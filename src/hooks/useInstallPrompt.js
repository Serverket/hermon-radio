import { useSyncExternalStore } from 'react';
import {
  isInstallDismissed,
  snoozeInstallPrompt,
  dismissInstallPermanently,
} from '../lib/pwaDismiss';

const ENGAGEMENT_DELAY_MS = 30_000;

function detectStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true
  );
}

function detectIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAppleMobile = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
  const isIPadOS = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1;
  return isAppleMobile || isIPadOS;
}

function detectIOSSafari() {
  if (!detectIOS()) return false;
  const ua = navigator.userAgent || '';
  return /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
}

// Module-level shared store so every install CTA observes the exact same single-use prompt
let deferredPrompt = null;
let engaged = false;
let initialized = false;
let forceDismissedThisSession = false;
let forceIOSInstructions = false;

const listeners = new Set();
let snapshot = {
  showBanner: false,
  showIOSModal: false,
  canInstallPrompt: false,
  isStandalone: detectStandalone(),
};

function computeSnapshot() {
  const standalone = detectStandalone();
  const dismissed = forceDismissedThisSession || isInstallDismissed();
  const iosSafari = detectIOSSafari();

  const shouldPrompt = engaged && !standalone && !dismissed;
  const showBanner = Boolean(shouldPrompt && deferredPrompt);
  const showIOSModal =
    Boolean(forceIOSInstructions && !standalone && !dismissed) ||
    Boolean(shouldPrompt && !deferredPrompt && iosSafari);

  return {
    showBanner,
    showIOSModal,
    canInstallPrompt: Boolean(deferredPrompt),
    isStandalone: standalone,
  };
}

function syncSnapshot() {
  const next = computeSnapshot();
  if (
    next.showBanner !== snapshot.showBanner ||
    next.showIOSModal !== snapshot.showIOSModal ||
    next.canInstallPrompt !== snapshot.canInstallPrompt ||
    next.isStandalone !== snapshot.isStandalone
  ) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }
}

function initStore() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.setTimeout(() => {
    engaged = true;
    syncSnapshot();
  }, ENGAGEMENT_DELAY_MS);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    syncSnapshot();
  });

  window.addEventListener('appinstalled', () => {
    dismissInstallPermanently();
    deferredPrompt = null;
    forceDismissedThisSession = true;
    forceIOSInstructions = false;
    syncSnapshot();
  });

  ['(display-mode: standalone)', '(display-mode: minimal-ui)'].forEach((query) => {
    const mql = window.matchMedia(query);
    if (mql?.addEventListener) {
      mql.addEventListener('change', syncSnapshot);
    }
  });
}

function subscribe(listener) {
  initStore();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  initStore();
  return snapshot;
}

const SERVER_SNAPSHOT = {
  showBanner: false,
  showIOSModal: false,
  canInstallPrompt: false,
  isStandalone: false,
};

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/**
 * Trigger the browser's single-use install prompt and release it after any outcome.
 * Falls back cleanly if prompt() rejects (e.g. NotAllowedError).
 */
export async function installApp() {
  const promptEvent = deferredPrompt;
  if (!promptEvent) {
    if (detectIOS()) {
      forceIOSInstructions = true;
      syncSnapshot();
    }
    return;
  }

  // Release immediately since beforeinstallprompt can only be invoked once
  deferredPrompt = null;

  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice?.outcome === 'accepted') {
      dismissInstallPermanently();
      forceDismissedThisSession = true;
    } else {
      forceDismissedThisSession = true;
      snoozeInstallPrompt();
    }
  } catch {
    forceDismissedThisSession = true;
    if (detectIOS()) {
      forceIOSInstructions = true;
    }
  } finally {
    syncSnapshot();
  }
}

export function dismissSnooze() {
  snoozeInstallPrompt();
  forceDismissedThisSession = true;
  forceIOSInstructions = false;
  syncSnapshot();
}

export function dismissPermanent() {
  dismissInstallPermanently();
  forceDismissedThisSession = true;
  forceIOSInstructions = false;
  syncSnapshot();
}

export default function useInstallPrompt() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ...state,
    installApp,
    dismissSnooze,
    dismissPermanent,
  };
}

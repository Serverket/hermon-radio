import { useState, useEffect, useCallback, useRef } from "react";

const DISMISS_KEY = "pwa-install-dismissed";
const ENGAGEMENT_DELAY_MS = 30_000; // 30 seconds
const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getDismissRecord() {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) || "{}");
  } catch {
    return {};
  }
}

function setDismissRecord(record) {
  localStorage.setItem(DISMISS_KEY, JSON.stringify(record));
}

function getIsStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function getIsIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
  );
}

function getIsIOSSafari() {
  const ua = navigator.userAgent;
  return (
    getIsIOS() &&
    /safari/i.test(ua) &&
    !/chrome|crios|fxios/i.test(ua)
  );
}

export default function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const promptRef = useRef(null);

  // Track engagement delay
  useEffect(() => {
    const timer = setTimeout(() => setEngaged(true), ENGAGEMENT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Capture beforeinstallprompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      promptRef.current = e;
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Listen for appinstalled
  useEffect(() => {
    const handler = () => {
      setDismissRecord({ permanent: true });
      setShowBanner(false);
      setShowIOSModal(false);
      setDeferredPrompt(null);
      promptRef.current = null;
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  // Decide whether to show banner/modal after engagement delay
  useEffect(() => {
    if (!engaged) return;
    if (getIsStandalone()) return;

    const dismissed = getDismissRecord();
    if (dismissed.permanent) return;
    if (dismissed.until && Date.now() < dismissed.until) return;

    if (promptRef.current) {
      setShowBanner(true);
    } else if (getIsIOSSafari()) {
      setShowIOSModal(true);
    }
  }, [engaged, deferredPrompt]);

  const installApp = useCallback(async () => {
    const prompt = promptRef.current;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setDismissRecord({ permanent: true });
    }
    setShowBanner(false);
    setDeferredPrompt(null);
    promptRef.current = null;
  }, []);

  const dismissSnooze = useCallback(() => {
    setDismissRecord({ until: Date.now() + SNOOZE_DURATION_MS });
    setShowBanner(false);
    setShowIOSModal(false);
  }, []);

  const dismissPermanent = useCallback(() => {
    setDismissRecord({ permanent: true });
    setShowBanner(false);
    setShowIOSModal(false);
  }, []);

  return {
    showBanner,
    showIOSModal,
    installApp,
    dismissSnooze,
    dismissPermanent,
  };
}

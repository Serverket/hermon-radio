export const DISMISS_KEY = 'pwa-install-dismissed';
export const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Safely read the stored install prompt dismiss record.
 * Private browsing modes on iOS/Safari can block storage reads.
 */
export function getDismissRecord() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Safely persist the install prompt dismiss record.
 */
export function setDismissRecord(record) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage quota or private-mode security errors
  }
}

export function isInstallDismissed(now = Date.now()) {
  const record = getDismissRecord();
  if (record?.permanent) return true;
  if (typeof record?.until === 'number' && now < record.until) return true;
  return false;
}

export function snoozeInstallPrompt() {
  setDismissRecord({ until: Date.now() + SNOOZE_DURATION_MS });
}

export function dismissInstallPermanently() {
  setDismissRecord({ permanent: true });
}


import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { CloseIcon } from './Icons';

const UPDATE_POLL_INTERVAL_MS = 60 * 60 * 1000;
let updateCheckTimer = null;

/**
 * Service Worker update banner powered by vite-plugin-pwa (`registerType: 'prompt'`).
 * Polls once per hour for long-running listening sessions and fetches live release metadata.
 */
const UpdateBanner = () => {
  const [releaseInfo, setReleaseInfo] = useState(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_, registration) {
      if (registration && !updateCheckTimer) {
        updateCheckTimer = window.setInterval(() => {
          registration.update();
        }, UPDATE_POLL_INTERVAL_MS);
      }
    },
  });

  useEffect(() => {
    if (!needRefresh) return undefined;
    const controller = new AbortController();

    fetch('/release-info.json', { cache: 'no-store', signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && (data.version || data.note)) {
          setReleaseInfo({
            version: data.version || '',
            note: data.note || '',
          });
        }
      })
      .catch(() => {
        // Offline or missing release-info.json safely falls back to generic label
      });

    return () => controller.abort();
  }, [needRefresh]);

  if (!needRefresh) return null;

  const summary = releaseInfo?.version
    ? `Nueva versión v${releaseInfo.version}${releaseInfo.note ? ` — ${releaseInfo.note}` : ''}`
    : releaseInfo?.note || 'Nueva versión disponible';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 z-[9995] flex justify-center px-3 pointer-events-none"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
      }}
    >
      <div className="pointer-events-auto glass-shell rounded-full pl-3.5 pr-1.5 py-1.5 flex items-center gap-2.5 max-w-lg shadow-xl border border-white/60 dark:border-white/15">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
          {summary}
        </span>

        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="btn-opal-gold px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          Actualizar
        </button>

        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Cerrar aviso de actualización"
          title="Cerrar"
          className="glass-pill w-7 h-7 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default UpdateBanner;


import { useState, useEffect } from 'react';
import useInstallPrompt from '../hooks/useInstallPrompt';

const InstallBanner = () => {
  const {
    showBanner,
    showIOSModal,
    installApp,
    dismissSnooze,
    dismissPermanent,
  } = useInstallPrompt();

  const [visible, setVisible] = useState(false);
  const [iosVisible, setIosVisible] = useState(false);

  useEffect(() => {
    if (showBanner) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
    setVisible(false);
    return undefined;
  }, [showBanner]);

  useEffect(() => {
    if (showIOSModal) {
      const t = setTimeout(() => setIosVisible(true), 50);
      return () => clearTimeout(t);
    }
    setIosVisible(false);
    return undefined;
  }, [showIOSModal]);

  if (showBanner) {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-[9998] transition-transform duration-500 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div className="mx-auto max-w-md px-4 pb-4">
          <div className="glass-shell rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-left">
              <img
                src="/android-chrome-192x192.png"
                alt="Radio Hermón 95.3 FM"
                className="w-12 h-12 rounded-2xl shadow-md border-2 border-white dark:border-amber-400/40 flex-shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-800 dark:text-white text-sm truncate">
                  Radio Hermón 95.3 FM
                </p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  Instala la app para una mejor experiencia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={installApp}
                className="btn-opal-gold flex-1 rounded-xl py-2.5 px-4 text-sm font-bold transition-transform active:scale-[0.97]"
              >
                Instalar
              </button>
              <button
                type="button"
                onClick={dismissSnooze}
                className="glass-pill rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-600 dark:text-slate-200 transition-colors"
              >
                Ahora no
              </button>
            </div>

            <button
              type="button"
              onClick={dismissPermanent}
              className="block w-full text-center text-xs font-medium text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              No volver a preguntar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showIOSModal) {
    return (
      <div
        className={`fixed inset-0 z-[9998] flex items-end justify-center transition-opacity duration-300 ${
          iosVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" onClick={dismissSnooze} />

        <div
          className={`relative w-full max-w-md mx-4 glass-shell rounded-[24px] p-5 transition-transform duration-500 ease-out text-left ${
            iosVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ marginBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/android-chrome-192x192.png"
              alt="Radio Hermón 95.3 FM"
              className="w-12 h-12 rounded-2xl shadow-md border-2 border-white dark:border-amber-400/40 flex-shrink-0 object-cover"
            />
            <div>
              <p className="font-extrabold text-slate-800 dark:text-white text-sm">
                Instalar Radio Hermón
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Añade la app a tu pantalla de inicio
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3 glass-inner rounded-2xl p-3">
              <span className="btn-opal-gold flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold">
                1
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-200 pt-0.5">
                Toca el botón{' '}
                <span className="inline-flex items-center align-middle accent-icon">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12M7 8l5-5 5 5"
                    />
                  </svg>
                </span>{' '}
                <strong>Compartir</strong> en la barra del navegador
              </p>
            </div>
            <div className="flex items-start gap-3 glass-inner rounded-2xl p-3">
              <span className="btn-opal-gold flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-200 pt-0.5">
                Desplázate y selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={dismissSnooze}
              className="btn-opal-gold flex-1 rounded-xl py-2.5 px-4 text-sm font-bold"
            >
              Ahora no
            </button>
            <button
              type="button"
              onClick={dismissPermanent}
              className="glass-pill rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300"
            >
              No preguntar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallBanner;

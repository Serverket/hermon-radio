import React, { useState, useEffect } from "react";
import useInstallPrompt from "../hooks/useInstallPrompt";

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

  // Animate in
  useEffect(() => {
    if (showBanner) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [showBanner]);

  useEffect(() => {
    if (showIOSModal) {
      const t = setTimeout(() => setIosVisible(true), 50);
      return () => clearTimeout(t);
    }
    setIosVisible(false);
  }, [showIOSModal]);

  // Chrome / Edge / Android / Desktop banner
  if (showBanner) {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-[9998] transition-transform duration-500 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-md px-4 pb-4">
          <div className="rounded-2xl bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/40 p-4">
            <div className="flex items-center gap-3">
              {/* App icon */}
              <img
                src="/android-chrome-192x192.png"
                alt="Radio Hermon"
                className="w-12 h-12 rounded-xl shadow-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
                  Radio Hermón
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Instala la app para una mejor experiencia
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={installApp}
                className="flex-1 rounded-xl py-2 px-4 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #02e1ba, #7cb1bf)" }}
              >
                Instalar
              </button>
              <button
                onClick={dismissSnooze}
                className="rounded-xl py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200/60 dark:bg-gray-700/60 hover:bg-gray-300/80 dark:hover:bg-gray-600/80 transition-colors duration-200"
              >
                Ahora no
              </button>
            </div>

            {/* Permanent dismiss link */}
            <button
              onClick={dismissPermanent}
              className="block w-full text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              No volver a preguntar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS Safari instructional modal
  if (showIOSModal) {
    return (
      <div
        className={`fixed inset-0 z-[9998] flex items-end justify-center transition-opacity duration-300 ${
          iosVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={dismissSnooze}
        />

        {/* Modal */}
        <div
          className={`relative w-full max-w-md mx-4 mb-4 rounded-2xl bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/40 p-5 transition-transform duration-500 ease-out ${
            iosVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/android-chrome-192x192.png"
              alt="Radio Hermon"
              className="w-12 h-12 rounded-xl shadow-md flex-shrink-0"
            />
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                Instalar Radio Hermón
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Añade la app a tu pantalla de inicio
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #02e1ba, #7cb1bf)" }}
              >
                1
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                Toca el botón{" "}
                <span className="inline-flex items-center align-middle">
                  {/* Share icon (iOS style) */}
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12M7 8l5-5 5 5" />
                  </svg>
                </span>{" "}
                <strong>Compartir</strong> en la barra del navegador
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #02e1ba, #7cb1bf)" }}
              >
                2
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                Desplázate y selecciona{" "}
                <strong>&quot;Añadir a pantalla de inicio&quot;</strong>
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={dismissSnooze}
              className="flex-1 rounded-xl py-2.5 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200/60 dark:bg-gray-700/60 hover:bg-gray-300/80 dark:hover:bg-gray-600/80 transition-colors duration-200"
            >
              Ahora no
            </button>
            <button
              onClick={dismissPermanent}
              className="rounded-xl py-2.5 px-4 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
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

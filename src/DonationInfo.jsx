/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import {
  HeartIcon,
  CloseIcon,
  CopyIcon,
  CheckIcon,
  QrCodeIcon,
  DownloadIcon,
} from './components/Icons';
import {
  BANK_DONATION_DATA,
  formatReadableBankText,
  normalizeVenezuelanPhone,
  buildSuiche7bPayload,
} from './utils/suiche7bQr';

const ALL_BANK_TEXT = formatReadableBankText();
const ENV_QR_PAYLOAD = (import.meta.env.VITE_S7B_QR_PAYLOAD || '').trim();
const ENV_QR_IMAGE = (import.meta.env.VITE_S7B_QR_IMAGE || '').trim();
const CONFIGURED_PHONE = normalizeVenezuelanPhone(BANK_DONATION_DATA.pagoMovilPhone);

const S7B_BADGE_STRIPES = ['#d81b60', '#1d4ed8', '#16a34a', '#eab308'];

function traceRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Stamps the recognizable merchant "SUICHE 7B" circular emblem cleanly at the center
 * of an ECC-H QR canvas so both screen display and downloaded PNG carry the icon.
 */
function drawSuiche7bCenterEmblem(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.112;

  // High-contrast white circular quiet pad + subtle perimeter ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, size * 0.004);
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Top navy "SUICHE" label
  const suicheFontSize = Math.round(outerR * 0.27);
  ctx.fillStyle = '#0f2859';
  ctx.font = `900 ${suicheFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SUICHE', cx, cy - outerR * 0.43);

  // Rainbow-striped rounded badge containing crisp white "7B"
  const badgeW = outerR * 1.18;
  const badgeH = outerR * 0.92;
  const badgeX = cx - badgeW / 2;
  const badgeY = cy - outerR * 0.15;

  ctx.save();
  traceRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, outerR * 0.22);
  ctx.clip();
  const stripeW = badgeW / S7B_BADGE_STRIPES.length;
  S7B_BADGE_STRIPES.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.fillRect(badgeX + idx * stripeW, badgeY, stripeW + 1, badgeH);
  });
  ctx.restore();

  const textFontSize = Math.round(badgeH * 0.68);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.28)';
  ctx.shadowBlur = Math.max(1, size * 0.004);
  ctx.font = `900 ${textFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillText('7B', cx, badgeY + badgeH * 0.54);
  ctx.restore();
}

const BANK_ITEMS = [
  { key: 'banco', label: 'Banco', value: `${BANK_DONATION_DATA.bankName} (${BANK_DONATION_DATA.bankCode})`, mono: false },
  { key: 'cuenta', label: 'Cuenta Bancaria', value: BANK_DONATION_DATA.accountNumber, mono: true },
  { key: 'rif', label: 'RIF', value: BANK_DONATION_DATA.rif, mono: true },
  ...(CONFIGURED_PHONE
    ? [{ key: 'pago_movil', label: 'Pago Móvil', value: `0${CONFIGURED_PHONE.slice(2)}`, mono: true }]
    : []),
  { key: 'nombre', label: 'Nombre / Titular', value: BANK_DONATION_DATA.holderName, mono: false },
];

const DonationInfo = ({ showDonationInfo, toggleDonationInfo, copyToClipboard, darkMode }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'datos'
  const [s7bPayload, setS7bPayload] = useState(() => ENV_QR_PAYLOAD);
  const [generatedQrUrl, setGeneratedQrUrl] = useState('');
  const [customImgFailed, setCustomImgFailed] = useState(false);

  const usingCustomImage = Boolean(ENV_QR_IMAGE) && !customImgFailed;
  const hasSuiche7bSource = usingCustomImage || Boolean(s7bPayload);

  useEffect(() => {
    if (!showDonationInfo) return undefined;
    const handleEsc = (e) => {
      if (e.key === 'Escape') toggleDonationInfo();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showDonationInfo, toggleDonationInfo]);

  useEffect(() => {
    if (showDonationInfo) {
      setActiveTab('qr');
      setCustomImgFailed(false);
    }
  }, [showDonationInfo]);

  // Build real encrypted Suiche 7B RSA-2048 (`origin=web`) payload when Pago Movil phone is configured
  useEffect(() => {
    if (ENV_QR_PAYLOAD || usingCustomImage) return undefined;
    let cancelled = false;
    buildSuiche7bPayload().then((payload) => {
      if (!cancelled) setS7bPayload(payload);
    });
    return () => {
      cancelled = true;
    };
  }, [usingCustomImage]);

  useEffect(() => {
    if (usingCustomImage || !s7bPayload) {
      setGeneratedQrUrl('');
      return undefined;
    }
    let cancelled = false;
    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, s7bPayload, {
      width: 560,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(() => {
        if (cancelled) return;
        drawSuiche7bCenterEmblem(qrCanvas);
        setGeneratedQrUrl(qrCanvas.toDataURL('image/png'));
      })
      .catch(() => {
        if (!cancelled) setGeneratedQrUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [s7bPayload, usingCustomImage]);

  if (!showDonationInfo) return null;

  const handleCopy = (key, value) => {
    copyToClipboard(value);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 1800);
  };

  const qrSource = usingCustomImage ? ENV_QR_IMAGE : generatedQrUrl;

  return createPortal(
    <div
      className={`${darkMode ? 'dark' : ''} fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/35 backdrop-blur-sm p-4`}
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleDonationInfo();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Donaciones Venezuela"
    >
      <div
        className="glass-shell rounded-[28px] p-5 sm:p-7 w-full max-w-[440px] max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5 text-left text-slate-800 dark:text-slate-100 transition-all duration-200"
        data-aos="zoom-in"
        data-aos-duration="300"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl pill-gold-soft flex items-center justify-center flex-shrink-0">
              <HeartIcon />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white leading-tight">
                Donaciones (Venezuela)
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Radio Hermón 95.3 FM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDonationInfo}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full glass-pill text-slate-600 dark:text-slate-300 flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Segmented Tab Switcher: QR Suiche 7B | Datos Bancarios */}
        <div className="glass-inner p-1 rounded-2xl grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'qr'
                ? 'btn-opal-gold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <QrCodeIcon />
            <span>QR Suiche 7B</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('datos')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'datos'
                ? 'btn-opal-gold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <CopyIcon />
            <span>Datos Bancarios</span>
          </button>
        </div>

        {activeTab === 'datos' ? (
          <>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
              Toca cualquiera de los datos bancarios para copiarlo automáticamente al portapapeles:
            </p>

            {/* Tap-to-copy Cards */}
            <div className="space-y-2.5">
              {BANK_ITEMS.map((item) => {
                const isCopied = copiedKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleCopy(item.key, item.value)}
                    className="w-full glass-inner rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-400 group"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        {item.label}
                      </span>
                      <span
                        className={`block mt-0.5 text-sm sm:text-base font-extrabold text-slate-800 dark:text-white break-words ${
                          item.mono ? 'tracking-wide font-mono text-[13px] sm:text-base' : ''
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>

                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isCopied ? 'badge-emerald-live' : 'pill-gold-soft'
                      }`}
                    >
                      {isCopied ? <CheckIcon /> : <CopyIcon />}
                      <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleCopy('all', ALL_BANK_TEXT)}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  copiedKey === 'all'
                    ? 'badge-emerald-live'
                    : 'glass-pill text-slate-700 dark:text-slate-200 hover:scale-[1.01]'
                }`}
              >
                {copiedKey === 'all' ? <CheckIcon /> : <CopyIcon />}
                <span>{copiedKey === 'all' ? 'Todo copiado' : 'Copiar todo'}</span>
              </button>

              <button
                type="button"
                onClick={toggleDonationInfo}
                className="btn-opal-gold flex-1 py-3 rounded-2xl text-sm font-bold transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3.5 text-center">
            {hasSuiche7bSource ? (
              <>
                <div className="glass-inner rounded-3xl p-4 sm:p-5 space-y-3">
                  {/* High-contrast white scanning frame */}
                  <div className="mx-auto w-52 h-52 sm:w-56 sm:h-56 bg-white rounded-2xl p-3 shadow-md border border-slate-100 flex items-center justify-center">
                    {qrSource ? (
                      <img
                        src={qrSource}
                        alt="Código QR Suiche 7B Bancaribe Radio Hermón"
                        onError={() => {
                          if (usingCustomImage) setCustomImgFailed(true);
                        }}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full border-2 border-slate-300/60 dark:border-slate-600/60 animate-spin"
                        style={{ borderTopColor: 'var(--hermon-to, #BD8F2A)' }}
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-900/40 rounded-xl px-3 py-1.5">
                    <span className="whitespace-nowrap">Bancaribe ({BANK_DONATION_DATA.bankCode})</span>
                    <span aria-hidden="true">·</span>
                    <span className="whitespace-nowrap">{BANK_DONATION_DATA.rif}</span>
                    {CONFIGURED_PHONE && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="whitespace-nowrap">0{CONFIGURED_PHONE.slice(2)}</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Escanea desde la app de tu banco (Suiche 7B · Pago Móvil) para rellenar automáticamente los datos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {qrSource && (
                    <a
                      href={qrSource}
                      download="RadioHermon_QR_Suiche7B.png"
                      className="btn-opal-gold flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
                    >
                      <DownloadIcon />
                      <span>Descargar QR</span>
                    </a>
                  )}

                  {s7bPayload && (
                    <button
                      type="button"
                      onClick={() => handleCopy('qr_payload', s7bPayload)}
                      className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                        copiedKey === 'qr_payload'
                          ? 'badge-emerald-live'
                          : 'glass-pill text-slate-700 dark:text-slate-200 hover:scale-[1.01]'
                      }`}
                    >
                      {copiedKey === 'qr_payload' ? <CheckIcon /> : <CopyIcon />}
                      <span>{copiedKey === 'qr_payload' ? 'Copiado' : 'Copiar trama'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleDonationInfo}
                    className="glass-pill px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="glass-inner rounded-3xl p-5 space-y-3 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl pill-gold-soft flex items-center justify-center">
                    <QrCodeIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
                    Se requiere teléfono Pago Móvil
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    El estándar oficial <strong>QR Suiche 7B</strong> cifra <strong>Banco ({BANK_DONATION_DATA.bankCode}) + RIF ({BANK_DONATION_DATA.rif}) + Teléfono móvil</strong> para Pago Móvil; no utiliza el número de cuenta de 20 dígitos.
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Para transferencias a la cuenta corriente, usa la pestaña <strong>Datos Bancarios</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('datos')}
                    className="btn-opal-gold flex-1 py-3 rounded-2xl text-sm font-bold transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    Ver Datos Bancarios
                  </button>
                  <button
                    type="button"
                    onClick={toggleDonationInfo}
                    className="glass-pill px-5 py-3 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default DonationInfo;

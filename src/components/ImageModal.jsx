/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Slideshow from './Slideshow';
import { CloseIcon } from './Icons';
import { sanitizeAdUrl } from '../utils/programAds';

/**
 * Image Modal component for displaying enlarged program images, muted videos, and optional external link CTA
 */
const ImageModal = ({
  isOpen,
  onClose,
  image,
  images,
  mediaType = 'image',
  poster = '',
  name,
  header,
  footer,
  url = '',
  linkLabel = 'Visitar ↗',
  darkMode,
}) => {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return undefined;
    }
    setEntered(false);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  if (!isOpen) return null;

  const safeUrl = sanitizeAdUrl(url);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name || 'Imagen ampliada'}
      className={`${darkMode ? 'dark' : ''} fixed inset-0 z-[250] flex items-center justify-center p-4 transition-opacity duration-200 backdrop-blur-sm ${
        entered ? 'bg-slate-900/50 opacity-100' : 'bg-slate-900/0 opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`glass-shell relative w-[94vw] sm:w-[560px] max-w-3xl max-h-[92vh] overflow-y-auto mx-auto rounded-[28px] transform transition-all duration-200 p-5 sm:p-6 space-y-4 ${
          entered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-left">
            {header && (
              <span className="block text-xs font-bold uppercase tracking-wider accent-icon">
                {header}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white leading-tight break-words">
              {name || 'Radio Hermón 95.3 FM'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full glass-pill text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="w-full glass-inner rounded-2xl p-2 flex justify-center overflow-hidden">
          {images && images.length > 0 ? (
            <Slideshow
              images={images}
              interval={4000}
              className="rounded-xl shadow-md"
              imgClassName="max-h-[60vh] sm:max-h-[65vh] w-auto max-w-full object-contain"
              title={name}
            />
          ) : mediaType === 'video' ? (
            <video
              src={image}
              poster={poster || undefined}
              autoPlay
              loop
              muted
              playsInline
              controls
              className="max-h-[60vh] sm:max-h-[65vh] w-auto max-w-full rounded-xl shadow-md bg-black"
            />
          ) : (
            <img
              src={image}
              alt={name || 'Program image'}
              className="max-h-[60vh] sm:max-h-[65vh] w-auto object-contain rounded-xl shadow-md"
            />
          )}
        </div>

        {(footer || safeUrl) && (
          <div
            className={`glass-inner rounded-2xl p-3.5 ${
              footer && safeUrl
                ? 'flex flex-wrap items-center justify-between gap-3 text-left'
                : 'flex flex-col sm:flex-row items-center justify-center gap-3 text-center'
            }`}
          >
            {footer && (
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex-1 min-w-[180px]">
                {footer}
              </p>
            )}
            {safeUrl && (
              <a
                href={safeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-opal-gold px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 flex-shrink-0 hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {linkLabel || 'Visitar ↗'}
              </a>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;

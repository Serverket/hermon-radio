/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { VolumeIcon, VolumeMuteIcon, ZoomIcon } from './Icons';

function SilentAdVideo({ ad, onInspectAd }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const showAudioToggle = ad.hasAudio !== false;

  // Always reset new ad videos to muted so they never collide with the live radio stream.
  useEffect(() => {
    setIsMuted(true);
    const el = videoRef.current;
    if (!el) return;
    el.defaultMuted = true;
    el.muted = true;
    el.volume = 0;
  }, [ad.src]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = isMuted;
    if (!isMuted && el.volume === 0) {
      el.volume = 0.85;
    }
  }, [isMuted]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-900/10 dark:bg-black/35 border border-white/60 dark:border-white/10">
      <video
        ref={videoRef}
        src={ad.src}
        poster={ad.poster || undefined}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-label={ad.alt || ad.title || 'Video publicitario del programa'}
        className="w-full h-auto max-h-[280px] sm:max-h-[320px] object-contain mx-auto block"
      />

      {showAudioToggle && (
        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          aria-label={isMuted ? 'Activar audio del anuncio' : 'Silenciar anuncio'}
          title={isMuted ? 'Sin audio por defecto · Toca para escuchar' : 'Silenciar anuncio'}
          className="absolute bottom-2 left-2 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold inline-flex items-center gap-1.5 border border-white/25 hover:bg-black/75 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {isMuted ? <VolumeMuteIcon className="w-3.5 h-3.5" /> : <VolumeIcon className="w-3.5 h-3.5" />}
          <span>{isMuted ? 'Sin audio' : 'Con audio'}</span>
        </button>
      )}

      {onInspectAd && (
        <button
          type="button"
          onClick={() => onInspectAd(ad)}
          aria-label="Ampliar video publicitario"
          title="Haz clic para ampliar"
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center border border-white/25 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <ZoomIcon />
        </button>
      )}
    </div>
  );
}

/**
 * Static side showcase panel ("vitrina lateral") for program-specific sponsors and ad banners.
 * Displays protagonist media banners (images or muted-by-default looping videos) alongside
 * clean text-only sponsor listings without inventing extra copy.
 */
export default function ProgramAdsPanel({ ads = [], programName = '', onInspectAd }) {
  if (!ads.length) return null;

  const mediaAds = ads.filter((ad) => Boolean(ad.src));
  const textAds = ads.filter((ad) => !ad.src && !ad.isContactNote);
  const contactNotes = ads.filter((ad) => !ad.src && ad.isContactNote);

  return (
    <div className="glass-shell rounded-[28px] p-4 sm:p-5 space-y-3.5 text-left text-slate-800 dark:text-slate-100">
      <div className="pb-3 border-b border-slate-200/70 dark:border-white/10">
        <span className="pill-gold-soft px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block">
          Publicidad del programa
        </span>
        {programName && (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-1">
            {programName}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {mediaAds.map((ad) => (
          <div key={ad.id} className="glass-inner rounded-2xl p-2.5 sm:p-3 space-y-2.5">
            {ad.mediaType === 'video' ? (
              <SilentAdVideo ad={ad} onInspectAd={onInspectAd} />
            ) : (
              <button
                type="button"
                onClick={() => onInspectAd?.(ad)}
                title="Haz clic para ampliar"
                className="relative mx-auto block w-full rounded-xl overflow-hidden shadow-sm border border-white/80 dark:border-white/15 bg-white/50 dark:bg-slate-900/50 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <img
                  src={ad.src}
                  alt={ad.alt || ad.title || 'Banner publicitario del programa'}
                  loading="lazy"
                  className="w-full h-auto max-h-[280px] sm:max-h-[320px] mx-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/25 group-hover:scale-110 transition-transform">
                  <ZoomIcon />
                </span>
              </button>
            )}

            {(ad.badge || ad.title || ad.subtitle || ad.url) && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
                <div className="min-w-[180px] flex-1 space-y-0.5">
                  {ad.badge && (
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider accent-icon">
                      {ad.badge}
                    </span>
                  )}
                  {ad.title && (
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug">
                      {ad.title}
                    </h3>
                  )}
                  {ad.subtitle && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ad.subtitle}
                    </p>
                  )}
                </div>

                {ad.url && (
                  <a
                    href={ad.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-opal-gold px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 hover:scale-[1.03] transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {ad.linkLabel}
                  </a>
                )}
              </div>
            )}
          </div>
        ))}

        {(textAds.length > 0 || contactNotes.length > 0) && (
          <div className="glass-inner rounded-2xl p-3 space-y-2">
            {textAds.length > 0 && (
              <>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Patrocinadores
                </span>
                <ul className="space-y-1.5">
                  {textAds.map((ad) => (
                    <li
                      key={ad.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-white/60 dark:bg-slate-900/40 px-3 py-2 border border-white/60 dark:border-white/5"
                    >
                      <div className="min-w-0 flex-1">
                        {ad.title && (
                          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-snug">
                            {ad.title}
                          </div>
                        )}
                        {ad.subtitle && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {ad.subtitle}
                          </div>
                        )}
                      </div>
                      {ad.url && (
                        <a
                          href={ad.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-xs font-bold accent-icon hover:underline flex-shrink-0"
                        >
                          {ad.linkLabel}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {contactNotes.map((note) => (
              <p
                key={note.id}
                className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 text-center pt-1"
              >
                {note.title}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

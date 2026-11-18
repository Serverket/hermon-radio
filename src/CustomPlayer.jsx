/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, VolumeIcon, VolumeMuteIcon } from './components/Icons';
import {
  audioReactiveState,
  ensureAudioAnalyser,
  sampleAudioTelemetry,
} from './utils/audioReactiveState';
import { activePosterThemeState } from './utils/posterTheme';

const VIDEO_URL_RE = /\.(mp4|webm|mov|m4v|m3u8)(\?|$)/i;

const CustomPlayer = ({ darkMode, src }) => {
  const [isVideo, setIsVideo] = useState(() => VIDEO_URL_RE.test(src || ''));
  const [isLoading, setIsLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState('checking');
  const [playIntent, setPlayIntent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = parseFloat(localStorage.getItem('hermon-volume'));
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.8;
  });
  const [muted, setMuted] = useState(false);
  const [corsEnabled, setCorsEnabled] = useState(true);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserGraphRef = useRef(null);
  const statusRef = useRef(streamStatus);
  const playIntentRef = useRef(playIntent);
  const checkTimeoutRef = useRef(null);
  const retryCount = useRef(0);

  useEffect(() => {
    statusRef.current = streamStatus;
    playIntentRef.current = playIntent;
  }, [streamStatus, playIntent]);

  // Lightweight adaptive stream health check that immediately cancels stream body after headers arrive
  const checkStreamHealth = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch(src, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      try {
        await response.body?.cancel?.();
      } catch {
        // Ignore if opaque response body cannot be cancelled directly
      }
      controller.abort();

      if (response.type === 'opaque' || response.ok) {
        retryCount.current = 0;
        return 'active';
      }
      throw new Error('Unexpected response type');
    } catch {
      clearTimeout(timeoutId);
      retryCount.current = Math.min(retryCount.current + 1, 5);
      return 'error';
    }
  }, [src]);

  useEffect(() => {
    let isMounted = true;

    const calculateDelay = () => {
      return statusRef.current === 'active' ? 15000 : 5000;
    };

    const scheduleCheck = (delay) => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = setTimeout(performCheck, delay);
    };

    const performCheck = async () => {
      if (!isMounted) return;
      if (document.hidden && !playIntentRef.current) {
        scheduleCheck(15000);
        return;
      }
      // Avoid redundant network check while the audio/video element is actively playing cleanly
      const activeMedia = isVideo ? videoRef.current : audioRef.current;
      if (activeMedia && !activeMedia.paused && activeMedia.readyState >= 2) {
        setStreamStatus('active');
        scheduleCheck(15000);
        return;
      }

      const previousStatus = statusRef.current;
      const status = await checkStreamHealth();
      if (!isMounted) return;

      if (status === 'active') {
        setStreamStatus('active');
      } else if (previousStatus === 'active') {
        setStreamStatus('connecting');
      } else {
        setStreamStatus('error');
      }

      scheduleCheck(calculateDelay());
    };

    scheduleCheck(1500);

    return () => {
      isMounted = false;
      clearTimeout(checkTimeoutRef.current);
    };
  }, [checkStreamHealth, isVideo]);

  // Synchronize video flag cleanly when src prop changes without opening duplicate probe connections
  useEffect(() => {
    setIsVideo(VIDEO_URL_RE.test(src || ''));
    setIsLoading(false);
  }, [src]);

  // Sync volume & mute to active media element
  useEffect(() => {
    const mediaEl = isVideo ? videoRef.current : audioRef.current;
    if (!mediaEl) return;
    mediaEl.volume = volume;
    mediaEl.muted = muted;
  }, [volume, muted, isVideo, isLoading]);

  // Restore saved playIntent on mount/stream switch
  useEffect(() => {
    if (isLoading) return;
    const savedIntent = localStorage.getItem('playIntent');
    if (!savedIntent) return;

    setPlayIntent(true);
    const attemptPlay = (retries = 0) => {
      const mediaElement = isVideo ? videoRef.current : audioRef.current;
      if (!mediaElement) return;
      mediaElement.play().catch(() => {
        if (retries < 3) setTimeout(() => attemptPlay(retries + 1), 1000);
      });
    };
    attemptPlay();
  }, [isVideo, isLoading]);

  const handlePlayEvent = () => {
    setPlayIntent(true);
    setIsPlaying(true);
    setStreamStatus('active');
    localStorage.setItem('playIntent', 'true');

    const mediaEl = isVideo ? videoRef.current : audioRef.current;
    if (mediaEl && corsEnabled && !analyserGraphRef.current) {
      analyserGraphRef.current = ensureAudioAnalyser(mediaEl);
    } else if (analyserGraphRef.current?.ctx?.state === 'suspended') {
      analyserGraphRef.current.ctx.resume().catch(() => {});
    }
  };

  const handlePauseEvent = () => {
    setPlayIntent(false);
    setIsPlaying(false);
    localStorage.removeItem('playIntent');
  };

  const handleMediaError = () => {
    // Auto-fallback: if anonymous CORS ever causes playback rejection, strip CORS cleanly
    if (corsEnabled) {
      setCorsEnabled(false);
      analyserGraphRef.current = null;
      return;
    }
    setStreamStatus('error');
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    const mediaEl = isVideo ? videoRef.current : audioRef.current;
    if (!mediaEl) return;

    if (isPlaying || !mediaEl.paused) {
      mediaEl.pause();
      return;
    }

    if (corsEnabled && !analyserGraphRef.current) {
      analyserGraphRef.current = ensureAudioAnalyser(mediaEl);
    }
    if (analyserGraphRef.current?.ctx?.state === 'suspended') {
      analyserGraphRef.current.ctx.resume().catch(() => {});
    }
    setStreamStatus('connecting');
    mediaEl.play().catch(() => {
      setStreamStatus('error');
    });
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0 && muted) setMuted(false);
    localStorage.setItem('hermon-volume', String(val));
  };

  const toggleMute = () => setMuted((prev) => !prev);

  // Lightweight 30fps Spectrogram + telemetry updater (zero React re-renders, stops idle loop when paused)
  useEffect(() => {
    let rafId = null;
    let lastTick = 0;
    let cachedGrad = null;
    let cachedKey = '';

    const drawFrame = (now) => {
      sampleAudioTelemetry(analyserGraphRef.current, isPlaying, now / 1000);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = 92;
      const cssH = 26;
      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        cachedGrad = null;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      if (!isPlaying) {
        ctx.fillStyle = darkMode ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.45)';
      } else {
        const [c0, c1, c2] = activePosterThemeState.spectre || ['#10B981', '#DFBC58', '#BD8F2A'];
        const key = `${c0}:${c1}:${c2}`;
        if (!cachedGrad || cachedKey !== key) {
          const grad = ctx.createLinearGradient(0, cssH, 0, 0);
          grad.addColorStop(0, c0);
          grad.addColorStop(0.55, c1);
          grad.addColorStop(1, c2);
          cachedGrad = grad;
          cachedKey = key;
        }
        ctx.fillStyle = cachedGrad;
      }

      const barCount = 14;
      const barWidth = 3.5;
      const gap = (cssW - barCount * barWidth) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const energy = audioReactiveState.bands[i] || 0;
        const barH = isPlaying ? Math.max(4, Math.round(4 + energy * (cssH - 5))) : 4;
        const x = i * (barWidth + gap);
        const y = cssH - barH;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barH, 999);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();
      }
    };

    const renderSpectrogram = (now) => {
      if (!document.hidden && now - lastTick >= 33) {
        lastTick = now;
        drawFrame(now);
      }
      // Pause animation loop cleanly at rest when radio isn't playing
      if (!isPlaying && audioReactiveState.energy < 0.002) {
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(renderSpectrogram);
    };

    drawFrame(performance.now());
    if (isPlaying || audioReactiveState.energy >= 0.002) {
      rafId = requestAnimationFrame(renderSpectrogram);
    }
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      sampleAudioTelemetry(null, false, 0);
    };
  }, [isPlaying, darkMode]);

  const statusMeta = {
    active: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      label: isPlaying ? 'Reproduciendo' : 'Stream Activo',
    },
    connecting: {
      dot: 'bg-amber-500 animate-pulse',
      text: 'text-amber-700 dark:text-amber-300',
      label: 'Conectando...',
    },
    checking: {
      dot: 'bg-amber-400 animate-pulse',
      text: 'text-slate-500 dark:text-slate-400',
      label: 'Verificando señal...',
    },
    error: {
      dot: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400',
      label: 'Reconectando señal',
    },
  }[streamStatus] || {
    dot: 'bg-slate-400',
    text: 'text-slate-500',
    label: 'Listo',
  };

  const volumePercent = muted ? 0 : Math.round(volume * 100);

  return (
    <div className="w-full glass-inner rounded-2xl p-4 space-y-3 text-left">
      {isLoading ? (
        <div className="flex justify-center items-center h-20">
          <div
            className="w-8 h-8 rounded-full border-2 border-slate-300/60 dark:border-slate-600/60 animate-spin"
            style={{ borderTopColor: 'var(--hermon-to, #BD8F2A)' }}
          />
        </div>
      ) : isVideo ? (
        <div className="space-y-2">
          <video
            ref={videoRef}
            src={src}
            crossOrigin={corsEnabled ? 'anonymous' : undefined}
            controls
            autoPlay={playIntent}
            onPlay={handlePlayEvent}
            onPause={handlePauseEvent}
            onError={handleMediaError}
            className="w-full h-auto rounded-xl overflow-hidden"
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusMeta.dot}`} />
              <span className={`text-xs font-bold ${statusMeta.text}`}>{statusMeta.label}</span>
            </div>
            <canvas ref={canvasRef} style={{ width: '92px', height: '26px' }} aria-hidden="true" />
          </div>
        </div>
      ) : (
        <>
          <audio
            ref={audioRef}
            src={src}
            crossOrigin={corsEnabled ? 'anonymous' : undefined}
            preload="none"
            onPlay={handlePlayEvent}
            onPause={handlePauseEvent}
            onCanPlay={() => setStreamStatus('active')}
            onError={handleMediaError}
          />

          {/* Top Row: Live Status & Real-Time Audio Spectrogram */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusMeta.dot}`} />
              <span className={`text-xs font-bold truncate ${statusMeta.text}`}>
                {statusMeta.label}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              style={{ width: '92px', height: '26px' }}
              className="flex-shrink-0"
              aria-hidden="true"
            />
          </div>

          {/* Main Controls: Tactile Gold Play Circle + High-Contrast Volume Slider */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pausar radio' : 'Reproducir radio'}
              className="btn-play-hero w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="inline-flex items-center gap-1.5 hover-accent-icon transition-colors focus:outline-none"
                  aria-label={muted ? 'Activar sonido' : 'Silenciar'}
                >
                  {muted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
                  <span>Volumen</span>
                </button>
                <span className="tabular-nums font-bold">{volumePercent}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Control de volumen"
                className="opal-slider w-full"
                style={{
                  background: `linear-gradient(to right, var(--hermon-from, #DFBC58) 0%, var(--hermon-to, #BD8F2A) ${volumePercent}%, ${
                    darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(203, 213, 225, 0.8)'
                  } ${volumePercent}%, ${
                    darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(203, 213, 225, 0.8)'
                  } 100%)`,
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomPlayer;

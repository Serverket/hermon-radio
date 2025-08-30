import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

/**
 * Simple HLS video player using hls.js
 * Props:
 *  - url: string (HLS .m3u8)
 *  - autoPlay?: boolean
 *  - muted?: boolean
 *  - poster?: string
 *  - className?: string (applied to video element)
 */
export default function HlsPlayer({ url, autoPlay = true, muted = true, poster, className = '' }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [streamStatus, setStreamStatus] = useState('connecting');
  const [isHovered, setIsHovered] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const healthCheckIntervalRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  // Cleanup function
  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  // Health check function to monitor stream availability
  const checkStreamHealth = async () => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Reconnection logic with exponential backoff
  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) return; // Already scheduled
    
    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000); // Max 30s
    console.log(`[HLS] Reconnecting in ${delay}ms (attempt ${retryCountRef.current + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      retryCountRef.current++;
      if (retryCountRef.current < maxRetries) {
        initializeStream();
      } else {
        setStreamStatus('error');
        console.log('[HLS] Max retries reached');
      }
    }, delay);
  };

  // Initialize stream connection
  const initializeStream = () => {
    setStreamStatus('connecting');
    const video = videoRef.current;
    if (!video || !url) return;

    // Clean up existing connections
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // If the browser supports native HLS (Safari), use it directly
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.onloadstart = () => setStreamStatus('connecting');
      video.oncanplay = () => {
        setStreamStatus('active');
        retryCountRef.current = 0; // Reset retry count on success
      };
      video.onerror = () => {
        setStreamStatus('error');
        scheduleReconnect();
      };
      if (autoPlay) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveDurationInfinity: true,
        enableWorker: true,
        lowLatencyMode: true,
        liveBackBufferLength: 0,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 2,
        maxBufferLength: 5,
        maxMaxBufferLength: 10,
        backBufferLength: 0,
      });
      
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStreamStatus('active');
        retryCountRef.current = 0; // Reset retry count on success
        if (autoPlay) {
          const p = video.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      });
      
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        console.log('[HLS] Error:', data);
        if (data?.fatal) {
          setStreamStatus('error');
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('[HLS] Network error, attempting recovery');
              hls.startLoad();
              scheduleReconnect();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('[HLS] Media error, attempting recovery');
              hls.recoverMediaError();
              scheduleReconnect();
              break;
            default:
              console.log('[HLS] Fatal error, destroying and reconnecting');
              hls.destroy();
              hlsRef.current = null;
              scheduleReconnect();
              break;
          }
        }
      });
      
      return;
    }

    // Neither native HLS nor hls.js is supported
    setStreamStatus('error');
  };

  // Start background health monitoring
  const startHealthMonitoring = () => {
    if (healthCheckIntervalRef.current) return; // Already running
    
    healthCheckIntervalRef.current = setInterval(async () => {
      if (streamStatus === 'active') {
        const isHealthy = await checkStreamHealth();
        if (!isHealthy) {
          console.log('[HLS] Health check failed, triggering reconnection');
          setStreamStatus('error');
          scheduleReconnect();
        }
      }
    }, 15000); // Check every 15 seconds when active
  };

  useEffect(() => {
    retryCountRef.current = 0;
    initializeStream();
    startHealthMonitoring();

    return cleanup;
  }, [url, autoPlay]);

  return (
    <div className="w-full relative">
      <div className="w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
        <video
          ref={videoRef}
          className={`w-full h-full ${className}`}
          controls
          muted={muted}
          playsInline
          poster={poster}
        />
      </div>
      
      {/* Stream status indicator - top right corner */}
      <div
        className="p-0.5 absolute top-0 right-0 flex items-center gap-1 bg-black/60 rounded backdrop-blur z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
          streamStatus === 'active' ? 'bg-green-500' :
          streamStatus === 'connecting' ? 'bg-yellow-500' :
          'bg-red-500'
        }`} />
        
        {/* Show text only when hovered */}
        {isHovered && (
          <span className="text-xs text-white">
            {streamStatus === 'active' ? 'Activo' : 
             streamStatus === 'connecting' ? 'Conectando...' : 
             'Error'}
          </span>
        )}
      </div>
    </div>
  );
}

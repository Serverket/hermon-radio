import React, { useState, useEffect, useRef, useCallback } from 'react';  
import AudioPlayer from 'react-h5-audio-player';  
import 'react-h5-audio-player/lib/styles.css';  

const CustomPlayer = ({ darkMode, src }) => {  
  const [isVideo, setIsVideo] = useState(false);  
  const [isLoading, setIsLoading] = useState(true);  
  const [streamStatus, setStreamStatus] = useState('checking');  
  const [playIntent, setPlayIntent] = useState(false);  
  const [isHovered, setIsHovered] = useState(false); // New hover state  
  const videoRef = useRef(null);  
  const audioRef = useRef(null);  
  const statusRef = useRef(streamStatus);  
  const playIntentRef = useRef(playIntent);  
  const checkTimeoutRef = useRef(null);  
  const retryCount = useRef(0);  

  // Sync refs with current state  
  useEffect(() => {  
    statusRef.current = streamStatus;  
    playIntentRef.current = playIntent;  
  }, [streamStatus, playIntent]);  

  // Revised stream health check with dynamic status updates  
  const checkStreamHealth = useCallback(async () => {  
    try {  
      const response = await fetch(src, {  
        method: 'GET',  
        cache: 'no-cache',  
        headers: {   
          'Cache-Control': 'no-cache',  
          'Range': 'bytes=0-1024' // Requesting the first 1024 bytes of the stream  
        }  
      });  

      // Check if the response is OK and contains audio data  
      if (!response.ok) throw new Error('Server error');  

      const contentType = response.headers.get('Content-Type');  
      if (contentType && contentType.includes('audio')) {  
        retryCount.current = 0;  
        return 'active';  
      } else {  
        throw new Error('Not audio stream');  
      }  
    } catch (error) {  
      retryCount.current = Math.min(retryCount.current + 1, 5);  
      return 'error';  
    }  
  }, [src]);  

  // Adaptive stream monitoring with immediate feedback  
  useEffect(() => {  
    let isMounted = true;  

    const calculateDelay = () => {  
      return statusRef.current === 'active'  
        ? 15000 // 15 seconds for active status checks  
        : 5000; // Check every 5 seconds when not active  
    };  

    const scheduleCheck = (delay) => {  
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);  
      checkTimeoutRef.current = setTimeout(performCheck, delay);  
    };  

    const performCheck = async () => {  
      if (!isMounted) return;  

      const previousStatus = statusRef.current;  
      const status = await checkStreamHealth();  
      if (!isMounted) return;  

      setStreamStatus(status);  

      // Immediate visual feedback for status changes  
      if (status === 'active') {  
        // If the stream is active, check again in 15 seconds  
        if (previousStatus !== 'active') {  
          setStreamStatus('active');  
        }  
      } else {  
        // If the stream is not active, revert to error or reconnecting status  
        if (previousStatus === 'active') {  
          setStreamStatus('connecting'); // Visual indication that reconnect is attempted  
        }  
      }  

      scheduleCheck(calculateDelay());  
    };  

    scheduleCheck(2000); // Initial check after 2 seconds  

    return () => {  
      isMounted = false;  
      clearTimeout(checkTimeoutRef.current);  
    };  
  }, [checkStreamHealth, isVideo]);  

  // Media type detection with cleanup  
  useEffect(() => {  
    const controller = new AbortController();  
    const media = document.createElement('video');  

    const detectType = async () => {  
      try {  
        media.src = src;  

        const metadataLoaded = new Promise((resolve) => {  
          media.onloadedmetadata = resolve;  
        });  

        const errorOccurred = new Promise((resolve) => {  
          media.onerror = resolve;  
        });  

        await Promise.race([metadataLoaded, errorOccurred]);  

        if (controller.signal.aborted) return;  
        setIsVideo(media.videoWidth > 0);  
        setIsLoading(false);  
      } catch (error) {  
        if (!controller.signal.aborted) {  
          setIsVideo(false);  
          setIsLoading(false);  
        }  
      }  
    };  

    detectType();  
    return () => {  
      controller.abort();  
      media.remove();  
    };  
  }, [src]);  

  // Play state management  
  const handlePlay = () => {  
    setPlayIntent(true);  
    localStorage.setItem('playIntent', 'true');  
  };  

  const handlePause = () => {  
    setPlayIntent(false);  
    localStorage.removeItem('playIntent');  
  };  

  // Restore play state  
  useEffect(() => {  
    const savedIntent = localStorage.getItem('playIntent');  
    if (savedIntent) {  
      setPlayIntent(true);  
      const attemptPlay = (retries = 0) => {  
        try {  
          const mediaElement = isVideo ? videoRef.current : audioRef.current?.audio.current;  
          if (mediaElement) {  
            mediaElement.play()  
              .catch(() => retries < 3 && setTimeout(() => attemptPlay(retries + 1), 1000));  
          }  
        } catch (error) {  
          console.error('Play restoration error:', error);  
        }  
      };  
      attemptPlay();  
    }  
  }, [isVideo]);  

  // Removed inline styles in favor of Tailwind classes

  const SimpleAudioWave = () => (
    <div className="flex items-center justify-center h-10 w-20 absolute right-2.5 top-1/2 transform -translate-y-1/2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`mx-0.5 w-1 transition-all duration-300 ${
            streamStatus === 'active' ? 'bg-green-500/80' : 'bg-gray-400'
          }`}
          style={{
            height: playIntent ? `${6 + i * 6}px` : '6px',
            animation: playIntent ? `audioWave 0.5s ease infinite alternate-reverse ${i * 0.1}s` : 'none',
          }}
        />
      ))}
    </div>
  );

  return (
    <div className={`w-full max-w-md relative overflow-hidden rounded-xl ${darkMode ? 'bg-gray-800 shadow-md' : 'bg-gray-100 shadow-blue-500/30 shadow-md'}`}>
      <style>{`
        @keyframes audioWave {
          0% { height: 6px; }
          100% { height: 30px; }
        }
        
        /* Dark mode styles for react-h5-audio-player */
        .dark .rhap_container {
          background-color: #1F2937;
          color: white;
        }
        
        .dark .rhap_button-clear,
        .dark .rhap_main-controls-button,
        .dark .rhap_volume-button {
          color: white;
        }
        
        .dark .rhap_progress-filled,
        .dark .rhap_volume-bar-filled {
          background-color: #3B82F6;
        }
        
        .dark .rhap_progress-indicator,
        .dark .rhap_volume-indicator {
          background: #60A5FA;
        }
        
        .dark .rhap_progress-bar,
        .dark .rhap_volume-bar {
          background-color: #4B5563;
        }
        
        .dark .rhap_main-controls-button:hover,
        .dark .rhap_volume-button:hover {
          color: #93C5FD;
        }
      `}</style>

      {isLoading ? (
        <div className="flex justify-center items-center h-20">
          <svg className="w-8 h-8 text-gray-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : isVideo ? (
        <video
          ref={videoRef}
          src={src}
          controls
          autoPlay={playIntent}
          onPlay={handlePlay}
          onPause={handlePause}
          className="w-full h-auto"
        />
      ) : (
        <div className={`flex relative items-center ${darkMode ? 'dark' : ''}`}>
          <AudioPlayer
            ref={audioRef}
            autoPlay={playIntent}
            src={src}
            onPlay={handlePlay}
            onPause={handlePause}
            onError={() => setStreamStatus('error')}
            onCanPlay={() => setStreamStatus('active')}
            customProgressBarSection={[]}
            customControlsSection={["MAIN_CONTROLS", "VOLUME_CONTROLS"]}
            showJumpControls={false}
            customAdditionalControls={[]}
            layout="horizontal-reverse"
            className="w-full bg-transparent shadow-none"
          />
          <SimpleAudioWave />
        </div>
      )}

      <div
        className={`p-0.5 fixed top-0 right-0 flex items-center gap-1 z-10 ${darkMode ? 'bg-gray-700/70' : 'bg-gray-200/70'} rounded backdrop-blur`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
          streamStatus === 'active' ? 'bg-green-500' :
          streamStatus === 'connecting' ? 'bg-yellow-500' :
          streamStatus === 'error' ? 'bg-red-500' : 
          'bg-gray-500' // Default state (checking)
        }`} />
        
        {/* Show text only when hovered */}
        {isHovered && (
          <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {streamStatus === 'active' ? 'Activo' : streamStatus === 'connecting' ? 'Conectando...' : 'Error'}
          </span>
        )}
      </div>
    </div>
  
  );  
};  

export default CustomPlayer;  
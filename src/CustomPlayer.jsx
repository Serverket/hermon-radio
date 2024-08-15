import React, { useState, useEffect, useRef } from 'react';  
import AudioPlayer from 'react-h5-audio-player';  
import 'react-h5-audio-player/lib/styles.css';  

const CustomPlayer = ({ darkMode, src }) => {  
  const [isVideo, setIsVideo] = useState(false);  
  const [isLoading, setIsLoading] = useState(true);  
  const [isPlaying, setIsPlaying] = useState(false);  
  const videoRef = useRef(null);  

  useEffect(() => {  
    setIsLoading(true);  
    const video = document.createElement('video');  
    video.src = src;  
    video.onloadedmetadata = () => {  
      setIsVideo(video.videoWidth > 0);  
      setIsLoading(false);  
    };  
    video.onerror = () => {  
      setIsVideo(false);  
      setIsLoading(false);  
    };  
  }, [src]);  

  const handlePlay = () => setIsPlaying(true);  
  const handlePause = () => setIsPlaying(false);  

  const commonStyles = {  
    backgroundColor: darkMode ? '#1F2937' : '#F3F4F6',  
    borderRadius: '12px',  
    boxShadow: darkMode  
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'  
      : '0 4px 6px -1px rgba(59, 130, 246, 0.5), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',  
    overflow: 'hidden',  
    width: '100%',  
    maxWidth: '400px',  
  };  

  const SimpleAudioWave = () => (  
    <div style={{  
      display: 'flex',  
      alignItems: 'center',  
      justifyContent: 'center',  
      height: '40px',  
      width: '80px',  
      position: 'absolute',  
      right: '10px',  
      top: '50%',  
      transform: 'translateY(-50%)',  
    }}>  
      {[1, 2, 3, 4, 5].map((i) => (  
        <div  
          key={i}  
          style={{  
            width: '4px',  
            height: isPlaying ? `${6 + i * 6}px` : '6px',  
            backgroundColor: 'var(--rhap-main-text-color)',  
            margin: '0 3px',  
            animation: isPlaying ? `audioWave 0.5s ease infinite alternate-reverse ${i * 0.1}s` : 'none',  
            transition: 'height 0.2s ease',  
          }}  
        />  
      ))}  
    </div>  
  );  

  return (  
    <div style={commonStyles} className={`custom-player-container ${darkMode ? 'dark' : ''}`}>  
      <style>  
        {`  
          @keyframes audioWave {  
            0% { height: 6px; }  
            100% { height: 30px; }  
          }  
          @keyframes spin {  
            to { transform: rotate(360deg); }  
          }  
          .custom-player-container {  
            --rhap-theme-color: ${darkMode ? '#9CA3AF' : '#4B5563'};  
            --rhap-main-text-color: ${darkMode ? '#9CA3AF' : '#4B5563'};  
            --rhap-background-color: transparent;  
          }  
          .custom-player-container .rhap_main-controls-button,  
          .custom-player-container .rhap_volume-button,  
          .custom-player-container .rhap_volume-bar,  
          .custom-player-container .rhap_volume-indicator {  
            color: var(--rhap-main-text-color);  
          }  
          .custom-player-container .rhap_volume-bar {  
            background-color: ${darkMode ? '#4B5563' : '#D1D5DB'};  
          }  
          .custom-player-container .rhap_volume-indicator {  
            background: var(--rhap-main-text-color);  
          }  
          .custom-player-container .rhap_volume-bar::-webkit-slider-thumb {  
            background: var(--rhap-main-text-color);  
          }  
          .custom-player-container .rhap_volume-bar::-moz-range-thumb {  
            background: var(--rhap-main-text-color);  
          }  
        `}  
      </style>  
      {isLoading ? (  
        <div className="flex items-center justify-center h-20">  
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
          autoPlay  
          className="custom-video-player"  
          style={{ width: '100%', height: 'auto' }}  
        />  
      ) : (  
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>  
          <AudioPlayer  
            autoPlay  
            src={src}  
            onPlay={handlePlay}  
            onPause={handlePause}  
            customProgressBarSection={[]}  
            customControlsSection={["MAIN_CONTROLS", "VOLUME_CONTROLS"]}  
            showJumpControls={false}  
            customAdditionalControls={[]}  
            layout="horizontal-reverse"  
            className={`custom-player ${darkMode ? 'dark' : ''}`}  
            style={{  
              backgroundColor: 'transparent',  
              boxShadow: 'none',  
              width: '100%',  
            }}  
          />  
          <SimpleAudioWave />  
        </div>  
      )}  
    </div>  
  );  
};  

export default CustomPlayer;
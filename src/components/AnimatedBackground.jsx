/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import bgLightGold from '../assets/bg-light-gold.webm';
import bgDarkGold from '../assets/bg-gold.webm';

/**
 * Renders the Light Neo-Glass & Opal Gold / Dark Obsidian backdrop using:
 * 1) The repainted golden silk looping video texture (only active theme decodes)
 * 2) Subtle adaptive poster colorimetry aura
 */
export default function AnimatedBackground({ darkMode }) {
  const lightVideoRef = useRef(null);
  const darkVideoRef = useRef(null);
  const [lightReady, setLightReady] = useState(false);
  const [darkReady, setDarkReady] = useState(false);

  // Ready listeners attached once on mount
  useEffect(() => {
    const bindReady = (videoEl, setReady) => {
      if (!videoEl) return () => {};
      const markReady = () => setReady(true);

      if (videoEl.readyState >= 3) {
        markReady();
      } else {
        videoEl.addEventListener('canplaythrough', markReady);
        videoEl.addEventListener('loadeddata', markReady);
        videoEl.addEventListener('playing', markReady);
      }

      return () => {
        videoEl.removeEventListener('canplaythrough', markReady);
        videoEl.removeEventListener('loadeddata', markReady);
        videoEl.removeEventListener('playing', markReady);
      };
    };

    const cleanupLight = bindReady(lightVideoRef.current, setLightReady);
    const cleanupDark = bindReady(darkVideoRef.current, setDarkReady);
    return () => {
      cleanupLight();
      cleanupDark();
    };
  }, []);

  // Decode & play ONLY the active theme's WebM texture (saves ~50% background video decode)
  useEffect(() => {
    const activeVideo = darkMode ? darkVideoRef.current : lightVideoRef.current;
    const inactiveVideo = darkMode ? lightVideoRef.current : darkVideoRef.current;
    if (inactiveVideo && !inactiveVideo.paused) {
      inactiveVideo.pause();
    }
    if (activeVideo && activeVideo.paused) {
      activeVideo.play().catch(() => {});
    }
  }, [darkMode]);

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 transition-colors duration-500 ${
        darkMode ? 'canvas-dark' : 'canvas-light'
      }`}
    >
      {/* Golden Silk Moving Texture — Light Opal Mode */}
      <video
        ref={lightVideoRef}
        src={bgLightGold}
        preload={darkMode ? 'none' : 'auto'}
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out mix-blend-multiply ${
          !darkMode && lightReady ? 'opacity-80' : 'opacity-0'
        }`}
      />

      {/* Golden Silk Moving Texture — Dark Obsidian Mode */}
      <video
        ref={darkVideoRef}
        src={bgDarkGold}
        preload={darkMode ? 'auto' : 'none'}
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out mix-blend-screen ${
          darkMode && darkReady ? 'opacity-75' : 'opacity-0'
        }`}
      />

      {/* Subtle Adaptive Poster Colorimetry Aura (transparent in Opal Gold fallback) */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: darkMode
            ? 'radial-gradient(ellipse 85% 65% at 50% 28%, var(--hermon-aura-dark, rgba(223, 188, 88, 0)) 0%, transparent 72%)'
            : 'radial-gradient(ellipse 85% 65% at 50% 28%, var(--hermon-aura-light, rgba(223, 188, 88, 0)) 0%, transparent 72%)',
        }}
      />
    </div>
  );
}

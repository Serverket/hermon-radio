import React, { useEffect, useRef, useState } from 'react';
import bgVideo from '../assets/bg.webm';

export default function AnimatedBackground({ darkMode }) {
    const videoRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const handleReady = () => setIsReady(true);

        if (v.readyState >= 4) {
            handleReady();
        } else {
            v.addEventListener("canplaythrough", handleReady);
            v.addEventListener("loadeddata", handleReady);
            v.addEventListener("playing", handleReady);
        }

        v.play().catch(e => console.warn("Autoplay blocked:", e));

        return () => {
            v.removeEventListener("canplaythrough", handleReady);
            v.removeEventListener("loadeddata", handleReady);
            v.removeEventListener("playing", handleReady);
        };
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {/* Video Layer */}
            <video
                ref={videoRef}
                src={bgVideo}
                autoPlay
                muted
                loop
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out 
          ${isReady ? (darkMode ? "opacity-30 brightness-50 invert" : "opacity-30 mix-blend-overlay brightness-125") : "opacity-0"}`}
            />

            {/* Gradient Overlays for "Repaint" Effect */}
            {/* Dark Mode Gradient: Softens the video to blend with dark theme - Reduced opacity for more brightness */}
            <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out bg-gradient-to-br from-black/40 to-gray-900/40 ${darkMode ? 'opacity-100' : 'opacity-0'}`} />

            {/* Light Mode Gradient: Removed/Adjusted to allow body gradient to show through, adding just a subtle texture blend if needed */}
            <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out bg-transparent ${!darkMode ? 'opacity-0' : 'opacity-0'}`} />


        </div>
    );
}

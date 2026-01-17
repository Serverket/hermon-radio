import React, { useState, useEffect } from 'react';

const Slideshow = ({ images, interval = 5000, className = "", onClick, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (!images || images.length <= 1) return;

        const timer = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
                setIsTransitioning(false);
            }, 500); // Wait for fade out
        }, interval);

        return () => clearInterval(timer);
    }, [images, interval]);

    if (!images || images.length === 0) return null;

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {images.map((img, index) => (
                <img
                    key={img}
                    src={img}
                    alt={`Slide ${index + 1}`}
                    onClick={onClick}
                    title={title}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                />
            ))}

            {/* Background placeholder to maintain size if needed, though absolute positioning might require container sizing */}
            <img
                src={images[0]}
                alt="placeholder"
                className="invisible relative z-[-1]"
            />
        </div>
    );
};

export default Slideshow;

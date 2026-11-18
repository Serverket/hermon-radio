/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';

const Slideshow = ({
  images,
  interval = 5000,
  className = '',
  imgClassName = '',
  onClick,
  title,
  onSlideChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    onSlideChange?.(images[currentIndex]);
  }, [images, currentIndex, onSlideChange]);

  useEffect(() => {
    if (!images || images.length <= 1) return undefined;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  const activeSrc = images[currentIndex] || images[0];

  return (
    <div className={`relative overflow-hidden ${imgClassName ? 'w-fit max-w-full mx-auto' : ''} ${className}`}>
      {images.map((img, index) => (
        <img
          key={img}
          src={img}
          alt={`Slide ${index + 1}`}
          onClick={onClick}
          title={title}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
            imgClassName.includes('group-hover') ? 'transition-[opacity,transform]' : ''
          } ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        />
      ))}

      {/* Invisible in-flow spacer matching the active slide's aspect ratio so container corners hug the poster */}
      <img
        src={activeSrc}
        alt=""
        aria-hidden="true"
        className={`invisible pointer-events-none block ${imgClassName || 'max-h-full mx-auto'}`}
      />
    </div>
  );
};

export default Slideshow;

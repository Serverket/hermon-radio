import React, { useEffect, useState } from 'react';

/**
 * Image Modal component for displaying enlarged program images
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.image - The image source URL
 * @param {string} props.name - The name/title of the image
 * @param {string} props.header - The header text for the image
 * @param {string} props.footer - The footer text for the image
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 */
const ImageModal = ({ isOpen, onClose, image, name, header, footer, darkMode }) => {
  const [entered, setEntered] = useState(false);
  // Handle ESC key to close modal (attach only when open)
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Animate when opening
  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return;
    }
    setEntered(false);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Handle click on backdrop to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[250] flex items-center justify-center transition-opacity duration-200 ${entered ? 'bg-black/75 opacity-100' : 'bg-black/0 opacity-0'}`}
      onClick={handleBackdropClick}
    >
      <div className={`relative w-[92vw] sm:w-auto max-w-3xl mx-auto rounded-lg overflow-hidden shadow-xl transform transition-all duration-200 ${entered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'} 
                      ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={"absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"}
          aria-label="Cerrar"
        >
          <i className="icon-cancel text-2xl" />
        </button>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex flex-col items-center">
            {/* Header */}
            {header && (
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {header}
              </h3>
            )}
            
            {/* Image */}
            <div className="w-full flex justify-center my-2">
              <img 
                src={image} 
                alt={name || 'Program image'} 
                className="max-h-[70vh] object-contain rounded-md"
              />
            </div>
            
            {/* Footer */}
            {footer && (
              <div className={`mt-4 text-sm text-center max-w-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

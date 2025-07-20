import React, { useEffect } from 'react';

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
  // Handle ESC key to close modal
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity"
      onClick={handleBackdropClick}
    >
      <div className={`relative max-w-3xl mx-auto rounded-lg overflow-hidden shadow-xl transform transition-all 
                      ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center 
                    ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          aria-label="Close modal"
        >
          ×
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

import React from 'react';
import MultiBibleCard from '../MultiBibleCard';

const BibleModal = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className={`relative w-[90%] h-[90%] md:w-[80%] md:h-[80%] lg:w-[75%] lg:h-[75%] rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
        data-aos="zoom-in"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
          aria-label="Cerrar"
          title="Cerrar"
        >
          <i className="icon-cancel text-2xl" />
        </button>
        <div className="h-full w-full">
          <div className="h-full w-full p-4 text-xl">
            <MultiBibleCard darkMode={darkMode} isVisible={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleModal;

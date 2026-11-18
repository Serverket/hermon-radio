/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import MultiBibleCard from '../MultiBibleCard';

const BibleModal = ({ isOpen, onClose, darkMode, initialSelection = null }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Santa Biblia Reina-Valera 1960"
      className={`${darkMode ? 'dark' : ''} fixed inset-0 z-[1000] bg-slate-900/35 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6`}
      onClick={onClose}
    >
      <div
        className="glass-shell rounded-[24px] sm:rounded-[28px] w-full max-w-[760px] h-[92dvh] sm:h-[88vh] max-h-[760px] p-4 sm:p-7 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-aos="zoom-in"
        data-aos-duration="300"
      >
        <MultiBibleCard
          darkMode={darkMode}
          isVisible={true}
          onClose={onClose}
          initialSelection={initialSelection}
        />
      </div>
    </div>,
    document.body
  );
};

export default BibleModal;

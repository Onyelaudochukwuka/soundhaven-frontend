import React, { useState, useEffect, ReactNode, KeyboardEvent } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen && !shouldRender) {
      setShouldRender(true);
    } else if (!isOpen && shouldRender) {
      timeoutId = setTimeout(() => setShouldRender(false), 200); // Debounce delay
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen, shouldRender]);

  const handleClose = () => {
    onClose();
  };

  if (!shouldRender) return null;

  // const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
  //   console.log('--- Modal Input Keydown Event ---'); // Mark the start of modal input logs
  //   console.log('event:', e);  // Inspect the event object
  //   console.log('event.target:', e.target);
  //   console.log('event.currentTarget:', e.currentTarget);
  //   console.log('e.code:', e.code); // Log the key code to check if it's 'Space'

  //   if (e.code === 'Space') {
  //     if (e) {
  //         e.preventDefault();
  //         e.stopPropagation();

  //         document.body.style.overflow = 'hidden'; 
  //     } else {
  //         console.warn('Event is undefined!');
  //     }
  //   }
  // };

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div 
        className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full" 
        // onKeyDown={handleKeyDown}
      >
        <button onClick={handleClose} className="text-red-500 float-right font-semibold">
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

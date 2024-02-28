import React, { useState, useEffect, ReactNode } from 'react';

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
    onClose(); // Perform the close action immediately
    // The modal will be removed from the DOM after the delay
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full">
        <button onClick={handleClose} className="text-red-500 float-right font-semibold">
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

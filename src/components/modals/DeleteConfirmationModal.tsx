import React, { useEffect, useRef } from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  doNotAskAgain: boolean;
  setDoNotAskAgain: (value: boolean) => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  doNotAskAgain,
  setDoNotAskAgain,
}) => {


  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isOpen) {
        event.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onConfirm]);

  useEffect(() => {
    if (isOpen) {
      deleteButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white z-50">
        <h3 className="text-lg font-bold">Confirm Delete</h3>
        <p className="mt-2">Are you sure you want to delete this track from your library?</p>
        <div className="mt-3">
          <input
            type="checkbox"
            id="doNotAskAgain"
            checked={doNotAskAgain}
            onChange={(e) => setDoNotAskAgain(e.target.checked)}
          />
          <label htmlFor="doNotAskAgain" className="ml-2">Do not ask me again</label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
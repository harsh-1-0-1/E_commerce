import { useEffect } from 'react';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-primary-500',
  };

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 min-w-[300px]`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-white hover:text-neutral-100"
      >
        ×
      </button>
    </div>
  );
};


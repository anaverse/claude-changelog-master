import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-28 right-6 flex items-center gap-3 px-5 py-4 border-brutal shadow-brutal z-50 transition-all duration-100 ${
        type === 'success'
          ? 'bg-accent-green text-black'
          : 'bg-accent-red text-white'
      }`}
      role="alert"
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      <span className="font-brutal font-bold uppercase tracking-wide">{message}</span>
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-black/20 transition-colors ml-2"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

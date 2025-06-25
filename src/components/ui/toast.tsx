import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'error';
  duration?: number;
}

interface ToastContextProps {
  showToast: (message: string, options?: { type?: Toast['type']; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, options?: { type?: Toast['type']; duration?: number }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type: options?.type, duration: options?.duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options?.duration ?? 3500);
  }, []);
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => (
  <div className="fixed bottom-4 left-1/2 z-50 flex flex-col items-center space-y-2 -translate-x-1/2">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`px-4 py-2 rounded shadow-lg text-sm animate-fade-in-up
          ${toast.type === 'error' ? 'bg-destructive text-destructive-foreground' : toast.type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
        style={{ minWidth: 220, maxWidth: 360 }}
      >
        {toast.message}
      </div>
    ))}
    <style jsx global>{`
      @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.3s cubic-bezier(0.4,0,0.2,1);
      }
    `}</style>
  </div>
); 
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 3500 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    info: (msg, title) => addToast({ message: msg, title, type: 'info' }),
    success: (msg, title) => addToast({ message: msg, title, type: 'success' }),
    warning: (msg, title) => addToast({ message: msg, title, type: 'warning' }),
    error: (msg, title) => addToast({ message: msg, title, type: 'error' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
            error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-[#1F5E4B] shrink-0 mt-0.5" />,
          };

          const borders = {
            success: 'border-emerald-200 bg-white shadow-emerald-950/5',
            error: 'border-rose-200 bg-white shadow-rose-950/5',
            warning: 'border-amber-200 bg-white shadow-amber-950/5',
            info: 'border-[#D8E9E2] bg-white shadow-[#1F5E4B]/5',
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in ${borders[t.type] || borders.info}`}
            >
              {icons[t.type] || icons.info}
              <div className="flex-1 min-w-0">
                {t.title && <h4 className="text-xs font-bold text-[#17211D]">{t.title}</h4>}
                <p className="text-xs text-[#6B756F] leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[#6B756F] hover:text-[#17211D] p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

import React, { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed z-50 bottom-20 md:bottom-6 right-0 left-0 md:left-auto md:right-6 px-4 md:px-0 flex flex-col space-y-2.5 pointer-events-none max-w-sm w-full mx-auto md:mx-0">
        {toasts.map((toast) => {
          let bgClass = 'bg-white border-slate-200 text-slate-800';
          let Icon = Info;
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
            Icon = CheckCircle;
            iconColor = 'text-emerald-500';
          } else if (toast.type === 'error') {
            bgClass = 'bg-red-50 border-red-200 text-red-900';
            Icon = XCircle;
            iconColor = 'text-red-500';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-50 border-amber-200 text-amber-900';
            Icon = AlertTriangle;
            iconColor = 'text-amber-500';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-2xl border shadow-lg pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgClass}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <span className="text-xs font-bold leading-normal">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-black/5 transition-colors shrink-0 ml-3"
              >
                <X className="w-3.5 h-3.5" />
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
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let config = {
              bg: 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/50',
              icon: <Info className="h-5 w-5 text-cyan-400" />
            };

            if (toast.type === 'success') {
              config = {
                bg: 'bg-green-950/90 border-green-900/60 text-green-100 shadow-green-950/50',
                icon: <CheckCircle className="h-5 w-5 text-green-400" />
              };
            } else if (toast.type === 'error') {
              config = {
                bg: 'bg-red-950/90 border-red-900/60 text-red-100 shadow-red-950/50',
                icon: <XCircle className="h-5 w-5 text-red-400" />
              };
            } else if (toast.type === 'warning') {
              config = {
                bg: 'bg-amber-950/90 border-amber-900/60 text-amber-100 shadow-amber-950/50',
                icon: <AlertTriangle className="h-5 w-5 text-amber-400" />
              };
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${config.bg}`}
              >
                <div className="flex items-center gap-3">
                  {config.icon}
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-text-muted hover:text-text-primary p-0.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

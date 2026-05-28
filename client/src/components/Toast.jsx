import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

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
            // Determine left border color based on type - thin colored border only
            let leftBorderColor = 'border-[#444748]';
            let leftAccentColor = '';

            if (toast.type === 'success') {
              leftAccentColor = 'border-l-[#22c55e]';
            } else if (toast.type === 'error') {
              leftAccentColor = 'border-l-[#ef4444]';
            } else if (toast.type === 'warning') {
              leftAccentColor = 'border-l-[#eab308]';
            } else {
              leftAccentColor = 'border-l-[#8e9192]';
            }

            // Simple geometric dot indicator
            let dotColor = 'bg-[#8e9192]';
            if (toast.type === 'success') dotColor = 'bg-[#22c55e]';
            else if (toast.type === 'error') dotColor = 'bg-[#ef4444]';
            else if (toast.type === 'warning') dotColor = 'bg-[#eab308]';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#1c1b1b] border ${leftBorderColor} border-l-4 ${leftAccentColor} backdrop-blur-md shadow-lg`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                  <p className="text-sm font-medium text-white">{toast.message}</p>
                </div>
                
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-[#8e9192] hover:text-white p-0.5 transition-colors flex-shrink-0 cursor-pointer"
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

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer = () => {
  const toasts = useSelector((state) => state.ui.toasts);
  const dispatch = useDispatch();

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => dispatch(removeToast(toast.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-accent shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-brand-card/95',
    error: 'border-red-500/40 bg-brand-card/95',
    info: 'border-brand-accent/40 bg-brand-card/95',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md ${borders[toast.type] || borders.info}`}
    >
      <div className="flex items-center gap-3">
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium text-brand-text leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-brand-muted hover:text-white p-1 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

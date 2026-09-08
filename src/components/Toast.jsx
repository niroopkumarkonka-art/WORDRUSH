import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

// Individual Toast with strict 1.5-second time limit
const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDismiss) onDismiss(toast.id);
    }, 1500); // 1.5 sec only
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  }[toast.type] || <Info className="w-5 h-5 text-sky-600 shrink-0" />;

  const borderStyles = {
    success: "border-2 border-emerald-300 bg-white text-slate-700 shadow-lg",
    warning: "border-2 border-amber-300 bg-white text-slate-700 shadow-lg",
    error: "border-2 border-rose-300 bg-white text-slate-700 shadow-lg",
    info: "border-2 border-sky-300 bg-white text-slate-700 shadow-lg",
  }[toast.type] || "border-2 border-slate-200 bg-white text-slate-700 shadow-lg";

  return (
    <div
      key={toast.id}
      className={`pointer-events-auto p-4 rounded-2xl flex items-start gap-3 backdrop-blur-md transition-all animate-pop ${borderStyles}`}
    >
      {icons}
      <div className="flex-1 text-xs">
        {toast.title && <div className="font-bold text-slate-800 mb-0.5">{toast.title}</div>}
        <div className="font-medium text-slate-600 leading-snug">{toast.message}</div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss && onDismiss(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const Toast = ({ toasts = [], onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0 select-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default Toast;


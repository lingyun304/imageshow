import React from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';

export function Toast({ toast }) {
  if (!toast?.show) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle size={18} className="toast-icon error" />;
      case 'info':
        return <Info size={18} className="toast-icon info" />;
      case 'warning':
        return <AlertCircle size={18} className="toast-icon warning" />;
      case 'success':
      default:
        return <Check size={18} className="toast-icon success" />;
    }
  };

  return (
    <div className={`toast-notification ${toast.type || 'success'} slide-in-top`}>
      {getIcon()}
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}

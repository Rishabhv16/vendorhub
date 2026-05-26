'use client';
import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const icons = { success: <CheckCircle size={18} />, error: <XCircle size={18} />, info: <Info size={18} /> };

  return (
    <div className={`toast toast-${type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
        <X size={16} />
      </button>
    </div>
  );
}

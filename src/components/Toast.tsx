'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastHandler: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (addToastHandler) {
    addToastHandler(message, type);
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  useEffect(() => {
    addToastHandler = (message: string, type: ToastType) => {
      const id = `toast-${++toastId}`;
      setToasts(prev => [...prev, { id, message, type }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    
    return () => {
      addToastHandler = null;
    };
  }, []);
  
  const icons = {
    success: <CheckCircle size={20} className="text-[#7D9C7D]" />,
    error: <XCircle size={20} className="text-[#C17B7B]" />,
    info: <AlertCircle size={20} className="text-[#C4A77D]" />,
  };
  
  return (
    <>
      {children}
      <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-[#2D2A26] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up pointer-events-auto"
          >
            {icons[toast.type]}
            <span className="text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

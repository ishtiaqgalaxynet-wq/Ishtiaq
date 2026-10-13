import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-medium pointer-events-auto transition-all animate-slide-up backdrop-blur-md ${
            t.type === 'success'
              ? 'bg-[#16161b]/95 border-emerald-500/40 text-emerald-300'
              : t.type === 'error'
              ? 'bg-[#16161b]/95 border-rose-500/40 text-rose-300'
              : 'bg-[#16161b]/95 border-white/[0.12] text-zinc-200'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-zinc-300 shrink-0" />}
          <span className="flex-1 leading-snug">{t.text}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-zinc-400 hover:text-white p-0.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

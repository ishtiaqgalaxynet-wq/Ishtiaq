import React from 'react';
import { X, Keyboard, Crown } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + V / ⌘V', desc: 'Paste photo or screenshot from clipboard' },
    { key: 'Ctrl + C / ⌘C', desc: 'Copy edited photo directly to clipboard' },
    { key: 'Ctrl + Z / ⌘Z', desc: 'Undo last edit' },
    { key: 'Ctrl + Y / ⌘⇧Z', desc: 'Redo last edit' },
    { key: 'Mouse Wheel', desc: 'Zoom in and out of canvas' },
    { key: 'Space + Drag', desc: 'Pan / move around canvas freely' },
    { key: 'Enter', desc: 'Apply crop selection' },
    { key: 'Esc', desc: 'Cancel crop or close modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#141418] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden text-xs text-zinc-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#18181e]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-zinc-300" />
            <h2 className="text-xs font-bold text-white tracking-tight uppercase">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 divide-y divide-white/[0.05]">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
              <span className="text-zinc-300 text-[11px]">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#222229] border border-white/[0.1] font-mono text-[10px] text-zinc-100 font-semibold shrink-0 shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-[#18181e] border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Owner: <strong className="text-zinc-200">Ishtiaq Islam Himel</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef } from 'react';
import { 
  ClipboardCopy, 
  Upload, 
  Crop, 
  RotateCw, 
  Combine, 
  ShieldAlert, 
  Sparkles,
  Sliders,
  Crown
} from 'lucide-react';

interface EmptyStateProps {
  onPasteFromClipboard: () => void;
  onSelectFiles: (files: FileList | File[]) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onPasteFromClipboard,
  onSelectFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFiles(e.target.files);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="max-w-xl w-full space-y-6">
        {/* Main dropzone / paste card */}
        <div 
          onClick={onPasteFromClipboard}
          className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-[#141418]/60 hover:bg-[#18181f]/80 p-10 transition-all duration-200 flex flex-col items-center justify-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1c1c22] border border-white/[0.08] flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:scale-105 group-hover:border-white/[0.2] transition-all shadow-md">
            <ClipboardCopy className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Click to Paste or Press <kbd className="px-2 py-0.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md font-mono text-zinc-300">Ctrl+V</kbd> / <kbd className="px-2 py-0.5 text-xs bg-zinc-800 border border-zinc-700 rounded-md font-mono text-zinc-300">⌘V</kbd>
            </h3>
            <p className="text-sm text-zinc-400">
              or browse image files from your computer
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select Images</span>
            </button>
          </div>

          <div className="text-xs text-zinc-500 font-mono pt-2">
            PNG · JPEG · WEBP · Clipboard Screenshots · Select multiple to Merge
          </div>
        </div>

        {/* Feature guide badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-zinc-400">
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <Crop className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Fast Crop & Aspect Ratios</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <RotateCw className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Turn, Flip & Level Angles</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <Combine className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Attach & Merge Photos</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Censor & Pixelate Secrets</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Light & Contrast Adjust</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>1-Click Copy to Clipboard</span>
          </div>
        </div>

        {/* Owner Credit Banner */}
        <div className="pt-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16161d] border border-white/[0.08] hover:border-amber-400/40 text-xs text-zinc-300 shadow-sm transition-colors group">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Owned & Created by <strong className="text-white font-semibold">Ishtiaq Islam Himel</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

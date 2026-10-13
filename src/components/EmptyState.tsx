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
  Layers,
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
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-10 flex flex-col items-center justify-center bg-[#0e0e11]">
      <div className="w-full max-w-2xl space-y-7 animate-fade-in my-auto">
        
        {/* Main Minimalist Dropzone in Sleek Matte Charcoal */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative rounded-3xl border border-white/[0.08] bg-[#141418] p-8 sm:p-12 text-center space-y-6 hover:border-white/[0.16] hover:bg-[#17171c] transition-all cursor-pointer group shadow-2xl shadow-black/80"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Minimalist Ambient Matte Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#1f1f26] border border-white/[0.1] text-zinc-100 mx-auto flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <ClipboardCopy className="w-7 h-7 text-zinc-200" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Paste or Drop Your Photos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Press <kbd className="px-2 py-0.5 rounded bg-[#22222a] border border-white/[0.12] font-mono text-[11px] text-zinc-200 font-semibold shadow-xs">Ctrl + V</kbd> or <kbd className="px-2 py-0.5 rounded bg-[#22222a] border border-white/[0.12] font-mono text-[11px] text-zinc-200 font-semibold shadow-xs">⌘V</kbd> anywhere to paste a screenshot directly from your clipboard.
            </p>
          </div>

          {/* Friendly Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onPasteFromClipboard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-lg shadow-black/50 transition-all active:scale-[0.98]"
            >
              <ClipboardCopy className="w-4 h-4 text-zinc-950" />
              <span>Paste from Clipboard</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.1] bg-[#1e1e24] hover:bg-[#26262e] text-zinc-200 font-medium text-xs transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 text-zinc-400" />
              <span>Choose Photo (1, 2, or 3)</span>
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 font-mono pt-1">
            PNG · JPEG · WEBP · Clipboard Screenshots · Select 2 or 3 to Merge
          </div>
        </div>

        {/* User-friendly feature guide cards in matte charcoal */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-zinc-400">
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <Crop className="w-4 h-4 text-zinc-300 shrink-0" />
            <span>Fast Crop & Aspect Ratios</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <RotateCw className="w-4 h-4 text-zinc-300 shrink-0" />
            <span>Turn, Flip & Level Angles</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <Combine className="w-4 h-4 text-zinc-300 shrink-0" />
            <span>Attach & Merge 2 or 3 Photos</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-zinc-300 shrink-0" />
            <span>Censor & Pixelate Secrets</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-zinc-300 shrink-0" />
            <span>Light, Contrast & Auto Enhance</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141418] border border-white/[0.06] flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-zinc-300 shrink-0" />
            <span>1-Click Copy back to Clipboard</span>
          </div>
        </div>

        {/* Owner Credit Banner */}
        <div className="pt-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#15151a] border border-white/[0.08] text-xs text-zinc-400 shadow-md">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Owned & Created by <strong className="text-zinc-100 font-semibold">Ishtiaq Islam Himel</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

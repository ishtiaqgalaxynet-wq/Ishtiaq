import React from 'react';
import { 
  ClipboardCopy, 
  Download, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Keyboard, 
  Trash2, 
  Check, 
  Eye, 
  EyeOff,
  UserCheck
} from 'lucide-react';

interface TopBarProps {
  hasImage: boolean;
  imageDimensions: { width: number; height: number } | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onCopyToClipboard: () => void;
  copiedSuccess: boolean;
  onOpenExportModal: () => void;
  onOpenShortcuts: () => void;
  onClearImage: () => void;
  isComparing: boolean;
  setIsComparing: (comparing: boolean) => void;
  onTriggerPaste: () => void;
  onTriggerUpload: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  hasImage,
  imageDimensions,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onCopyToClipboard,
  copiedSuccess,
  onOpenExportModal,
  onOpenShortcuts,
  onClearImage,
  isComparing,
  setIsComparing,
  onTriggerPaste,
  onTriggerUpload,
}) => {
  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#121215]/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      {/* Zone 1: Wordmark, Owner credit & canvas metadata */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#222228] border border-white/[0.12] flex items-center justify-center font-bold text-white text-xs shadow-inner group-hover:border-white/[0.25] transition-colors">
            PC
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors flex items-center gap-1.5">
              PasteCrop
            </span>
            <div className="flex items-center gap-1.5">
              <span className="hidden md:inline-block w-1 h-1 rounded-full bg-zinc-600"></span>
              <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] hover:border-amber-400/30 transition-colors">
                <span className="text-amber-400">👑</span>
                <span className="hidden sm:inline text-zinc-500">Owner:</span>
                <span className="text-zinc-200 font-semibold">Ishtiaq Islam Himel</span>
              </span>
            </div>
          </div>
        </a>

        {hasImage && imageDimensions && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 font-mono pl-3 border-l border-white/[0.08]">
            <span className="text-zinc-300">{imageDimensions.width} × {imageDimensions.height}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400">{Math.round(zoom * 100)}%</span>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation & canvas interaction controls */}
      <nav className="flex items-center gap-1.5 md:gap-2 text-xs font-medium text-zinc-300">
        {!hasImage ? (
          <>
            <button
              onClick={onTriggerPaste}
              className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
            >
              Paste Clipboard
            </button>
            <button
              onClick={onTriggerUpload}
              className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
            >
              Upload Photo
            </button>
            <button
              onClick={onOpenShortcuts}
              className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
            >
              Shortcuts
            </button>
          </>
        ) : (
          <>
            {/* History undo / redo */}
            <div className="flex items-center bg-[#1c1c21] border border-white/[0.08] rounded-lg p-0.5 shadow-xs">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-300 disabled:opacity-25 disabled:hover:bg-transparent transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-300 disabled:opacity-25 disabled:hover:bg-transparent transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compare toggle */}
            <button
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={() => setIsComparing(false)}
              onMouseLeave={() => setIsComparing(false)}
              onTouchStart={() => setIsComparing(true)}
              onTouchEnd={() => setIsComparing(false)}
              title="Hold to compare with original image"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                isComparing
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-xs'
                  : 'bg-[#1c1c21] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {isComparing ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
              <span className="hidden sm:inline">Compare</span>
            </button>

            {/* Zoom controls */}
            <div className="hidden sm:flex items-center bg-[#1c1c21] border border-white/[0.08] rounded-lg p-0.5 shadow-xs">
              <button
                onClick={onZoomOut}
                title="Zoom Out"
                className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onZoomFit}
                title="Reset Fit to Screen"
                className="px-2 py-1 text-xs text-zinc-300 font-mono hover:text-white transition-colors"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={onZoomIn}
                title="Zoom In"
                className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all hidden md:block"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <button
              onClick={onClearImage}
              title="Clear Project"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all hidden md:block"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </nav>

      {/* Zone 3: Primary action button + Quick Copy */}
      <div className="flex items-center gap-2 shrink-0">
        {hasImage && (
          <button
            onClick={onCopyToClipboard}
            title="Copy to clipboard (Ctrl+C)"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
              copiedSuccess
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-[#1c1c21] border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardCopy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copiedSuccess ? 'Copied!' : 'Copy'}</span>
          </button>
        )}

        {hasImage ? (
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5 text-zinc-950" />
            <span>Export</span>
          </button>
        ) : (
          <button
            onClick={onTriggerPaste}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <ClipboardCopy className="w-3.5 h-3.5 text-zinc-950" />
            <span>Paste Photo</span>
          </button>
        )}
      </div>
    </header>
  );
};

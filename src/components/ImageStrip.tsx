import React from 'react';
import { ProjectImage } from '../types/editor';
import { Plus, X, Layers, Combine } from 'lucide-react';

interface ImageStripProps {
  images: ProjectImage[];
  activeImageId: string;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onAttachImageClick: () => void;
  onOpenMergeMode: () => void;
  isMergeMode: boolean;
}

export const ImageStrip: React.FC<ImageStripProps> = ({
  images,
  activeImageId,
  onSelectImage,
  onRemoveImage,
  onAttachImageClick,
  onOpenMergeMode,
  isMergeMode,
}) => {
  if (images.length === 0) return null;

  return (
    <div className="h-14 border-t border-white/[0.08] bg-[#121215]/95 backdrop-blur-md px-3 flex items-center justify-between gap-3 select-none shrink-0 z-20">
      {/* Left: Thumbnail items */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1 min-w-0">
        <div className="text-[11px] font-medium text-zinc-400 hidden sm:flex items-center gap-1.5 shrink-0 pr-1.5">
          <Layers className="w-3.5 h-3.5 text-zinc-300" />
          <span>Photos</span>
          <span className="font-mono text-zinc-400">({images.length})</span>
        </div>

        {images.map((img, index) => {
          const isActive = !isMergeMode && img.id === activeImageId;
          return (
            <div
              key={img.id}
              className={`group relative flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg border text-xs transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#24242b] border-white/[0.22] text-white shadow-xs'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200'
              }`}
              onClick={() => onSelectImage(img.id)}
            >
              {/* Mini thumbnail */}
              <div className="w-7 h-7 rounded-md bg-black/40 overflow-hidden border border-white/[0.08] relative shrink-0">
                <img
                  src={img.state.src}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 px-1 font-mono text-[8px] text-white/80 bg-black/70 rounded-tl leading-none">
                  {index + 1}
                </span>
              </div>

              {/* Title & dimensions */}
              <div className="min-w-0 text-left">
                <div className="font-medium text-[11px] truncate max-w-[85px] leading-tight">
                  {img.name}
                </div>
                <div className="text-[9px] text-zinc-400 font-mono truncate leading-tight">
                  {img.state.width}×{img.state.height}
                </div>
              </div>

              {/* Delete button (if more than 1 image) */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(img.id);
                  }}
                  title="Remove photo"
                  className="p-0.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 opacity-40 group-hover:opacity-100 transition-opacity ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add photo button */}
        <button
          onClick={onAttachImageClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-white/[0.12] hover:border-white/[0.3] bg-white/[0.02] hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200 text-xs transition-all shrink-0"
          title="Attach another image or paste (Ctrl+V)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="font-medium text-[11px] whitespace-nowrap">Attach</span>
        </button>
      </div>

      {/* Right: Merge CTA button */}
      <div className="shrink-0 flex items-center gap-2">
        <button
          onClick={onOpenMergeMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap border ${
            isMergeMode
              ? 'bg-zinc-100 text-zinc-950 border-white shadow-xs'
              : 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] hover:text-white'
          }`}
          title="Combine & stitch multiple photos together"
        >
          <Combine className="w-3.5 h-3.5" />
          <span>Merge {images.length >= 2 ? `(${images.length})` : 'Photos'}</span>
        </button>
      </div>
    </div>
  );
};

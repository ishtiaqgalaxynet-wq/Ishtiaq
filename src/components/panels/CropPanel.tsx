import React from 'react';
import { AspectRatio, CropRect } from '../../types/editor';
import { Check, RotateCcw } from 'lucide-react';

interface CropPanelProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  cropRect: CropRect;
  imageDimensions: { width: number; height: number };
  onApplyCrop: () => void;
  onResetCrop: () => void;
}

export const CropPanel: React.FC<CropPanelProps> = ({
  aspectRatio,
  setAspectRatio,
  cropRect,
  imageDimensions,
  onApplyCrop,
  onResetCrop,
}) => {
  const ratios: { id: AspectRatio; label: string; desc: string }[] = [
    { id: 'free', label: 'Free', desc: 'Custom' },
    { id: '1:1', label: '1:1', desc: 'Square' },
    { id: '4:3', label: '4:3', desc: 'Standard' },
    { id: '16:9', label: '16:9', desc: 'Wide' },
    { id: '3:2', label: '3:2', desc: 'Photo' },
    { id: '9:16', label: '9:16', desc: 'Story' },
    { id: '2:3', label: '2:3', desc: 'Portrait' },
  ];

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      <div>
        <label className="text-slate-400 font-medium block mb-2 text-[11px] uppercase tracking-wider">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {ratios.map((r) => (
            <button
              key={r.id}
              onClick={() => setAspectRatio(r.id)}
              className={`p-2 rounded-lg border text-center transition-all ${
                aspectRatio === r.id
                  ? 'bg-zinc-800 border-white/[0.25] text-white font-medium shadow-xs'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white'
              }`}
            >
              <div className="font-mono text-xs">{r.label}</div>
              <div className="text-[10px] text-zinc-400 truncate mt-0.5">{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions info */}
      <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1.5 font-mono text-[11px]">
        <div className="flex justify-between text-zinc-400">
          <span>Crop Box:</span>
          <span className="text-zinc-200">{Math.round(cropRect.width)} × {Math.round(cropRect.height)} px</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Source:</span>
          <span className="text-zinc-400">{imageDimensions.width} × {imageDimensions.height} px</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onResetCrop}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-all text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Reset Box</span>
        </button>
        <button
          onClick={onApplyCrop}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
        >
          <Check className="w-3.5 h-3.5 text-zinc-950" />
          <span>Apply Crop</span>
        </button>
      </div>

      <div className="text-[11px] text-slate-400 leading-relaxed px-1">
        Drag corner or edge handles to resize the box. Drag inside to reposition.
      </div>
    </div>
  );
};

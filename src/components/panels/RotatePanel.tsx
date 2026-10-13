import React from 'react';
import { 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  RefreshCw,
  Rotate3D
} from 'lucide-react';

interface RotatePanelProps {
  rotation: number;
  fineAngle: number;
  flipH: boolean;
  flipV: boolean;
  onRotate90CW: () => void;
  onRotate90CCW: () => void;
  onRotate180: () => void;
  onToggleFlipH: () => void;
  onToggleFlipV: () => void;
  onSetFineAngle: (angle: number) => void;
  onResetRotation: () => void;
}

export const RotatePanel: React.FC<RotatePanelProps> = ({
  rotation,
  fineAngle,
  flipH,
  flipV,
  onRotate90CW,
  onRotate90CCW,
  onRotate180,
  onToggleFlipH,
  onToggleFlipV,
  onSetFineAngle,
  onResetRotation,
}) => {
  return (
    <div className="p-4 space-y-4 text-xs select-none">
      <div>
        <label className="text-slate-400 font-medium block mb-2 text-[11px] uppercase tracking-wider">
          Rotate
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={onRotate90CCW}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/[0.12] hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px]">90° Left</span>
          </button>
          <button
            onClick={onRotate90CW}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/[0.12] hover:text-white transition-all"
          >
            <RotateCw className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px]">90° Right</span>
          </button>
          <button
            onClick={onRotate180}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/[0.12] hover:text-white transition-all"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px]">180°</span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-slate-400 font-medium block mb-2 text-[11px] uppercase tracking-wider">
          Flip
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onToggleFlipH}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-all ${
              flipH
                ? 'bg-indigo-600/20 border-indigo-500/80 text-white font-medium shadow-xs'
                : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/[0.12] hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Horizontal</span>
          </button>
          <button
            onClick={onToggleFlipV}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-all ${
              flipV
                ? 'bg-indigo-600/20 border-indigo-500/80 text-white font-medium shadow-xs'
                : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/[0.12] hover:text-white'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5 text-slate-400" />
            <span>Vertical</span>
          </button>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-slate-400">
          <span className="text-[11px] uppercase tracking-wider font-medium">Fine Leveling</span>
          <span className="font-mono text-slate-200 text-xs">
            {fineAngle > 0 ? `+${fineAngle}` : fineAngle}°
          </span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="range"
            min="-45"
            max="45"
            step="0.5"
            value={fineAngle}
            onChange={(e) => onSetFineAngle(parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          {fineAngle !== 0 && (
            <button
              onClick={() => onSetFineAngle(0)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono shrink-0 pl-1"
            >
              0°
            </button>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onResetRotation}
          className="w-full py-2 px-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all text-xs"
        >
          Reset Rotation
        </button>
      </div>
    </div>
  );
};

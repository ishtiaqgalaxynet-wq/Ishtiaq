import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Check } from 'lucide-react';

interface ResizePanelProps {
  currentWidth: number;
  currentHeight: number;
  onApplyResize: (width: number, height: number) => void;
}

export const ResizePanel: React.FC<ResizePanelProps> = ({
  currentWidth,
  currentHeight,
  onApplyResize,
}) => {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [lockAspect, setLockAspect] = useState(true);

  useEffect(() => {
    setWidth(currentWidth);
    setHeight(currentHeight);
  }, [currentWidth, currentHeight]);

  const handleWidthChange = (newW: number) => {
    setWidth(newW);
    if (lockAspect && currentWidth > 0) {
      const ratio = currentHeight / currentWidth;
      setHeight(Math.round(newW * ratio));
    }
  };

  const handleHeightChange = (newH: number) => {
    setHeight(newH);
    if (lockAspect && currentHeight > 0) {
      const ratio = currentWidth / currentHeight;
      setWidth(Math.round(newH * ratio));
    }
  };

  const handleScalePercentage = (pct: number) => {
    const newW = Math.round((currentWidth * pct) / 100);
    const newH = Math.round((currentHeight * pct) / 100);
    setWidth(newW);
    setHeight(newH);
  };

  const scales = [25, 50, 75, 100, 150, 200];

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      <div>
        <label className="text-slate-400 font-medium block mb-2 text-[11px] uppercase tracking-wider">
          Quick Scale
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {scales.map((s) => (
            <button
              key={s}
              onClick={() => handleScalePercentage(s)}
              className="py-1.5 px-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/[0.12] hover:text-white font-mono transition-all text-xs"
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-medium text-xs">Dimensions</span>
          <button
            onClick={() => setLockAspect(!lockAspect)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
              lockAspect ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.06] text-slate-400'
            }`}
          >
            {lockAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span>{lockAspect ? 'Locked' : 'Free'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Width (px)</label>
            <input
              type="number"
              min="10"
              max="10000"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Height (px)</label>
            <input
              type="number"
              min="10"
              max="10000"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex justify-between font-mono pt-0.5">
          <span>Current:</span>
          <span>{currentWidth} × {currentHeight} px</span>
        </div>
      </div>

      <button
        onClick={() => onApplyResize(width, height)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
      >
        <Check className="w-3.5 h-3.5 text-zinc-950" />
        <span>Apply Resize</span>
      </button>
    </div>
  );
};

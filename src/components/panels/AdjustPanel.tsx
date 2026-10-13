import React from 'react';
import { Adjustments } from '../../types/editor';
import { Wand2, RotateCcw } from 'lucide-react';

interface AdjustPanelProps {
  adjustments: Adjustments;
  onChangeAdjustment: (key: keyof Adjustments, value: number | boolean) => void;
  onAutoEnhance: () => void;
  onResetAdjustments: () => void;
}

export const AdjustPanel: React.FC<AdjustPanelProps> = ({
  adjustments,
  onChangeAdjustment,
  onAutoEnhance,
  onResetAdjustments,
}) => {
  const sliders: {
    key: keyof Adjustments;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
  }[] = [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, unit: '' },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, unit: '' },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, unit: '' },
    { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1, unit: '' },
    { key: 'warmth', label: 'Color Warmth', min: -50, max: 50, step: 1, unit: '' },
    { key: 'blur', label: 'Soft Blur', min: 0, max: 20, step: 0.5, unit: 'px' },
    { key: 'sepia', label: 'Sepia Tone', min: 0, max: 100, step: 1, unit: '%' },
    { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1, unit: '%' },
  ];

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      {/* Auto enhance & reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAutoEnhance}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-800 border border-white/[0.1] text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all text-xs font-medium"
        >
          <Wand2 className="w-3.5 h-3.5 text-zinc-300" />
          <span>Auto Enhance</span>
        </button>
        <button
          onClick={onResetAdjustments}
          className="p-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
          title="Reset adjustments"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sliders list */}
      <div className="space-y-3 pt-1">
        {sliders.map((s) => {
          const val = adjustments[s.key] as number;
          return (
            <div key={s.key} className="space-y-1">
              <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                <span>{s.label}</span>
                <span className="font-mono text-zinc-200">
                  {val > 0 && s.min < 0 ? `+${val}` : val}{s.unit}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val}
                onChange={(e) => onChangeAdjustment(s.key, parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          );
        })}

        {/* Invert toggle */}
        <div className="pt-2 flex items-center justify-between p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div>
            <div className="text-zinc-200 text-xs font-medium">Invert Colors</div>
            <div className="text-[10px] text-zinc-400">Negative film photo effect</div>
          </div>
          <button
            onClick={() => onChangeAdjustment('invert', !adjustments.invert)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              adjustments.invert
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'bg-white/[0.06] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {adjustments.invert ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  );
};

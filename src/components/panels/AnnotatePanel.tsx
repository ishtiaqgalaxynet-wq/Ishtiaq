import React from 'react';
import { AnnotationTool } from '../../types/editor';
import { 
  Pen, 
  Highlighter, 
  MoveRight, 
  Square, 
  Circle, 
  ShieldAlert, 
  Type, 
  Trash2, 
  RotateCcw 
} from 'lucide-react';

interface AnnotatePanelProps {
  currentTool: AnnotationTool;
  setCurrentTool: (tool: AnnotationTool) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  hasTextBg: boolean;
  setHasTextBg: (hasBg: boolean) => void;
  annotationCount: number;
  onClearAnnotations: () => void;
  onUndoLastAnnotation: () => void;
}

export const AnnotatePanel: React.FC<AnnotatePanelProps> = ({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  strokeWidth,
  setStrokeWidth,
  fontSize,
  setFontSize,
  hasTextBg,
  setHasTextBg,
  annotationCount,
  onClearAnnotations,
  onUndoLastAnnotation,
}) => {
  const tools: { id: AnnotationTool; label: string; icon: React.ReactNode }[] = [
    { id: 'pen', label: 'Pen', icon: <Pen className="w-3.5 h-3.5" /> },
    { id: 'highlighter', label: 'Marker', icon: <Highlighter className="w-3.5 h-3.5" /> },
    { id: 'arrow', label: 'Arrow', icon: <MoveRight className="w-3.5 h-3.5" /> },
    { id: 'rect', label: 'Box', icon: <Square className="w-3.5 h-3.5" /> },
    { id: 'circle', label: 'Circle', icon: <Circle className="w-3.5 h-3.5" /> },
    { id: 'redact', label: 'Blur/Censor', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-3.5 h-3.5" /> },
  ];

  const presetColors = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#6366F1',
    '#EC4899',
    '#FFFFFF',
    '#000000',
  ];

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      {/* Tool selector */}
      <div>
        <label className="text-slate-400 font-medium block mb-2 text-[11px] uppercase tracking-wider">
          Tool
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTool(t.id)}
              className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${
                currentTool === t.id
                  ? 'bg-zinc-800 border-white/[0.25] text-white font-medium shadow-xs'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white'
              }`}
            >
              <span className={currentTool === t.id ? 'text-zinc-100' : 'text-zinc-400'}>
                {t.icon}
              </span>
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      {currentTool !== 'redact' && (
        <div>
          <label className="text-slate-400 font-medium block mb-2 text-[11px] uppercase tracking-wider">
            Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {presetColors.map((c) => (
              <button
                key={c}
                onClick={() => setCurrentColor(c)}
                className={`w-5 h-5 rounded-full border transition-all ${
                  currentColor.toUpperCase() === c.toUpperCase()
                    ? 'border-white scale-125 shadow-sm'
                    : 'border-white/20 hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-5 h-5 rounded-full cursor-pointer bg-transparent border-0"
              title="Custom Color"
            />
          </div>
        </div>
      )}

      {/* Stroke / Size */}
      {currentTool !== 'text' && currentTool !== 'redact' && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Stroke Size</span>
            <span className="font-mono text-slate-200">{strokeWidth}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="32"
            step="1"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
          />
        </div>
      )}

      {/* Text Settings */}
      {currentTool === 'text' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Font Size</span>
              <span className="font-mono text-slate-200">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="64"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <span className="text-slate-300">Badge Background</span>
            <button
              onClick={() => setHasTextBg(!hasTextBg)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                hasTextBg ? 'bg-zinc-100 text-zinc-950' : 'bg-white/[0.06] text-zinc-400'
              }`}
            >
              {hasTextBg ? 'Filled' : 'Transparent'}
            </button>
          </div>
        </div>
      )}

      {/* Redact tip */}
      {currentTool === 'redact' && (
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 leading-relaxed">
          Drag over sensitive passwords, emails, or names to pixelate and censor them.
        </div>
      )}

      {/* Undo & Clear */}
      {annotationCount > 0 && (
        <div className="pt-2 flex items-center gap-2 border-t border-white/[0.06]">
          <button
            onClick={onUndoLastAnnotation}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo Mark</span>
          </button>
          <button
            onClick={onClearAnnotations}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
};

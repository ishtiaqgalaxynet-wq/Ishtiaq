import React from 'react';
import { Crop, RotateCw, Sliders, Sparkles, PenTool, Scaling, Combine } from 'lucide-react';
import { ToolMode } from '../types/editor';

interface ToolbarProps {
  activeMode: ToolMode;
  setActiveMode: (mode: ToolMode) => void;
  imageCount?: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeMode, setActiveMode, imageCount = 1 }) => {
  const tools: { id: ToolMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'crop', label: 'Crop', icon: <Crop className="w-3.5 h-3.5" /> },
    { id: 'rotate', label: 'Rotate & Flip', icon: <RotateCw className="w-3.5 h-3.5" /> },
    { id: 'adjust', label: 'Adjust Light', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'filters', label: 'Filters', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'annotate', label: 'Markup & Blur', icon: <PenTool className="w-3.5 h-3.5" /> },
    { id: 'resize', label: 'Resize', icon: <Scaling className="w-3.5 h-3.5" /> },
    { 
      id: 'merge', 
      label: 'Merge & Collage', 
      icon: <Combine className="w-3.5 h-3.5" />,
      badge: imageCount >= 2 ? `${imageCount} photos` : undefined
    },
  ];

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121215]/90 border-b border-white/[0.08] overflow-x-auto select-none shrink-0 z-20">
      {tools.map((tool) => {
        const isActive = activeMode === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveMode(tool.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-[#222228] text-white shadow-xs border border-white/[0.14]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span className={isActive ? 'text-zinc-100' : 'text-zinc-400'}>
              {tool.icon}
            </span>
            <span>{tool.label}</span>
            {tool.badge && (
              <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold ${
                isActive ? 'bg-zinc-700 text-zinc-100' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {tool.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

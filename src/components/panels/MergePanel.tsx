import React from 'react';
import { MergeSettings, MergeLayout, ProjectImage } from '../../types/editor';
import { 
  Columns, 
  Rows, 
  Grid2X2, 
  LayoutTemplate, 
  Layers, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ClipboardCopy, 
  Download 
} from 'lucide-react';

interface MergePanelProps {
  images: ProjectImage[];
  settings: MergeSettings;
  onChangeSettings: (settings: MergeSettings) => void;
  onApplyMerge: () => void;
  onCopyMerged: () => void;
  onExportMerged: () => void;
}

export const MergePanel: React.FC<MergePanelProps> = ({
  images,
  settings,
  onChangeSettings,
  onApplyMerge,
  onCopyMerged,
  onExportMerged,
}) => {
  const layouts: { id: MergeLayout; label: string; icon: React.ReactNode }[] = [
    { id: 'horizontal', label: 'Side by Side', icon: <Columns className="w-4 h-4" /> },
    { id: 'vertical', label: 'Stacked', icon: <Rows className="w-4 h-4" /> },
    { id: 'grid', label: 'Grid', icon: <Grid2X2 className="w-4 h-4" /> },
    { id: 'featured-left', label: 'Feature Left', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'featured-top', label: 'Feature Top', icon: <LayoutTemplate className="w-4 h-4 rotate-90" /> },
    { id: 'pip', label: 'Picture-in-Pic', icon: <Layers className="w-4 h-4" /> },
  ];

  const bgColors = [
    { label: 'Charcoal', value: '#121215' },
    { label: 'Black', value: '#000000' },
    { label: 'White', value: '#ffffff' },
    { label: 'Slate', value: '#1e293b' },
    { label: 'Clear', value: 'transparent' },
  ];

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const currentOrder = settings.order && settings.order.length > 0 
      ? [...settings.order] 
      : images.map((img) => img.id);

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;

    onChangeSettings({ ...settings, order: currentOrder });
  };

  const orderedImages = (settings.order && settings.order.length > 0)
    ? settings.order.map((id) => images.find((img) => img.id === id)).filter(Boolean) as ProjectImage[]
    : images;

  return (
    <div className="p-4 space-y-4 text-xs select-none">
      {/* Layout Selection */}
      <div>
        <label className="text-slate-400 font-medium block mb-2 text-[11px] uppercase tracking-wider">
          Layout
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => onChangeSettings({ ...settings, layout: l.id })}
              className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                settings.layout === l.id
                  ? 'bg-zinc-800 border-white/[0.25] text-white font-medium shadow-xs'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white'
              }`}
            >
              <span className={settings.layout === l.id ? 'text-zinc-100' : 'text-zinc-400'}>
                {l.icon}
              </span>
              <span className="truncate">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sequence Order */}
      <div>
        <label className="text-zinc-400 font-medium block mb-2 text-[11px] uppercase tracking-wider">
          Sequence ({orderedImages.length} photos)
        </label>
        <div className="space-y-1">
          {orderedImages.map((img, idx) => (
            <div
              key={img.id}
              className="flex items-center justify-between p-1.5 pl-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 h-4 rounded-full bg-white/[0.06] text-zinc-300 font-mono text-[9px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-medium text-zinc-300 truncate text-[11px]">{img.name}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'left')}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent"
                  title="Move left/up"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button
                  disabled={idx === orderedImages.length - 1}
                  onClick={() => handleMove(idx, 'right')}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent"
                  title="Move right/down"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-2.5 pt-1">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-[11px]">
            <span>Gap Spacing</span>
            <span className="font-mono text-zinc-200">{settings.spacing}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="48"
            step="2"
            value={settings.spacing}
            onChange={(e) => onChangeSettings({ ...settings, spacing: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-[11px]">
            <span>Outer Padding</span>
            <span className="font-mono text-zinc-200">{settings.padding}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="48"
            step="2"
            value={settings.padding}
            onChange={(e) => onChangeSettings({ ...settings, padding: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-[11px]">
            <span>Corner Rounding</span>
            <span className="font-mono text-zinc-200">{settings.borderRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            step="2"
            value={settings.borderRadius}
            onChange={(e) => onChangeSettings({ ...settings, borderRadius: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Fit mode & Background */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <span className="text-zinc-300 text-[11px]">Photo Sizing</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeSettings({ ...settings, fitMode: 'cover' })}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                settings.fitMode === 'cover' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-white/[0.06] text-zinc-400'
              }`}
            >
              Fill
            </button>
            <button
              onClick={() => onChangeSettings({ ...settings, fitMode: 'contain' })}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                settings.fitMode === 'contain' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-white/[0.06] text-zinc-400'
              }`}
            >
              Fit
            </button>
          </div>
        </div>

        {/* Background color */}
        <div>
          <label className="text-zinc-400 font-medium block mb-1 text-[11px]">Canvas Background</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {bgColors.map((bg) => (
              <button
                key={bg.value}
                onClick={() => onChangeSettings({ ...settings, bgColor: bg.value })}
                className={`px-2 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  settings.bgColor === bg.value
                    ? 'bg-zinc-800 border-white/[0.25] text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
        <button
          onClick={onApplyMerge}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
        >
          <Check className="w-3.5 h-3.5 text-zinc-950" />
          <span>Merge into Single Image</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onCopyMerged}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-all text-xs"
          >
            <ClipboardCopy className="w-3.5 h-3.5 text-zinc-300" />
            <span>Copy</span>
          </button>
          <button
            onClick={onExportMerged}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

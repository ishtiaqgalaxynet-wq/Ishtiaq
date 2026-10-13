import React, { useState, useEffect } from 'react';
import { ExportFormat } from '../types/editor';
import { 
  Download, 
  ClipboardCopy, 
  Check, 
  X, 
  FileImage, 
  Sliders 
} from 'lucide-react';
import { getCanvasBlob, formatBytes, downloadCanvas, copyCanvasToClipboard } from '../utils/imageProcess';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  renderedCanvas: HTMLCanvasElement | null;
  initialFileName?: string;
  onCopySuccess: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  renderedCanvas,
  initialFileName = 'pastecrop_image',
  onCopySuccess,
}) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [fileName, setFileName] = useState(initialFileName);
  const [estimatedSize, setEstimatedSize] = useState<string>('Calculating...');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen || !renderedCanvas) return;

    let active = true;
    getCanvasBlob(renderedCanvas, format, quality)
      .then((blob) => {
        if (!active) return;
        setEstimatedSize(formatBytes(blob.size));
      })
      .catch(() => {
        if (!active) return;
        setEstimatedSize('Unknown');
      });

    return () => {
      active = false;
    };
  }, [isOpen, renderedCanvas, format, quality]);

  if (!isOpen || !renderedCanvas) return null;

  const handleCopy = async () => {
    const success = await copyCanvasToClipboard(renderedCanvas);
    if (success) {
      setIsCopied(true);
      onCopySuccess();
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCanvas(renderedCanvas, fileName, format, quality);
      onClose();
    } catch (err) {
      console.error('Download error', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formats: { id: ExportFormat; label: string; desc: string }[] = [
    { id: 'png', label: 'PNG', desc: 'Lossless' },
    { id: 'jpeg', label: 'JPEG', desc: 'Compressed' },
    { id: 'webp', label: 'WEBP', desc: 'Modern' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#141418] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden text-xs text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#18181e]">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-zinc-300" />
            <h2 className="text-xs font-bold text-white tracking-tight uppercase">Save & Export Photo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Format selection */}
          <div>
            <label className="text-zinc-400 font-medium block mb-1.5 text-[11px] uppercase tracking-wider">Format</label>
            <div className="grid grid-cols-3 gap-1.5">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    format === f.id
                      ? 'bg-[#26262e] border-white/30 text-white font-semibold shadow-xs'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white'
                  }`}
                >
                  <div className="font-mono text-xs">{f.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          {format !== 'png' && (
            <div className="space-y-1.5 bg-[#1a1a20] p-3 rounded-xl border border-white/[0.08]">
              <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  Compression Quality
                </span>
                <span className="font-mono text-zinc-100 font-semibold">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          )}

          {/* File Name */}
          <div>
            <label className="text-zinc-400 font-medium block mb-1 text-[11px] uppercase tracking-wider">File Name</label>
            <div className="flex items-center bg-[#1a1a20] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-white/30">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-transparent w-full text-zinc-100 focus:outline-none font-mono text-xs"
                placeholder="image_name"
              />
              <span className="text-zinc-400 font-mono text-[11px] shrink-0">
                .{format === 'jpeg' ? 'jpg' : format}
              </span>
            </div>
          </div>

          {/* Info summary */}
          <div className="p-3 bg-[#1a1a20] border border-white/[0.08] rounded-xl space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-zinc-400">
              <span>Resolution:</span>
              <span className="text-zinc-200">{renderedCanvas.width} × {renderedCanvas.height} px</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Est. Size:</span>
              <span className="text-zinc-100 font-semibold">{estimatedSize}</span>
            </div>
          </div>

          {/* Quick Copy to Clipboard Button */}
          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
              isCopied
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-[#1e1e24] hover:bg-[#25252d] text-zinc-200 border-white/[0.08] hover:text-white'
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardCopy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{isCopied ? 'Copied Image to Clipboard!' : 'Copy to Clipboard (Ctrl+C)'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#18181e] border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">
            PasteCrop by Ishtiaq Islam Himel
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 text-zinc-950" />
              <span>{isDownloading ? 'Saving...' : 'Download Photo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

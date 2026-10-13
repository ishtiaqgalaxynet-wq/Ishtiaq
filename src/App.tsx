/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ImageState, 
  ToolMode, 
  CropRect, 
  AspectRatio, 
  Adjustments, 
  AnnotationTool, 
  AnnotationItem, 
  Point, 
  PresetFilterId,
  ProjectImage,
  MergeSettings
} from './types/editor';
import { 
  DEFAULT_ADJUSTMENTS, 
  FILTER_PRESETS, 
  loadImage, 
  renderCompositeCanvas, 
  renderMergedCanvas,
  cropImageToState, 
  resizeImageToState, 
  copyCanvasToClipboard 
} from './utils/imageProcess';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { ImageStrip } from './components/ImageStrip';
import { CropPanel } from './components/panels/CropPanel';
import { RotatePanel } from './components/panels/RotatePanel';
import { AdjustPanel } from './components/panels/AdjustPanel';
import { FiltersPanel } from './components/panels/FiltersPanel';
import { AnnotatePanel } from './components/panels/AnnotatePanel';
import { ResizePanel } from './components/panels/ResizePanel';
import { MergePanel } from './components/panels/MergePanel';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { EmptyState } from './components/EmptyState';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // Multi-image project state
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);

  // Active Tool Mode
  const [toolMode, setToolMode] = useState<ToolMode>('crop');

  // History Stack per active image
  const [history, setHistory] = useState<ImageState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Active Crop State
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');

  // Annotate State
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>('pen');
  const [annotationColor, setAnnotationColor] = useState<string>('#EF4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [fontSize, setFontSize] = useState<number>(24);
  const [hasTextBg, setHasTextBg] = useState<boolean>(true);

  // Merge Settings
  const [mergeSettings, setMergeSettings] = useState<MergeSettings>({
    layout: 'horizontal',
    spacing: 12,
    padding: 16,
    bgColor: '#121215',
    borderRadius: 8,
    fitMode: 'cover',
    order: [],
  });
  const [mergedPreviewCanvas, setMergedPreviewCanvas] = useState<HTMLCanvasElement | null>(null);

  // Canvas Viewport (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });

  // Modals & Feedback
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [renderedExportCanvas, setRenderedExportCanvas] = useState<HTMLCanvasElement | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active image object
  const activeImage = images.find((img) => img.id === activeImageId) || images[0] || null;
  const imageState = activeImage ? activeImage.state : null;

  // Toast helper
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Push state to active image and history
  const pushHistory = useCallback((newState: ImageState) => {
    if (!activeImageId) return;

    setImages((prev) =>
      prev.map((img) => (img.id === activeImageId ? { ...img, state: newState } : img))
    );

    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, newState];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [activeImageId, historyIndex]);

  // Load a single image into workspace (either as first or appended)
  const attachImage = async (src: string, customName?: string) => {
    try {
      const img = await loadImage(src);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      const newId = Math.random().toString(36).substring(2, 9);
      const photoName = customName || `Photo ${images.length + 1}`;

      const initialState: ImageState = {
        src,
        width: w,
        height: h,
        rotation: 0,
        fineAngle: 0,
        flipH: false,
        flipV: false,
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        filter: 'normal',
        annotations: [],
      };

      const initCropW = Math.round(w * 0.85);
      const initCropH = Math.round(h * 0.85);
      const initCropX = Math.round((w - initCropW) / 2);
      const initCropY = Math.round((h - initCropH) / 2);

      const newProjImg: ProjectImage = {
        id: newId,
        name: photoName,
        state: initialState,
        originalSrc: src,
        cropRect: { x: initCropX, y: initCropY, width: initCropW, height: initCropH },
        aspectRatio: 'free',
      };

      setImages((prev) => {
        const next = [...prev, newProjImg];
        // update merge order if needed
        setMergeSettings((ms) => ({
          ...ms,
          order: ms.order.length > 0 ? [...ms.order, newId] : next.map((i) => i.id),
        }));
        return next;
      });

      setActiveImageId(newId);
      setHistory([initialState]);
      setHistoryIndex(0);
      setCropRect(newProjImg.cropRect);

      // Fit zoom
      const maxViewW = window.innerWidth - 380;
      const maxViewH = window.innerHeight - 180;
      const scaleFit = Math.min(1, Math.min(maxViewW / w, maxViewH / h) * 0.85);
      setZoom(Math.max(0.15, Math.min(1, scaleFit)));
      setPan({ x: 0, y: 0 });

      if (images.length === 0) {
        addToast('success', `Opened ${photoName} (${w} × ${h} px)`);
      } else {
        addToast('success', `Attached ${photoName}! You now have ${images.length + 1} photos ready to merge.`);
      }
    } catch (err) {
      console.error('Failed to attach image', err);
      addToast('error', 'Failed to load image');
    }
  };

  // Switch active image selection
  const handleSelectImage = (id: string) => {
    setActiveImageId(id);
    const target = images.find((i) => i.id === id);
    if (target) {
      setHistory([target.state]);
      setHistoryIndex(0);
      setCropRect(target.cropRect);
      // Reset pan/zoom centering
      const maxViewW = window.innerWidth - 380;
      const maxViewH = window.innerHeight - 180;
      const scaleFit = Math.min(1, Math.min(maxViewW / target.state.width, maxViewH / target.state.height) * 0.85);
      setZoom(Math.max(0.15, Math.min(1, scaleFit)));
      setPan({ x: 0, y: 0 });
    }
    if (toolMode === 'merge') {
      setToolMode('crop');
    }
  };

  // Remove an image from the project
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      if (filtered.length > 0 && activeImageId === id) {
        setActiveImageId(filtered[0].id);
      }
      return filtered;
    });
    setMergeSettings((prev) => ({
      ...prev,
      order: prev.order.filter((i) => i !== id),
    }));
    addToast('info', 'Photo removed');
  };

  // Multi-file selection
  const handleFilesSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    let count = 0;
    fileArray.forEach((file) => {
      if (file.type.startsWith('image/')) {
        count++;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            const cleanName = file.name.replace(/\.[^/.]+$/, '');
            attachImage(e.target.result, cleanName || undefined);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    if (count === 0 && fileArray.length > 0) {
      addToast('error', 'Please select valid image files');
    }
  };

  const handleFileSelect = (file: File) => {
    handleFilesSelect([file]);
  };

  // Paste from clipboard handler
  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) {
        addToast('info', 'Clipboard API restricted. Press Ctrl+V directly to paste.');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
              if (typeof e.target?.result === 'string') {
                attachImage(e.target.result);
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      addToast('info', 'No image found in clipboard. Copy an image or screenshot first!');
    } catch (err) {
      console.warn('Clipboard read error:', err);
      addToast('info', 'Press Ctrl+V or ⌘V to paste image from clipboard.');
    }
  };

  // Global window paste listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              handleFileSelect(file);
              return;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [images.length]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Copy to Clipboard: Ctrl+C
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (imageState) {
          e.preventDefault();
          handleCopyToClipboard();
        }
      }
      // Apply crop on Enter
      else if (e.key === 'Enter' && toolMode === 'crop' && imageState) {
        e.preventDefault();
        handleApplyCrop();
      }
      // Escape to cancel or close modal
      else if (e.key === 'Escape') {
        if (isExportOpen) setIsExportOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, imageState, toolMode, isExportOpen, isShortcutsOpen]);

  // Undo & Redo Handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevState = history[prevIndex];
      setImages((prev) =>
        prev.map((img) => (img.id === activeImageId ? { ...img, state: prevState } : img))
      );
      addToast('info', 'Undone last change');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextState = history[nextIndex];
      setImages((prev) =>
        prev.map((img) => (img.id === activeImageId ? { ...img, state: nextState } : img))
      );
      addToast('info', 'Redone change');
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((prev) => Math.min(5, prev * 1.25));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.1, prev * 0.8));
  const handleZoomFit = () => {
    const curW = (toolMode === 'merge' && mergedPreviewCanvas) 
      ? mergedPreviewCanvas.width 
      : (imageState ? imageState.width : 800);
    const curH = (toolMode === 'merge' && mergedPreviewCanvas) 
      ? mergedPreviewCanvas.height 
      : (imageState ? imageState.height : 600);

    const maxViewW = window.innerWidth - 380;
    const maxViewH = window.innerHeight - 180;
    const scaleFit = Math.min(1, Math.min(maxViewW / curW, maxViewH / curH) * 0.85);
    setZoom(Math.max(0.1, scaleFit));
    setPan({ x: 0, y: 0 });
  };

  // Rerender merged preview whenever in merge mode or images/settings change
  useEffect(() => {
    if (images.length === 0) {
      setMergedPreviewCanvas(null);
      return;
    }

    let active = true;
    renderMergedCanvas(images, mergeSettings)
      .then((c) => {
        if (active) setMergedPreviewCanvas(c);
      })
      .catch((err) => console.error('Merged canvas render failed', err));

    return () => {
      active = false;
    };
  }, [images, mergeSettings]);

  // Copy current image or merged canvas to clipboard
  const handleCopyToClipboard = async () => {
    try {
      let canvas: HTMLCanvasElement;
      if (toolMode === 'merge' && mergedPreviewCanvas) {
        canvas = mergedPreviewCanvas;
      } else if (imageState) {
        canvas = await renderCompositeCanvas(imageState);
      } else {
        return;
      }

      const success = await copyCanvasToClipboard(canvas);
      if (success) {
        setCopiedSuccess(true);
        addToast('success', 'Image copied to clipboard! Ready to paste anywhere.');
        setTimeout(() => setCopiedSuccess(false), 2500);
      } else {
        addToast('error', 'Browser blocked clipboard access. Use Export to download.');
      }
    } catch (err) {
      console.error('Clipboard copy error', err);
      addToast('error', 'Failed to copy to clipboard');
    }
  };

  // Open Export Modal
  const handleOpenExportModal = async () => {
    try {
      let canvas: HTMLCanvasElement;
      if (toolMode === 'merge' && mergedPreviewCanvas) {
        canvas = mergedPreviewCanvas;
      } else if (imageState) {
        canvas = await renderCompositeCanvas(imageState);
      } else {
        return;
      }

      setRenderedExportCanvas(canvas);
      setIsExportOpen(true);
    } catch (err) {
      console.error('Failed to prepare export', err);
      addToast('error', 'Failed to prepare image for export');
    }
  };

  // Apply crop to active photo
  const handleApplyCrop = async () => {
    if (!imageState) return;
    try {
      const newState = await cropImageToState(imageState, cropRect);
      pushHistory(newState);
      setCropRect({
        x: 0,
        y: 0,
        width: newState.width,
        height: newState.height,
      });
      addToast('success', `Cropped ${activeImage?.name} to ${newState.width} × ${newState.height} px`);
    } catch (err) {
      console.error('Crop failed', err);
      addToast('error', 'Failed to crop image');
    }
  };

  const handleResetCrop = () => {
    if (!imageState) return;
    const is90or270 = (imageState.rotation % 180 !== 0);
    const curW = is90or270 ? imageState.height : imageState.width;
    const curH = is90or270 ? imageState.width : imageState.height;
    setCropRect({ x: 0, y: 0, width: curW, height: curH });
    setAspectRatio('free');
  };

  // Rotate & Flip Handlers
  const handleRotate90CW = () => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      rotation: (imageState.rotation + 90) % 360,
    };
    pushHistory(newState);
  };

  const handleRotate90CCW = () => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      rotation: (imageState.rotation + 270) % 360,
    };
    pushHistory(newState);
  };

  const handleRotate180 = () => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      rotation: (imageState.rotation + 180) % 360,
    };
    pushHistory(newState);
  };

  const handleToggleFlipH = () => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      flipH: !imageState.flipH,
    };
    pushHistory(newState);
  };

  const handleToggleFlipV = () => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      flipV: !imageState.flipV,
    };
    pushHistory(newState);
  };

  const handleSetFineAngle = (angle: number) => {
    if (!imageState || !activeImageId) return;
    setImages((prev) =>
      prev.map((img) =>
        img.id === activeImageId
          ? { ...img, state: { ...img.state, fineAngle: angle } }
          : img
      )
    );
  };

  const handleResetRotation = () => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      rotation: 0,
      fineAngle: 0,
      flipH: false,
      flipV: false,
    };
    pushHistory(newState);
  };

  // Adjustment Handlers
  const handleChangeAdjustment = (key: keyof Adjustments, value: number | boolean) => {
    if (!imageState || !activeImageId) return;
    setImages((prev) =>
      prev.map((img) =>
        img.id === activeImageId
          ? {
              ...img,
              state: {
                ...img.state,
                adjustments: {
                  ...img.state.adjustments,
                  [key]: value,
                },
              },
            }
          : img
      )
    );
  };

  const handleAutoEnhance = () => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      adjustments: {
        ...imageState.adjustments,
        contrast: 15,
        saturation: 20,
        brightness: 5,
        warmth: 5,
      },
    };
    pushHistory(newState);
    addToast('success', 'Auto-enhanced contrast & saturation');
  };

  const handleResetAdjustments = () => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
    };
    pushHistory(newState);
  };

  // Filter Preset Handler
  const handleSelectFilter = (filterId: PresetFilterId) => {
    if (!imageState) return;
    const preset = FILTER_PRESETS.find((p) => p.id === filterId);
    if (!preset) return;

    const newState: ImageState = {
      ...imageState,
      filter: filterId,
      adjustments: {
        ...DEFAULT_ADJUSTMENTS,
        ...preset.adjustments,
      },
    };
    pushHistory(newState);
  };

  // Annotation Handlers
  const handleAddAnnotation = (item: AnnotationItem) => {
    if (!imageState) return;
    const newState: ImageState = {
      ...imageState,
      annotations: [...imageState.annotations, item],
    };
    pushHistory(newState);
  };

  const handleUndoLastAnnotation = () => {
    if (!imageState || imageState.annotations.length === 0) return;
    const newState: ImageState = {
      ...imageState,
      annotations: imageState.annotations.slice(0, -1),
    };
    pushHistory(newState);
  };

  const handleClearAnnotations = () => {
    if (!imageState || imageState.annotations.length === 0) return;
    const newState: ImageState = {
      ...imageState,
      annotations: [],
    };
    pushHistory(newState);
    addToast('info', 'Cleared all annotations');
  };

  // Resize Handler
  const handleApplyResize = async (newW: number, newH: number) => {
    if (!imageState) return;
    try {
      const newState = await resizeImageToState(imageState, newW, newH);
      pushHistory(newState);
      addToast('success', `Resized to ${newW} × ${newH} px`);
    } catch (err) {
      console.error('Resize failed', err);
      addToast('error', 'Failed to resize image');
    }
  };

  // Apply Merge into Single Image in Project
  const handleApplyMergeToCanvas = async () => {
    if (!mergedPreviewCanvas) return;
    const dataUrl = mergedPreviewCanvas.toDataURL('image/png');
    const w = mergedPreviewCanvas.width;
    const h = mergedPreviewCanvas.height;

    const newId = Math.random().toString(36).substring(2, 9);
    const newName = `Merged Collage (${images.length} Photos)`;

    const initialState: ImageState = {
      src: dataUrl,
      width: w,
      height: h,
      rotation: 0,
      fineAngle: 0,
      flipH: false,
      flipV: false,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      filter: 'normal',
      annotations: [],
    };

    const newProjImg: ProjectImage = {
      id: newId,
      name: newName,
      state: initialState,
      originalSrc: dataUrl,
      cropRect: { x: 0, y: 0, width: w, height: h },
      aspectRatio: 'free',
    };

    setImages((prev) => [newProjImg, ...prev]);
    setActiveImageId(newId);
    setHistory([initialState]);
    setHistoryIndex(0);
    setCropRect(newProjImg.cropRect);
    setToolMode('crop');

    addToast('success', 'Collage merged into a single image! You can now crop, annotate, or export it.');
  };

  // Clear entire project
  const handleClearProject = () => {
    setImages([]);
    setActiveImageId('');
    setHistory([]);
    setHistoryIndex(-1);
    setMergedPreviewCanvas(null);
    addToast('info', 'Project cleared');
  };

  // Multi-Sample Loader
  const handleLoadMultiSample = async () => {
    await attachImage('/src/assets/images/sample_photo_city_1791877825579.jpg', 'Modern City');
    await attachImage('/src/assets/images/sample_photo_nature_1791877824892.jpg', 'Forest Trail');
    setToolMode('merge');
    addToast('success', 'Loaded 2 sample photos in Merge & Collage studio!');
  };

  // Current display dimensions
  const is90or270 = imageState ? imageState.rotation % 180 !== 0 : false;
  const currentDisplayDimensions = (toolMode === 'merge' && mergedPreviewCanvas)
    ? { width: mergedPreviewCanvas.width, height: mergedPreviewCanvas.height }
    : imageState
    ? {
        width: is90or270 ? imageState.height : imageState.width,
        height: is90or270 ? imageState.width : imageState.height,
      }
    : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e0e11] text-zinc-100 overflow-hidden select-none">
      {/* Hidden File Input for header uploads (supports multi-file) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelect(e.target.files);
          }
        }}
      />

      {/* Top Bar with Wordmark, Status, Zoom, Copy & Export */}
      <TopBar
        hasImage={images.length > 0}
        imageDimensions={currentDisplayDimensions}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onCopyToClipboard={handleCopyToClipboard}
        copiedSuccess={copiedSuccess}
        onOpenExportModal={handleOpenExportModal}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onClearImage={handleClearProject}
        isComparing={isComparing}
        setIsComparing={setIsComparing}
        onTriggerPaste={handlePasteFromClipboard}
        onTriggerUpload={() => fileInputRef.current?.click()}
      />

      {/* Main Studio Viewport */}
      {images.length === 0 ? (
        <EmptyState
          onPasteFromClipboard={handlePasteFromClipboard}
          onSelectFiles={handleFilesSelect}
        />
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Secondary Workspace Toolbar (Mode Switcher) */}
          <Toolbar 
            activeMode={toolMode} 
            setActiveMode={setToolMode} 
            imageCount={images.length}
          />

          {/* Friendly Notification Banner if 2+ photos exist and not in merge mode */}
          {images.length >= 2 && toolMode !== 'merge' && (
            <div className="px-4 py-1.5 bg-[#141418] border-b border-white/[0.08] flex items-center justify-between text-xs text-zinc-300 shrink-0">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>You have <strong>{images.length} photos</strong> attached. Ready to combine side-by-side or stacked?</span>
              </span>
              <button
                onClick={() => setToolMode('merge')}
                className="px-2.5 py-0.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-[11px] transition-colors"
              >
                Open Merge & Collage Studio →
              </button>
            </div>
          )}

          {/* Canvas + Settings Sidebar Layout */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Interactive Canvas Area */}
            <div className="flex-1 relative min-h-0 h-full overflow-hidden">
              {imageState && (
                <EditorCanvas
                  imageState={imageState}
                  originalSrc={activeImage?.originalSrc || imageState.src}
                  isComparing={isComparing}
                  toolMode={toolMode}
                  cropRect={cropRect}
                  setCropRect={setCropRect}
                  aspectRatio={aspectRatio}
                  annotationTool={annotationTool}
                  annotationColor={annotationColor}
                  strokeWidth={strokeWidth}
                  fontSize={fontSize}
                  hasTextBg={hasTextBg}
                  onAddAnnotation={handleAddAnnotation}
                  zoom={zoom}
                  setZoom={setZoom}
                  pan={pan}
                  setPan={setPan}
                  onDropImage={handleFileSelect}
                  mergedCanvas={mergedPreviewCanvas}
                />
              )}

              {/* Floating quick crop bar for effortless user friendliness */}
              {toolMode === 'crop' && imageState && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#141418]/95 backdrop-blur-md border border-white/[0.12] px-3.5 py-2 rounded-full shadow-2xl animate-fade-in">
                  <span className="text-[11px] font-mono text-zinc-300 pr-1 hidden sm:inline">
                    {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
                  </span>
                  <button
                    onClick={handleResetCrop}
                    className="px-2.5 py-1 rounded-full text-xs text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApplyCrop}
                    className="px-3.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm transition-all"
                  >
                    ✓ Apply Crop
                  </button>
                </div>
              )}
            </div>

            {/* Context Tool Panel (Right Sidebar on Desktop, Bottom Sheet on Mobile) */}
            <aside className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-white/[0.08] bg-[#141418]/95 backdrop-blur-md overflow-y-auto shrink-0 z-20 max-h-80 md:max-h-full">
              {toolMode === 'crop' && (
                <CropPanel
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                  cropRect={cropRect}
                  imageDimensions={currentDisplayDimensions || { width: 0, height: 0 }}
                  onApplyCrop={handleApplyCrop}
                  onResetCrop={handleResetCrop}
                />
              )}

              {toolMode === 'rotate' && imageState && (
                <RotatePanel
                  rotation={imageState.rotation}
                  fineAngle={imageState.fineAngle}
                  flipH={imageState.flipH}
                  flipV={imageState.flipV}
                  onRotate90CW={handleRotate90CW}
                  onRotate90CCW={handleRotate90CCW}
                  onRotate180={handleRotate180}
                  onToggleFlipH={handleToggleFlipH}
                  onToggleFlipV={handleToggleFlipV}
                  onSetFineAngle={handleSetFineAngle}
                  onResetRotation={handleResetRotation}
                />
              )}

              {toolMode === 'adjust' && imageState && (
                <AdjustPanel
                  adjustments={imageState.adjustments}
                  onChangeAdjustment={handleChangeAdjustment}
                  onAutoEnhance={handleAutoEnhance}
                  onResetAdjustments={handleResetAdjustments}
                />
              )}

              {toolMode === 'filters' && imageState && (
                <FiltersPanel
                  activeFilter={imageState.filter}
                  onSelectFilter={handleSelectFilter}
                />
              )}

              {toolMode === 'annotate' && imageState && (
                <AnnotatePanel
                  currentTool={annotationTool}
                  setCurrentTool={setAnnotationTool}
                  currentColor={annotationColor}
                  setCurrentColor={setAnnotationColor}
                  strokeWidth={strokeWidth}
                  setStrokeWidth={setStrokeWidth}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  hasTextBg={hasTextBg}
                  setHasTextBg={setHasTextBg}
                  annotationCount={imageState.annotations.length}
                  onClearAnnotations={handleClearAnnotations}
                  onUndoLastAnnotation={handleUndoLastAnnotation}
                />
              )}

              {toolMode === 'resize' && (
                <ResizePanel
                  currentWidth={currentDisplayDimensions?.width || 0}
                  currentHeight={currentDisplayDimensions?.height || 0}
                  onApplyResize={handleApplyResize}
                />
              )}

              {toolMode === 'merge' && (
                <MergePanel
                  images={images}
                  settings={mergeSettings}
                  onChangeSettings={setMergeSettings}
                  onApplyMerge={handleApplyMergeToCanvas}
                  onCopyMerged={handleCopyToClipboard}
                  onExportMerged={handleOpenExportModal}
                />
              )}
            </aside>
          </div>

          {/* Bottom Multi-Image Gallery Strip */}
          <ImageStrip
            images={images}
            activeImageId={activeImageId}
            onSelectImage={handleSelectImage}
            onRemoveImage={handleRemoveImage}
            onAttachImageClick={() => fileInputRef.current?.click()}
            onOpenMergeMode={() => setToolMode('merge')}
            isMergeMode={toolMode === 'merge'}
          />
        </div>
      )}

      {/* Export / Save Dialog Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        renderedCanvas={renderedExportCanvas}
        initialFileName={activeImage?.name || 'pastecrop_image'}
        onCopySuccess={() => addToast('success', 'Image copied to clipboard!')}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

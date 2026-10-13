import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  ImageState, 
  ToolMode, 
  CropRect, 
  AspectRatio, 
  AnnotationTool, 
  AnnotationItem, 
  Point 
} from '../types/editor';
import { 
  renderCompositeCanvas, 
  buildCssFilterString, 
  drawAnnotation 
} from '../utils/imageProcess';

interface EditorCanvasProps {
  imageState: ImageState;
  originalSrc: string;
  isComparing: boolean;
  toolMode: ToolMode;
  cropRect: CropRect;
  setCropRect: React.Dispatch<React.SetStateAction<CropRect>>;
  aspectRatio: AspectRatio;
  annotationTool: AnnotationTool;
  annotationColor: string;
  strokeWidth: number;
  fontSize: number;
  hasTextBg: boolean;
  onAddAnnotation: (item: AnnotationItem) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  pan: Point;
  setPan: (pan: Point | ((prev: Point) => Point)) => void;
  onDropImage: (file: File) => void;
  mergedCanvas?: HTMLCanvasElement | null;
}

type CropHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | 'move' | null;

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  imageState,
  originalSrc,
  isComparing,
  toolMode,
  cropRect,
  setCropRect,
  aspectRatio,
  annotationTool,
  annotationColor,
  strokeWidth,
  fontSize,
  hasTextBg,
  onAddAnnotation,
  zoom,
  setZoom,
  pan,
  setPan,
  onDropImage,
  mergedCanvas,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<Point>({ x: 0, y: 0 });
  const [activeCropHandle, setActiveCropHandle] = useState<CropHandle>(null);
  const [cropStartPos, setCropStartPos] = useState<Point>({ x: 0, y: 0 });
  const [initialCropRect, setInitialCropRect] = useState<CropRect>(cropRect);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [drawingStart, setDrawingStart] = useState<Point | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<Point | null>(null);

  // Text prompt state
  const [textInputPos, setTextInputPos] = useState<Point | null>(null);
  const [textInputValue, setTextInputValue] = useState('');

  const [isDragOver, setIsDragOver] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Listen to spacebar for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Calculate actual display canvas dimensions (considering 90 / 270 deg rotations or merge canvas)
  const is90or270 = (imageState.rotation % 180 !== 0);
  const isMergeMode = toolMode === 'merge' && !!mergedCanvas;
  const displayW = isMergeMode ? mergedCanvas!.width : (is90or270 ? imageState.height : imageState.width);
  const displayH = isMergeMode ? mergedCanvas!.height : (is90or270 ? imageState.width : imageState.height);

  // Render composite image whenever imageState changes or comparison changes or merge mode updates
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isMergeMode && mergedCanvas) {
        canvas.width = mergedCanvas.width;
        canvas.height = mergedCanvas.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(mergedCanvas, 0, 0);
        }
        return;
      }

      const stateToRender = isComparing
        ? {
            ...imageState,
            src: originalSrc,
            rotation: 0,
            fineAngle: 0,
            flipH: false,
            flipV: false,
            adjustments: {
              brightness: 0,
              contrast: 0,
              saturation: 0,
              exposure: 0,
              warmth: 0,
              blur: 0,
              sharpen: 0,
              sepia: 0,
              grayscale: 0,
              invert: false,
            },
            filter: 'normal' as const,
            annotations: [],
          }
        : imageState;

      try {
        const rendered = await renderCompositeCanvas(stateToRender);
        if (isCancelled) return;

        canvas.width = rendered.width;
        canvas.height = rendered.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(rendered, 0, 0);
        }
      } catch (err) {
        console.error('Canvas render failed', err);
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [imageState, isComparing, originalSrc, isMergeMode, mergedCanvas]);

  // Render live annotation drawing preview on top overlay
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    overlay.width = displayW;
    overlay.height = displayH;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (isDrawing && toolMode === 'annotate') {
      const previewItem: AnnotationItem = {
        id: 'preview',
        tool: annotationTool,
        color: annotationColor,
        size: strokeWidth,
        points: currentPath,
        start: drawingStart || undefined,
        end: drawingCurrent || undefined,
        fontSize,
        bgColor: hasTextBg ? 'rgba(15, 23, 42, 0.85)' : undefined,
      };
      drawAnnotation(ctx, previewItem);
    }
  }, [
    isDrawing,
    toolMode,
    annotationTool,
    annotationColor,
    strokeWidth,
    currentPath,
    drawingStart,
    drawingCurrent,
    displayW,
    displayH,
    fontSize,
    hasTextBg,
  ]);

  // Convert client viewport coordinate to image pixel coordinate
  const clientToImageCoords = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const imgX = (clientX - rect.left) * scaleX;
      const imgY = (clientY - rect.top) * scaleY;

      return {
        x: Math.max(0, Math.min(canvas.width, imgX)),
        y: Math.max(0, Math.min(canvas.height, imgY)),
      };
    },
    []
  );

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    setZoom(newZoom);
  };

  // Mouse Down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // If Spacebar pressed or middle click or alt-click, pan canvas
    if (e.button === 1 || isSpacePressed || (e.altKey && e.button === 0)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;

    const coords = clientToImageCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (toolMode === 'annotate') {
      if (annotationTool === 'text') {
        setTextInputPos(coords);
        setTextInputValue('');
        return;
      }

      setIsDrawing(true);
      setDrawingStart(coords);
      setDrawingCurrent(coords);
      if (annotationTool === 'pen' || annotationTool === 'highlighter') {
        setCurrentPath([coords]);
      }
    }
  };

  // Mouse Move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
      return;
    }

    const coords = clientToImageCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (isDrawing && toolMode === 'annotate') {
      setDrawingCurrent(coords);
      if (annotationTool === 'pen' || annotationTool === 'highlighter') {
        setCurrentPath((prev) => [...prev, coords]);
      }
    }

    if (activeCropHandle && toolMode === 'crop') {
      handleCropHandleMove(coords);
    }
  };

  // Mouse Up handler
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && toolMode === 'annotate') {
      if (drawingStart && drawingCurrent) {
        const newItem: AnnotationItem = {
          id: Math.random().toString(36).substring(2, 9),
          tool: annotationTool,
          color: annotationColor,
          size: strokeWidth,
          points: currentPath.length > 0 ? [...currentPath] : undefined,
          start: drawingStart,
          end: drawingCurrent,
          fontSize,
          bgColor: hasTextBg ? 'rgba(15, 23, 42, 0.85)' : undefined,
        };
        onAddAnnotation(newItem);
      }

      setIsDrawing(false);
      setCurrentPath([]);
      setDrawingStart(null);
      setDrawingCurrent(null);
    }

    if (activeCropHandle) {
      setActiveCropHandle(null);
    }
  };

  // Crop handle drag logic
  const handleCropHandleStart = (handle: CropHandle, e: React.MouseEvent) => {
    e.stopPropagation();
    const coords = clientToImageCoords(e.clientX, e.clientY);
    if (!coords) return;
    setActiveCropHandle(handle);
    setCropStartPos(coords);
    setInitialCropRect({ ...cropRect });
  };

  const handleCropHandleMove = (currentPos: Point) => {
    const dx = currentPos.x - cropStartPos.x;
    const dy = currentPos.y - cropStartPos.y;

    const imgW = displayW;
    const imgH = displayH;

    let { x, y, width, height } = initialCropRect;

    // Aspect ratio ratio multiplier
    let targetRatio: number | null = null;
    if (aspectRatio === '1:1') targetRatio = 1;
    else if (aspectRatio === '4:3') targetRatio = 4 / 3;
    else if (aspectRatio === '16:9') targetRatio = 16 / 9;
    else if (aspectRatio === '3:2') targetRatio = 3 / 2;
    else if (aspectRatio === '9:16') targetRatio = 9 / 16;
    else if (aspectRatio === '2:3') targetRatio = 2 / 3;

    if (activeCropHandle === 'move') {
      x = Math.max(0, Math.min(imgW - width, initialCropRect.x + dx));
      y = Math.max(0, Math.min(imgH - height, initialCropRect.y + dy));
    } else {
      let newX = x;
      let newY = y;
      let newW = width;
      let newH = height;

      if (activeCropHandle?.includes('e')) {
        newW = Math.max(20, initialCropRect.width + dx);
        if (newX + newW > imgW) newW = imgW - newX;
      }
      if (activeCropHandle?.includes('w')) {
        const potentialW = initialCropRect.width - dx;
        if (potentialW >= 20 && initialCropRect.x + dx >= 0) {
          newX = initialCropRect.x + dx;
          newW = potentialW;
        }
      }
      if (activeCropHandle?.includes('s')) {
        newH = Math.max(20, initialCropRect.height + dy);
        if (newY + newH > imgH) newH = imgH - newY;
      }
      if (activeCropHandle?.includes('n')) {
        const potentialH = initialCropRect.height - dy;
        if (potentialH >= 20 && initialCropRect.y + dy >= 0) {
          newY = initialCropRect.y + dy;
          newH = potentialH;
        }
      }

      // Enforce aspect ratio lock if active
      if (targetRatio !== null) {
        if (activeCropHandle === 'e' || activeCropHandle === 'w') {
          newH = newW / targetRatio;
        } else {
          newW = newH * targetRatio;
        }
        if (newX + newW > imgW) {
          newW = imgW - newX;
          newH = newW / targetRatio;
        }
        if (newY + newH > imgH) {
          newH = imgH - newY;
          newW = newH * targetRatio;
        }
      }

      x = Math.max(0, newX);
      y = Math.max(0, newY);
      width = Math.min(imgW - x, newW);
      height = Math.min(imgH - y, newH);
    }

    setCropRect({ x, y, width, height });
  };

  // Submit Text Annotation
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInputValue.trim() && textInputPos) {
      onAddAnnotation({
        id: Math.random().toString(36).substring(2, 9),
        tool: 'text',
        color: annotationColor,
        size: strokeWidth,
        start: textInputPos,
        text: textInputValue.trim(),
        fontSize,
        bgColor: hasTextBg ? 'rgba(15, 23, 42, 0.85)' : undefined,
      });
    }
    setTextInputPos(null);
    setTextInputValue('');
  };

  // Drag and Drop files onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onDropImage(file);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-checkerboard select-none ${
        isSpacePressed ? 'cursor-grab' : isPanning ? 'cursor-grabbing' : toolMode === 'annotate' ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {/* Drag & drop overlay indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-black/70 border-2 border-dashed border-white/60 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-[#18181d] px-6 py-3 rounded-2xl border border-white/20 text-white font-semibold shadow-2xl">
            Drop photo to open
          </div>
        </div>
      )}

      {/* Transformed Stage Container */}
      <div
        className="relative transition-transform duration-75 ease-out shadow-2xl shadow-black/80"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          width: displayW,
          height: displayH,
        }}
      >
        {/* Base Image Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block w-full h-full pointer-events-none"
        />

        {/* Live Annotations Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 block w-full h-full pointer-events-none z-10"
        />

        {/* Interactive Crop Overlay */}
        {toolMode === 'crop' && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Dark Scrim around crop box */}
            <div
              className="absolute pointer-events-auto cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.72)]"
              style={{
                left: `${cropRect.x}px`,
                top: `${cropRect.y}px`,
                width: `${cropRect.width}px`,
                height: `${cropRect.height}px`,
              }}
              onMouseDown={(e) => handleCropHandleStart('move', e)}
            >
              {/* Rule of thirds grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-white/25"></div>
                <div className="border-r border-b border-white/25"></div>
                <div className="border-b border-white/25"></div>
                <div className="border-r border-b border-white/25"></div>
                <div className="border-r border-b border-white/25"></div>
                <div className="border-b border-white/25"></div>
                <div className="border-r border-white/25"></div>
                <div className="border-r border-white/25"></div>
                <div></div>
              </div>

              {/* Crop box dimensions badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#16161b]/90 backdrop-blur border border-white/20 text-[10px] text-white font-mono pointer-events-none shadow-sm">
                {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
              </div>

              {/* Corner Handles */}
              <div
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-zinc-900 rounded-sm cursor-nwse-resize shadow"
                onMouseDown={(e) => handleCropHandleStart('nw', e)}
              />
              <div
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-zinc-900 rounded-sm cursor-nesw-resize shadow"
                onMouseDown={(e) => handleCropHandleStart('ne', e)}
              />
              <div
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-zinc-900 rounded-sm cursor-nwse-resize shadow"
                onMouseDown={(e) => handleCropHandleStart('se', e)}
              />
              <div
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-zinc-900 rounded-sm cursor-nesw-resize shadow"
                onMouseDown={(e) => handleCropHandleStart('sw', e)}
              />

              {/* Edge Handles */}
              <div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-zinc-900 rounded-sm cursor-ns-resize shadow"
                onMouseDown={(e) => handleCropHandleStart('n', e)}
              />
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-zinc-900 rounded-sm cursor-ns-resize shadow"
                onMouseDown={(e) => handleCropHandleStart('s', e)}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2 h-6 bg-white border border-zinc-900 rounded-sm cursor-ew-resize shadow"
                onMouseDown={(e) => handleCropHandleStart('w', e)}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2 h-6 bg-white border border-zinc-900 rounded-sm cursor-ew-resize shadow"
                onMouseDown={(e) => handleCropHandleStart('e', e)}
              />
            </div>
          </div>
        )}

        {/* Text Input Popover */}
        {textInputPos && (
          <div
            className="absolute z-30 pointer-events-auto"
            style={{
              left: `${textInputPos.x}px`,
              top: `${textInputPos.y}px`,
            }}
          >
            <form onSubmit={handleTextSubmit} className="flex items-center gap-1.5 bg-[#18181d] border border-white/15 p-1.5 rounded-xl shadow-2xl">
              <input
                type="text"
                autoFocus
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                placeholder="Type caption..."
                className="bg-[#24242b] border border-white/10 text-white text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-white/30 w-44"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 text-xs rounded-lg font-semibold transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setTextInputPos(null)}
                className="px-2 py-1 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Comparing Indicator badge */}
      {isComparing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/90 text-slate-950 font-bold px-3 py-1 rounded-full text-xs shadow-lg pointer-events-none z-30">
          Showing Original Image
        </div>
      )}
    </div>
  );
};

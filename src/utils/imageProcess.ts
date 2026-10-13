import { ImageState, Adjustments, AnnotationItem, ExportFormat, FilterPreset } from '../types/editor';

export const DEFAULT_ADJUSTMENTS: Adjustments = {
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
};

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'normal', name: 'Original', adjustments: { ...DEFAULT_ADJUSTMENTS } },
  { id: 'vivid', name: 'Vivid Pop', adjustments: { brightness: 5, contrast: 20, saturation: 35, warmth: 10 } },
  { id: 'mono', name: 'High B&W', adjustments: { grayscale: 100, contrast: 30, brightness: 5 } },
  { id: 'vintage', name: 'Vintage 70s', adjustments: { sepia: 40, contrast: 15, brightness: 5, warmth: 25, saturation: -15 } },
  { id: 'slate', name: 'Cool Slate', adjustments: { warmth: -25, saturation: -10, contrast: 15, brightness: 0 } },
  { id: 'cyber', name: 'Cyber Noir', adjustments: { contrast: 45, brightness: -10, saturation: 20, warmth: -15 } },
  { id: 'warm', name: 'Golden Hour', adjustments: { warmth: 35, saturation: 20, brightness: 10, contrast: 10 } },
  { id: 'matte', name: 'Soft Matte', adjustments: { contrast: -15, brightness: 10, saturation: -10 } },
  { id: 'dramatic', name: 'Dramatic', adjustments: { contrast: 35, brightness: -5, saturation: 10, exposure: 10 } },
];

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Builds standard CSS filter string from Adjustments object
 */
export function buildCssFilterString(adj: Adjustments): string {
  const parts: string[] = [];

  // Brightness: 0 is 100%, -100 is 0%, 100 is 200%
  const brightnessVal = 1 + adj.brightness / 100 + adj.exposure / 100;
  parts.push(`brightness(${Math.max(0, brightnessVal)})`);

  // Contrast: 0 is 100%, -100 is 0%, 100 is 200%
  const contrastVal = 1 + adj.contrast / 100;
  parts.push(`contrast(${Math.max(0, contrastVal)})`);

  // Saturation: 0 is 100%, -100 is 0%, 100 is 200%
  const saturateVal = 1 + adj.saturation / 100;
  parts.push(`saturate(${Math.max(0, saturateVal)})`);

  // Grayscale: 0 to 100%
  if (adj.grayscale > 0) {
    parts.push(`grayscale(${adj.grayscale}%)`);
  }

  // Sepia: 0 to 100%
  if (adj.sepia > 0) {
    parts.push(`sepia(${adj.sepia}%)`);
  }

  // Invert: 0 or 100%
  if (adj.invert) {
    parts.push(`invert(100%)`);
  }

  // Blur: 0 to 20px
  if (adj.blur > 0) {
    parts.push(`blur(${adj.blur}px)`);
  }

  return parts.join(' ');
}

/**
 * Pixelate a specified rectangular area on canvas context (useful for redact/blurring sensitive info)
 */
export function pixelateArea(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  blockSize = 12
) {
  const rx = Math.round(Math.min(x, x + width));
  const ry = Math.round(Math.min(y, y + height));
  const rw = Math.round(Math.abs(width));
  const rh = Math.round(Math.abs(height));

  if (rw <= 0 || rh <= 0) return;

  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  const safeX = Math.max(0, Math.min(canvasWidth - 1, rx));
  const safeY = Math.max(0, Math.min(canvasHeight - 1, ry));
  const safeW = Math.min(rw, canvasWidth - safeX);
  const safeH = Math.min(rh, canvasHeight - safeY);

  if (safeW <= 0 || safeH <= 0) return;

  const imgData = ctx.getImageData(safeX, safeY, safeW, safeH);
  const data = imgData.data;

  for (let py = 0; py < safeH; py += blockSize) {
    for (let px = 0; px < safeW; px += blockSize) {
      const curW = Math.min(blockSize, safeW - px);
      const curH = Math.min(blockSize, safeH - py);

      let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
      let count = 0;

      for (let dy = 0; dy < curH; dy++) {
        for (let dx = 0; dx < curW; dx++) {
          const index = ((py + dy) * safeW + (px + dx)) * 4;
          totalR += data[index];
          totalG += data[index + 1];
          totalB += data[index + 2];
          totalA += data[index + 3];
          count++;
        }
      }

      const avgR = Math.round(totalR / count);
      const avgG = Math.round(totalG / count);
      const avgB = Math.round(totalB / count);
      const avgA = Math.round(totalA / count);

      for (let dy = 0; dy < curH; dy++) {
        for (let dx = 0; dx < curW; dx++) {
          const index = ((py + dy) * safeW + (px + dx)) * 4;
          data[index] = avgR;
          data[index + 1] = avgG;
          data[index + 2] = avgB;
          data[index + 3] = avgA;
        }
      }
    }
  }

  ctx.putImageData(imgData, safeX, safeY);
}

/**
 * Draw an arrow on canvas
 */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  lineWidth: number
) {
  const headLength = Math.max(12, lineWidth * 3.5);
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Main line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw single annotation onto canvas
 */
export function drawAnnotation(ctx: CanvasRenderingContext2D, item: AnnotationItem) {
  ctx.save();

  if (item.tool === 'pen' && item.points && item.points.length > 0) {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(item.points[0].x, item.points[0].y);
    for (let i = 1; i < item.points.length; i++) {
      ctx.lineTo(item.points[i].x, item.points[i].y);
    }
    ctx.stroke();
  } else if (item.tool === 'highlighter' && item.points && item.points.length > 0) {
    ctx.strokeStyle = item.color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = item.size * 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(item.points[0].x, item.points[0].y);
    for (let i = 1; i < item.points.length; i++) {
      ctx.lineTo(item.points[i].x, item.points[i].y);
    }
    ctx.stroke();
  } else if (item.tool === 'arrow' && item.start && item.end) {
    drawArrow(ctx, item.start.x, item.start.y, item.end.x, item.end.y, item.color, item.size);
  } else if (item.tool === 'rect' && item.start && item.end) {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.size;
    const x = Math.min(item.start.x, item.end.x);
    const y = Math.min(item.start.y, item.end.y);
    const w = Math.abs(item.end.x - item.start.x);
    const h = Math.abs(item.end.y - item.start.y);
    ctx.strokeRect(x, y, w, h);
  } else if (item.tool === 'circle' && item.start && item.end) {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.size;
    const x = Math.min(item.start.x, item.end.x);
    const y = Math.min(item.start.y, item.end.y);
    const w = Math.abs(item.end.x - item.start.x);
    const h = Math.abs(item.end.y - item.start.y);
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (item.tool === 'redact' && item.start && item.end) {
    const x = Math.min(item.start.x, item.end.x);
    const y = Math.min(item.start.y, item.end.y);
    const w = Math.abs(item.end.x - item.start.x);
    const h = Math.abs(item.end.y - item.start.y);
    pixelateArea(ctx, x, y, w, h, 14);
  } else if (item.tool === 'text' && item.start && item.text) {
    const fontSize = item.fontSize || 24;
    ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
    const textMetrics = ctx.measureText(item.text);
    const textWidth = textMetrics.width;
    const padding = 8;
    const boxHeight = fontSize * 1.3;

    // Optional background badge for readability
    if (item.bgColor && item.bgColor !== 'transparent') {
      ctx.fillStyle = item.bgColor;
      ctx.fillRect(item.start.x - padding, item.start.y - fontSize + padding / 2, textWidth + padding * 2, boxHeight);
    }

    ctx.fillStyle = item.color;
    ctx.textBaseline = 'middle';
    ctx.fillText(item.text, item.start.x, item.start.y);
  }

  ctx.restore();
}

/**
 * Render the full transformed image with adjustments, rotations, flips, and annotations onto an HTMLCanvasElement
 */
export async function renderCompositeCanvas(imageState: ImageState): Promise<HTMLCanvasElement> {
  const img = await loadImage(imageState.src);

  // Determine canvas dimensions based on 90 / 270 degree rotation
  const is90or270 = (imageState.rotation % 180 !== 0);
  const baseW = is90or270 ? imageState.height : imageState.width;
  const baseH = is90or270 ? imageState.width : imageState.height;

  const canvas = document.createElement('canvas');
  canvas.width = baseW;
  canvas.height = baseH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.save();

  // Move to center to perform rotation & flips
  ctx.translate(baseW / 2, baseH / 2);

  const totalAngleDeg = imageState.rotation + (imageState.fineAngle || 0);
  const totalAngleRad = (totalAngleDeg * Math.PI) / 180;
  ctx.rotate(totalAngleRad);

  const scaleX = imageState.flipH ? -1 : 1;
  const scaleY = imageState.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Apply CSS filters (brightness, contrast, saturation, blur, etc.)
  const filterStr = buildCssFilterString(imageState.adjustments);
  if (filterStr) {
    ctx.filter = filterStr;
  }

  // Draw base image centered
  const drawW = imageState.width;
  const drawH = imageState.height;
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();

  // Apply warmth tint if specified
  if (imageState.adjustments.warmth !== 0) {
    ctx.save();
    if (imageState.adjustments.warmth > 0) {
      ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(0.35, imageState.adjustments.warmth / 250)})`;
    } else {
      ctx.fillStyle = `rgba(0, 140, 255, ${Math.min(0.35, Math.abs(imageState.adjustments.warmth) / 250)})`;
    }
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillRect(0, 0, baseW, baseH);
    ctx.restore();
  }

  // Draw all annotations on top
  for (const ann of imageState.annotations) {
    drawAnnotation(ctx, ann);
  }

  return canvas;
}

/**
 * Crop the image canvas to a specific sub-rectangle and return a new image state
 */
export async function cropImageToState(
  imageState: ImageState,
  crop: { x: number; y: number; width: number; height: number }
): Promise<ImageState> {
  const composite = await renderCompositeCanvas(imageState);

  // Clamp crop values to composite bounds
  const x = Math.max(0, Math.min(composite.width - 1, Math.round(crop.x)));
  const y = Math.max(0, Math.min(composite.height - 1, Math.round(crop.y)));
  const w = Math.max(1, Math.min(composite.width - x, Math.round(crop.width)));
  const h = Math.max(1, Math.min(composite.height - y, Math.round(crop.height)));

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = w;
  croppedCanvas.height = h;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Could not get cropped canvas context');

  cctx.drawImage(composite, x, y, w, h, 0, 0, w, h);
  const dataUrl = croppedCanvas.toDataURL('image/png');

  return {
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
}

/**
 * Resize image canvas to custom width and height
 */
export async function resizeImageToState(
  imageState: ImageState,
  targetWidth: number,
  targetHeight: number
): Promise<ImageState> {
  const composite = await renderCompositeCanvas(imageState);

  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = Math.max(1, Math.round(targetWidth));
  resizedCanvas.height = Math.max(1, Math.round(targetHeight));
  const rctx = resizedCanvas.getContext('2d');
  if (!rctx) throw new Error('Could not get resize canvas context');

  // High quality image smoothing
  rctx.imageSmoothingEnabled = true;
  rctx.imageSmoothingQuality = 'high';
  rctx.drawImage(composite, 0, 0, resizedCanvas.width, resizedCanvas.height);

  const dataUrl = resizedCanvas.toDataURL('image/png');

  return {
    src: dataUrl,
    width: resizedCanvas.width,
    height: resizedCanvas.height,
    rotation: 0,
    fineAngle: 0,
    flipH: false,
    flipV: false,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    filter: 'normal',
    annotations: [],
  };
}

/**
 * Convert canvas to Blob in requested format & quality
 */
export function getCanvasBlob(canvas: HTMLCanvasElement, format: ExportFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob'));
      },
      mime,
      quality
    );
  });
}

/**
 * Copy canvas image to user's clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await getCanvasBlob(canvas, 'png', 1.0);
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed, attempting fallback', err);
    return false;
  }
}

/**
 * Trigger browser file download
 */
export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  fileName: string,
  format: ExportFormat,
  quality: number
) {
  const blob = await getCanvasBlob(canvas, format, quality);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const ext = format === 'jpeg' ? 'jpg' : format;
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  link.download = `${cleanName || 'edited_image'}.${ext}`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Formats byte size to human readable string (KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Draws an image canvas into a rectangular area with optional corner radius and fitMode
 */
function drawSlotImage(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  radius: number,
  fitMode: 'cover' | 'contain'
) {
  ctx.save();

  // Create rounded rectangle path clip if radius > 0
  if (radius > 0) {
    const r = Math.min(radius, Math.min(dw, dh) / 2);
    ctx.beginPath();
    ctx.moveTo(dx + r, dy);
    ctx.lineTo(dx + dw - r, dy);
    ctx.quadraticCurveTo(dx + dw, dy, dx + dw, dy + r);
    ctx.lineTo(dx + dw, dy + dh - r);
    ctx.quadraticCurveTo(dx + dw, dy + dh, dx + dw - r, dy + dh);
    ctx.lineTo(dx + r, dy + dh);
    ctx.quadraticCurveTo(dx, dy + dh, dx, dy + dh - r);
    ctx.lineTo(dx, dy + r);
    ctx.quadraticCurveTo(dx, dy, dx + r, dy);
    ctx.closePath();
    ctx.clip();
  }

  const sw = source.width;
  const sh = source.height;

  if (fitMode === 'cover') {
    const srcRatio = sw / sh;
    const dstRatio = dw / dh;
    let sx = 0, sy = 0, sCropW = sw, sCropH = sh;

    if (srcRatio > dstRatio) {
      // Source is wider than destination
      sCropW = sh * dstRatio;
      sx = (sw - sCropW) / 2;
    } else {
      // Source is taller than destination
      sCropH = sw / dstRatio;
      sy = (sh - sCropH) / 2;
    }

    ctx.drawImage(source, sx, sy, sCropW, sCropH, dx, dy, dw, dh);
  } else {
    // Contain mode
    const scale = Math.min(dw / sw, dh / sh);
    const fitW = sw * scale;
    const fitH = sh * scale;
    const offsetX = dx + (dw - fitW) / 2;
    const offsetY = dy + (dh - fitH) / 2;

    ctx.drawImage(source, 0, 0, sw, sh, offsetX, offsetY, fitW, fitH);
  }

  ctx.restore();
}

/**
 * Render multiple images into a stitched / merged composite canvas
 */
export async function renderMergedCanvas(
  images: import('../types/editor').ProjectImage[],
  settings: import('../types/editor').MergeSettings
): Promise<HTMLCanvasElement> {
  if (images.length === 0) {
    const emptyCanvas = document.createElement('canvas');
    emptyCanvas.width = 800;
    emptyCanvas.height = 600;
    return emptyCanvas;
  }

  // Order images by settings.order if present
  const orderedImages: import('../types/editor').ProjectImage[] = [];
  if (settings.order && settings.order.length > 0) {
    for (const id of settings.order) {
      const found = images.find((img) => img.id === id);
      if (found) orderedImages.push(found);
    }
    // Append any images not explicitly listed in order
    for (const img of images) {
      if (!orderedImages.some((o) => o.id === img.id)) {
        orderedImages.push(img);
      }
    }
  } else {
    orderedImages.push(...images);
  }

  // Pre-render composite canvases for all images (applying each image's crop, rotation, filters)
  const renderedItems = await Promise.all(
    orderedImages.map(async (img) => {
      const c = await renderCompositeCanvas(img.state);
      return { id: img.id, name: img.name, canvas: c };
    })
  );

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get merged canvas context');

  const { layout, spacing, padding, bgColor, borderRadius, fitMode } = settings;
  const count = renderedItems.length;

  if (layout === 'horizontal') {
    // Normalize to uniform height
    const uniformH = 1000;
    const scaledWidths = renderedItems.map((item) => (item.canvas.width / item.canvas.height) * uniformH);
    const totalW = Math.round(
      scaledWidths.reduce((a, b) => a + b, 0) + spacing * (count - 1) + padding * 2
    );
    const totalH = Math.round(uniformH + padding * 2);

    canvas.width = totalW;
    canvas.height = totalH;

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalW, totalH);
    }

    let curX = padding;
    renderedItems.forEach((item, idx) => {
      const slotW = scaledWidths[idx];
      drawSlotImage(ctx, item.canvas, curX, padding, slotW, uniformH, borderRadius, fitMode);
      curX += slotW + spacing;
    });
  } else if (layout === 'vertical') {
    // Normalize to uniform width
    const uniformW = 1200;
    const scaledHeights = renderedItems.map((item) => (item.canvas.height / item.canvas.width) * uniformW);
    const totalH = Math.round(
      scaledHeights.reduce((a, b) => a + b, 0) + spacing * (count - 1) + padding * 2
    );
    const totalW = Math.round(uniformW + padding * 2);

    canvas.width = totalW;
    canvas.height = totalH;

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalW, totalH);
    }

    let curY = padding;
    renderedItems.forEach((item, idx) => {
      const slotH = scaledHeights[idx];
      drawSlotImage(ctx, item.canvas, padding, curY, uniformW, slotH, borderRadius, fitMode);
      curY += slotH + spacing;
    });
  } else if (layout === 'featured-left' && count >= 2) {
    const baseW = 1400;
    const baseH = 900;
    canvas.width = baseW + padding * 2;
    canvas.height = baseH + padding * 2;

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const leftW = Math.round((baseW - spacing) * 0.6);
    const rightW = baseW - spacing - leftW;

    // Draw main left slot
    drawSlotImage(ctx, renderedItems[0].canvas, padding, padding, leftW, baseH, borderRadius, fitMode);

    // Draw right slots
    const rightItems = renderedItems.slice(1);
    const rightCount = rightItems.length;
    const slotH = (baseH - spacing * (rightCount - 1)) / rightCount;

    rightItems.forEach((item, idx) => {
      const curY = padding + idx * (slotH + spacing);
      drawSlotImage(ctx, item.canvas, padding + leftW + spacing, curY, rightW, slotH, borderRadius, fitMode);
    });
  } else if (layout === 'featured-top' && count >= 2) {
    const baseW = 1200;
    const baseH = 1100;
    canvas.width = baseW + padding * 2;
    canvas.height = baseH + padding * 2;

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const topH = Math.round((baseH - spacing) * 0.58);
    const bottomH = baseH - spacing - topH;

    // Draw main top slot
    drawSlotImage(ctx, renderedItems[0].canvas, padding, padding, baseW, topH, borderRadius, fitMode);

    // Draw bottom slots
    const bottomItems = renderedItems.slice(1);
    const bottomCount = bottomItems.length;
    const slotW = (baseW - spacing * (bottomCount - 1)) / bottomCount;

    bottomItems.forEach((item, idx) => {
      const curX = padding + idx * (slotW + spacing);
      drawSlotImage(ctx, item.canvas, curX, padding + topH + spacing, slotW, bottomH, borderRadius, fitMode);
    });
  } else if (layout === 'pip' && count >= 2) {
    // Picture in picture overlay
    const baseCanvas = renderedItems[0].canvas;
    canvas.width = baseCanvas.width;
    canvas.height = baseCanvas.height;

    // Draw base
    ctx.drawImage(baseCanvas, 0, 0);

    // Draw pip overlays in bottom corners
    const pipW = Math.round(canvas.width * 0.32);
    const pipH = Math.round(canvas.height * 0.32);

    renderedItems.slice(1).forEach((item, idx) => {
      const margin = 24;
      const curX = canvas.width - pipW - margin - idx * (pipW * 0.4);
      const curY = canvas.height - pipH - margin;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffffff';
      // Draw shadow border
      ctx.fillRect(curX - 4, curY - 4, pipW + 8, pipH + 8);
      ctx.restore();

      drawSlotImage(ctx, item.canvas, curX, curY, pipW, pipH, Math.max(4, borderRadius), fitMode);
    });
  } else {
    // Standard Grid (2x2 or balanced columns)
    const cols = count <= 2 ? count : count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);
    const cellW = 600;
    const cellH = 450;
    const totalW = cols * cellW + spacing * (cols - 1) + padding * 2;
    const totalH = rows * cellH + spacing * (rows - 1) + padding * 2;

    canvas.width = totalW;
    canvas.height = totalH;

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalW, totalH);
    }

    renderedItems.forEach((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const curX = padding + col * (cellW + spacing);
      const curY = padding + row * (cellH + spacing);

      drawSlotImage(ctx, item.canvas, curX, curY, cellW, cellH, borderRadius, fitMode);
    });
  }

  return canvas;
}


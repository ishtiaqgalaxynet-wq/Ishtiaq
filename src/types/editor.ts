export type ToolMode = 'crop' | 'rotate' | 'adjust' | 'filters' | 'annotate' | 'resize' | 'merge';

export type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '9:16' | '2:3';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Adjustments {
  brightness: number;   // -100 to 100, default 0
  contrast: number;     // -100 to 100, default 0
  saturation: number;   // -100 to 100, default 0
  exposure: number;     // -100 to 100, default 0
  warmth: number;       // -100 to 100, default 0
  blur: number;         // 0 to 20, default 0
  sharpen: number;      // 0 to 100, default 0
  sepia: number;        // 0 to 100, default 0
  grayscale: number;    // 0 to 100, default 0
  invert: boolean;      // default false
}

export type PresetFilterId = 'normal' | 'vivid' | 'mono' | 'vintage' | 'slate' | 'cyber' | 'warm' | 'matte' | 'dramatic';

export interface FilterPreset {
  id: PresetFilterId;
  name: string;
  adjustments: Partial<Adjustments>;
}

export type AnnotationTool = 'pen' | 'highlighter' | 'arrow' | 'rect' | 'circle' | 'redact' | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface AnnotationItem {
  id: string;
  tool: AnnotationTool;
  color: string;
  size: number;
  points?: Point[];       // for pen, highlighter
  start?: Point;          // for arrow, rect, circle, redact
  end?: Point;            // for arrow, rect, circle, redact
  text?: string;          // for text
  fontSize?: number;      // for text
  bgColor?: string;       // text background badge or transparent
}

export interface ImageState {
  src: string;                 // current base image data URL
  width: number;
  height: number;
  rotation: number;            // 0, 90, 180, 270 degrees
  fineAngle: number;           // -45 to 45
  flipH: boolean;
  flipV: boolean;
  adjustments: Adjustments;
  filter: PresetFilterId;
  annotations: AnnotationItem[];
}

export interface ProjectImage {
  id: string;
  name: string;
  state: ImageState;
  originalSrc: string;
  cropRect: CropRect;
  aspectRatio: AspectRatio;
}

export type MergeLayout = 
  | 'horizontal'      // Side by Side (Left to Right)
  | 'vertical'        // Stacked (Top to Bottom)
  | 'grid'            // Grid / Balanced 2x2 or 3-split
  | 'featured-left'   // 1 Big Left + 2 Stacked Right
  | 'featured-top'    // 1 Big Top + 2 Side-by-side Bottom
  | 'pip';            // Picture in Picture / Overlay

export interface MergeSettings {
  layout: MergeLayout;
  spacing: number;            // 0 to 48 px gap between images
  padding: number;            // 0 to 48 px outer container padding
  bgColor: string;            // background hex or 'transparent'
  borderRadius: number;       // 0 to 32 px corner radius
  fitMode: 'cover' | 'contain';
  order: string[];            // Image IDs sequence
}

export interface HistoryItem {
  state: ImageState;
  description: string;
}

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportSettings {
  format: ExportFormat;
  quality: number; // 0.1 to 1.0
  fileName: string;
}

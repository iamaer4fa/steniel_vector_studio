export type ToolType =
  | 'pick'
  | 'shape'
  | 'zoom'
  | 'pan'
  | 'freehand'
  | 'pen'
  | 'rectangle'
  | 'ellipse'
  | 'polygon'
  | 'text'
  | 'interactive-fill'
  | 'eyedropper';

export type NodeType = 'cusp' | 'smooth' | 'symmetrical';
export type SegmentType = 'line' | 'curve';

export interface Point {
  x: number;
  y: number;
}

export interface CurveNode {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  segmentType: SegmentType;
  handleIn?: Point;
  handleOut?: Point;
  selected?: boolean;
}

export interface Subpath {
  id: string;
  nodes: CurveNode[];
  closed: boolean;
}

export interface Transform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface VectorObjectBase {
  id: string;
  name: string;
  fill: string; // hex or 'none'
  stroke: string; // hex or 'none'
  strokeWidth: number; // in pt
  strokeDash?: string; // 'solid' | 'dashed' | 'dotted'
  opacity: number; // 0 to 1
  visible: boolean;
  locked: boolean;
  fillRule?: 'nonzero' | 'evenodd';
  transform: Transform;
}

export interface CurveObject extends VectorObjectBase {
  type: 'curve';
  subpaths: Subpath[];
}

export interface RectangleObject extends VectorObjectBase {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadii: [number, number, number, number]; // [TL, TR, BR, BL]
  roundCornersTogether: boolean;
}

export interface EllipseObject extends VectorObjectBase {
  type: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  kind: 'ellipse' | 'pie' | 'arc';
  startAngle: number;
  endAngle: number;
}

export interface PolygonObject extends VectorObjectBase {
  type: 'polygon';
  cx: number;
  cy: number;
  radius: number;
  sides: number;
  isStar: boolean;
  sharpness: number; // 0.1 to 0.9 for star inner depth
}

export interface TextObject extends VectorObjectBase {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: 'left' | 'center' | 'right';
}

export type VectorObject =
  | CurveObject
  | RectangleObject
  | EllipseObject
  | PolygonObject
  | TextObject;

export interface Guideline {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
}

export interface PageConfig {
  name: string;
  width: number; // in mm or px
  height: number;
  unit: 'mm' | 'px' | 'in' | 'pt';
  orientation: 'portrait' | 'landscape';
  preset: string;
}

export interface ViewportState {
  panX: number;
  panY: number;
  zoom: number; // 1 = 100%
}

export interface SelectedNodeRef {
  objectId: string;
  subpathIndex: number;
  nodeIndex: number;
  handleType?: 'node' | 'handleIn' | 'handleOut';
}

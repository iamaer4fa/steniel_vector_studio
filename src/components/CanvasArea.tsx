import React, { useRef, useState, useEffect } from 'react';
import {
  CurveNode,
  CurveObject,
  Guideline,
  PageConfig,
  Point,
  SelectedNodeRef,
  Subpath,
  ToolType,
  VectorObject,
  ViewportState,
} from '../types/corel';
import {
  distance,
  generateId,
  getObjectBoundingBox,
  insertNodeOnSegment,
  smoothFreehandPoints,
  subpathsToSvgPath,
  updateNodeHandles,
} from '../utils/bezier';

interface CanvasAreaProps {
  objects: VectorObject[];
  selectedId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updated: VectorObject) => void;
  onAddObject: (newObj: VectorObject) => void;
  activeTool: ToolType;
  selectedNodeRef: SelectedNodeRef | null;
  onSelectNode: (nodeRef: SelectedNodeRef | null) => void;
  pageConfig: PageConfig;
  viewport: ViewportState;
  onViewportChange: (vp: ViewportState) => void;
  guidelines: Guideline[];
  onAddGuideline: (gl: Guideline) => void;
  onDeleteGuideline: (id: string) => void;
  showRulers: boolean;
  showGuidelines: boolean;
  snapToGuidelines: boolean;
  onCursorMove: (pt: Point) => void;
  freehandSmoothing: number;
  currentFill: string;
  currentOutline: string;
  isDark: boolean;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  objects,
  selectedId,
  onSelectObject,
  onUpdateObject,
  onAddObject,
  activeTool,
  selectedNodeRef,
  onSelectNode,
  pageConfig,
  viewport,
  onViewportChange,
  guidelines,
  onAddGuideline,
  onDeleteGuideline,
  showRulers,
  showGuidelines,
  snapToGuidelines,
  onCursorMove,
  freehandSmoothing,
  currentFill,
  currentOutline,
  isDark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Transform mode for Pick tool: 'resize' vs 'rotate' (second click toggles rotate/skew in CorelDRAW)
  const [transformMode, setTransformMode] = useState<'resize' | 'rotate'>('resize');

  // Object drag state
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize' | 'rotate' | 'node' | 'handleIn' | 'handleOut' | 'segment' | 'draw' | 'ruler';
    handle?: string;
    startMouse: Point;
    startObj?: VectorObject;
    subpathIndex?: number;
    nodeIndex?: number;
    rulerOrientation?: 'horizontal' | 'vertical';
  } | null>(null);

  // Freehand drawing points
  const [freehandPoints, setFreehandPoints] = useState<Point[]>([]);

  // Pen tool active curve being drawn
  const [penNodes, setPenNodes] = useState<CurveNode[]>([]);
  const [penCurrentPos, setPenCurrentPos] = useState<Point | null>(null);

  // Marquee node selection box
  const [marqueeBox, setMarqueeBox] = useState<{ start: Point; current: Point } | null>(null);

  // Selected object
  const selectedObject = objects.find((o) => o.id === selectedId) || null;

  // Convert screen coordinates to canvas space
  const screenToCanvas = (clientX: number, clientY: number): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - viewport.panX) / viewport.zoom;
    const y = (clientY - rect.top - viewport.panY) / viewport.zoom;
    return { x, y };
  };

  // Convert canvas space to screen coordinates
  const canvasToScreen = (canvasX: number, canvasY: number): Point => {
    const x = canvasX * viewport.zoom + viewport.panX;
    const y = canvasY * viewport.zoom + viewport.panY;
    return { x, y };
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.15), 8);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered at mouse pointer
    const newPanX = mouseX - (mouseX - viewport.panX) * (newZoom / viewport.zoom);
    const newPanY = mouseY - (mouseY - viewport.panY) * (newZoom / viewport.zoom);

    onViewportChange({ panX: newPanX, panY: newPanY, zoom: newZoom });
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    onCursorMove(canvasPt);

    if (activeTool === 'pen') {
      setPenCurrentPos(canvasPt);
    }

    // Panning
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      onViewportChange({
        ...viewport,
        panX: viewport.panX + dx,
        panY: viewport.panY + dy,
      });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Freehand drawing
    if (dragState?.type === 'draw' && activeTool === 'freehand') {
      setFreehandPoints((prev) => [...prev, canvasPt]);
      return;
    }

    // Node or Handle dragging (Shape tool)
    if (
      dragState &&
      (dragState.type === 'node' ||
        dragState.type === 'handleIn' ||
        dragState.type === 'handleOut') &&
      selectedObject &&
      selectedObject.type === 'curve' &&
      dragState.subpathIndex !== undefined &&
      dragState.nodeIndex !== undefined
    ) {
      const curve = selectedObject as CurveObject;
      const sub = curve.subpaths[dragState.subpathIndex];
      const targetNode = sub.nodes[dragState.nodeIndex];

      const movedType =
        dragState.type === 'node'
          ? 'anchor'
          : dragState.type === 'handleIn'
          ? 'handleIn'
          : 'handleOut';

      const updatedNode = updateNodeHandles(targetNode, movedType, canvasPt);

      const newSubpaths = [...curve.subpaths];
      const newNodes = [...sub.nodes];
      newNodes[dragState.nodeIndex] = updatedNode;
      newSubpaths[dragState.subpathIndex] = { ...sub, nodes: newNodes };

      onUpdateObject({ ...curve, subpaths: newSubpaths });
      return;
    }

    // Moving selected object
    if (dragState?.type === 'move' && dragState.startObj) {
      const dx = canvasPt.x - dragState.startMouse.x;
      const dy = canvasPt.y - dragState.startMouse.y;
      const orig = dragState.startObj;

      if (orig.type === 'rectangle') {
        onUpdateObject({ ...orig, x: orig.x + dx, y: orig.y + dy });
      } else if (orig.type === 'ellipse') {
        onUpdateObject({ ...orig, cx: orig.cx + dx, cy: orig.cy + dy });
      } else if (orig.type === 'polygon') {
        onUpdateObject({ ...orig, cx: orig.cx + dx, cy: orig.cy + dy });
      } else if (orig.type === 'curve') {
        const newSubpaths = orig.subpaths.map((s) => ({
          ...s,
          nodes: s.nodes.map((n) => ({
            ...n,
            x: n.x + dx,
            y: n.y + dy,
            handleIn: n.handleIn ? { x: n.handleIn.x + dx, y: n.handleIn.y + dy } : undefined,
            handleOut: n.handleOut ? { x: n.handleOut.x + dx, y: n.handleOut.y + dy } : undefined,
          })),
        }));
        onUpdateObject({ ...orig, subpaths: newSubpaths });
      }
      return;
    }

    // Resizing object
    if (dragState?.type === 'resize' && dragState.startObj && dragState.handle) {
      const dx = canvasPt.x - dragState.startMouse.x;
      const dy = canvasPt.y - dragState.startMouse.y;
      const orig = dragState.startObj;
      const handle = dragState.handle;

      if (orig.type === 'rectangle') {
        let newX = orig.x;
        let newY = orig.y;
        let newW = orig.width;
        let newH = orig.height;

        if (handle.includes('e')) newW = Math.max(10, orig.width + dx);
        if (handle.includes('s')) newH = Math.max(10, orig.height + dy);
        if (handle.includes('w')) {
          const w = Math.max(10, orig.width - dx);
          newX = orig.x + (orig.width - w);
          newW = w;
        }
        if (handle.includes('n')) {
          const h = Math.max(10, orig.height - dy);
          newY = orig.y + (orig.height - h);
          newH = h;
        }

        onUpdateObject({ ...orig, x: newX, y: newY, width: newW, height: newH });
      } else if (orig.type === 'ellipse') {
        const rx = Math.max(5, orig.rx + (handle.includes('e') ? dx / 2 : 0));
        const ry = Math.max(5, orig.ry + (handle.includes('s') ? dy / 2 : 0));
        onUpdateObject({ ...orig, rx, ry });
      }
      return;
    }

    // Rotating object
    if (dragState?.type === 'rotate' && dragState.startObj) {
      const bbox = getObjectBoundingBox(dragState.startObj);
      const center = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
      const angle = Math.atan2(canvasPt.y - center.y, canvasPt.x - center.x) * (180 / Math.PI);
      const startAngle =
        Math.atan2(
          dragState.startMouse.y - center.y,
          dragState.startMouse.x - center.x
        ) *
        (180 / Math.PI);
      const deltaAngle = angle - startAngle;

      onUpdateObject({
        ...dragState.startObj,
        transform: {
          ...dragState.startObj.transform,
          rotation: (dragState.startObj.transform.rotation + deltaAngle) % 360,
        },
      });
      return;
    }

    // Ruler Guideline dragging
    if (dragState?.type === 'ruler') {
      // Just tracking
    }
  };

  // Mouse Down on background
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Pan tool activates viewport panning
    if (e.button === 1 || activeTool === 'pan' || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button !== 0) return; // Only primary button for canvas actions

    const canvasPt = screenToCanvas(e.clientX, e.clientY);

    // Freehand Tool start
    if (activeTool === 'freehand') {
      setFreehandPoints([canvasPt]);
      setDragState({ type: 'draw', startMouse: canvasPt });
      return;
    }

    // Pen Tool click
    if (activeTool === 'pen') {
      // Check if closing curve on first node
      if (penNodes.length > 2 && distance(canvasPt, penNodes[0]) < 14) {
        // Close curve!
        const closedCurve: CurveObject = {
          id: generateId('curve'),
          name: `Curve ${objects.length + 1}`,
          type: 'curve',
          fill: currentFill,
          stroke: currentOutline,
          strokeWidth: 1.5,
          opacity: 1,
          visible: true,
          locked: false,
          transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          subpaths: [{ id: generateId('sub'), nodes: penNodes, closed: true }],
        };
        onAddObject(closedCurve);
        onSelectObject(closedCurve.id);
        setPenNodes([]);
        setPenCurrentPos(null);
        return;
      }

      // Add node to pen path
      const newNode: CurveNode = {
        id: generateId('n'),
        x: canvasPt.x,
        y: canvasPt.y,
        type: 'smooth',
        segmentType: 'curve',
      };
      setPenNodes([...penNodes, newNode]);
      return;
    }

    // Rectangle creation
    if (activeTool === 'rectangle') {
      const newRect: VectorObject = {
        id: generateId('rect'),
        name: `Rectangle ${objects.length + 1}`,
        type: 'rectangle',
        x: canvasPt.x,
        y: canvasPt.y,
        width: 140,
        height: 90,
        cornerRadii: [0, 0, 0, 0],
        roundCornersTogether: true,
        fill: currentFill,
        stroke: currentOutline,
        strokeWidth: 1.5,
        opacity: 1,
        visible: true,
        locked: false,
        transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      };
      onAddObject(newRect);
      onSelectObject(newRect.id);
      return;
    }

    // Ellipse creation
    if (activeTool === 'ellipse') {
      const newEllipse: VectorObject = {
        id: generateId('ellipse'),
        name: `Ellipse ${objects.length + 1}`,
        type: 'ellipse',
        cx: canvasPt.x,
        cy: canvasPt.y,
        rx: 60,
        ry: 45,
        kind: 'ellipse',
        startAngle: 0,
        endAngle: 360,
        fill: currentFill,
        stroke: currentOutline,
        strokeWidth: 1.5,
        opacity: 1,
        visible: true,
        locked: false,
        transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      };
      onAddObject(newEllipse);
      onSelectObject(newEllipse.id);
      return;
    }

    // Polygon / Star creation
    if (activeTool === 'polygon') {
      const newPoly: VectorObject = {
        id: generateId('star'),
        name: `Star ${objects.length + 1}`,
        type: 'polygon',
        cx: canvasPt.x,
        cy: canvasPt.y,
        radius: 50,
        sides: 5,
        isStar: true,
        sharpness: 0.5,
        fill: currentFill,
        stroke: currentOutline,
        strokeWidth: 1.5,
        opacity: 1,
        visible: true,
        locked: false,
        transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      };
      onAddObject(newPoly);
      onSelectObject(newPoly.id);
      return;
    }

    // Deselect if clicking on empty canvas
    if (activeTool === 'pick') {
      onSelectObject(null);
      setTransformMode('resize');
    } else if (activeTool === 'shape') {
      onSelectNode(null);
    }
  };

  // Mouse Up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Finish Freehand drawing
    if (dragState?.type === 'draw' && activeTool === 'freehand') {
      if (freehandPoints.length > 2) {
        const sub = smoothFreehandPoints(freehandPoints, freehandSmoothing * 0.8);
        const newCurve: CurveObject = {
          id: generateId('curve'),
          name: `Freehand Curve ${objects.length + 1}`,
          type: 'curve',
          fill: 'none',
          stroke: currentOutline === 'none' ? '#000000' : currentOutline,
          strokeWidth: 2,
          opacity: 1,
          visible: true,
          locked: false,
          transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          subpaths: [sub],
        };
        onAddObject(newCurve);
        onSelectObject(newCurve.id);
      }
      setFreehandPoints([]);
    }

    // Drop new guideline from ruler
    if (dragState?.type === 'ruler') {
      const canvasPt = screenToCanvas(e.clientX, e.clientY);
      if (dragState.rulerOrientation === 'horizontal') {
        onAddGuideline({
          id: generateId('gl'),
          orientation: 'horizontal',
          position: Math.round(canvasPt.y),
        });
      } else if (dragState.rulerOrientation === 'vertical') {
        onAddGuideline({
          id: generateId('gl'),
          orientation: 'vertical',
          position: Math.round(canvasPt.x),
        });
      }
    }

    setDragState(null);
  };

  // Double Click on Pen tool finishes open curve
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (activeTool === 'pen' && penNodes.length > 1) {
      const openCurve: CurveObject = {
        id: generateId('curve'),
        name: `Pen Curve ${objects.length + 1}`,
        type: 'curve',
        fill: 'none',
        stroke: currentOutline,
        strokeWidth: 1.5,
        opacity: 1,
        visible: true,
        locked: false,
        transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        subpaths: [{ id: generateId('sub'), nodes: penNodes, closed: false }],
      };
      onAddObject(openCurve);
      onSelectObject(openCurve.id);
      setPenNodes([]);
      setPenCurrentPos(null);
    }
  };

  // Dragging from top ruler
  const handleTopRulerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragState({
      type: 'ruler',
      rulerOrientation: 'horizontal',
      startMouse: { x: e.clientX, y: e.clientY },
    });
  };

  // Dragging from left ruler
  const handleLeftRulerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragState({
      type: 'ruler',
      rulerOrientation: 'vertical',
      startMouse: { x: e.clientX, y: e.clientY },
    });
  };

  // Double click on curve segment in Shape mode inserts a node!
  const handleSegmentDoubleClick = (
    e: React.MouseEvent,
    curve: CurveObject,
    subpathIndex: number,
    nodeIndex: number
  ) => {
    e.stopPropagation();
    const updatedSub = insertNodeOnSegment(curve.subpaths[subpathIndex], nodeIndex);
    const newSubpaths = [...curve.subpaths];
    newSubpaths[subpathIndex] = updatedSub;
    onUpdateObject({ ...curve, subpaths: newSubpaths });
    onSelectNode({
      objectId: curve.id,
      subpathIndex,
      nodeIndex: nodeIndex + 1,
      handleType: 'node',
    });
  };

  // Double click on node deletes it (CorelDRAW shortcut)
  const handleNodeDoubleClick = (
    e: React.MouseEvent,
    curve: CurveObject,
    subpathIndex: number,
    nodeIndex: number
  ) => {
    e.stopPropagation();
    const sub = curve.subpaths[subpathIndex];
    if (sub.nodes.length <= 2) return;
    const newNodes = sub.nodes.filter((_, idx) => idx !== nodeIndex);
    const newSubpaths = [...curve.subpaths];
    newSubpaths[subpathIndex] = { ...sub, nodes: newNodes };
    onUpdateObject({ ...curve, subpaths: newSubpaths });
    onSelectNode(null);
  };

  const selectedBBox = selectedObject ? getObjectBoundingBox(selectedObject) : null;

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 h-full overflow-hidden select-none outline-hidden ${
        isDark ? 'bg-neutral-950' : 'bg-neutral-200'
      }`}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{
        cursor:
          activeTool === 'pan' || isPanning
            ? 'grab'
            : activeTool === 'shape'
            ? 'crosshair'
            : activeTool === 'pen'
            ? 'crosshair'
            : activeTool === 'freehand'
            ? 'crosshair'
            : 'default',
      }}
    >
      {/* ================= TOP RULER ================= */}
      {showRulers && (
        <div
          onMouseDown={handleTopRulerMouseDown}
          className={`absolute top-0 left-6 right-0 h-6 border-b z-20 flex items-center font-mono text-[9px] cursor-ns-resize overflow-hidden ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'
          }`}
          title="Drag down to create Horizontal Guideline"
        >
          {Array.from({ length: 40 }).map((_, i) => {
            const val = (i - 10) * 100;
            const screenX = val * viewport.zoom + viewport.panX;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 flex flex-col justify-end"
                style={{ left: `${screenX}px` }}
              >
                <div className="h-2 w-[1px] bg-neutral-400 dark:bg-neutral-600" />
                <span className="leading-none pl-1 pb-0.5">{val}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= LEFT RULER ================= */}
      {showRulers && (
        <div
          onMouseDown={handleLeftRulerMouseDown}
          className={`absolute top-6 bottom-0 left-0 w-6 border-r z-20 flex flex-col items-center font-mono text-[9px] cursor-ew-resize overflow-hidden ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'
          }`}
          title="Drag right to create Vertical Guideline"
        >
          {Array.from({ length: 40 }).map((_, i) => {
            const val = (i - 10) * 100;
            const screenY = val * viewport.zoom + viewport.panY;
            return (
              <div
                key={i}
                className="absolute left-0 right-0 flex items-center justify-end"
                style={{ top: `${screenY}px` }}
              >
                <span className="leading-none pr-1 -rotate-90 origin-right text-[8px]">{val}</span>
                <div className="w-2 h-[1px] bg-neutral-400 dark:bg-neutral-600" />
              </div>
            );
          })}
        </div>
      )}

      {/* Top-Left Ruler Origin intersection */}
      {showRulers && (
        <div className={`absolute top-0 left-0 w-6 h-6 border-b border-r z-30 flex items-center justify-center font-mono text-[8px] font-bold ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'
        }`}>
          0,0
        </div>
      )}

      {/* ================= CANVAS VIEWPORT (SVG) ================= */}
      <svg
        className="w-full h-full pointer-events-auto"
        style={{
          transformOrigin: '0 0',
        }}
      >
        <g
          transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}
        >
          {/* Paper Sheet Shadow */}
          <rect
            x={0}
            y={0}
            width={pageConfig.width}
            height={pageConfig.height}
            fill={isDark ? '#171717' : '#FFFFFF'}
            filter="drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18))"
            stroke={isDark ? '#404040' : '#D4D4D4'}
            strokeWidth={1 / viewport.zoom}
          />

          {/* Corel Grid (subtle dot grid inside page) */}
          <defs>
            <pattern
              id="corel-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="10"
                cy="10"
                r="0.5"
                fill={isDark ? '#333333' : '#E5E5E5'}
              />
            </pattern>
          </defs>
          <rect
            x={0}
            y={0}
            width={pageConfig.width}
            height={pageConfig.height}
            fill="url(#corel-grid)"
            pointerEvents="none"
          />

          {/* ================= RENDER OBJECTS ================= */}
          {objects.map((obj) => {
            if (!obj.visible) return null;
            const isSelected = obj.id === selectedId;

            return (
              <g
                key={obj.id}
                transform={`rotate(${obj.transform.rotation || 0} ${
                  selectedBBox ? selectedBBox.x + selectedBBox.width / 2 : 0
                } ${selectedBBox ? selectedBBox.y + selectedBBox.height / 2 : 0}) scale(${
                  obj.transform.scaleX || 1
                } ${obj.transform.scaleY || 1})`}
                opacity={obj.opacity}
                onMouseDown={(e) => {
                  if (activeTool === 'pick') {
                    e.stopPropagation();
                    if (isSelected) {
                      // Second click in CorelDRAW toggles between resize and rotation handles!
                      setTransformMode((prev) => (prev === 'resize' ? 'rotate' : 'resize'));
                    } else {
                      onSelectObject(obj.id);
                      setTransformMode('resize');
                    }
                    const canvasPt = screenToCanvas(e.clientX, e.clientY);
                    setDragState({
                      type: 'move',
                      startMouse: canvasPt,
                      startObj: JSON.parse(JSON.stringify(obj)),
                    });
                  } else if (activeTool === 'shape') {
                    e.stopPropagation();
                    onSelectObject(obj.id);
                  }
                }}
                className={activeTool === 'pick' ? 'cursor-move' : ''}
              >
                {/* Curve Object */}
                {obj.type === 'curve' && (
                  <path
                    d={subpathsToSvgPath(obj.subpaths)}
                    fill={obj.fill}
                    stroke={obj.stroke}
                    strokeWidth={obj.strokeWidth}
                    fillRule={obj.fillRule || 'nonzero'}
                    strokeDasharray={
                      obj.strokeDash === 'dashed'
                        ? '6,4'
                        : obj.strokeDash === 'dotted'
                        ? '2,3'
                        : undefined
                    }
                  />
                )}

                {/* Rectangle */}
                {obj.type === 'rectangle' && (
                  <rect
                    x={obj.x}
                    y={obj.y}
                    width={obj.width}
                    height={obj.height}
                    rx={obj.cornerRadii[0]}
                    fill={obj.fill}
                    stroke={obj.stroke}
                    strokeWidth={obj.strokeWidth}
                  />
                )}

                {/* Ellipse */}
                {obj.type === 'ellipse' && (
                  <ellipse
                    cx={obj.cx}
                    cy={obj.cy}
                    rx={obj.rx}
                    ry={obj.ry}
                    fill={obj.fill}
                    stroke={obj.stroke}
                    strokeWidth={obj.strokeWidth}
                  />
                )}

                {/* Star / Polygon */}
                {obj.type === 'polygon' && (() => {
                  const totalPoints = obj.isStar ? obj.sides * 2 : obj.sides;
                  const angleStep = (Math.PI * 2) / totalPoints;
                  const pts: string[] = [];
                  for (let i = 0; i < totalPoints; i++) {
                    const angle = i * angleStep - Math.PI / 2;
                    const r = obj.isStar && i % 2 === 1 ? obj.radius * (1 - obj.sharpness) : obj.radius;
                    pts.push(`${obj.cx + r * Math.cos(angle)},${obj.cy + r * Math.sin(angle)}`);
                  }
                  return (
                    <polygon
                      points={pts.join(' ')}
                      fill={obj.fill}
                      stroke={obj.stroke}
                      strokeWidth={obj.strokeWidth}
                    />
                  );
                })()}

                {/* Text */}
                {obj.type === 'text' && (
                  <text
                    x={obj.x}
                    y={obj.y}
                    fontFamily={obj.fontFamily}
                    fontSize={obj.fontSize}
                    fontWeight={obj.fontWeight}
                    fontStyle={obj.fontStyle}
                    fill={obj.fill}
                    stroke={obj.stroke}
                    strokeWidth={obj.strokeWidth}
                  >
                    {obj.text}
                  </text>
                )}
              </g>
            );
          })}

          {/* ================= LIVE FREEHAND PREVIEW ================= */}
          {freehandPoints.length > 1 && (
            <polyline
              points={freehandPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* ================= LIVE PEN TOOL PREVIEW ================= */}
          {penNodes.length > 0 && (
            <g>
              <polyline
                points={penNodes.map((n) => `${n.x},${n.y}`).join(' ')}
                fill="none"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              {penCurrentPos && (
                <line
                  x1={penNodes[penNodes.length - 1].x}
                  y1={penNodes[penNodes.length - 1].y}
                  x2={penCurrentPos.x}
                  y2={penCurrentPos.y}
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />
              )}
              {penNodes.map((n, idx) => (
                <rect
                  key={idx}
                  x={n.x - 3}
                  y={n.y - 3}
                  width="6"
                  height="6"
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          )}

          {/* ================= PICK TOOL SELECTION BOUNDING BOX & HANDLES ================= */}
          {activeTool === 'pick' && selectedBBox && selectedObject && (
            <g pointerEvents="all">
              {/* Marquee box */}
              <rect
                x={selectedBBox.x - 2}
                y={selectedBBox.y - 2}
                width={selectedBBox.width + 4}
                height={selectedBBox.height + 4}
                fill="none"
                stroke="#0284C7"
                strokeWidth={1 / viewport.zoom}
                strokeDasharray="3,3"
              />

              {/* Center 'X' pivot marker (CorelDRAW signature) */}
              <g
                transform={`translate(${selectedBBox.x + selectedBBox.width / 2}, ${
                  selectedBBox.y + selectedBBox.height / 2
                })`}
              >
                <circle r={4 / viewport.zoom} fill="none" stroke="#0284C7" strokeWidth={1 / viewport.zoom} />
                <line
                  x1={-3 / viewport.zoom}
                  y1={0}
                  x2={3 / viewport.zoom}
                  y2={0}
                  stroke="#0284C7"
                  strokeWidth={1 / viewport.zoom}
                />
                <line
                  x1={0}
                  y1={-3 / viewport.zoom}
                  x2={0}
                  y2={3 / viewport.zoom}
                  stroke="#0284C7"
                  strokeWidth={1 / viewport.zoom}
                />
              </g>

              {/* Resize mode: 8 square handles */}
              {transformMode === 'resize' && (
                <>
                  {[
                    { id: 'nw', x: selectedBBox.x, y: selectedBBox.y, cursor: 'nwse-resize' },
                    { id: 'n', x: selectedBBox.x + selectedBBox.width / 2, y: selectedBBox.y, cursor: 'ns-resize' },
                    { id: 'ne', x: selectedBBox.x + selectedBBox.width, y: selectedBBox.y, cursor: 'nesw-resize' },
                    { id: 'e', x: selectedBBox.x + selectedBBox.width, y: selectedBBox.y + selectedBBox.height / 2, cursor: 'ew-resize' },
                    { id: 'se', x: selectedBBox.x + selectedBBox.width, y: selectedBBox.y + selectedBBox.height, cursor: 'nwse-resize' },
                    { id: 's', x: selectedBBox.x + selectedBBox.width / 2, y: selectedBBox.y + selectedBBox.height, cursor: 'ns-resize' },
                    { id: 'sw', x: selectedBBox.x, y: selectedBBox.y + selectedBBox.height, cursor: 'nesw-resize' },
                    { id: 'w', x: selectedBBox.x, y: selectedBBox.y + selectedBBox.height / 2, cursor: 'ew-resize' },
                  ].map((h) => {
                    const size = 7 / viewport.zoom;
                    return (
                      <rect
                        key={h.id}
                        x={h.x - size / 2}
                        y={h.y - size / 2}
                        width={size}
                        height={size}
                        fill="#000000"
                        stroke="#FFFFFF"
                        strokeWidth={1 / viewport.zoom}
                        style={{ cursor: h.cursor }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const canvasPt = screenToCanvas(e.clientX, e.clientY);
                          setDragState({
                            type: 'resize',
                            handle: h.id,
                            startMouse: canvasPt,
                            startObj: JSON.parse(JSON.stringify(selectedObject)),
                          });
                        }}
                      />
                    );
                  })}
                </>
              )}

              {/* Rotate mode: 4 corner circular rotation knobs + 4 edge skew arrows */}
              {transformMode === 'rotate' && (
                <>
                  {[
                    { id: 'nw', x: selectedBBox.x, y: selectedBBox.y },
                    { id: 'ne', x: selectedBBox.x + selectedBBox.width, y: selectedBBox.y },
                    { id: 'se', x: selectedBBox.x + selectedBBox.width, y: selectedBBox.y + selectedBBox.height },
                    { id: 'sw', x: selectedBBox.x, y: selectedBBox.y + selectedBBox.height },
                  ].map((h) => {
                    const r = 5 / viewport.zoom;
                    return (
                      <circle
                        key={h.id}
                        cx={h.x}
                        cy={h.y}
                        r={r}
                        fill="#3B82F6"
                        stroke="#FFFFFF"
                        strokeWidth={1.5 / viewport.zoom}
                        style={{ cursor: 'alias' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const canvasPt = screenToCanvas(e.clientX, e.clientY);
                          setDragState({
                            type: 'rotate',
                            startMouse: canvasPt,
                            startObj: JSON.parse(JSON.stringify(selectedObject)),
                          });
                        }}
                      >
                        <title>Drag to Rotate (CorelDRAW)</title>
                      </circle>
                    );
                  })}
                </>
              )}
            </g>
          )}

          {/* ================= SHAPE TOOL (F10) NODE EDITING OVERLAY ================= */}
          {/* This renders all curve anchor nodes, tangent handles, and supports curve bending! */}
          {activeTool === 'shape' && selectedObject && selectedObject.type === 'curve' && (
            <g pointerEvents="all">
              {selectedObject.subpaths.map((subpath, subIdx) => {
                const nodes = subpath.nodes;
                return (
                  <g key={subpath.id || subIdx}>
                    {/* Curve Segments: Double click to insert node! */}
                    {nodes.map((node, nodeIdx) => {
                      const nextNode =
                        nodeIdx < nodes.length - 1
                          ? nodes[nodeIdx + 1]
                          : subpath.closed
                          ? nodes[0]
                          : null;
                      if (!nextNode) return null;

                      let segD = `M ${node.x} ${node.y} `;
                      if (node.segmentType === 'line' || (!node.handleOut && !nextNode.handleIn)) {
                        segD += `L ${nextNode.x} ${nextNode.y}`;
                      } else {
                        const cp1 = node.handleOut || { x: node.x, y: node.y };
                        const cp2 = nextNode.handleIn || { x: nextNode.x, y: nextNode.y };
                        segD += `C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${nextNode.x} ${nextNode.y}`;
                      }

                      return (
                        <path
                          key={`seg-${nodeIdx}`}
                          d={segD}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={10 / viewport.zoom}
                          className="hover:stroke-emerald-400/40 cursor-pointer"
                          onDoubleClick={(e) =>
                            handleSegmentDoubleClick(e, selectedObject, subIdx, nodeIdx)
                          }
                        >
                          <title>Double-click to insert a new node</title>
                        </path>
                      );
                    })}

                    {/* Nodes & Control Handles */}
                    {nodes.map((node, nodeIdx) => {
                      const isNodeSelected =
                        selectedNodeRef?.objectId === selectedObject.id &&
                        selectedNodeRef.subpathIndex === subIdx &&
                        selectedNodeRef.nodeIndex === nodeIdx;

                      const nodeSize = (isNodeSelected ? 8 : 6) / viewport.zoom;

                      return (
                        <g key={node.id || nodeIdx}>
                          {/* If node is selected, render its incoming and outgoing control handles! */}
                          {isNodeSelected && (
                            <>
                              {/* handleIn */}
                              {node.handleIn && (
                                <g>
                                  <line
                                    x1={node.x}
                                    y1={node.y}
                                    x2={node.handleIn.x}
                                    y2={node.handleIn.y}
                                    stroke="#3B82F6"
                                    strokeWidth={1 / viewport.zoom}
                                  />
                                  <circle
                                    cx={node.handleIn.x}
                                    cy={node.handleIn.y}
                                    r={4 / viewport.zoom}
                                    fill="#3B82F6"
                                    stroke="#FFFFFF"
                                    strokeWidth={1 / viewport.zoom}
                                    className="cursor-crosshair hover:scale-125"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      const canvasPt = screenToCanvas(e.clientX, e.clientY);
                                      setDragState({
                                        type: 'handleIn',
                                        startMouse: canvasPt,
                                        subpathIndex: subIdx,
                                        nodeIndex: nodeIdx,
                                      });
                                    }}
                                  />
                                </g>
                              )}

                              {/* handleOut */}
                              {node.handleOut && (
                                <g>
                                  <line
                                    x1={node.x}
                                    y1={node.y}
                                    x2={node.handleOut.x}
                                    y2={node.handleOut.y}
                                    stroke="#3B82F6"
                                    strokeWidth={1 / viewport.zoom}
                                  />
                                  <circle
                                    cx={node.handleOut.x}
                                    cy={node.handleOut.y}
                                    r={4 / viewport.zoom}
                                    fill="#3B82F6"
                                    stroke="#FFFFFF"
                                    strokeWidth={1 / viewport.zoom}
                                    className="cursor-crosshair hover:scale-125"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      const canvasPt = screenToCanvas(e.clientX, e.clientY);
                                      setDragState({
                                        type: 'handleOut',
                                        startMouse: canvasPt,
                                        subpathIndex: subIdx,
                                        nodeIndex: nodeIdx,
                                      });
                                    }}
                                  />
                                </g>
                              )}
                            </>
                          )}

                          {/* Node Anchor Point (Square in CorelDRAW) */}
                          <rect
                            x={node.x - nodeSize / 2}
                            y={node.y - nodeSize / 2}
                            width={nodeSize}
                            height={nodeSize}
                            fill={isNodeSelected ? '#0284C7' : '#FFFFFF'}
                            stroke={isNodeSelected ? '#FFFFFF' : '#0369A1'}
                            strokeWidth={1.2 / viewport.zoom}
                            className="cursor-pointer transition-transform hover:scale-125"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              onSelectNode({
                                objectId: selectedObject.id,
                                subpathIndex: subIdx,
                                nodeIndex: nodeIdx,
                                handleType: 'node',
                              });
                              const canvasPt = screenToCanvas(e.clientX, e.clientY);
                              setDragState({
                                type: 'node',
                                startMouse: canvasPt,
                                subpathIndex: subIdx,
                                nodeIndex: nodeIdx,
                              });
                            }}
                            onDoubleClick={(e) =>
                              handleNodeDoubleClick(e, selectedObject, subIdx, nodeIdx)
                            }
                          >
                            <title>{`Node ${nodeIdx + 1} (${node.type})\n• Drag to move node\n• Double-click to delete node`}</title>
                          </rect>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          )}

          {/* ================= GUIDELINES ================= */}
          {showGuidelines &&
            guidelines.map((gl) => {
              if (gl.orientation === 'horizontal') {
                return (
                  <g key={gl.id}>
                    <line
                      x1={-5000}
                      y1={gl.position}
                      x2={5000}
                      y2={gl.position}
                      stroke="#00AEEF"
                      strokeWidth={1 / viewport.zoom}
                      strokeDasharray="4,4"
                      className="cursor-ns-resize"
                      onDoubleClick={() => onDeleteGuideline(gl.id)}
                    />
                  </g>
                );
              } else {
                return (
                  <g key={gl.id}>
                    <line
                      x1={gl.position}
                      y1={-5000}
                      x2={gl.position}
                      y2={5000}
                      stroke="#00AEEF"
                      strokeWidth={1 / viewport.zoom}
                      strokeDasharray="4,4"
                      className="cursor-ew-resize"
                      onDoubleClick={() => onDeleteGuideline(gl.id)}
                    />
                  </g>
                );
              }
            })}
        </g>
      </svg>
    </div>
  );
};

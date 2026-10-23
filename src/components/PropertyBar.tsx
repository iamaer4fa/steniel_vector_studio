import React from 'react';
import {
  Lock,
  Unlock,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Plus,
  Minus,
  Spline,
  GitMerge,
  Split,
  Maximize2,
  CircleDot,
  Minimize2,
  Share2,
  Sparkles,
  Layers,
  ArrowRightLeft,
  ChevronDown,
  LayoutTemplate,
  ChevronsRight,
  MoveHorizontal,
  MoveVertical,
} from 'lucide-react';
import {
  CurveNode,
  CurveObject,
  PageConfig,
  SelectedNodeRef,
  ToolType,
  VectorObject,
} from '../types/corel';

interface PropertyBarProps {
  activeTool: ToolType;
  selectedObject: VectorObject | null;
  selectedNodeRef: SelectedNodeRef | null;
  pageConfig: PageConfig;
  onPageConfigChange: (config: PageConfig) => void;
  onObjectChange: (updated: VectorObject) => void;
  onConvertToCurves: () => void;
  // Node editing actions (Shape Tool F10)
  onAddNode: () => void;
  onDeleteNode: () => void;
  onJoinNodes: () => void;
  onBreakCurve: () => void;
  onConvertSegmentToLine: () => void;
  onConvertSegmentToCurve: () => void;
  onMakeNodeCusp: () => void;
  onMakeNodeSmooth: () => void;
  onMakeNodeSymmetrical: () => void;
  onReverseCurve: () => void;
  onAutoCloseCurve: () => void;
  onAlignNodes: (direction: 'horizontal' | 'vertical') => void;
  elasticMode: boolean;
  onToggleElasticMode: () => void;
  // Common styling actions
  onOpenFillModal: () => void;
  onOpenOutlineModal: () => void;
  freehandSmoothing: number;
  onFreehandSmoothingChange: (val: number) => void;
  isDark: boolean;
}

export const PropertyBar: React.FC<PropertyBarProps> = ({
  activeTool,
  selectedObject,
  selectedNodeRef,
  pageConfig,
  onPageConfigChange,
  onObjectChange,
  onConvertToCurves,
  onAddNode,
  onDeleteNode,
  onJoinNodes,
  onBreakCurve,
  onConvertSegmentToLine,
  onConvertSegmentToCurve,
  onMakeNodeCusp,
  onMakeNodeSmooth,
  onMakeNodeSymmetrical,
  onReverseCurve,
  onAutoCloseCurve,
  onAlignNodes,
  elasticMode,
  onToggleElasticMode,
  onOpenFillModal,
  onOpenOutlineModal,
  freehandSmoothing,
  onFreehandSmoothingChange,
  isDark,
}) => {
  const [aspectLocked, setAspectLocked] = React.useState(true);

  // If Shape Tool is active and a curve is selected: render CorelDRAW's iconic Node Editing Bar!
  if (activeTool === 'shape') {
    const isCurveObj = selectedObject?.type === 'curve';
    const curve = isCurveObj ? (selectedObject as CurveObject) : null;
    let currentNode: CurveNode | null = null;

    if (curve && selectedNodeRef) {
      const sub = curve.subpaths[selectedNodeRef.subpathIndex];
      if (sub && sub.nodes[selectedNodeRef.nodeIndex]) {
        currentNode = sub.nodes[selectedNodeRef.nodeIndex];
      }
    }

    return (
      <div className={`flex items-center h-9 px-3 gap-1.5 border-b select-none text-xs overflow-x-auto ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'
      }`}>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mr-2 shrink-0">
          <Spline className="w-4 h-4" />
          <span>Shape (F10)</span>
        </div>

        {!isCurveObj ? (
          <div className="flex items-center gap-3 text-neutral-500">
            <span>Select a curve, or convert shape to curves (Ctrl+Q)</span>
            {selectedObject && (
              <button
                onClick={onConvertToCurves}
                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Convert to Curves (Ctrl+Q)
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            {/* Add Node (+) & Delete Node (-) */}
            <div className="flex items-center bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded p-0.5 shadow-2xs">
              <button
                onClick={onAddNode}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-emerald-600 dark:text-emerald-400 font-bold"
                title="Add Node (+ / Double-click segment)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDeleteNode}
                disabled={!selectedNodeRef}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-red-600 dark:text-red-400 disabled:opacity-30"
                title="Delete Selected Node (- / Delete key / Double-click node)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />

            {/* Join & Break */}
            <div className="flex items-center bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded p-0.5 shadow-2xs">
              <button
                onClick={onJoinNodes}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                title="Join Two Nodes"
              >
                <GitMerge className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onBreakCurve}
                disabled={!selectedNodeRef}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 disabled:opacity-30"
                title="Break Curve at Selected Node"
              >
                <Split className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />

            {/* Convert to Line vs Convert to Curve */}
            <div className="flex items-center bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded p-0.5 shadow-2xs">
              <button
                onClick={onConvertSegmentToLine}
                disabled={!selectedNodeRef}
                className={`px-1.5 py-1 rounded text-[11px] font-mono hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 ${
                  currentNode?.segmentType === 'line' ? 'bg-neutral-200 dark:bg-neutral-700 font-bold' : ''
                }`}
                title="Convert Segment to Line"
              >
                / Line
              </button>
              <button
                onClick={onConvertSegmentToCurve}
                disabled={!selectedNodeRef}
                className={`px-1.5 py-1 rounded text-[11px] font-mono hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 ${
                  currentNode?.segmentType === 'curve' ? 'bg-neutral-200 dark:bg-neutral-700 font-bold' : ''
                }`}
                title="Convert Segment to Bézier Curve"
              >
                ~ Curve
              </button>
            </div>

            <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />

            {/* Node Types: Cusp, Smooth, Symmetrical */}
            <div className="flex items-center bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded p-0.5 shadow-2xs">
              <button
                onClick={onMakeNodeCusp}
                disabled={!selectedNodeRef}
                className={`px-2 py-1 rounded text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors ${
                  currentNode?.type === 'cusp' ? 'bg-blue-600 text-white font-medium shadow-xs' : ''
                }`}
                title="Make Node Cusp (Independent control handles)"
              >
                Cusp
              </button>
              <button
                onClick={onMakeNodeSmooth}
                disabled={!selectedNodeRef}
                className={`px-2 py-1 rounded text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors ${
                  currentNode?.type === 'smooth' ? 'bg-blue-600 text-white font-medium shadow-xs' : ''
                }`}
                title="Make Node Smooth (Collinear tangent handles)"
              >
                Smooth
              </button>
              <button
                onClick={onMakeNodeSymmetrical}
                disabled={!selectedNodeRef}
                className={`px-2 py-1 rounded text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors ${
                  currentNode?.type === 'symmetrical' ? 'bg-blue-600 text-white font-medium shadow-xs' : ''
                }`}
                title="Make Node Symmetrical (Equal length & collinear handles)"
              >
                Symmetrical
              </button>
            </div>

            <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />

            {/* Reverse & Auto-Close */}
            <button
              onClick={onReverseCurve}
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              title="Reverse Curve Direction"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onAutoCloseCurve}
              className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-[11px] font-medium"
              title="Auto-Close Curve"
            >
              Auto-Close
            </button>

            <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />

            {/* Align Nodes */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onAlignNodes('horizontal')}
                disabled={!selectedNodeRef}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30"
                title="Align Nodes Horizontally"
              >
                <MoveHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onAlignNodes('vertical')}
                disabled={!selectedNodeRef}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30"
                title="Align Nodes Vertically"
              >
                <MoveVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selected Node Status Readout */}
            {currentNode && (
              <div className="ml-3 pl-3 border-l border-neutral-300 dark:border-neutral-700 flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                <span>Node: ({Math.round(currentNode.x)}, {Math.round(currentNode.y)})</span>
                <span>Type: <strong className="text-emerald-600 dark:text-emerald-400 capitalize">{currentNode.type}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Freehand (F5) or Pen tool active
  if (activeTool === 'freehand' || activeTool === 'pen') {
    return (
      <div className={`flex items-center h-9 px-3 gap-3 border-b select-none text-xs ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'
      }`}>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {activeTool === 'freehand' ? 'Freehand (F5)' : 'Bézier / Pen Tool'}
        </span>
        {activeTool === 'freehand' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-500">Smoothing:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={freehandSmoothing}
              onChange={(e) => onFreehandSmoothingChange(Number(e.target.value))}
              className="w-24 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="font-mono text-[11px] w-4">{freehandSmoothing}</span>
          </div>
        )}
        <div className="text-[11px] text-neutral-500 italic">
          {activeTool === 'freehand'
            ? 'Drag mouse on canvas to draw smooth vector curves'
            : 'Click to place corner nodes, drag to place smooth Bézier curves, click start node to close'}
        </div>
      </div>
    );
  }

  // If an object is selected: Render CorelDRAW's Object Transform & Appearance Property Bar!
  if (selectedObject) {
    const handleCoordChange = (field: 'x' | 'y' | 'width' | 'height', val: number) => {
      if (selectedObject.type === 'rectangle') {
        onObjectChange({ ...selectedObject, [field]: val });
      } else if (selectedObject.type === 'ellipse') {
        if (field === 'x') onObjectChange({ ...selectedObject, cx: val });
        if (field === 'y') onObjectChange({ ...selectedObject, cy: val });
        if (field === 'width') onObjectChange({ ...selectedObject, rx: val / 2 });
        if (field === 'height') onObjectChange({ ...selectedObject, ry: val / 2 });
      } else if (selectedObject.type === 'curve') {
        // Delta shift
        if (field === 'x' || field === 'y') {
          const currentX = selectedObject.transform.x;
          const currentY = selectedObject.transform.y;
          onObjectChange({
            ...selectedObject,
            transform: {
              ...selectedObject.transform,
              x: field === 'x' ? val : currentX,
              y: field === 'y' ? val : currentY,
            },
          });
        }
      }
    };

    const handleRotationChange = (deg: number) => {
      onObjectChange({
        ...selectedObject,
        transform: { ...selectedObject.transform, rotation: deg },
      });
    };

    const handleMirrorH = () => {
      onObjectChange({
        ...selectedObject,
        transform: {
          ...selectedObject.transform,
          scaleX: selectedObject.transform.scaleX * -1,
        },
      });
    };

    const handleMirrorV = () => {
      onObjectChange({
        ...selectedObject,
        transform: {
          ...selectedObject.transform,
          scaleY: selectedObject.transform.scaleY * -1,
        },
      });
    };

    const handleStrokeWidth = (w: number) => {
      onObjectChange({
        ...selectedObject,
        strokeWidth: w,
        stroke: selectedObject.stroke === 'none' && w > 0 ? '#000000' : selectedObject.stroke,
      });
    };

    return (
      <div className={`flex items-center h-9 px-3 gap-2 border-b select-none text-xs overflow-x-auto ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'
      }`}>
        {/* Rotation */}
        <div className="flex items-center gap-1">
          <RotateCw className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="number"
            value={Math.round(selectedObject.transform.rotation || 0)}
            onChange={(e) => handleRotationChange(Number(e.target.value))}
            className={`w-14 h-6 px-1 text-center font-mono text-[11px] rounded border ${
              isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300'
            }`}
            title="Angle of Rotation (degrees)"
          />
          <span className="text-neutral-400 text-[10px]">°</span>
        </div>

        {/* Mirror */}
        <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 p-0.5">
          <button
            onClick={handleMirrorH}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Mirror Horizontally"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMirrorV}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Mirror Vertically"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

        {/* Outline Width dropdown (CorelDRAW standard) */}
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500 text-[11px]">Outline:</span>
          <select
            value={selectedObject.strokeWidth}
            onChange={(e) => handleStrokeWidth(Number(e.target.value))}
            className={`h-6 px-2 text-[11px] font-mono rounded border ${
              isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300'
            }`}
            title="Outline Width"
          >
            <option value="0">None</option>
            <option value="0.25">Hairline (0.25 pt)</option>
            <option value="0.5">0.5 pt</option>
            <option value="1">1.0 pt</option>
            <option value="1.5">1.5 pt</option>
            <option value="2">2.0 pt</option>
            <option value="3">3.0 pt</option>
            <option value="4">4.0 pt</option>
            <option value="8">8.0 pt</option>
            <option value="12">12.0 pt</option>
            <option value="16">16.0 pt</option>
            <option value="24">24.0 pt</option>
          </select>
        </div>

        {/* Fill & Stroke Quick Swatches */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFillModal}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-400"
            title="Uniform Fill (Shift+F11)"
          >
            <div
              className="w-3.5 h-3.5 rounded-xs border border-neutral-400"
              style={{
                backgroundColor: selectedObject.fill === 'none' ? 'transparent' : selectedObject.fill,
                backgroundImage: selectedObject.fill === 'none' ? 'linear-gradient(45deg, #f00 50%, transparent 50%)' : 'none',
              }}
            />
            <span className="text-[10px] text-neutral-500 font-mono">Fill</span>
          </button>

          <button
            onClick={onOpenOutlineModal}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-400"
            title="Outline Pen (F12)"
          >
            <div
              className="w-3.5 h-3.5 rounded-xs border-2"
              style={{
                borderColor: selectedObject.stroke === 'none' ? '#ef4444' : selectedObject.stroke,
              }}
            />
            <span className="text-[10px] text-neutral-500 font-mono">Outline</span>
          </button>
        </div>

        <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

        {/* Convert to Curves (Ctrl+Q) */}
        {selectedObject.type !== 'curve' ? (
          <button
            onClick={onConvertToCurves}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors shadow-xs"
            title="Convert to Curves (Ctrl+Q)"
          >
            <Spline className="w-3 h-3" />
            <span>Convert to Curves (Ctrl+Q)</span>
          </button>
        ) : (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Curve Object ({selectedObject.subpaths[0]?.nodes.length || 0} nodes)
          </span>
        )}

        {/* Rectangle specific controls */}
        {selectedObject.type === 'rectangle' && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-300 dark:border-neutral-700">
            <span className="text-[11px] text-neutral-500">Corner Radius:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={selectedObject.cornerRadii[0]}
              onChange={(e) => {
                const val = Number(e.target.value);
                onObjectChange({
                  ...selectedObject,
                  cornerRadii: [val, val, val, val],
                });
              }}
              className={`w-12 h-6 px-1 text-center font-mono text-[11px] rounded border ${
                isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300'
              }`}
            />
          </div>
        )}

        {/* Star / Polygon specific controls */}
        {selectedObject.type === 'polygon' && (
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-300 dark:border-neutral-700">
            <span className="text-[11px] text-neutral-500">Points:</span>
            <input
              type="number"
              min="3"
              max="32"
              value={selectedObject.sides}
              onChange={(e) => {
                onObjectChange({
                  ...selectedObject,
                  sides: Number(e.target.value),
                });
              }}
              className={`w-10 h-6 px-1 text-center font-mono text-[11px] rounded border ${
                isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300'
              }`}
            />
            {selectedObject.isStar && (
              <>
                <span className="text-[11px] text-neutral-500">Sharpness:</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.85"
                  step="0.05"
                  value={selectedObject.sharpness}
                  onChange={(e) => {
                    onObjectChange({
                      ...selectedObject,
                      sharpness: Number(e.target.value),
                    });
                  }}
                  className="w-16 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // DEFAULT DOCUMENT PROPERTY BAR (When nothing is selected)
  return (
    <div className={`flex items-center h-9 px-3 gap-2 border-b select-none text-xs overflow-x-auto ${
      isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'
    }`}>
      {/* Page Size Preset */}
      <div className="flex items-center gap-1.5">
        <LayoutTemplate className="w-3.5 h-3.5 text-neutral-400" />
        <select
          value={pageConfig.preset}
          onChange={(e) => {
            const val = e.target.value;
            let w = 800;
            let h = 600;
            if (val === 'A4') { w = 794; h = 1123; }
            else if (val === 'Letter') { w = 816; h = 1056; }
            else if (val === 'A3') { w = 1123; h = 1587; }
            else if (val === 'Web 1920x1080') { w = 1920; h = 1080; }
            onPageConfigChange({
              ...pageConfig,
              preset: val,
              width: w,
              height: h,
            });
          }}
          className={`h-6 px-2 text-[11px] rounded border font-medium ${
            isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-300 text-neutral-800'
          }`}
        >
          <option value="Custom 800x600">Custom 800 × 600 px</option>
          <option value="Letter">Letter (8.5 × 11 in)</option>
          <option value="A4">A4 (210 × 297 mm)</option>
          <option value="A3">A3 (297 × 420 mm)</option>
          <option value="Web 1920x1080">Full HD (1920 × 1080 px)</option>
        </select>
      </div>

      {/* Page Dimensions */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={pageConfig.width}
          onChange={(e) => onPageConfigChange({ ...pageConfig, width: Number(e.target.value), preset: 'Custom' })}
          className={`w-14 h-6 px-1 text-center font-mono text-[11px] rounded border ${
            isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300'
          }`}
          title="Page Width"
        />
        <span className="text-neutral-400 text-[10px]">×</span>
        <input
          type="number"
          value={pageConfig.height}
          onChange={(e) => onPageConfigChange({ ...pageConfig, height: Number(e.target.value), preset: 'Custom' })}
          className={`w-14 h-6 px-1 text-center font-mono text-[11px] rounded border ${
            isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300'
          }`}
          title="Page Height"
        />
      </div>

      {/* Orientation buttons */}
      <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 p-0.5">
        <button
          onClick={() => {
            if (pageConfig.orientation !== 'portrait') {
              onPageConfigChange({
                ...pageConfig,
                orientation: 'portrait',
                width: Math.min(pageConfig.width, pageConfig.height),
                height: Math.max(pageConfig.width, pageConfig.height),
              });
            }
          }}
          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
            pageConfig.orientation === 'portrait' ? 'bg-emerald-600 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
          title="Portrait"
        >
          Portrait
        </button>
        <button
          onClick={() => {
            if (pageConfig.orientation !== 'landscape') {
              onPageConfigChange({
                ...pageConfig,
                orientation: 'landscape',
                width: Math.max(pageConfig.width, pageConfig.height),
                height: Math.min(pageConfig.width, pageConfig.height),
              });
            }
          }}
          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
            pageConfig.orientation === 'landscape' ? 'bg-emerald-600 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
          title="Landscape"
        >
          Landscape
        </button>
      </div>

      <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Units */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-neutral-500">Units:</span>
        <select
          value={pageConfig.unit}
          onChange={(e) => onPageConfigChange({ ...pageConfig, unit: e.target.value as any })}
          className={`h-6 px-1 text-[11px] rounded border font-mono ${
            isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-300'
          }`}
        >
          <option value="px">Pixels</option>
          <option value="mm">Millimeters</option>
          <option value="in">Inches</option>
          <option value="pt">Points</option>
        </select>
      </div>

      <div className="flex-1" />
      <span className="text-[11px] text-neutral-400 italic">No object selected</span>
    </div>
  );
};

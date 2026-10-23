import React from 'react';
import { Point, SelectedNodeRef, VectorObject } from '../types/corel';
import { getObjectBoundingBox } from '../utils/bezier';

interface StatusBarProps {
  selectedObject: VectorObject | null;
  selectedNodeRef: SelectedNodeRef | null;
  cursorPos: Point;
  unit: string;
  zoom: number;
  onOpenFillModal: () => void;
  onOpenOutlineModal: () => void;
  isDark: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  selectedObject,
  selectedNodeRef,
  cursorPos,
  unit,
  zoom,
  onOpenFillModal,
  onOpenOutlineModal,
  isDark,
}) => {
  let statusText = 'No objects selected';

  if (selectedObject) {
    if (selectedObject.type === 'curve') {
      const nodeCount = selectedObject.subpaths.reduce((acc, s) => acc + s.nodes.length, 0);
      statusText = `Curve on Layer 1 (${nodeCount} nodes, ${selectedObject.subpaths.length} subpath${
        selectedObject.subpaths.length > 1 ? 's' : ''
      })`;
      if (selectedNodeRef) {
        statusText += ` · Selected Node ${selectedNodeRef.nodeIndex + 1}`;
      }
    } else if (selectedObject.type === 'rectangle') {
      statusText = `Rectangle on Layer 1 (${Math.round(selectedObject.width)} × ${Math.round(
        selectedObject.height
      )} ${unit})`;
    } else if (selectedObject.type === 'ellipse') {
      statusText = `Ellipse on Layer 1 (Radius: ${Math.round(selectedObject.rx)} × ${Math.round(
        selectedObject.ry
      )} ${unit})`;
    } else if (selectedObject.type === 'polygon') {
      statusText = `${selectedObject.isStar ? 'Star' : 'Polygon'} on Layer 1 (${
        selectedObject.sides
      } points)`;
    } else if (selectedObject.type === 'text') {
      statusText = `Text on Layer 1: "${selectedObject.text}"`;
    }
  }

  const outlineColor = selectedObject ? selectedObject.stroke : 'none';
  const fillColor = selectedObject ? selectedObject.fill : 'none';
  const outlineWidth = selectedObject ? selectedObject.strokeWidth : 0;

  return (
    <div className={`h-6 px-3 border-t flex items-center justify-between select-none text-[11px] font-mono z-30 ${
      isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'
    }`}>
      {/* Left: Selection Description */}
      <div className="flex items-center gap-2 truncate max-w-[45%]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="truncate text-neutral-700 dark:text-neutral-300 font-sans">{statusText}</span>
      </div>

      {/* Center: Cursor Coordinates */}
      <div className="flex items-center gap-3 tabular-nums">
        <span>
          X: <strong className="text-neutral-900 dark:text-white">{Math.round(cursorPos.x)}</strong> {unit}
        </span>
        <span>
          Y: <strong className="text-neutral-900 dark:text-white">{Math.round(cursorPos.y)}</strong> {unit}
        </span>
        <span className="text-neutral-400">|</span>
        <span>{Math.round(zoom * 100)}%</span>
      </div>

      {/* Right: Fill & Outline indicators with double-click edit (CorelDRAW standard) */}
      <div className="flex items-center gap-2 font-sans text-[11px]">
        {/* Fill chip */}
        <button
          onClick={onOpenFillModal}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Uniform Fill (Shift+F11) - Double-click to edit"
        >
          <div
            className="w-3.5 h-3.5 rounded-xs border border-neutral-400 shadow-2xs"
            style={{
              backgroundColor: fillColor === 'none' ? 'transparent' : fillColor,
              backgroundImage:
                fillColor === 'none'
                  ? 'linear-gradient(45deg, #ef4444 50%, transparent 50%)'
                  : 'none',
            }}
          />
          <span className="uppercase text-[10px] font-mono">{fillColor}</span>
        </button>

        {/* Outline chip */}
        <button
          onClick={onOpenOutlineModal}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Outline Pen (F12) - Double-click to edit"
        >
          <div
            className="w-3.5 h-3.5 rounded-xs border-2 shadow-2xs"
            style={{
              borderColor: outlineColor === 'none' ? '#ef4444' : outlineColor,
            }}
          />
          <span className="text-[10px] font-mono">{outlineWidth} pt</span>
        </button>
      </div>
    </div>
  );
};

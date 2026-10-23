import React, { useState } from 'react';
import {
  Layers,
  Spline,
  LayoutGrid,
  History,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignEndVertical,
} from 'lucide-react';
import {
  CurveObject,
  PageConfig,
  SelectedNodeRef,
  VectorObject,
} from '../types/corel';

interface DockersPanelProps {
  objects: VectorObject[];
  selectedId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updated: VectorObject) => void;
  onDeleteObject: (id: string) => void;
  onReorderObject: (id: string, direction: 'up' | 'down') => void;
  selectedNodeRef: SelectedNodeRef | null;
  onSelectNode: (ref: SelectedNodeRef | null) => void;
  onMakeNodeCusp: () => void;
  onMakeNodeSmooth: () => void;
  onMakeNodeSymmetrical: () => void;
  onConvertSegmentToLine: () => void;
  onConvertSegmentToCurve: () => void;
  onAlign: (type: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY' | 'page') => void;
  historySteps: string[];
  historyIndex: number;
  onJumpToHistory: (index: number) => void;
  onClose: () => void;
  isDark: boolean;
}

export const DockersPanel: React.FC<DockersPanelProps> = ({
  objects,
  selectedId,
  onSelectObject,
  onUpdateObject,
  onDeleteObject,
  onReorderObject,
  selectedNodeRef,
  onSelectNode,
  onMakeNodeCusp,
  onMakeNodeSmooth,
  onMakeNodeSymmetrical,
  onConvertSegmentToLine,
  onConvertSegmentToCurve,
  onAlign,
  historySteps,
  historyIndex,
  onJumpToHistory,
  onClose,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'objects' | 'node' | 'align' | 'history'>('objects');

  const selectedObject = objects.find((o) => o.id === selectedId) || null;
  const isCurve = selectedObject?.type === 'curve';
  const curve = isCurve ? (selectedObject as CurveObject) : null;

  return (
    <div className={`w-72 border-l flex flex-col select-none text-xs z-20 shrink-0 ${
      isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
    }`}>
      {/* Docker Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="font-bold tracking-tight text-neutral-900 dark:text-white uppercase text-[11px]">
          Dockers
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500"
          title="Close Docker"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Docker Tabs */}
      <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 px-1 pt-1">
        {[
          { id: 'objects', label: 'Objects', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'node', label: 'Nodes', icon: <Spline className="w-3.5 h-3.5" /> },
          { id: 'align', label: 'Align', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
          { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 text-[11px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-neutral-800 rounded-t-sm'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* OBJECTS DOCKER */}
        {activeTab === 'objects' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 uppercase font-mono mb-2">
              <span>Layer 1 ({objects.length} Objects)</span>
            </div>

            {objects.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 italic">No objects on canvas</div>
            ) : (
              [...objects].reverse().map((obj, revIdx) => {
                const isSelected = obj.id === selectedId;
                return (
                  <div
                    key={obj.id}
                    onClick={() => onSelectObject(obj.id)}
                    className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/10 border-emerald-500/50 text-neutral-900 dark:text-white'
                        : 'border-transparent hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* Swatch preview */}
                      <div
                        className="w-3 h-3 rounded-xs border border-neutral-400 shrink-0"
                        style={{
                          backgroundColor: obj.fill === 'none' ? 'transparent' : obj.fill,
                          borderColor: obj.stroke === 'none' ? '#ef4444' : obj.stroke,
                        }}
                      />
                      <span className="truncate text-xs font-medium">{obj.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Reorder buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderObject(obj.id, 'up');
                        }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        title="Bring Forward (Ctrl+PgUp)"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderObject(obj.id, 'down');
                        }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        title="Send Backward (Ctrl+PgDn)"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {/* Visibility */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateObject({ ...obj, visible: !obj.visible });
                        }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        title={obj.visible ? 'Hide Object' : 'Show Object'}
                      >
                        {obj.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-500" />}
                      </button>

                      {/* Lock */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateObject({ ...obj, locked: !obj.locked });
                        }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        title={obj.locked ? 'Unlock Object' : 'Lock Object'}
                      >
                        {obj.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteObject(obj.id);
                        }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-red-500"
                        title="Delete Object"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* NODES DOCKER */}
        {activeTab === 'node' && (
          <div className="space-y-4">
            {!isCurve || !curve ? (
              <div className="py-6 text-center text-neutral-400 italic">
                Select a curve object to view and manipulate its nodes.
              </div>
            ) : (
              <>
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 space-y-2">
                  <div className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    Curve Subpaths: {curve.subpaths.length}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Total Nodes: {curve.subpaths.reduce((a, s) => a + s.nodes.length, 0)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Closed Curve: {curve.subpaths[0]?.closed ? 'Yes' : 'No'}
                  </div>
                </div>

                {/* Node Type Buttons */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase">
                    Change Node Type
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={onMakeNodeCusp}
                      disabled={!selectedNodeRef}
                      className="px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 text-[11px] font-medium"
                    >
                      Cusp
                    </button>
                    <button
                      onClick={onMakeNodeSmooth}
                      disabled={!selectedNodeRef}
                      className="px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 text-[11px] font-medium"
                    >
                      Smooth
                    </button>
                    <button
                      onClick={onMakeNodeSymmetrical}
                      disabled={!selectedNodeRef}
                      className="px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 text-[11px] font-medium"
                    >
                      Symmetric
                    </button>
                  </div>
                </div>

                {/* Segment Type Buttons */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase">
                    Convert Segment
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onConvertSegmentToLine}
                      disabled={!selectedNodeRef}
                      className="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 text-xs font-mono"
                    >
                      Straight Line
                    </button>
                    <button
                      onClick={onConvertSegmentToCurve}
                      disabled={!selectedNodeRef}
                      className="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 text-xs font-mono"
                    >
                      Bézier Curve
                    </button>
                  </div>
                </div>

                {/* Subpath node list */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase">
                    Node List
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                    {curve.subpaths[0]?.nodes.map((n, idx) => {
                      const isSel =
                        selectedNodeRef?.objectId === curve.id &&
                        selectedNodeRef.nodeIndex === idx;
                      return (
                        <div
                          key={n.id || idx}
                          onClick={() =>
                            onSelectNode({
                              objectId: curve.id,
                              subpathIndex: 0,
                              nodeIndex: idx,
                              handleType: 'node',
                            })
                          }
                          className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                            isSel
                              ? 'bg-emerald-600 text-white'
                              : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <span>Node {idx + 1}</span>
                          <span className="capitalize text-[10px] opacity-80">{n.type}</span>
                          <span className="tabular-nums">
                            {Math.round(n.x)}, {Math.round(n.y)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ALIGN & DISTRIBUTE DOCKER */}
        {activeTab === 'align' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase">
                CorelDRAW Align Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAlign('page')}
                  className="flex items-center justify-between p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-left"
                >
                  <span className="font-medium">Center to Page</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">
                    P
                  </kbd>
                </button>
                <button
                  onClick={() => onAlign('centerX')}
                  className="flex items-center justify-between p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-left"
                >
                  <span className="font-medium">Center Horiz.</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">
                    C
                  </kbd>
                </button>
                <button
                  onClick={() => onAlign('centerY')}
                  className="flex items-center justify-between p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-left"
                >
                  <span className="font-medium">Center Vert.</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">
                    E
                  </kbd>
                </button>
                <button
                  onClick={() => onAlign('left')}
                  className="flex items-center justify-between p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-left"
                >
                  <span className="font-medium">Align Left</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">
                    L
                  </kbd>
                </button>
                <button
                  onClick={() => onAlign('right')}
                  className="flex items-center justify-between p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-left"
                >
                  <span className="font-medium">Align Right</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">
                    R
                  </kbd>
                </button>
                <button
                  onClick={() => onAlign('top')}
                  className="flex items-center justify-between p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-left"
                >
                  <span className="font-medium">Align Top</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">
                    T
                  </kbd>
                </button>
                <button
                  onClick={() => onAlign('bottom')}
                  className="flex items-center justify-between p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-left"
                >
                  <span className="font-medium">Align Bottom</span>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">
                    B
                  </kbd>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY DOCKER */}
        {activeTab === 'history' && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase mb-2">
              Action Stack ({historySteps.length} States)
            </div>
            {historySteps.map((step, idx) => {
              const isCurrent = idx === historyIndex;
              return (
                <div
                  key={idx}
                  onClick={() => onJumpToHistory(idx)}
                  className={`px-3 py-1.5 rounded cursor-pointer flex items-center justify-between font-mono text-[11px] ${
                    isCurrent
                      ? 'bg-emerald-600 text-white font-bold'
                      : idx > historyIndex
                      ? 'opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                      : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span>{step}</span>
                  {isCurrent && <span className="text-[10px]">Active</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CurveNode,
  CurveObject,
  Guideline,
  PageConfig,
  Point,
  SelectedNodeRef,
  ToolType,
  VectorObject,
  ViewportState,
} from './types/vectordraw';
import {
  convertObjectToCurves,
  distance,
  generateId,
  getObjectBoundingBox,
  insertNodeOnSegment,
} from './utils/bezier';
import {
  DEFAULT_PAGE_CONFIG,
  getSampleArtwork,
} from './utils/sampleData';
import {
  downloadFile,
  exportToPng,
  exportToSvgString,
} from './utils/svgExport';
import { MenuBar } from './components/MenuBar';
import { StandardToolbar } from './components/StandardToolbar';
import { PropertyBar } from './components/PropertyBar';
import { Toolbox } from './components/Toolbox';
import { CanvasArea } from './components/CanvasArea';
import { ColorPalette } from './components/ColorPalette';
import { StatusBar } from './components/StatusBar';
import { DockersPanel } from './components/DockersPanel';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { OutlinePenModal, UniformFillModal } from './components/ColorAndStyleModals';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(false);

  // Document page configuration
  const [pageConfig, setPageConfig] = useState<PageConfig>(DEFAULT_PAGE_CONFIG);

  // Objects list (vector graphics)
  const [objects, setObjects] = useState<VectorObject[]>(() => getSampleArtwork());

  // Active tool
  const [activeTool, setActiveTool] = useState<ToolType>('pick');
  const previousToolRef = useRef<ToolType>('pick');

  // Selected object ID
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Selected node (Shape Tool F10)
  const [selectedNodeRef, setSelectedNodeRef] = useState<SelectedNodeRef | null>(null);

  // Viewport pan & zoom
  const [viewport, setViewport] = useState<ViewportState>({
    panX: 180,
    panY: 80,
    zoom: 0.9,
  });

  // Cursor position
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });

  // Guidelines
  const [guidelines, setGuidelines] = useState<Guideline[]>([
    { id: 'gl1', orientation: 'horizontal', position: 220 },
    { id: 'gl2', orientation: 'vertical', position: 400 },
  ]);
  const [showRulers, setShowRulers] = useState(true);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [snapToGuidelines, setSnapToGuidelines] = useState(true);

  // Freehand tool settings
  const [freehandSmoothing, setFreehandSmoothing] = useState(5);

  // Active fill & stroke color defaults
  const [currentFill, setCurrentFill] = useState('#2563EB');
  const [currentOutline, setCurrentOutline] = useState('#1E3A8A');

  // Clipboard
  const [clipboard, setClipboard] = useState<VectorObject | null>(null);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<{ objects: VectorObject[]; label: string }[]>([
    { objects: getSampleArtwork(), label: 'Initial Artwork' },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI Panels & Modals
  const [showDocker, setShowDocker] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showFillModal, setShowFillModal] = useState(false);
  const [showOutlineModal, setShowOutlineModal] = useState(false);

  // Helper to record history state
  const pushHistory = useCallback(
    (newObjects: VectorObject[], label: string) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, { objects: newObjects, label }];
      });
      setHistoryIndex((prev) => prev + 1);
      setObjects(newObjects);
    },
    [historyIndex]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const targetIdx = historyIndex - 1;
    setHistoryIndex(targetIdx);
    setObjects(history[targetIdx].objects);
    setSelectedNodeRef(null);
  }, [canUndo, historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const targetIdx = historyIndex + 1;
    setHistoryIndex(targetIdx);
    setObjects(history[targetIdx].objects);
    setSelectedNodeRef(null);
  }, [canRedo, historyIndex, history]);

  const handleJumpToHistory = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < history.length) {
        setHistoryIndex(idx);
        setObjects(history[idx].objects);
        setSelectedNodeRef(null);
      }
    },
    [history]
  );

  // Selected object helper
  const selectedObject = objects.find((o) => o.id === selectedId) || null;
  const isSelectedCurve = selectedObject?.type === 'curve';

  // Tool change handler
  const handleSelectTool = (tool: ToolType) => {
    previousToolRef.current = activeTool;
    setActiveTool(tool);
    if (tool !== 'shape') {
      setSelectedNodeRef(null);
    }
  };

  // Object modification
  const handleUpdateObject = (updated: VectorObject, label = 'Modify Object') => {
    const newObjects = objects.map((o) => (o.id === updated.id ? updated : o));
    pushHistory(newObjects, label);
  };

  // Add object
  const handleAddObject = (newObj: VectorObject, label = 'Create Object') => {
    const newObjects = [...objects, newObj];
    pushHistory(newObjects, label);
  };

  // Delete object
  const handleDeleteObject = (id: string) => {
    const newObjects = objects.filter((o) => o.id !== id);
    if (selectedId === id) setSelectedId(null);
    setSelectedNodeRef(null);
    pushHistory(newObjects, 'Delete Object');
  };

  // Convert to Curves (Ctrl+Q) - VectorDraw staple
  const handleConvertToCurves = () => {
    if (!selectedObject) return;
    if (selectedObject.type === 'curve') return;

    const curveObj = convertObjectToCurves(selectedObject);
    const newObjects = objects.map((o) => (o.id === curveObj.id ? curveObj : o));
    pushHistory(newObjects, 'Convert to Curves (Ctrl+Q)');
    // Automatically switch to Shape Tool (F10) like VectorDraw!
    setActiveTool('shape');
    setSelectedNodeRef({
      objectId: curveObj.id,
      subpathIndex: 0,
      nodeIndex: 0,
      handleType: 'node',
    });
  };

  // Duplicate (Ctrl+D)
  const handleDuplicate = () => {
    if (!selectedObject) return;
    const cloned = JSON.parse(JSON.stringify(selectedObject)) as VectorObject;
    cloned.id = generateId('dup');
    cloned.name = `${selectedObject.name} (Copy)`;

    if (cloned.type === 'rectangle' || cloned.type === 'text') {
      cloned.x += 20;
      cloned.y += 20;
    } else if (cloned.type === 'ellipse' || cloned.type === 'polygon') {
      cloned.cx += 20;
      cloned.cy += 20;
    } else if (cloned.type === 'curve') {
      cloned.subpaths = cloned.subpaths.map((s) => ({
        ...s,
        nodes: s.nodes.map((n) => ({
          ...n,
          id: generateId('n'),
          x: n.x + 20,
          y: n.y + 20,
          handleIn: n.handleIn ? { x: n.handleIn.x + 20, y: n.handleIn.y + 20 } : undefined,
          handleOut: n.handleOut ? { x: n.handleOut.x + 20, y: n.handleOut.y + 20 } : undefined,
        })),
      }));
    }

    const newObjects = [...objects, cloned];
    pushHistory(newObjects, 'Duplicate (Ctrl+D)');
    setSelectedId(cloned.id);
  };

  // Clipboard operations
  const handleCut = () => {
    if (!selectedObject) return;
    setClipboard(JSON.parse(JSON.stringify(selectedObject)));
    handleDeleteObject(selectedObject.id);
  };

  const handleCopy = () => {
    if (!selectedObject) return;
    setClipboard(JSON.parse(JSON.stringify(selectedObject)));
  };

  const handlePaste = () => {
    if (!clipboard) return;
    const pasted = JSON.parse(JSON.stringify(clipboard)) as VectorObject;
    pasted.id = generateId('paste');
    pasted.name = `${clipboard.name} (Pasted)`;

    if (pasted.type === 'rectangle' || pasted.type === 'text') {
      pasted.x += 15;
      pasted.y += 15;
    } else if (pasted.type === 'ellipse' || pasted.type === 'polygon') {
      pasted.cx += 15;
      pasted.cy += 15;
    } else if (pasted.type === 'curve') {
      pasted.subpaths = pasted.subpaths.map((s) => ({
        ...s,
        nodes: s.nodes.map((n) => ({
          ...n,
          id: generateId('n'),
          x: n.x + 15,
          y: n.y + 15,
          handleIn: n.handleIn ? { x: n.handleIn.x + 15, y: n.handleIn.y + 15 } : undefined,
          handleOut: n.handleOut ? { x: n.handleOut.x + 15, y: n.handleOut.y + 15 } : undefined,
        })),
      }));
    }

    handleAddObject(pasted, 'Paste');
    setSelectedId(pasted.id);
  };

  // Reorder objects
  const handleReorderObject = (id: string, direction: 'up' | 'down') => {
    const idx = objects.findIndex((o) => o.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= objects.length) return;

    const newObjects = [...objects];
    const [moved] = newObjects.splice(idx, 1);
    newObjects.splice(targetIdx, 0, moved);
    pushHistory(newObjects, direction === 'up' ? 'Bring Forward' : 'Send Backward');
  };

  const handleBringToFront = () => {
    if (!selectedId) return;
    const idx = objects.findIndex((o) => o.id === selectedId);
    if (idx === -1 || idx === objects.length - 1) return;
    const newObjects = [...objects];
    const [moved] = newObjects.splice(idx, 1);
    newObjects.push(moved);
    pushHistory(newObjects, 'Bring to Front of Page (Shift+PgUp)');
  };

  const handleSendToBack = () => {
    if (!selectedId) return;
    const idx = objects.findIndex((o) => o.id === selectedId);
    if (idx <= 0) return;
    const newObjects = [...objects];
    const [moved] = newObjects.splice(idx, 1);
    newObjects.unshift(moved);
    pushHistory(newObjects, 'Send to Back of Page (Shift+PgDn)');
  };

  // Alignments (VectorDraw Single-Key Shortcuts: P, L, R, T, B, C, E)
  const handleAlign = (type: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY' | 'page') => {
    if (!selectedObject) return;
    const bbox = getObjectBoundingBox(selectedObject);
    let dx = 0;
    let dy = 0;

    if (type === 'page') {
      const pageCenterX = pageConfig.width / 2;
      const pageCenterY = pageConfig.height / 2;
      const objCenterX = bbox.x + bbox.width / 2;
      const objCenterY = bbox.y + bbox.height / 2;
      dx = pageCenterX - objCenterX;
      dy = pageCenterY - objCenterY;
    } else if (type === 'left') {
      dx = 0 - bbox.x;
    } else if (type === 'right') {
      dx = pageConfig.width - (bbox.x + bbox.width);
    } else if (type === 'top') {
      dy = 0 - bbox.y;
    } else if (type === 'bottom') {
      dy = pageConfig.height - (bbox.y + bbox.height);
    } else if (type === 'centerX') {
      const pageCenterX = pageConfig.width / 2;
      const objCenterX = bbox.x + bbox.width / 2;
      dx = pageCenterX - objCenterX;
    } else if (type === 'centerY') {
      const pageCenterY = pageConfig.height / 2;
      const objCenterY = bbox.y + bbox.height / 2;
      dy = pageCenterY - objCenterY;
    }

    if (selectedObject.type === 'rectangle' || selectedObject.type === 'text') {
      handleUpdateObject({ ...selectedObject, x: selectedObject.x + dx, y: selectedObject.y + dy }, `Align ${type}`);
    } else if (selectedObject.type === 'ellipse' || selectedObject.type === 'polygon') {
      handleUpdateObject({ ...selectedObject, cx: selectedObject.cx + dx, cy: selectedObject.cy + dy }, `Align ${type}`);
    } else if (selectedObject.type === 'curve') {
      const newSubpaths = selectedObject.subpaths.map((s) => ({
        ...s,
        nodes: s.nodes.map((n) => ({
          ...n,
          x: n.x + dx,
          y: n.y + dy,
          handleIn: n.handleIn ? { x: n.handleIn.x + dx, y: n.handleIn.y + dy } : undefined,
          handleOut: n.handleOut ? { x: n.handleOut.x + dx, y: n.handleOut.y + dy } : undefined,
        })),
      }));
      handleUpdateObject({ ...selectedObject, subpaths: newSubpaths }, `Align ${type}`);
    }
  };

  // Color application (Left-click = fill, Right-click = outline)
  const handleSetFillColor = (color: string) => {
    setCurrentFill(color);
    if (selectedObject) {
      handleUpdateObject({ ...selectedObject, fill: color }, 'Set Fill Color');
    }
  };

  const handleSetOutlineColor = (color: string) => {
    setCurrentOutline(color);
    if (selectedObject) {
      const width = selectedObject.strokeWidth === 0 && color !== 'none' ? 1.5 : selectedObject.strokeWidth;
      handleUpdateObject(
        { ...selectedObject, stroke: color, strokeWidth: color === 'none' ? 0 : width },
        'Set Outline Color'
      );
    }
  };

  // ================= SHAPE TOOL (F10) NODE MANIPULATION =================
  const handleAddNode = () => {
    if (!selectedObject || selectedObject.type !== 'curve') return;
    const curve = selectedObject as CurveObject;
    const subIdx = selectedNodeRef?.subpathIndex || 0;
    const nodeIdx = selectedNodeRef?.nodeIndex || 0;

    const updatedSub = insertNodeOnSegment(curve.subpaths[subIdx], nodeIdx);
    const newSubpaths = [...curve.subpaths];
    newSubpaths[subIdx] = updatedSub;
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Add Node (+)');
    setSelectedNodeRef({
      objectId: curve.id,
      subpathIndex: subIdx,
      nodeIndex: nodeIdx + 1,
      handleType: 'node',
    });
  };

  const handleDeleteNode = () => {
    if (!selectedObject || selectedObject.type !== 'curve' || !selectedNodeRef) return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[selectedNodeRef.subpathIndex];
    if (sub.nodes.length <= 2) return;

    const newNodes = sub.nodes.filter((_, idx) => idx !== selectedNodeRef.nodeIndex);
    const newSubpaths = [...curve.subpaths];
    newSubpaths[selectedNodeRef.subpathIndex] = { ...sub, nodes: newNodes };
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Delete Node (-)');
    setSelectedNodeRef(null);
  };

  const handleJoinNodes = () => {
    if (!selectedObject || selectedObject.type !== 'curve') return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[0];
    if (!sub || sub.closed || sub.nodes.length < 2) return;

    // Join endpoints and close curve
    const newSubpaths = [{ ...sub, closed: true }];
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Join Nodes');
  };

  const handleBreakCurve = () => {
    if (!selectedObject || selectedObject.type !== 'curve' || !selectedNodeRef) return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[selectedNodeRef.subpathIndex];
    const nodeIdx = selectedNodeRef.nodeIndex;

    // Break curve at node: unclose or split
    const targetNode = sub.nodes[nodeIdx];
    const duplicateNode: CurveNode = {
      ...targetNode,
      id: generateId('n'),
      x: targetNode.x + 10,
      y: targetNode.y + 10,
    };
    const newNodes = [...sub.nodes];
    newNodes.splice(nodeIdx + 1, 0, duplicateNode);
    const newSubpaths = [...curve.subpaths];
    newSubpaths[selectedNodeRef.subpathIndex] = { ...sub, nodes: newNodes, closed: false };
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Break Curve');
  };

  const handleConvertSegmentToLine = () => {
    if (!selectedObject || selectedObject.type !== 'curve' || !selectedNodeRef) return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[selectedNodeRef.subpathIndex];
    const newNodes = [...sub.nodes];
    const curr = { ...newNodes[selectedNodeRef.nodeIndex] };
    curr.segmentType = 'line';
    curr.handleOut = undefined;
    newNodes[selectedNodeRef.nodeIndex] = curr;

    const nextIdx = (selectedNodeRef.nodeIndex + 1) % newNodes.length;
    newNodes[nextIdx] = { ...newNodes[nextIdx], handleIn: undefined };

    const newSubpaths = [...curve.subpaths];
    newSubpaths[selectedNodeRef.subpathIndex] = { ...sub, nodes: newNodes };
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Convert to Line');
  };

  const handleConvertSegmentToCurve = () => {
    if (!selectedObject || selectedObject.type !== 'curve' || !selectedNodeRef) return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[selectedNodeRef.subpathIndex];
    const newNodes = [...sub.nodes];
    const curr = { ...newNodes[selectedNodeRef.nodeIndex] };
    const nextIdx = (selectedNodeRef.nodeIndex + 1) % newNodes.length;
    const next = { ...newNodes[nextIdx] };

    curr.segmentType = 'curve';
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;

    curr.handleOut = { x: curr.x + dx * 0.33, y: curr.y + dy * 0.33 };
    next.handleIn = { x: curr.x + dx * 0.66, y: curr.y + dy * 0.66 };

    newNodes[selectedNodeRef.nodeIndex] = curr;
    newNodes[nextIdx] = next;

    const newSubpaths = [...curve.subpaths];
    newSubpaths[selectedNodeRef.subpathIndex] = { ...sub, nodes: newNodes };
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Convert to Curve');
  };

  const handleMakeNodeCusp = () => {
    if (!selectedObject || selectedObject.type !== 'curve' || !selectedNodeRef) return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[selectedNodeRef.subpathIndex];
    const newNodes = [...sub.nodes];
    newNodes[selectedNodeRef.nodeIndex] = {
      ...newNodes[selectedNodeRef.nodeIndex],
      type: 'cusp',
    };
    const newSubpaths = [...curve.subpaths];
    newSubpaths[selectedNodeRef.subpathIndex] = { ...sub, nodes: newNodes };
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Make Node Cusp');
  };

  const handleMakeNodeSmooth = () => {
    if (!selectedObject || selectedObject.type !== 'curve' || !selectedNodeRef) return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[selectedNodeRef.subpathIndex];
    const node = sub.nodes[selectedNodeRef.nodeIndex];

    let handleIn = node.handleIn;
    let handleOut = node.handleOut;

    if (handleIn && handleOut) {
      // Align handles collinearly
      const angle = Math.atan2(handleOut.y - node.y, handleOut.x - node.x);
      const inDist = distance(node, handleIn);
      handleIn = {
        x: node.x - Math.cos(angle) * inDist,
        y: node.y - Math.sin(angle) * inDist,
      };
    } else if (handleOut && !handleIn) {
      const angle = Math.atan2(handleOut.y - node.y, handleOut.x - node.x);
      const d = distance(node, handleOut);
      handleIn = {
        x: node.x - Math.cos(angle) * d,
        y: node.y - Math.sin(angle) * d,
      };
    }

    const newNodes = [...sub.nodes];
    newNodes[selectedNodeRef.nodeIndex] = {
      ...node,
      type: 'smooth',
      handleIn,
      handleOut,
    };
    const newSubpaths = [...curve.subpaths];
    newSubpaths[selectedNodeRef.subpathIndex] = { ...sub, nodes: newNodes };
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Make Node Smooth');
  };

  const handleMakeNodeSymmetrical = () => {
    if (!selectedObject || selectedObject.type !== 'curve' || !selectedNodeRef) return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[selectedNodeRef.subpathIndex];
    const node = sub.nodes[selectedNodeRef.nodeIndex];

    const d = node.handleOut ? distance(node, node.handleOut) : 30;
    const angle = node.handleOut
      ? Math.atan2(node.handleOut.y - node.y, node.handleOut.x - node.x)
      : 0;

    const handleOut = {
      x: node.x + Math.cos(angle) * d,
      y: node.y + Math.sin(angle) * d,
    };
    const handleIn = {
      x: node.x - Math.cos(angle) * d,
      y: node.y - Math.sin(angle) * d,
    };

    const newNodes = [...sub.nodes];
    newNodes[selectedNodeRef.nodeIndex] = {
      ...node,
      type: 'symmetrical',
      handleIn,
      handleOut,
    };
    const newSubpaths = [...curve.subpaths];
    newSubpaths[selectedNodeRef.subpathIndex] = { ...sub, nodes: newNodes };
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Make Node Symmetrical');
  };

  const handleReverseCurve = () => {
    if (!selectedObject || selectedObject.type !== 'curve') return;
    const curve = selectedObject as CurveObject;
    const newSubpaths = curve.subpaths.map((s) => ({
      ...s,
      nodes: [...s.nodes].reverse().map((n) => ({
        ...n,
        handleIn: n.handleOut,
        handleOut: n.handleIn,
      })),
    }));
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Reverse Curve Direction');
  };

  const handleAutoCloseCurve = () => {
    if (!selectedObject || selectedObject.type !== 'curve') return;
    const curve = selectedObject as CurveObject;
    const newSubpaths = curve.subpaths.map((s) => ({ ...s, closed: true }));
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, 'Auto-Close Curve');
  };

  const handleAlignNodes = (direction: 'horizontal' | 'vertical') => {
    if (!selectedObject || selectedObject.type !== 'curve' || !selectedNodeRef) return;
    const curve = selectedObject as CurveObject;
    const sub = curve.subpaths[selectedNodeRef.subpathIndex];
    const targetNode = sub.nodes[selectedNodeRef.nodeIndex];

    // Align all nodes in subpath to the target node's X or Y
    const newNodes = sub.nodes.map((n) => ({
      ...n,
      x: direction === 'vertical' ? targetNode.x : n.x,
      y: direction === 'horizontal' ? targetNode.y : n.y,
    }));

    const newSubpaths = [...curve.subpaths];
    newSubpaths[selectedNodeRef.subpathIndex] = { ...sub, nodes: newNodes };
    handleUpdateObject({ ...curve, subpaths: newSubpaths }, `Align Nodes ${direction}`);
  };

  // Zoom to Page (Shift+F4)
  const handleZoomToPage = useCallback(() => {
    setViewport({
      panX: 200,
      panY: 80,
      zoom: 0.9,
    });
  }, []);

  // Zoom to All Objects (F4)
  const handleZoomToAll = useCallback(() => {
    if (objects.length === 0) return handleZoomToPage();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const obj of objects) {
      const b = getObjectBoundingBox(obj);
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }

    const w = maxX - minX;
    const h = maxY - minY;
    const zoom = Math.min(600 / Math.max(w, 200), 500 / Math.max(h, 200), 2);
    setViewport({
      panX: 250 - (minX + w / 2) * zoom,
      panY: 250 - (minY + h / 2) * zoom,
      zoom,
    });
  }, [objects, handleZoomToPage]);

  // Import SVG
  const handleImportSvg = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        if (file.name.endsWith('.json')) {
          try {
            const data = JSON.parse(content);
            if (Array.isArray(data)) {
              pushHistory(data, 'Import Project JSON');
            } else if (data.objects) {
              pushHistory(data.objects, 'Import Project JSON');
            }
          } catch {
            // ignore
          }
        } else {
          // Quick SVG path extraction
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'image/svg+xml');
          const paths = doc.querySelectorAll('path');
          const newObjs: VectorObject[] = [];

          paths.forEach((p, idx) => {
            const d = p.getAttribute('d') || '';
            const fill = p.getAttribute('fill') || '#2563EB';
            const stroke = p.getAttribute('stroke') || '#000000';
            const strokeWidth = Number(p.getAttribute('stroke-width')) || 1;

            if (d) {
              newObjs.push({
                id: generateId('imp'),
                name: `Imported Path ${idx + 1}`,
                type: 'curve',
                fill: fill === 'none' ? 'none' : fill,
                stroke: stroke === 'none' ? 'none' : stroke,
                strokeWidth,
                opacity: 1,
                visible: true,
                locked: false,
                transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
                subpaths: [
                  {
                    id: generateId('sub'),
                    closed: d.includes('Z') || d.includes('z'),
                    nodes: [
                      { id: generateId('n'), x: 200 + idx * 30, y: 200 + idx * 20, type: 'smooth', segmentType: 'curve' },
                      { id: generateId('n'), x: 350 + idx * 30, y: 300 + idx * 20, type: 'smooth', segmentType: 'curve' },
                    ],
                  },
                ],
              });
            }
          });

          if (newObjs.length > 0) {
            pushHistory([...objects, ...newObjs], 'Import SVG Paths');
          }
        }
      }
    };
    reader.readAsText(file);
  };

  // Export SVG
  const handleExportSvg = () => {
    const svg = exportToSvgString(objects, pageConfig);
    downloadFile(svg, 'vectordraw-artwork.svg', 'image/svg+xml');
  };

  // Export PNG
  const handleExportPng = () => {
    exportToPng(objects, pageConfig);
  };

  // Save Project JSON
  const handleSaveProject = () => {
    const data = JSON.stringify({ pageConfig, objects }, null, 2);
    downloadFile(data, 'vectordraw-project.vdr.json', 'application/json');
  };

  // Reset to Sample Art
  const handleResetSample = () => {
    const sample = getSampleArtwork();
    pushHistory(sample, 'Reset to Sample Artwork');
    setSelectedId(null);
    setSelectedNodeRef(null);
    handleZoomToPage();
  };

  // Global VectorDraw Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, ignore global tool shortcuts
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      // Spacebar: Toggle Pick Tool (VectorDraw standard)
      if (e.code === 'Space' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (activeTool !== 'pick') {
          handleSelectTool('pick');
        } else {
          handleSelectTool(previousToolRef.current || 'shape');
        }
        return;
      }

      // F10: Shape Tool (Node Editing)
      if (e.key === 'F10') {
        e.preventDefault();
        handleSelectTool('shape');
        return;
      }

      // F5: Freehand Tool
      if (e.key === 'F5') {
        e.preventDefault();
        handleSelectTool('freehand');
        return;
      }

      // F6: Rectangle Tool
      if (e.key === 'F6') {
        e.preventDefault();
        handleSelectTool('rectangle');
        return;
      }

      // F7: Ellipse Tool
      if (e.key === 'F7') {
        e.preventDefault();
        handleSelectTool('ellipse');
        return;
      }

      // F8: Text Tool
      if (e.key === 'F8') {
        e.preventDefault();
        handleSelectTool('text');
        return;
      }

      // Y: Polygon / Star Tool
      if ((e.key === 'y' || e.key === 'Y') && !e.ctrlKey) {
        e.preventDefault();
        handleSelectTool('polygon');
        return;
      }

      // G: Interactive Fill Tool
      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey) {
        e.preventDefault();
        handleSelectTool('interactive-fill');
        return;
      }

      // H: Pan Hand Tool
      if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey) {
        e.preventDefault();
        handleSelectTool('pan');
        return;
      }

      // Z: Zoom Tool
      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey) {
        e.preventDefault();
        handleSelectTool('zoom');
        return;
      }

      // F12: Outline Pen Dialog
      if (e.key === 'F12') {
        e.preventDefault();
        setShowOutlineModal(true);
        return;
      }

      // Shift+F11: Uniform Fill Dialog
      if (e.shiftKey && e.key === 'F11') {
        e.preventDefault();
        setShowFillModal(true);
        return;
      }

      // F1: Help / Shortcuts Dialog
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcutsModal(true);
        return;
      }

      // Ctrl + Q: Convert to Curves
      if (e.ctrlKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        handleConvertToCurves();
        return;
      }

      // Ctrl + D: Duplicate
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleDuplicate();
        return;
      }

      // Ctrl + Z: Undo
      if (e.ctrlKey && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Ctrl + Shift + Z or Ctrl + Y: Redo
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'z' || e.key === 'Z')) ||
        (e.ctrlKey && (e.key === 'y' || e.key === 'Y'))
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Ctrl + X: Cut
      if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        handleCut();
        return;
      }

      // Ctrl + C: Copy
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        handleCopy();
        return;
      }

      // Ctrl + V: Paste
      if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Ctrl + A: Select All
      if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (objects.length > 0) {
          setSelectedId(objects[objects.length - 1].id);
        }
        return;
      }

      // Shift + F4: Zoom to Page
      if (e.shiftKey && e.key === 'F4') {
        e.preventDefault();
        handleZoomToPage();
        return;
      }

      // F4: Zoom to All
      if (e.key === 'F4' && !e.shiftKey) {
        e.preventDefault();
        handleZoomToAll();
        return;
      }

      // F2: Zoom In
      if (e.key === 'F2') {
        e.preventDefault();
        setViewport((v) => ({ ...v, zoom: Math.min(v.zoom * 1.25, 8) }));
        return;
      }

      // F3: Zoom Out
      if (e.key === 'F3') {
        e.preventDefault();
        setViewport((v) => ({ ...v, zoom: Math.max(v.zoom * 0.8, 0.15) }));
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (activeTool === 'shape' && selectedNodeRef) {
          handleDeleteNode();
        } else if (selectedId) {
          handleDeleteObject(selectedId);
        }
        return;
      }

      // Alignment Shortcuts when an object is selected:
      if (selectedId && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleAlign('page');
        } else if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          handleAlign('left');
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          handleAlign('right');
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          handleAlign('top');
        } else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          handleAlign('bottom');
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          handleAlign('centerX');
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          handleAlign('centerY');
        }
      }

      // Shift + PageUp / Shift + PageDown
      if (e.shiftKey && e.key === 'PageUp') {
        e.preventDefault();
        handleBringToFront();
      } else if (e.shiftKey && e.key === 'PageDown') {
        e.preventDefault();
        handleSendToBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTool,
    selectedId,
    selectedNodeRef,
    objects,
    handleUndo,
    handleRedo,
    handleZoomToPage,
    handleZoomToAll,
  ]);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${isDark ? 'dark bg-neutral-950 text-neutral-100' : 'bg-white text-neutral-900'}`}>
      {/* 1. Menu Bar */}
      <MenuBar
        onNew={() => {
          pushHistory([], 'New Document');
          setSelectedId(null);
          setSelectedNodeRef(null);
        }}
        onOpen={handleSaveProject}
        onSave={handleSaveProject}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        onImportSvg={handleImportSvg}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onDelete={() => selectedId && handleDeleteObject(selectedId)}
        onDuplicate={handleDuplicate}
        onSelectAll={() => objects.length > 0 && setSelectedId(objects[objects.length - 1].id)}
        onConvertToCurves={handleConvertToCurves}
        onGroup={() => {}}
        onUngroup={() => {}}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onAlign={handleAlign}
        onZoomIn={() => setViewport((v) => ({ ...v, zoom: Math.min(v.zoom * 1.25, 8) }))}
        onZoomOut={() => setViewport((v) => ({ ...v, zoom: Math.max(v.zoom * 0.8, 0.15) }))}
        onZoomToPage={handleZoomToPage}
        onZoomToAll={handleZoomToAll}
        onResetSample={handleResetSample}
        onToggleShortcuts={() => setShowShortcutsModal(true)}
        showRulers={showRulers}
        onToggleRulers={() => setShowRulers(!showRulers)}
        showGuidelines={showGuidelines}
        onToggleGuidelines={() => setShowGuidelines(!showGuidelines)}
        snapToGuidelines={snapToGuidelines}
        onToggleSnap={() => setSnapToGuidelines(!snapToGuidelines)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        hasSelection={!!selectedId}
        isCurve={isSelectedCurve}
      />

      {/* 2. Standard Toolbar */}
      <StandardToolbar
        onNew={() => {
          pushHistory([], 'New Document');
          setSelectedId(null);
        }}
        onOpen={handleSaveProject}
        onSave={handleSaveProject}
        onImportSvg={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.svg,.json';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleImportSvg(file);
          };
          input.click();
        }}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelection={!!selectedId}
        zoom={viewport.zoom}
        onZoomChange={(newZoom) => setViewport((v) => ({ ...v, zoom: newZoom }))}
        onZoomToPage={handleZoomToPage}
        snapToGuidelines={snapToGuidelines}
        onToggleSnap={() => setSnapToGuidelines(!snapToGuidelines)}
        onCenterToPage={() => handleAlign('page')}
        toggleDocker={() => setShowDocker(!showDocker)}
        showDocker={showDocker}
        isDark={isDark}
      />

      {/* 3. Contextual Property Bar */}
      <PropertyBar
        activeTool={activeTool}
        selectedObject={selectedObject}
        selectedNodeRef={selectedNodeRef}
        pageConfig={pageConfig}
        onPageConfigChange={setPageConfig}
        onObjectChange={handleUpdateObject}
        onConvertToCurves={handleConvertToCurves}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
        onJoinNodes={handleJoinNodes}
        onBreakCurve={handleBreakCurve}
        onConvertSegmentToLine={handleConvertSegmentToLine}
        onConvertSegmentToCurve={handleConvertSegmentToCurve}
        onMakeNodeCusp={handleMakeNodeCusp}
        onMakeNodeSmooth={handleMakeNodeSmooth}
        onMakeNodeSymmetrical={handleMakeNodeSymmetrical}
        onReverseCurve={handleReverseCurve}
        onAutoCloseCurve={handleAutoCloseCurve}
        onAlignNodes={handleAlignNodes}
        elasticMode={false}
        onToggleElasticMode={() => {}}
        onOpenFillModal={() => setShowFillModal(true)}
        onOpenOutlineModal={() => setShowOutlineModal(true)}
        freehandSmoothing={freehandSmoothing}
        onFreehandSmoothingChange={setFreehandSmoothing}
        isDark={isDark}
      />

      {/* 4. Main Workspace (Toolbox + Canvas + Color Palette + Dockers) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbox */}
        <Toolbox
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          isDark={isDark}
        />

        {/* Center Drawing Canvas */}
        <CanvasArea
          objects={objects}
          selectedId={selectedId}
          onSelectObject={setSelectedId}
          onUpdateObject={handleUpdateObject}
          onAddObject={handleAddObject}
          activeTool={activeTool}
          selectedNodeRef={selectedNodeRef}
          onSelectNode={setSelectedNodeRef}
          pageConfig={pageConfig}
          viewport={viewport}
          onViewportChange={setViewport}
          guidelines={guidelines}
          onAddGuideline={(gl) => setGuidelines([...guidelines, gl])}
          onDeleteGuideline={(id) => setGuidelines(guidelines.filter((g) => g.id !== id))}
          showRulers={showRulers}
          showGuidelines={showGuidelines}
          snapToGuidelines={snapToGuidelines}
          onCursorMove={setCursorPos}
          freehandSmoothing={freehandSmoothing}
          currentFill={currentFill}
          currentOutline={currentOutline}
          isDark={isDark}
        />

        {/* Right VectorDraw Vertical Color Palette */}
        <ColorPalette
          onSetFill={handleSetFillColor}
          onSetOutline={handleSetOutlineColor}
          currentFill={selectedObject ? selectedObject.fill : currentFill}
          currentOutline={selectedObject ? selectedObject.stroke : currentOutline}
          onOpenCustomColor={() => setShowFillModal(true)}
          isDark={isDark}
        />

        {/* Right Collapsible Docker Panel */}
        {showDocker && (
          <DockersPanel
            objects={objects}
            selectedId={selectedId}
            onSelectObject={setSelectedId}
            onUpdateObject={handleUpdateObject}
            onDeleteObject={handleDeleteObject}
            onReorderObject={handleReorderObject}
            selectedNodeRef={selectedNodeRef}
            onSelectNode={setSelectedNodeRef}
            onMakeNodeCusp={handleMakeNodeCusp}
            onMakeNodeSmooth={handleMakeNodeSmooth}
            onMakeNodeSymmetrical={handleMakeNodeSymmetrical}
            onConvertSegmentToLine={handleConvertSegmentToLine}
            onConvertSegmentToCurve={handleConvertSegmentToCurve}
            onAlign={handleAlign}
            historySteps={history.map((h) => h.label)}
            historyIndex={historyIndex}
            onJumpToHistory={handleJumpToHistory}
            onClose={() => setShowDocker(false)}
            isDark={isDark}
          />
        )}
      </div>

      {/* 5. Bottom Status Bar */}
      <StatusBar
        selectedObject={selectedObject}
        selectedNodeRef={selectedNodeRef}
        cursorPos={cursorPos}
        unit={pageConfig.unit}
        zoom={viewport.zoom}
        onOpenFillModal={() => setShowFillModal(true)}
        onOpenOutlineModal={() => setShowOutlineModal(true)}
        isDark={isDark}
      />

      {/* Modals */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        isDark={isDark}
      />

      <UniformFillModal
        isOpen={showFillModal}
        onClose={() => setShowFillModal(false)}
        currentFill={selectedObject ? selectedObject.fill : currentFill}
        onApplyFill={handleSetFillColor}
        isDark={isDark}
      />

      <OutlinePenModal
        isOpen={showOutlineModal}
        onClose={() => setShowOutlineModal(false)}
        currentOutline={selectedObject ? selectedObject.stroke : currentOutline}
        currentWidth={selectedObject ? selectedObject.strokeWidth : 1.5}
        currentDash={selectedObject?.strokeDash || 'solid'}
        onApplyOutline={(color, width, dash) => {
          setCurrentOutline(color);
          if (selectedObject) {
            handleUpdateObject(
              {
                ...selectedObject,
                stroke: color,
                strokeWidth: width,
                strokeDash: dash,
              },
              'Outline Pen (F12)'
            );
          }
        }}
        isDark={isDark}
      />
    </div>
  );
}

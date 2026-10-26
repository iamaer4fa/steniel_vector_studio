import React from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Upload,
  Undo2,
  Redo2,
  Scissors,
  Copy,
  Clipboard,
  Maximize,
  Magnet,
  AlignCenter,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StandardToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onImportSvg: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onZoomToPage: () => void;
  snapToGuidelines: boolean;
  onToggleSnap: () => void;
  onCenterToPage: () => void;
  toggleDocker: () => void;
  showDocker: boolean;
  isDark: boolean;
}

export const StandardToolbar: React.FC<StandardToolbarProps> = ({
  onNew,
  onOpen,
  onSave,
  onImportSvg,
  onExportSvg,
  onExportPng,
  onCut,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasSelection,
  zoom,
  onZoomChange,
  onZoomToPage,
  snapToGuidelines,
  onToggleSnap,
  onCenterToPage,
  toggleDocker,
  showDocker,
  isDark,
}) => {
  return (
    <div className={`flex items-center h-9 px-2 gap-1 border-b select-none text-xs ${
      isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
    }`}>
      {/* File Operations */}
      <button
        onClick={onNew}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        title="New (Ctrl+N)"
      >
        <FileText className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onOpen}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        title="Open Project (Ctrl+O)"
      >
        <FolderOpen className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onSave}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        title="Save Project (Ctrl+S)"
      >
        <Save className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Import / Export */}
      <button
        onClick={onImportSvg}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        title="Import SVG / File (Ctrl+I)"
      >
        <Upload className="w-3.5 h-3.5 text-blue-500" />
      </button>
      <button
        onClick={onExportSvg}
        className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors shadow-xs"
        title="Export SVG (Ctrl+E)"
      >
        <Download className="w-3 h-3" />
        <span>Export SVG</span>
      </button>
      <button
        onClick={onExportPng}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-[11px]"
        title="Export PNG"
      >
        PNG
      </button>

      <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Clipboard */}
      <button
        onClick={onCut}
        disabled={!hasSelection}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
        title="Cut (Ctrl+X)"
      >
        <Scissors className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onCopy}
        disabled={!hasSelection}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
        title="Copy (Ctrl+C)"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onPaste}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        title="Paste (Ctrl+V)"
      >
        <Clipboard className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Undo / Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Zoom selector */}
      <div className="flex items-center gap-1">
        <select
          value={Math.round(zoom * 100)}
          onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
          className={`h-6 px-1.5 text-[11px] rounded border font-mono ${
            isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-300 text-neutral-800'
          }`}
        >
          <option value="25">25%</option>
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="100">100%</option>
          <option value="125">125%</option>
          <option value="150">150%</option>
          <option value="200">200%</option>
          <option value="300">300%</option>
        </select>
        <button
          onClick={onZoomToPage}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Zoom to Page (Shift+F4)"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Quick VectorDraw Alignment & Snapping */}
      <button
        onClick={onCenterToPage}
        disabled={!hasSelection}
        className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
        title="Center to Page (P)"
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onToggleSnap}
        className={`p-1.5 rounded transition-colors ${
          snapToGuidelines ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
        }`}
        title="Snap to Guidelines (Alt+Z)"
      >
        <Magnet className="w-3.5 h-3.5" />
      </button>

      <div className="flex-1" />

      {/* Right toggle for VectorDraw Dockers */}
      <button
        onClick={toggleDocker}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
          showDocker ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
        }`}
        title="Toggle Dockers (Objects, Inspector, Align)"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Dockers</span>
      </button>
    </div>
  );
};

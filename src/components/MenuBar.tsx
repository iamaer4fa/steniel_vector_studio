import React, { useState } from 'react';
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
  Trash2,
  CopyPlus,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  HelpCircle,
  Sun,
  Moon,
  Maximize,
  Compass,
} from 'lucide-react';
import { PageConfig, VectorObject } from '../types/corel';

interface MenuBarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onImportSvg: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSelectAll: () => void;
  onConvertToCurves: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAlign: (type: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY' | 'page') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToPage: () => void;
  onZoomToAll: () => void;
  onResetSample: () => void;
  onToggleShortcuts: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  showGuidelines: boolean;
  onToggleGuidelines: () => void;
  snapToGuidelines: boolean;
  onToggleSnap: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  hasSelection: boolean;
  isCurve: boolean;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNew,
  onOpen,
  onSave,
  onExportSvg,
  onExportPng,
  onImportSvg,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onSelectAll,
  onConvertToCurves,
  onBringToFront,
  onSendToBack,
  onAlign,
  onZoomIn,
  onZoomOut,
  onZoomToPage,
  onZoomToAll,
  onResetSample,
  onToggleShortcuts,
  showRulers,
  onToggleRulers,
  showGuidelines,
  onToggleGuidelines,
  snapToGuidelines,
  onToggleSnap,
  isDark,
  onToggleTheme,
  hasSelection,
  isCurve,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleAction = (callback: () => void) => {
    callback();
    setOpenMenu(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportSvg(e.target.files[0]);
    }
    setOpenMenu(null);
  };

  return (
    <div className={`relative flex items-center h-8 px-2 border-b select-none text-xs font-medium z-50 ${
      isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-800'
    }`}>
      {/* Brand Logo / Wordmark */}
      <div className="flex items-center gap-1.5 mr-4 font-bold tracking-tight text-emerald-600">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span className="text-[13px] text-neutral-900 dark:text-white">CorelDRAW</span>
        <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 rounded">Vector</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".svg,.json"
        className="hidden"
      />

      {/* Menus */}
      <div className="flex items-center space-x-0.5">
        {/* FILE MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            className={`px-2.5 py-1 rounded transition-colors ${
              openMenu === 'file' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black') : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div
              className={`absolute top-full left-0 mt-0.5 w-56 rounded-md shadow-xl border py-1 z-50 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                onClick={() => handleAction(onNew)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> New</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+N</span>
              </button>
              <button
                onClick={() => handleAction(onOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Open...</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+O</span>
              </button>
              <button
                onClick={() => handleAction(onSave)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> Save Project</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+S</span>
              </button>
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> Import SVG / File</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+I</span>
              </button>
              <button
                onClick={() => handleAction(onExportSvg)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Export to SVG</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+E</span>
              </button>
              <button
                onClick={() => handleAction(onExportPng)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Export to PNG (Bitmap)</span>
              </button>
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
              <button
                onClick={() => handleAction(onResetSample)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left text-emerald-600 dark:text-emerald-400"
              >
                <span className="flex items-center gap-2"><Compass className="w-3.5 h-3.5" /> Load Sample Vector Art</span>
              </button>
            </div>
          )}
        </div>

        {/* EDIT MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            className={`px-2.5 py-1 rounded transition-colors ${
              openMenu === 'edit' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black') : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
          >
            Edit
          </button>
          {openMenu === 'edit' && (
            <div
              className={`absolute top-full left-0 mt-0.5 w-56 rounded-md shadow-xl border py-1 z-50 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                onClick={() => handleAction(onUndo)}
                disabled={!canUndo}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><Undo2 className="w-3.5 h-3.5" /> Undo</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+Z</span>
              </button>
              <button
                onClick={() => handleAction(onRedo)}
                disabled={!canRedo}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><Redo2 className="w-3.5 h-3.5" /> Redo</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+Shift+Z</span>
              </button>
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
              <button
                onClick={() => handleAction(onCut)}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><Scissors className="w-3.5 h-3.5" /> Cut</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+X</span>
              </button>
              <button
                onClick={() => handleAction(onCopy)}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><Copy className="w-3.5 h-3.5" /> Copy</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+C</span>
              </button>
              <button
                onClick={() => handleAction(onPaste)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><Clipboard className="w-3.5 h-3.5" /> Paste</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+V</span>
              </button>
              <button
                onClick={() => handleAction(onDuplicate)}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><CopyPlus className="w-3.5 h-3.5" /> Duplicate</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+D</span>
              </button>
              <button
                onClick={() => handleAction(onDelete)}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40 text-red-600 dark:text-red-400"
              >
                <span className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</span>
                <span className="text-neutral-400 font-mono text-[11px]">Del</span>
              </button>
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
              <button
                onClick={() => handleAction(onSelectAll)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span>Select All Objects</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+A</span>
              </button>
            </div>
          )}
        </div>

        {/* VIEW MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            className={`px-2.5 py-1 rounded transition-colors ${
              openMenu === 'view' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black') : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
          >
            View
          </button>
          {openMenu === 'view' && (
            <div
              className={`absolute top-full left-0 mt-0.5 w-56 rounded-md shadow-xl border py-1 z-50 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                onClick={() => handleAction(onZoomIn)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><ZoomIn className="w-3.5 h-3.5" /> Zoom In</span>
                <span className="text-neutral-400 font-mono text-[11px]">F2 / +</span>
              </button>
              <button
                onClick={() => handleAction(onZoomOut)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><ZoomOut className="w-3.5 h-3.5" /> Zoom Out</span>
                <span className="text-neutral-400 font-mono text-[11px]">F3 / -</span>
              </button>
              <button
                onClick={() => handleAction(onZoomToPage)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5" /> Fit to Page</span>
                <span className="text-neutral-400 font-mono text-[11px]">Shift+F4</span>
              </button>
              <button
                onClick={() => handleAction(onZoomToAll)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><Maximize2 className="w-3.5 h-3.5" /> Zoom to All Objects</span>
                <span className="text-neutral-400 font-mono text-[11px]">F4</span>
              </button>
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
              <button
                onClick={() => handleAction(onToggleRulers)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span>{showRulers ? '✓ Show Rulers' : '  Show Rulers'}</span>
                <span className="text-neutral-400 font-mono text-[11px]">Shift+R</span>
              </button>
              <button
                onClick={() => handleAction(onToggleGuidelines)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span>{showGuidelines ? '✓ Show Guidelines' : '  Show Guidelines'}</span>
              </button>
              <button
                onClick={() => handleAction(onToggleSnap)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span>{snapToGuidelines ? '✓ Snap to Guidelines' : '  Snap to Guidelines'}</span>
                <span className="text-neutral-400 font-mono text-[11px]">Alt+Z</span>
              </button>
            </div>
          )}
        </div>

        {/* OBJECT MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('object')}
            className={`px-2.5 py-1 rounded transition-colors ${
              openMenu === 'object' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black') : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
          >
            Object
          </button>
          {openMenu === 'object' && (
            <div
              className={`absolute top-full left-0 mt-0.5 w-60 rounded-md shadow-xl border py-1 z-50 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                onClick={() => handleAction(onConvertToCurves)}
                disabled={!hasSelection || isCurve}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40 text-emerald-600 dark:text-emerald-400 font-medium"
              >
                <span>Convert to Curves</span>
                <span className="text-neutral-400 font-mono text-[11px]">Ctrl+Q</span>
              </button>
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-neutral-400">Order</div>
              <button
                onClick={() => handleAction(onBringToFront)}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>To Front of Page</span>
                <span className="text-neutral-400 font-mono text-[11px]">Shift+PgUp</span>
              </button>
              <button
                onClick={() => handleAction(onSendToBack)}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>To Back of Page</span>
                <span className="text-neutral-400 font-mono text-[11px]">Shift+PgDn</span>
              </button>
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-neutral-400">Align (Corel Shortcuts)</div>
              <button
                onClick={() => handleAction(() => onAlign('page'))}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>Center to Page</span>
                <span className="text-neutral-400 font-mono text-[11px]">P</span>
              </button>
              <button
                onClick={() => handleAction(() => onAlign('left'))}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>Align Left</span>
                <span className="text-neutral-400 font-mono text-[11px]">L</span>
              </button>
              <button
                onClick={() => handleAction(() => onAlign('right'))}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>Align Right</span>
                <span className="text-neutral-400 font-mono text-[11px]">R</span>
              </button>
              <button
                onClick={() => handleAction(() => onAlign('top'))}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>Align Top</span>
                <span className="text-neutral-400 font-mono text-[11px]">T</span>
              </button>
              <button
                onClick={() => handleAction(() => onAlign('bottom'))}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>Align Bottom</span>
                <span className="text-neutral-400 font-mono text-[11px]">B</span>
              </button>
              <button
                onClick={() => handleAction(() => onAlign('centerX'))}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>Center Horizontally</span>
                <span className="text-neutral-400 font-mono text-[11px]">C</span>
              </button>
              <button
                onClick={() => handleAction(() => onAlign('centerY'))}
                disabled={!hasSelection}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left disabled:opacity-40"
              >
                <span>Center Vertically</span>
                <span className="text-neutral-400 font-mono text-[11px]">E</span>
              </button>
            </div>
          )}
        </div>

        {/* HELP MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-2.5 py-1 rounded transition-colors ${
              openMenu === 'help' ? (isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black') : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
          >
            Help
          </button>
          {openMenu === 'help' && (
            <div
              className={`absolute top-full left-0 mt-0.5 w-60 rounded-md shadow-xl border py-1 z-50 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                onClick={() => handleAction(onToggleShortcuts)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" /> CorelDRAW Shortcuts</span>
                <span className="text-neutral-400 font-mono text-[11px]">F1</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleShortcuts}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="CorelDRAW Shortcuts (F1)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px]">Shortcuts</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="p-1 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-700" />}
        </button>
      </div>
    </div>
  );
};

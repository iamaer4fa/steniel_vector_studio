import React, { useState } from 'react';
import { X, Search, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface ShortcutItem {
  key: string;
  desc: string;
  category: 'Tools' | 'Node & Curve Editing' | 'Alignment' | 'Transform & Order' | 'View & Navigation';
}

const SHORTCUTS: ShortcutItem[] = [
  // Tools
  { key: 'Space', desc: 'Toggle Pick Tool', category: 'Tools' },
  { key: 'F10', desc: 'Shape Tool (Bézier Node Editing)', category: 'Tools' },
  { key: 'F5', desc: 'Freehand Drawing Tool', category: 'Tools' },
  { key: 'F6', desc: 'Rectangle Tool', category: 'Tools' },
  { key: 'F7', desc: 'Ellipse Tool', category: 'Tools' },
  { key: 'F8', desc: 'Text Tool', category: 'Tools' },
  { key: 'Y', desc: 'Polygon / Star Tool', category: 'Tools' },
  { key: 'G', desc: 'Interactive Fill Tool', category: 'Tools' },
  { key: 'Z', desc: 'Zoom Tool', category: 'Tools' },
  { key: 'H', desc: 'Pan Hand Tool', category: 'Tools' },

  // Node & Curve Editing
  { key: 'Ctrl + Q', desc: 'Convert Object to Curves', category: 'Node & Curve Editing' },
  { key: '+', desc: 'Add Node (or double-click curve segment)', category: 'Node & Curve Editing' },
  { key: '- / Del', desc: 'Delete Selected Node (or double-click node)', category: 'Node & Curve Editing' },
  { key: 'Drag Curve', desc: 'Directly bend curve segments in Shape Tool', category: 'Node & Curve Editing' },
  { key: 'Left Click Swatch', desc: 'Apply Fill Color', category: 'Node & Curve Editing' },
  { key: 'Right Click Swatch', desc: 'Apply Outline / Stroke Color', category: 'Node & Curve Editing' },

  // Alignment
  { key: 'P', desc: 'Center selected object(s) to Page', category: 'Alignment' },
  { key: 'L', desc: 'Align Left', category: 'Alignment' },
  { key: 'R', desc: 'Align Right', category: 'Alignment' },
  { key: 'T', desc: 'Align Top', category: 'Alignment' },
  { key: 'B', desc: 'Align Bottom', category: 'Alignment' },
  { key: 'C', desc: 'Align Centers Horizontally', category: 'Alignment' },
  { key: 'E', desc: 'Align Centers Vertically', category: 'Alignment' },

  // Transform & Order
  { key: 'Ctrl + D', desc: 'Duplicate Object with offset', category: 'Transform & Order' },
  { key: 'Ctrl + A', desc: 'Select All Objects', category: 'Transform & Order' },
  { key: 'Ctrl + Z', desc: 'Undo', category: 'Transform & Order' },
  { key: 'Ctrl + Shift + Z', desc: 'Redo', category: 'Transform & Order' },
  { key: 'Shift + PgUp', desc: 'Bring to Front of Page', category: 'Transform & Order' },
  { key: 'Shift + PgDn', desc: 'Send to Back of Page', category: 'Transform & Order' },
  { key: 'Ctrl + PgUp', desc: 'Bring Forward one level', category: 'Transform & Order' },
  { key: 'Ctrl + PgDn', desc: 'Send Backward one level', category: 'Transform & Order' },

  // View & Dialogs
  { key: 'Shift + F4', desc: 'Zoom to Page', category: 'View & Navigation' },
  { key: 'F4', desc: 'Zoom to All Objects', category: 'View & Navigation' },
  { key: 'F2', desc: 'Zoom In', category: 'View & Navigation' },
  { key: 'F3', desc: 'Zoom Out', category: 'View & Navigation' },
  { key: 'F12', desc: 'Outline Pen Dialog', category: 'View & Navigation' },
  { key: 'Shift + F11', desc: 'Uniform Fill Dialog', category: 'View & Navigation' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = SHORTCUTS.filter(
    (s) =>
      s.key.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(filtered.map((s) => s.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/15 text-emerald-600 dark:text-emerald-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">CorelDRAW Keyboard Shortcuts</h3>
              <p className="text-xs text-neutral-500">Native key bindings matching CorelDRAW suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shortcuts by key or function..."
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs border ${
                isDark
                  ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-emerald-500'
                  : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-emerald-500'
              } outline-hidden`}
              autoFocus
            />
          </div>
        </div>

        {/* Shortcuts list grouped by category */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {cat}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filtered
                  .filter((s) => s.category === cat)
                  .map((s, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-lg border ${
                        isDark ? 'bg-neutral-800/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200/80'
                      }`}
                    >
                      <span className="text-xs text-neutral-700 dark:text-neutral-300">{s.desc}</span>
                      <kbd className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700 font-mono text-[11px] font-semibold text-neutral-900 dark:text-white shadow-2xs">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-xs text-neutral-500 rounded-b-xl">
          <span>Tip: Press <kbd className="font-mono font-semibold">F10</kbd> to enter Shape mode and edit any curve nodes</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

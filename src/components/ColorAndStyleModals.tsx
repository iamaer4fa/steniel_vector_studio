import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { COREL_PALETTE } from '../utils/sampleData';

interface FillModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFill: string;
  onApplyFill: (color: string) => void;
  isDark: boolean;
}

export const UniformFillModal: React.FC<FillModalProps> = ({
  isOpen,
  onClose,
  currentFill,
  onApplyFill,
  isDark,
}) => {
  const [selectedColor, setSelectedColor] = useState(
    currentFill === 'none' ? '#2563EB' : currentFill
  );
  const [isNone, setIsNone] = useState(currentFill === 'none');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl flex flex-col border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <span className="font-bold text-sm">Uniform Fill (Shift+F11)</span>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Preview & Hex */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg border-2 border-neutral-400 shadow-inner"
              style={{
                backgroundColor: isNone ? 'transparent' : selectedColor,
                backgroundImage: isNone
                  ? 'linear-gradient(45deg, #ef4444 50%, transparent 50%)'
                  : 'none',
              }}
            />
            <div className="flex-1 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNone}
                  onChange={(e) => setIsNone(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-medium">No Fill (Transparent)</span>
              </label>

              {!isNone && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 font-mono">Hex:</span>
                  <input
                    type="color"
                    value={selectedColor.startsWith('#') ? selectedColor : '#2563EB'}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className={`w-28 px-2 py-1 rounded border font-mono text-xs ${
                      isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick CorelDRAW Palette Swatches */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase">
              Corel Palette Swatches
            </div>
            <div className="grid grid-cols-10 gap-1.5 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              {COREL_PALETTE.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (c.hex === 'none') {
                      setIsNone(true);
                    } else {
                      setIsNone(false);
                      setSelectedColor(c.hex);
                    }
                  }}
                  className="w-6 h-6 rounded-xs border border-black/20 hover:scale-110 transition-transform relative"
                  style={{ backgroundColor: c.hex === 'none' ? '#ffffff' : c.hex }}
                  title={c.name}
                >
                  {c.hex === 'none' && (
                    <div className="w-full h-full relative">
                      <span className="absolute inset-0 border-t border-red-500 rotate-45" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyFill(isNone ? 'none' : selectedColor);
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs"
          >
            Apply Fill
          </button>
        </div>
      </div>
    </div>
  );
};

interface OutlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOutline: string;
  currentWidth: number;
  currentDash?: string;
  onApplyOutline: (color: string, width: number, dash: string) => void;
  isDark: boolean;
}

export const OutlinePenModal: React.FC<OutlineModalProps> = ({
  isOpen,
  onClose,
  currentOutline,
  currentWidth,
  currentDash = 'solid',
  onApplyOutline,
  isDark,
}) => {
  const [selectedColor, setSelectedColor] = useState(
    currentOutline === 'none' ? '#000000' : currentOutline
  );
  const [width, setWidth] = useState(currentWidth || 1);
  const [dash, setDash] = useState(currentDash || 'solid');
  const [isNone, setIsNone] = useState(currentOutline === 'none');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl flex flex-col border ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <span className="font-bold text-sm">Outline Pen (F12)</span>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isNone}
              onChange={(e) => setIsNone(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0"
            />
            <span className="font-medium">No Outline (None)</span>
          </label>

          {!isNone && (
            <>
              {/* Color & Width */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-neutral-500 font-medium">Color:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedColor.startsWith('#') ? selectedColor : '#000000'}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className={`w-20 px-2 py-1 rounded border font-mono text-xs ${
                        isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-neutral-500 font-medium">Width (points):</span>
                  <select
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className={`w-full px-2 py-1.5 rounded border text-xs font-mono ${
                      isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300'
                    }`}
                  >
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
                  </select>
                </div>
              </div>

              {/* Style: Solid, Dashed, Dotted */}
              <div className="space-y-1.5">
                <span className="text-neutral-500 font-medium">Line Style:</span>
                <div className="grid grid-cols-3 gap-2">
                  {['solid', 'dashed', 'dotted'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setDash(st)}
                      className={`px-3 py-2 rounded-lg border capitalize text-xs font-medium transition-colors ${
                        dash === st
                          ? 'border-emerald-600 bg-emerald-600/10 text-emerald-600 font-bold'
                          : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyOutline(isNone ? 'none' : selectedColor, isNone ? 0 : width, dash);
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs"
          >
            Apply Outline
          </button>
        </div>
      </div>
    </div>
  );
};

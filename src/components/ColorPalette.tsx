import React, { useState } from 'react';
import { VECTORDRAW_PALETTE } from '../utils/sampleData';
import { Palette, ChevronUp, ChevronDown } from 'lucide-react';

interface ColorPaletteProps {
  onSetFill: (color: string) => void;
  onSetOutline: (color: string) => void;
  currentFill: string;
  currentOutline: string;
  onOpenCustomColor: () => void;
  isDark: boolean;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  onSetFill,
  onSetOutline,
  currentFill,
  currentOutline,
  onOpenCustomColor,
  isDark,
}) => {
  const [hoveredColor, setHoveredColor] = useState<{ name: string; hex: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, hex: string) => {
    e.preventDefault();
    onSetOutline(hex);
  };

  return (
    <div className={`w-8 border-l flex flex-col items-center py-1 select-none z-10 shrink-0 ${
      isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
    }`}>
      {/* Top hint or custom color button */}
      <button
        onClick={onOpenCustomColor}
        className="w-6 h-6 mb-1 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
        title="Color Mixer / Palette Picker"
      >
        <Palette className="w-3.5 h-3.5" />
      </button>

      {/* Vertical Swatch Strip */}
      <div className="flex-1 w-full flex flex-col items-center gap-0.5 overflow-y-auto overflow-x-hidden no-scrollbar px-1">
        {VECTORDRAW_PALETTE.map((color, idx) => {
          const isNone = color.hex === 'none';
          const isCurrentFill = currentFill.toLowerCase() === color.hex.toLowerCase();
          const isCurrentOutline = currentOutline.toLowerCase() === color.hex.toLowerCase();

          return (
            <div
              key={idx}
              className="relative group w-full flex justify-center"
              onMouseEnter={() => setHoveredColor(color)}
              onMouseLeave={() => setHoveredColor(null)}
            >
              <button
                onClick={() => onSetFill(color.hex)}
                onContextMenu={(e) => handleContextMenu(e, color.hex)}
                className={`w-5 h-5 rounded-xs transition-transform hover:scale-110 relative ${
                  isNone ? 'border border-neutral-300 dark:border-neutral-600 bg-white' : 'border border-black/10'
                } ${isCurrentFill ? 'ring-1 ring-emerald-500 z-10' : ''}`}
                style={{
                  backgroundColor: isNone ? '#ffffff' : color.hex,
                }}
                title={`${color.name}\n• Left-click: Set Fill\n• Right-click: Set Outline`}
              >
                {isNone && (
                  <svg className="w-full h-full text-red-500" viewBox="0 0 20 20">
                    <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                )}
                {isCurrentFill && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  </span>
                )}
                {isCurrentOutline && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 border border-black" />
                )}
              </button>

              {/* Tooltip on left */}
              <div className="absolute right-full top-0 mr-2 hidden group-hover:flex flex-col px-2 py-1 rounded bg-neutral-950 text-white text-[11px] whitespace-nowrap shadow-xl z-50 pointer-events-none">
                <span className="font-semibold text-white">{color.name}</span>
                <span className="font-mono text-[10px] text-neutral-400 uppercase">{color.hex}</span>
                <div className="text-[10px] text-emerald-400 mt-0.5">
                  Left-click: Fill · Right-click: Outline
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

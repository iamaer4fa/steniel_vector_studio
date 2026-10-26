import React from 'react';
import {
  MousePointer,
  Spline,
  ZoomIn,
  Hand,
  Pencil,
  PenTool,
  Square,
  Circle,
  Star,
  Type,
  Paintbrush,
  Pipette,
} from 'lucide-react';
import { ToolType } from '../types/vectordraw';

interface ToolboxProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  isDark: boolean;
}

interface ToolDefinition {
  id: ToolType;
  name: string;
  shortcut: string;
  icon: React.ReactNode;
  isHighlighted?: boolean;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  activeTool,
  onSelectTool,
  isDark,
}) => {
  const tools: ToolDefinition[] = [
    {
      id: 'pick',
      name: 'Pick Tool',
      shortcut: 'Space',
      icon: <MousePointer className="w-4 h-4" />,
    },
    {
      id: 'shape',
      name: 'Shape Tool (Node Editing)',
      shortcut: 'F10',
      icon: <Spline className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      isHighlighted: true,
    },
    {
      id: 'zoom',
      name: 'Zoom Tool',
      shortcut: 'Z',
      icon: <ZoomIn className="w-4 h-4" />,
    },
    {
      id: 'pan',
      name: 'Pan Hand Tool',
      shortcut: 'H',
      icon: <Hand className="w-4 h-4" />,
    },
    {
      id: 'freehand',
      name: 'Freehand Tool',
      shortcut: 'F5',
      icon: <Pencil className="w-4 h-4" />,
    },
    {
      id: 'pen',
      name: 'Bézier / Pen Tool',
      shortcut: 'P',
      icon: <PenTool className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'rectangle',
      name: 'Rectangle Tool',
      shortcut: 'F6',
      icon: <Square className="w-4 h-4" />,
    },
    {
      id: 'ellipse',
      name: 'Ellipse Tool',
      shortcut: 'F7',
      icon: <Circle className="w-4 h-4" />,
    },
    {
      id: 'polygon',
      name: 'Polygon / Star Tool',
      shortcut: 'Y',
      icon: <Star className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'text',
      name: 'Text Tool',
      shortcut: 'F8',
      icon: <Type className="w-4 h-4" />,
    },
    {
      id: 'interactive-fill',
      name: 'Interactive Fill Tool',
      shortcut: 'G',
      icon: <Paintbrush className="w-4 h-4" />,
    },
    {
      id: 'eyedropper',
      name: 'Color Eyedropper',
      shortcut: 'I',
      icon: <Pipette className="w-4 h-4" />,
    },
  ];

  return (
    <div className={`w-10 border-r flex flex-col items-center py-2 gap-1 select-none z-10 shrink-0 ${
      isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
    }`}>
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <div key={tool.id} className="relative group">
            <button
              onClick={() => onSelectTool(tool.id)}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors relative ${
                isActive
                  ? isDark
                    ? 'bg-neutral-800 text-white shadow-inner ring-1 ring-emerald-500/50'
                    : 'bg-white text-black shadow-xs ring-1 ring-emerald-500/50'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
              title={`${tool.name} (${tool.shortcut})`}
            >
              {tool.icon}
              {/* VectorDraw tiny corner arrow for flyout indicator */}
              <span className="absolute bottom-0.5 right-0.5 w-0 h-0 border-b-3 border-r-3 border-t-0 border-l-0 border-b-neutral-400 border-r-neutral-400 dark:border-b-neutral-600 dark:border-r-neutral-600" />
            </button>

            {/* Custom Tooltip */}
            <div className="absolute left-full top-0 ml-2 hidden group-hover:flex items-center gap-2 px-2 py-1 rounded bg-neutral-950 text-white text-[11px] whitespace-nowrap shadow-lg z-50 pointer-events-none">
              <span>{tool.name}</span>
              <span className="px-1 py-0.5 bg-neutral-800 rounded font-mono text-[10px] text-emerald-400">
                {tool.shortcut}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

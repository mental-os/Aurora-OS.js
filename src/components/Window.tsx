import { memo } from 'react';
import { Maximize2 } from 'lucide-react';
import { Rnd } from 'react-rnd';
import type { WindowState } from '../hooks/useWindowManager';
import { useAppContext } from './AppContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { cn } from './ui/utils';

interface WindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onUpdateState: (updates: Partial<WindowState>) => void;
  isFocused: boolean;
  bounds?: string;
}

function WindowComponent({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdateState,
  isFocused,
  bounds
}: WindowProps) {
  const { titleBarBackground } = useThemeColors();
  const { disableShadows } = useAppContext();

  // Calculate position/size based on state
  const x = window.isMaximized ? 0 : window.position.x;
  const y = window.isMaximized ? 28 : window.position.y;
  const width = window.isMaximized ? '100vw' : window.size.width;
  const height = window.isMaximized ? 'calc(100vh - 28px)' : window.size.height;

  // Calculate target position for minimize animation
  const getMinimizeTarget = () => {
    if (typeof document !== 'undefined') {
      const dock = document.getElementById('dock-main');
      if (dock) {
        const rect = dock.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
    }
    // Fallback
    return {
      x: 48,
      y: typeof globalThis !== 'undefined' ? globalThis.innerHeight / 2 : 500
    };
  };

  const minimizeTarget = window.isMinimized ? (() => {
    const target = getMinimizeTarget();
    // We need to center the window relative to the target point.
    // Since we are not changing the width/height of the Rnd container (perf optimization),
    // we must subtract half the window size from the target coordinates
    // so that the center of the window aligns with the target.
    const currentWidth = window.isMaximized ? (typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1000) : window.size.width;
    const currentHeight = window.isMaximized ? (typeof globalThis !== 'undefined' ? globalThis.innerHeight - 28 : 800) : window.size.height;

    return {
      x: target.x - currentWidth / 2,
      y: target.y - currentHeight / 2
    };
  })() : { x: 0, y: 0 };

  return (
    <Rnd
      size={{ width, height }}
      position={{
        x: window.isMinimized ? minimizeTarget.x : x,
        y: window.isMinimized ? minimizeTarget.y : y
      }}
      bounds={bounds}
      onDragStop={(_e, d) => {
        onUpdateState({ position: { x: d.x, y: d.y } });
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        onUpdateState({
          size: {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height)
          },
          position: position
        });
      }}
      minWidth={window.isMinimized ? 0 : 300}
      minHeight={window.isMinimized ? 0 : 200}
      dragHandleClassName="window-title-bar"
      disableDragging={window.isMaximized || window.isMinimized}
      enableResizing={!window.isMaximized && !window.isMinimized}
      onMouseDown={onFocus}
      style={{
        zIndex: window.zIndex,
        display: 'flex',
        flexDirection: 'column',
        // Transition for smooth maximize/minimize if we want manual CSS transitions
        transition: window.isMaximized || window.isMinimized ? 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
        // Start minimized styles
        pointerEvents: window.isMinimized ? 'none' : 'auto',
      }}
      className="absolute"
    >
      <div
        className={cn(
          "w-full h-full flex flex-col overflow-hidden transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "rounded-xl border border-white/20",
          !disableShadows && "shadow-2xl",
          (!isFocused && !window.isMinimized) && "brightness-75 saturate-50"
        )}
        style={{
          background: !isFocused ? '#171717' : undefined,
          opacity: window.isMinimized ? 0 : 1,
          transform: window.isMinimized ? 'scale(0)' : 'scale(1)',
        }}
      >
        {/* Title Bar */}
        <div
          className="window-title-bar h-11 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 cursor-move select-none shrink-0"
          style={{ background: titleBarBackground }}
        >
          <div className="flex items-center gap-2 " onMouseDown={(e) => e.stopPropagation()}>
            {/* stopPropagation on controls so they don't trigger drag if clicked */}
            <button
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              onClick={onClose}
            />
            <button
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
              onClick={onMinimize}
            />
            <button
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
              onClick={onMaximize}
            />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-sm text-white/80 pointer-events-none">
            {window.title}
          </div>

          <div className="window-controls opacity-0 pointer-events-none">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Content */}
        {/* We allow propagation so checking clicks on content triggers Rnd's onMouseDown={onFocus} */}
        <div className="flex-1 overflow-auto cursor-default">
          {window.content}
        </div>
      </div>
    </Rnd>
  );
}

export const Window = memo(WindowComponent);
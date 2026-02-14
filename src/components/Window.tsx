import React, {
  memo,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Maximize2 } from "lucide-react";
import { Rnd } from "react-rnd";
import type { WindowState } from "../hooks/useWindowManager";
import { useAppContext } from "./AppContext";
import { WindowContext } from "./WindowContext";
import { useThemeColors } from "../hooks/useThemeColors";
import { cn } from "./ui/utils";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "./ui/context-menu";
import { renderContextMenuItems } from "./ui/context-menu-utils";
import { getApp } from "../config/appRegistry";
import { useI18n } from "../i18n";

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
  bounds,
}: WindowProps) {
  const { titleBarBackground, accentColor } = useThemeColors();
  const { disableShadows, reduceMotion, blurEnabled, gpuEnabled } = useAppContext();
  const { t } = useI18n();
  const appConfig = getApp(window.type);
  const contextMenuConfig = appConfig?.contextMenu;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false); // Added state for smooth resizing
  const [beforeClose, setBeforeClose] = useState<
    (() => boolean | Promise<boolean>) | null
  >(null);

  // Drag threshold refs
  const dragRef = useRef<{
    startX: number;
    startY: number;
    timer: NodeJS.Timeout | null;
  }>({ startX: 0, startY: 0, timer: null });

  // Stabilize onClose using ref to prevent context churn if parent passes inline function
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleClose = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();

      // Check local handler
      if (beforeClose) {
        const canClose = await beforeClose();
        if (!canClose) return;
      }
      // Call latest prop
      onCloseRef.current();
    },
    [beforeClose],
  ); // Depend on beforeClose state

  // Context value must be stable to prevent consumer (Notepad) useEffect from looping
  const windowContextValue = useMemo(
    () => ({
      setBeforeClose,
      forceClose: () => onCloseRef.current(),
      data: window.data,
    }),
    [window.data],
  ); // Re-create if data changes

  // ... (rest of the file until return)

  // Calculate position/size based on state
  // Calculate explicit dimensions for maximized state to ensure Rnd handles it correctly
  // Use globalThis to avoid shadowing the 'window' prop
  const maximizeWidth =
    typeof globalThis !== "undefined" ? globalThis.innerWidth : 1000;
  // Fixed: Removed the extra 2px safety margin so it touches the bottom (30 -> 28)
  const maximizeHeight =
    typeof globalThis !== "undefined" ? globalThis.innerHeight - 28 : 800;

  const x = window.isMaximized ? 0 : window.position.x;
  const y = window.isMaximized ? 28 : window.position.y;
  const width = window.isMaximized ? maximizeWidth : window.size.width;
  const height = window.isMaximized ? maximizeHeight : window.size.height;

  // Optimization: Cache dock position to verify layout thrashing
  const [dockCenter, setDockCenter] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updateDockPosition = () => {
      const dock = document.getElementById('dock-main');
      if (dock) {
        const rect = dock.getBoundingClientRect();
        setDockCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    };

    // Update on mount and resize
    // Update on mount and resize
    // Observer for Dock Size Changes
    let dockObserver: ResizeObserver | null = null;
    const dock = document.getElementById('dock-main');
    
    if (dock) {
      dockObserver = new ResizeObserver(() => {
        updateDockPosition();
      });
      dockObserver.observe(dock);
    }

    globalThis.addEventListener('resize', updateDockPosition);
    return () => {
      globalThis.removeEventListener('resize', updateDockPosition);
      if (dockObserver) dockObserver.disconnect();
    };
  }, []);

  const minimizeTarget = useMemo(() => {
    if (!window.isMinimized) return { x: 0, y: 0 };

    // Use cached dock center or fallback
    const target = dockCenter || {
      x: 48, // Default fallback position (approx sidebar)
      y: typeof globalThis !== 'undefined' ? globalThis.innerHeight / 2 : 500
    };

    const winWidth = window.isMaximized ? (typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1000) : window.size.width;
    const winHeight = window.isMaximized ? (typeof globalThis !== 'undefined' ? globalThis.innerHeight - 28 : 800) : window.size.height;

    return {
      x: target.x - winWidth / 2,
      y: target.y - winHeight / 2
    };
  }, [window.isMinimized, window.isMaximized, window.size, dockCenter]);

  const getTransform = () => {
    if (window.isMinimized) return "scale(0)";
    if (window.isMaximized) return "scale(1)";
    // Lift effect while dragging (if motion enabled)
    return isDragging && !reduceMotion ? "scale(1.02)" : "scale(1)";
  };

  const clearDragTimer = () => {
    if (dragRef.current.timer) {
      clearTimeout(dragRef.current.timer);
      dragRef.current.timer = null;
    }
  };

  // Optimization: specific state to delay "content-visibility" until animation finishes
  const [isHibernated, setIsHibernated] = useState(false);

  // Derived state: Reset hibernation immediately when window is restored
  if (!window.isMinimized && isHibernated) {
    setIsHibernated(false);
  }

  useEffect(() => {
    if (window.isMinimized) {
      const timer = setTimeout(() => setIsHibernated(true), 300);
      return () => clearTimeout(timer);
    }
  }, [window.isMinimized]);

  return (
    <Rnd
      size={{ width, height }}
      position={{
        x: window.isMinimized ? minimizeTarget.x : x,
        y: window.isMinimized ? minimizeTarget.y : y,
      }}
      bounds={bounds}
      cancel=".no-drag" // Add cancel prop to prevent dragging on specific elements
      onDragStart={(_e, d) => {
        // Don't set isDragging immediately to avoiding "lift" on click
        dragRef.current.startX = d.x;
        dragRef.current.startY = d.y;

        // If held for 150ms, assume intention to drag
        dragRef.current.timer = setTimeout(() => {
          setIsDragging(true);
        }, 150);
      }}
      onDrag={(_e, d) => {
        if (!isDragging) {
          const dx = Math.abs(d.x - dragRef.current.startX);
          const dy = Math.abs(d.y - dragRef.current.startY);
          // Threshold of 5px to trigger visual lift
          if (dx > 5 || dy > 5) {
            clearDragTimer();
            setIsDragging(true);
          }
        }
      }}
      onDragStop={(_e, d) => {
        clearDragTimer();
        setIsDragging(false);
        onUpdateState({ position: { x: d.x, y: d.y } });
      }}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        setIsResizing(false);
        onUpdateState({
          size: {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          },
          position: position,
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
        display: "flex",
        flexDirection: "column",
        // Update transition logic: Only disable transition when user is actively dragging or resizing
        transition:
          isDragging || isResizing
            ? "none"
            : "all 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        pointerEvents: window.isMinimized ? "none" : "auto",
        // Optimization: Skip rendering layout/paint for minimized windows AFTER animation
        contentVisibility: isHibernated ? "hidden" : "visible",
        // Fix: Allow overflow so scale transforms don't get clipped during drag (FOCUSED only)
        // Optimization: Apply strict containment to UNFOCUSED windows to stop layout thrashing
        // If GPU is disabled, we might want to be even more aggressive, but strict is already max isolation.
        contain: isFocused ? "none" : "strict",
        overflow: isFocused ? "visible" : "hidden",
        // Optimization: Hint to browser to promote to layer when dragging (Only if GPU enabled)
        willChange: (isDragging && gpuEnabled) ? "transform" : "auto",
      }}
      className="absolute"
    >
      <div
        className={cn(
          "w-full h-full flex flex-col overflow-hidden",
          "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "rounded-xl border",
          window.owner !== "root" && "border-white/20",
          !disableShadows && isFocused && gpuEnabled && "shadow-2xl", // Optimization: GPU check
          !isFocused && !window.isMinimized && "brightness-75 saturate-50",
          isDragging &&
            !disableShadows &&
            gpuEnabled &&
            "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]",
        )}
        style={{
          borderColor:
            window.owner === "root"
              ? isFocused
                ? accentColor
                : `${accentColor}80`
              : undefined,
          // Optimization: Solid dark background for unfocused windows (saves GPU)
          background: !isFocused ? "#171717" : undefined, 
          opacity: window.isMinimized ? 0 : 1,
          transform: getTransform(),
          // Optimization: Only apply expensive blur to the FOCUSED window AND if GPU is enabled
          backdropFilter: (blurEnabled && isFocused && gpuEnabled)
            ? isDragging
              ? "blur(20px)"
              : "blur(12px)"
            : "none",
        }}
      >
        {/* Title Bar */}
        <div
          className={cn(
            "window-title-bar h-11 border-b border-white/10 flex items-center justify-between px-4 cursor-move select-none shrink-0",
          )}
          style={{ background: titleBarBackground }}
        >
          <div
            className="flex items-center gap-2 no-drag" // Add no-drag class here
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()} // Add pointer event stop
          >
            {/* stopPropagation on controls */}
            <button
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              onClick={handleClose}
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
        <div
          className="flex-1 overflow-auto cursor-default"
          style={{ pointerEvents: isDragging ? "none" : "auto" }}
        >
          <WindowContext.Provider value={windowContextValue}>
            {contextMenuConfig ? (
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="h-full w-full">
                    {React.isValidElement(window.content) ? (
                      React.cloneElement(
                        window.content as React.ReactElement<any>,
                        // eslint-disable-next-line
                        {
                          id: window.id,
                          // Use handleClose which is the useCallback wrapper
                          onClose: (e?: any) => handleClose(e),
                        },
                      )
                    ) : (
                      window.content
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {renderContextMenuItems(
                    contextMenuConfig.items,
                    t,
                    appConfig?.name || window.title,
                    window.id,
                  )}
                </ContextMenuContent>
              </ContextMenu>
            ) : React.isValidElement(window.content) ? (
              React.cloneElement(window.content as React.ReactElement<any>, 
                // eslint-disable-next-line
                {
                  id: window.id,
                  onClose: (e?: any) => handleClose(e),
                }
              )
            ) : (
              window.content
            )}
          </WindowContext.Provider>
        </div>
      </div>
    </Rnd>
  );
}

export const Window = memo(WindowComponent);

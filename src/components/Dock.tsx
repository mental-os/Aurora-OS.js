import { Trash, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useMemo, memo } from 'react';
import type { WindowState } from '../hooks/useWindowManager';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAppContext } from './AppContext';
import { useFileSystem } from './FileSystemContext';
import { cn } from './ui/utils';
import { getDockApps } from '../config/appRegistry';

interface DockProps {
  onOpenApp: (appType: string, data?: any) => void;
  onRestoreWindow: (windowId: string) => void;
  onFocusWindow: (windowId: string) => void;
  windows: WindowState[];
}

function DockComponent({ onOpenApp, onRestoreWindow, onFocusWindow, windows }: DockProps) {
  const { dockBackground, blurStyle } = useThemeColors();
  const { reduceMotion, disableShadows, disableGradients, accentColor, devMode } = useAppContext();
  const { getNodeAtPath, homePath, installedApps } = useFileSystem();

  const trashNode = getNodeAtPath(`${homePath}/.Trash`);
  const isTrashEmpty = !trashNode?.children || trashNode.children.length === 0;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shouldHide, setShouldHide] = useState(false);

  // Get visible apps based on installed apps
  const visibleApps = useMemo(() => {
    const apps = getDockApps(installedApps);

    // Add DevCenter if in dev mode and it's installed
    if (devMode && installedApps.has('dev-center')) {
      // DevCenter is already in the registry, just verify it's included
    }

    return apps;
  }, [installedApps, devMode]);

  // Group windows by app type
  const windowsByApp = useMemo(() => {
    const map: Record<string, WindowState[]> = {};
    windows.forEach(w => {
      const appType = w.id.split('-')[0];
      if (!map[appType]) map[appType] = [];
      map[appType].push(w);
    });
    return map;
  }, [windows]);

  // Memoize intersection calculation
  const hasIntersection = useMemo(() => {
    const hasMaximizedWindow = windows.some(w => w.isMaximized && !w.isMinimized);

    if (hasMaximizedWindow) {
      return true;
    }

    const dockBounds = {
      left: 16,
      right: 80,
      top: window.innerHeight / 2 - 300,
      bottom: window.innerHeight / 2 + 300,
    };

    return windows.some(w => {
      if (w.isMinimized) return false;

      const windowBounds = w.isMaximized
        ? { left: 0, right: window.innerWidth, top: 28, bottom: window.innerHeight }
        : {
          left: w.position.x,
          right: w.position.x + w.size.width,
          top: w.position.y,
          bottom: w.position.y + w.size.height,
        };

      return !(
        windowBounds.right < dockBounds.left ||
        windowBounds.left > dockBounds.right ||
        windowBounds.bottom < dockBounds.top ||
        windowBounds.top > dockBounds.bottom
      );
    });
  }, [windows]);

  useEffect(() => {
    setShouldHide(hasIntersection);
  }, [hasIntersection]);

  // Handle dock icon click - macOS behavior
  // Hold Alt/Option to force open a new window
  const handleAppClick = (appId: string, e: React.MouseEvent) => {
    const appWindows = windowsByApp[appId] || [];

    // Alt/Option key - always open new window
    if (e.altKey) {
      onOpenApp(appId);
      return;
    }

    if (appWindows.length === 0) {
      // No windows open - open new window
      onOpenApp(appId);
    } else {
      const minimizedWindows = appWindows.filter(w => w.isMinimized);
      const visibleWindows = appWindows.filter(w => !w.isMinimized);

      // Find the global top window to check if this app is currently focused
      const globalTopWindow = windows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, windows[0]);
      const isAppFocused = globalTopWindow && globalTopWindow.id.startsWith(appId);

      if (minimizedWindows.length > 0) {
        // If app is focused and has minimized windows, OR if it has NO visible windows
        // -> Restore the most recent minimized window
        if (isAppFocused || visibleWindows.length === 0) {
          const toRestore = minimizedWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, minimizedWindows[0]);
          onRestoreWindow(toRestore.id);
          return;
        }
      }

      // Otherwise focus the topmost visible window
      if (visibleWindows.length > 0) {
        const topWindow = visibleWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, visibleWindows[0]);
        onFocusWindow(topWindow.id);
      }
    }
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[9998]">
      <motion.div
        id="dock-main"
        className={cn(
          "rounded-2xl p-2 border border-white/20",
          !disableShadows && "shadow-2xl"
        )}
        style={{ background: dockBackground, ...blurStyle }}
        initial={{ x: -100, opacity: 0 }}
        animate={{
          x: shouldHide ? -80 : 0,
          opacity: shouldHide ? 0 : 1
        }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
      >
        <div className="flex flex-col gap-2">
          {/* App Icons */}
          {visibleApps.map((app, index) => {
            const appWindows = windowsByApp[app.id] || [];
            const hasWindows = appWindows.length > 0;
            const windowCount = appWindows.length;

            // Handle gradient vs solid color logic
            // Use inline style for solid color to guarantee rendering
            const bgClass = disableGradients
              ? ''
              : `bg-gradient-to-br ${app.iconColor}`;

            const style = disableGradients
              ? { backgroundColor: app.iconSolid }
              : {};

            const IconComponent = app.icon;

            return (
              <div key={app.id} className="flex flex-col items-center gap-2">
                {/* Horizontal Separator before Terminal */}
                {app.id === 'terminal' && (
                  <div className="w-8 h-px bg-white/20 my-1 mx-auto" />
                )}

                <motion.button
                  aria-label={app.name}
                  className={cn(
                    "relative w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all",
                    bgClass,
                    !disableShadows && "shadow-lg hover:shadow-xl"
                  )}
                  style={style}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => handleAppClick(app.id, e)}
                  whileHover={reduceMotion ? { scale: 1, x: 0 } : { scale: 1.1, x: 8 }}
                  whileTap={reduceMotion ? { scale: 1 } : { scale: 0.95 }}
                >
                  <IconComponent className="w-6 h-6" />

                  {/* Running indicator dot(s) */}
                  {hasWindows && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {/* Show up to 3 dots */}
                      {Array.from({ length: Math.min(windowCount, 3) }).map((_, i) => {
                        const visibleCount = appWindows.filter(w => !w.isMinimized).length;
                        // If i < visibleCount -> Bright (Visible)
                        // If i >= visibleCount -> Dim (Minimized)
                        const isVisibleDot = i < visibleCount;

                        return (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${isVisibleDot ? '' : 'bg-white'}`}
                            style={isVisibleDot ? {
                              backgroundColor: accentColor,
                              boxShadow: `0 0 4px ${accentColor}`
                            } : undefined}
                          />
                        );
                      })}
                    </div>
                  )}

                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-lg whitespace-nowrap border border-white/20"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {app.name}
                      {hasWindows && ` (${windowCount})`}
                    </motion.div>
                  )}
                </motion.button>
              </div>
            );
          })}


          {/* Separator */}
          <div className="w-8 h-[1px] bg-white/10 my-1 mx-auto" />

          {/* Trash Icon */}
          <motion.button
            aria-label="Trash"
            className={cn(
              "relative w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all border border-white/5",
              !disableShadows && "shadow-lg hover:shadow-xl",
              !disableGradients && "bg-gradient-to-br from-gray-700 to-gray-900"
            )}
            style={disableGradients ? { backgroundColor: '#374151' } : {}}
            onMouseEnter={() => setHoveredIndex(visibleApps.length)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => {
              // Open Finder at .Trash
              onOpenApp('finder', { path: `${homePath}/.Trash` });
            }}
            whileHover={reduceMotion ? { scale: 1, x: 0 } : { scale: 1.1, x: 8 }}
            whileTap={reduceMotion ? { scale: 1 } : { scale: 0.95 }}
          >
            {isTrashEmpty ? <Trash className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}

            {hoveredIndex === visibleApps.length && (
              <motion.div
                className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-lg whitespace-nowrap border border-white/20"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                Trash
              </motion.div>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export const Dock = memo(DockComponent);
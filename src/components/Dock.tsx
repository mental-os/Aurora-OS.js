import { FolderOpen, Settings, Mail, Calendar, Image, Music, Video, Terminal, Globe, MessageSquare, Trash, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useMemo, memo } from 'react';
import type { WindowState } from '../hooks/useWindowManager';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAppContext } from './AppContext';
import { useFileSystem } from './FileSystemContext';
import { cn } from './ui/utils';

interface DockProps {
  onOpenApp: (appType: string, data?: any) => void;
  onRestoreWindow: (windowId: string) => void;
  onFocusWindow: (windowId: string) => void;
  windows: WindowState[];
}

const dockApps = [
  { id: 'finder', icon: FolderOpen, label: 'Finder', color: 'from-blue-500 to-blue-600', solid: '#3b82f6' },
  { id: 'mail', icon: Mail, label: 'Mail', color: 'from-blue-400 to-blue-500', solid: '#60a5fa' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'from-red-500 to-red-600', solid: '#ef4444' },
  { id: 'photos', icon: Image, label: 'Photos', color: 'from-pink-500 to-rose-600', solid: '#ec4899' },
  { id: 'music', icon: Music, label: 'Music', color: 'from-purple-500 to-purple-600', solid: '#a855f7' },
  { id: 'videos', icon: Video, label: 'Videos', color: 'from-orange-500 to-orange-600', solid: '#f97316' },
  { id: 'messages', icon: MessageSquare, label: 'Messages', color: 'from-green-500 to-green-600', solid: '#22c55e' },
  { id: 'browser', icon: Globe, label: 'Browser', color: 'from-cyan-500 to-blue-600', solid: '#06b6d4' },
  { id: 'terminal', icon: Terminal, label: 'Terminal', color: 'from-gray-700 to-gray-900', solid: '#374151' },
  { id: 'settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-600', solid: '#6b7280' },
  // Trash is handled separately
];

function DockComponent({ onOpenApp, onRestoreWindow, onFocusWindow, windows }: DockProps) {
  const { dockBackground, blurStyle } = useThemeColors();
  const { reduceMotion, disableShadows, disableGradients, accentColor, devMode } = useAppContext();
  const { getNodeAtPath, homePath } = useFileSystem();

  const trashNode = getNodeAtPath(`${homePath}/.Trash`);
  const isTrashEmpty = !trashNode?.children || trashNode.children.length === 0;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shouldHide, setShouldHide] = useState(false);

  // Filter apps based on settings
  const visibleApps = useMemo(() => {
    const apps = [...dockApps];
    if (devMode) {
      // Insert DevCenter before Settings
      apps.splice(apps.length - 1, 0, {
        id: 'dev-center', icon: Terminal, label: 'DevCenter', color: 'from-purple-500 to-purple-600', solid: '#9333ea'
      });
    }
    return apps;
  }, [devMode]);

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
              : `bg-gradient-to-br ${app.color}`;

            const style = disableGradients
              ? { backgroundColor: app.solid }
              : {};

            const IconComponent = app.icon;

            return (
              <div key={app.id} className="flex flex-col items-center gap-2">
                {/* Horizontal Separator before Terminal */}
                {app.id === 'terminal' && (
                  <div className="w-8 h-px bg-white/20 my-1 mx-auto" />
                )}

                <motion.button
                  aria-label={app.label}
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
                      {app.label}
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
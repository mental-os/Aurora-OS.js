import { Trash, Trash2, Grid, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useMemo, memo } from 'react';
import type { WindowState } from '@/hooks/useWindowManager';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppContext } from '@/components/AppContext';
import { useFileSystem } from '@/components/FileSystemContext';
import { useI18n } from '@/i18n/index';
import { cn } from '@/components/ui/utils';
import { getDockApps } from '@/config/appRegistry';
import { AppIcon } from '@/components/ui/AppIcon';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface DockProps {
  onOpenApp: (appType: string, data?: any) => void;
  onRestoreWindow: (windowId: string) => void;
  onFocusWindow: (windowId: string) => void;
  windows: WindowState[];
}

function DockComponent({ onOpenApp, onRestoreWindow, onFocusWindow, windows }: DockProps) {
  const { t } = useI18n();
  const { dockBackground, blurStyle, getBackgroundColor } = useThemeColors();
  const { reduceMotion, disableShadows, disableGradients, accentColor, devMode } = useAppContext();
  const { getNodeAtPath, homePath, installedApps } = useFileSystem();

  const trashNode = getNodeAtPath(`${homePath}/.Trash`);
  const isTrashEmpty = !trashNode?.children || trashNode.children.length === 0;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shouldHide, setShouldHide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get visible apps based on installed apps
  const visibleApps = useMemo(() => {
    const apps = getDockApps(installedApps);

    // Add DevCenter if in dev mode and it's installed
    if (devMode && installedApps.has('dev-center')) {
      // DevCenter is already in the registry, just verify it's included
    }

    return apps;
  }, [installedApps, devMode]);

  const MAX_VISIBLE_APPS = 3;

  // Split apps into Pinned (System) and User apps
  const { pinnedApps, userApps } = useMemo(() => {
    const pinned = ['terminal', 'settings'];
    return {
      pinnedApps: visibleApps.filter(app => pinned.includes(app.id)),
      userApps: visibleApps.filter(app => !pinned.includes(app.id))
    };
  }, [visibleApps]);

  const primaryUserApps = userApps.slice(0, MAX_VISIBLE_APPS);
  const overflowUserApps = userApps.slice(MAX_VISIBLE_APPS);

  const filteredOverflowApps = useMemo(() => {
    if (!searchQuery) return overflowUserApps;
    return overflowUserApps.filter(app => {
      const appName = app.nameKey ? t(app.nameKey) : app.name;
      return appName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [overflowUserApps, searchQuery, t]);

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

  const renderAppIcon = (app: any, index: number, isOverflow = false) => {
    const appWindows = windowsByApp[app.id] || [];
    const hasWindows = appWindows.length > 0;
    const windowCount = appWindows.length;
    const appName = app.nameKey ? t(app.nameKey) : app.name;

    return (
      <div key={app.id} className="flex flex-col items-center gap-2">
        <motion.button
          aria-label={appName}
          className="relative group"
          onMouseEnter={() => !isOverflow && setHoveredIndex(index)}
          onMouseLeave={() => !isOverflow && setHoveredIndex(null)}
          onClick={(e) => handleAppClick(app.id, e)}
          whileHover={reduceMotion ? { scale: 1, x: 0 } : (isOverflow ? { scale: 1.1, x: 0 } : { scale: 1.1, x: 8 })}
          whileTap={reduceMotion ? { scale: 1 } : { scale: 0.95 }}
        >
          <AppIcon
            app={app}
            size="md"
            className={cn(
              "w-12 h-12",
              !disableShadows && "shadow-lg hover:shadow-xl"
            )}
            showIcon={true}
          />

          {/* Running indicator dots positioned over the icon */}
          {hasWindows && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 z-10">
              {/* Show up to 3 dots */}
              {Array.from({ length: Math.min(windowCount, 3) }).map((_, i) => {
                const visibleCount = appWindows.filter(w => !w.isMinimized).length;
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

          {!isOverflow && hoveredIndex === index && (
            <motion.div
              className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-lg whitespace-nowrap border border-white/20 z-50 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              {appName}
              {hasWindows && ` (${windowCount})`}
            </motion.div>
          )}
        </motion.button>
        {isOverflow && <div className="text-xs text-white/80 mt-1">{appName}</div>}
      </div>
    );
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none sticky-dock-container">
      <div className="pointer-events-auto">
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
            {/* Primary User Apps */}
            {primaryUserApps.map((app, index) => renderAppIcon(app, index))}

            {/* Overflow Menu */}
            {overflowUserApps.length > 0 && (
              <Popover onOpenChange={(open) => !open && setSearchQuery('')}>
                <PopoverTrigger asChild>
                  <motion.button
                    className="relative group flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/5"
                    onMouseEnter={() => setHoveredIndex(MAX_VISIBLE_APPS)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    whileHover={reduceMotion ? { scale: 1, x: 0 } : { scale: 1.1, x: 8 }}
                    whileTap={reduceMotion ? { scale: 1 } : { scale: 0.95 }}
                  >
                    <Grid className="w-6 h-6 text-white" />
                    {hoveredIndex === MAX_VISIBLE_APPS && (
                      <motion.div
                        className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-lg whitespace-nowrap border border-white/20 z-50 top-1/2 -translate-y-1/2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {t('appStore.categories.all')}
                      </motion.div>
                    )}
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="center"
                  sideOffset={16}
                  className={cn(
                    "w-80 p-4 border-white/20 flex flex-col gap-4 text-white",
                    !disableShadows ? 'shadow-2xl' : 'shadow-none'
                  )}
                  style={{
                    background: getBackgroundColor(0.8),
                    ...blurStyle,
                  }}
                >
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      placeholder={t('appStore.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-white/20"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto scrollbar-hide p-2">
                    {filteredOverflowApps.length > 0 ? (
                      filteredOverflowApps.map((app, index) => renderAppIcon(app, index + MAX_VISIBLE_APPS, true))
                    ) : (
                      <div className="col-span-3 text-center text-white/50 text-sm py-4">
                        {t('appStore.empty.title')}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Separator between User Apps and System Apps */}
            {(primaryUserApps.length > 0 || overflowUserApps.length > 0) && (
              <div className="w-8 h-px bg-white/10 my-1 mx-auto" />
            )}

            {/* Pinned System Apps (Terminal, Settings) */}
            {pinnedApps.map((app, index) => renderAppIcon(app, index + 100))}

            {/* Separator before Trash */}
            <div className="w-8 h-px bg-white/10 my-1 mx-auto" />

            {/* Trash Icon */}
            <motion.button
              aria-label={t('fileManager.places.trash')}
              className={cn(
                "relative w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all border border-white/5",
                !disableShadows && "shadow-lg hover:shadow-xl",
                !disableGradients && "bg-linear-to-br from-gray-700 to-gray-900"
              )}
              style={disableGradients ? { backgroundColor: '#374151' } : {}}
              onMouseEnter={() => setHoveredIndex(visibleApps.length + 1)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                // Open Finder at .Trash
                onOpenApp('finder', { path: `${homePath}/.Trash` });
              }}
              whileHover={reduceMotion ? { scale: 1, x: 0 } : { scale: 1.1, x: 8 }}
              whileTap={reduceMotion ? { scale: 1 } : { scale: 0.95 }}
            >
              {isTrashEmpty ? <Trash className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}

              {hoveredIndex === visibleApps.length + 1 && (
                <motion.div
                  className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-lg whitespace-nowrap border border-white/20 top-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {t('fileManager.places.trash')}
                </motion.div>
              )}
            </motion.button>
          </div>
        </motion.div >
      </div>
    </div >
  );
}

export const Dock = memo(DockComponent);
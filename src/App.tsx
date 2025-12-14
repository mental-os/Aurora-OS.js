import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Desktop } from './components/Desktop';
import { LoginScreen } from './components/LoginScreen';
import { MenuBar } from './components/MenuBar';
import { Dock } from './components/Dock';
import { Window } from './components/Window';
import { FileManager } from './components/FileManager';

import { Settings } from './components/Settings';
import { Photos } from './components/apps/Photos';
import { Music } from './components/apps/Music';
import { Messages } from './components/apps/Messages';
import { Browser } from './components/apps/Browser';
import { Terminal } from './components/apps/Terminal';
import { DevCenter } from './components/apps/DevCenter';
import { PlaceholderApp } from './components/apps/PlaceholderApp';
import { AppProvider, useAppContext } from './components/AppContext';
import { FileSystemProvider, useFileSystem, type FileSystemContextType } from './components/FileSystemContext';
import { Toaster } from './components/ui/sonner';
import { getGridConfig, gridToPixel, pixelToGrid, findNextFreeCell, gridPosToKey, rearrangeGrid, type GridPosition } from './utils/gridSystem';
import { notify } from './services/notifications';
import { feedback } from './services/soundFeedback';

const POSITIONS_STORAGE_KEY = 'aurora-os-desktop-positions';
const WINDOWS_STORAGE_PREFIX = 'aurora-os-windows-';

export interface WindowState {
  id: string;
  type: string; // App ID (e.g. 'finder', 'settings')
  title: string;
  content: React.ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  data?: any; // Extra data like path for finder
}

export interface DesktopIcon {
  id: string;
  name: string;
  type: 'folder' | 'file';
  position: { x: number; y: number };
  isEmpty?: boolean;
}

interface WindowSession {
  id: string;
  type: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  data?: any;
}

// ... existing code ...



// Load icon positions (supports both pixel and grid formats with migration)
function loadIconPositions(): Record<string, GridPosition> {
  try {
    const stored = localStorage.getItem(POSITIONS_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const firstKey = Object.keys(data)[0];

      // Check if data is in old pixel format and convert
      if (firstKey && data[firstKey] && typeof data[firstKey].x === 'number') {
        const config = getGridConfig(window.innerWidth, window.innerHeight);
        const gridPositions: Record<string, GridPosition> = {};
        Object.entries(data).forEach(([key, value]) => {
          const pos = value as { x: number; y: number };
          gridPositions[key] = pixelToGrid(pos.x, pos.y, config);
        });
        return gridPositions;
      }
      return data;
    }
  } catch (e) {
    console.warn('Failed to load desktop positions:', e);
  }
  return {};
}

function OS() {
  const { activeUser } = useAppContext();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [isRestoring, setIsRestoring] = useState(true);

  const topZIndexRef = useRef(100);

  // Track window size for responsive icon positioning
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global click sound
  useEffect(() => {
    const handleGlobalClick = () => {
      feedback.click();
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const { listDirectory, resolvePath, getNodeAtPath, moveNodeById } = useFileSystem() as unknown as FileSystemContextType;

  // Grid-based Icon Positions State
  const [iconGridPositions, setIconGridPositions] = useState<Record<string, GridPosition>>(loadIconPositions);

  // Save grid positions when they change
  useEffect(() => {
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(iconGridPositions));
  }, [iconGridPositions]);

  // Derive desktop icons from filesystem + grid positions
  const { icons: desktopIcons, newPositions } = useMemo(() => {
    const desktopPath = resolvePath('~/Desktop');
    const files = listDirectory(desktopPath) || [];
    const config = getGridConfig(windowSize.width, windowSize.height);

    const icons: DesktopIcon[] = [];
    const occupiedCells = new Set<string>();
    const newPositions: Record<string, GridPosition> = {};

    // Process all files - use existing grid positions or find new ones
    files.forEach(file => {
      let gridPos = iconGridPositions[file.id];

      if (!gridPos) {
        // Find next free cell for new icons
        gridPos = findNextFreeCell(occupiedCells, config, windowSize.height);
        newPositions[file.id] = gridPos;
      }

      // Convert grid to pixel for rendering
      const pixelPos = gridToPixel(gridPos, config);

      icons.push({
        id: file.id,
        name: file.name,
        type: file.type === 'directory' ? 'folder' : 'file',
        position: pixelPos,
        isEmpty: file.children?.length === 0
      });

      occupiedCells.add(gridPosToKey(gridPos));
    });

    return { icons, newPositions };
  }, [listDirectory, resolvePath, iconGridPositions, windowSize]);

  // Sync new grid positions to state
  useEffect(() => {
    if (Object.keys(newPositions).length > 0) {
      // Use setTimeout to avoid synchronous state update cycle during render phase
      setTimeout(() => {
        setIconGridPositions(prev => {
          const merged = { ...prev, ...newPositions };
          if (Object.keys(prev).length === Object.keys(merged).length) return prev;
          return merged;
        });
      }, 0);
    }
  }, [newPositions]);

  // Cleanup orphaned positions (when files are deleted/moved externally)
  useEffect(() => {
    const activeIds = new Set(desktopIcons.map(icon => icon.id));
    const currentPositionIds = Object.keys(iconGridPositions);
    const orphans = currentPositionIds.filter(id => !activeIds.has(id));

    if (orphans.length > 0) {
      setTimeout(() => {
        setIconGridPositions(prev => {
          const next = { ...prev };
          let hasChanges = false;
          orphans.forEach(id => {
            if (next[id]) {
              delete next[id];
              hasChanges = true;
            }
          });
          return hasChanges ? next : prev;
        });
      }, 0);
    }
  }, [desktopIcons, iconGridPositions]);

  const openWindowRef = useRef<(type: string, data?: { path?: string }) => void>(() => { });

  // Helper to generate content
  const getAppContent = useCallback((type: string, data?: any): { content: React.ReactNode, title: string } => {
    let content: React.ReactNode;
    let title: string;

    switch (type) {
      case 'finder':
        title = 'Finder';
        content = <FileManager initialPath={data?.path} />;
        break;
      case 'settings':
        title = 'System Settings';
        content = <Settings />;
        break;
      case 'photos':
        title = 'Photos';
        content = <Photos />;
        break;
      case 'music':
        title = 'Music';
        content = <Music />;
        break;
      case 'messages':
        title = 'Messages';
        content = <Messages />;
        break;
      case 'browser':
        title = 'Browser';
        content = <Browser />;
        break;
      case 'terminal':
        title = 'Terminal';
        // Need to forward the ref logic if terminal is special
        content = <Terminal onLaunchApp={(id, args) => openWindowRef.current(id, { path: args?.[0] })} />;
        break;
      case 'trash':
        title = 'Trash';
        content = <FileManager initialPath="~/.Trash" />;
        break;
      case 'dev-center':
        title = 'DEV Center';
        content = <DevCenter />;
        break;
      default:
        title = type.charAt(0).toUpperCase() + type.slice(1);
        content = <PlaceholderApp title={title} />;
    }
    return { content, title };
  }, []); // Dependencies? openWindowRef is stable

  // Load windows on mount / user change
  useEffect(() => {
    setIsRestoring(true);
    const key = `${WINDOWS_STORAGE_PREFIX}${activeUser}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const sessions: WindowSession[] = JSON.parse(stored);
        const restoredWindows: WindowState[] = sessions.map(session => {
          const { content } = getAppContent(session.type, session.data);
          // Use stored title if available, else default (though session.title IS stored)
          return {
            ...session,
            content,
            // Ensure title is up to date
          };
        });

        // Find max Z-Index to continue correctly
        const maxZ = Math.max(100, ...restoredWindows.map(w => w.zIndex));
        topZIndexRef.current = maxZ;

        setWindows(restoredWindows);
      } else {
        setWindows([]);
      }
    } catch (e) {
      console.warn('Failed to restore windows:', e);
      setWindows([]);
    } finally {
      setIsRestoring(false);
    }
  }, [activeUser, getAppContent]);

  // Persist windows on change (Debounced)
  useEffect(() => {
    if (isRestoring) return; // Don't save while restoring

    const key = `${WINDOWS_STORAGE_PREFIX}${activeUser}`;

    // Map to serializable format
    const sessions: WindowSession[] = windows.map(w => ({
      id: w.id,
      type: w.type,
      title: w.title,
      isMinimized: w.isMinimized,
      isMaximized: w.isMaximized,
      position: w.position,
      size: w.size,
      zIndex: w.zIndex,
      data: w.data
    }));

    try {
      localStorage.setItem(key, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save windows:', e);
    }
  }, [windows, activeUser, isRestoring]);

  // ... rest of code

  const openWindow = useCallback((type: string, data?: { path?: string }) => {
    feedback.windowOpen();

    const { content, title } = getAppContent(type, data);

    setWindows(prevWindows => {
      topZIndexRef.current += 1;
      const newZIndex = topZIndexRef.current;
      const newWindow: WindowState = {
        id: `${type}-${Date.now()}`,
        type, // Store app type
        title,
        content,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + prevWindows.length * 30, y: 80 + prevWindows.length * 30 },
        size: { width: 900, height: 600 },
        zIndex: newZIndex,
        data, // Store args
      };
      return [...prevWindows, newWindow];
    });
  }, [getAppContent]);


  useEffect(() => {
    openWindowRef.current = openWindow;
  }, [openWindow]);

  const closeWindow = useCallback((id: string) => {
    feedback.windowClose();
    //notify.system('success', id, 'Application closed successfully');
    setWindows(prevWindows => prevWindows.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    //feedback.click();
    notify.system('success', id, 'Application minimized successfully');
    setWindows(prevWindows => {
      const updated = prevWindows.map(w =>
        w.id === id ? { ...w, isMinimized: true } : w
      );

      const visibleWindows = updated.filter(w => !w.isMinimized);
      if (visibleWindows.length > 0) {
        const topWindow = visibleWindows.reduce((max, w) =>
          w.zIndex > max.zIndex ? w : max, visibleWindows[0]
        );
        topZIndexRef.current += 1;
        const newZIndex = topZIndexRef.current;
        return updated.map(w =>
          w.id === topWindow.id ? { ...w, zIndex: newZIndex } : w
        );
      }

      return updated;
    });
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    //feedback.click();
    notify.system('success', id, 'Application maximized successfully');
    setWindows(prevWindows => prevWindows.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prevWindows => {
      topZIndexRef.current += 1;
      const newZIndex = topZIndexRef.current;
      return prevWindows.map(w =>
        w.id === id ? { ...w, zIndex: newZIndex, isMinimized: false } : w
      );
    });
  }, []);

  const updateWindowState = useCallback((id: string, updates: Partial<WindowState>) => {
    setWindows(prevWindows => prevWindows.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  const updateIconPosition = useCallback((id: string, position: { x: number; y: number }) => {
    const config = getGridConfig(window.innerWidth, window.innerHeight);
    const targetGridPos = pixelToGrid(position.x, position.y, config);
    const targetCellKey = gridPosToKey(targetGridPos);

    // Check if another icon occupies this grid cell
    const conflictingIcon = desktopIcons.find(icon => {
      const iconGridPos = iconGridPositions[icon.id];
      // Check if grid positions match (excluding self)
      return icon.id !== id && iconGridPos && gridPosToKey(iconGridPos) === targetCellKey;
    });

    if (conflictingIcon) {
      // Check if conflicting item is a folder AND we are strictly overlapping the icon graphic
      if (conflictingIcon.type === 'folder') {
        const targetPixelPos = gridToPixel(iconGridPositions[conflictingIcon.id], config);

        // Calculate centers (Icon graphic is roughly centered + offset)
        const targetCenter = { x: targetPixelPos.x + 50, y: targetPixelPos.y + 50 };
        const dragCenter = { x: position.x + 50, y: position.y + 50 };

        const dx = targetCenter.x - dragCenter.x;
        const dy = targetCenter.y - dragCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If dropped close to center of folder (within 35px radius), move IT IN
        if (distance < 35) {
          const sourceIcon = desktopIcons.find(i => i.id === id);
          if (sourceIcon) {
            const destParentPath = resolvePath(`~/Desktop/${conflictingIcon.name}`);
            moveNodeById(id, destParentPath);

            // Clean up grid position for moved item safely
            setIconGridPositions(prev => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
            return;
          }
        }
      }

      // Auto-rearrange: grid conflict detected but not moving into folder
      const allIconIds = desktopIcons.map(i => i.id);
      const newPositions = rearrangeGrid(
        allIconIds,
        iconGridPositions,
        id,
        targetGridPos,
        windowSize.height,
        config
      );
      setIconGridPositions(newPositions);
    } else {
      // No conflict - just update the position
      setIconGridPositions(prev => ({
        ...prev,
        [id]: targetGridPos
      }));
    }
  }, [desktopIcons, iconGridPositions, windowSize, resolvePath, moveNodeById]);



  const handleIconDoubleClick = useCallback((iconId: string) => {
    const icon = desktopIcons.find(i => i.id === iconId);
    if (!icon) return;

    const path = resolvePath(`~/Desktop/${icon.name}`);
    const node = getNodeAtPath(path);

    if (node?.type === 'directory') {
      openWindow('finder', { path });
    }

  }, [desktopIcons, resolvePath, getNodeAtPath, openWindow]);

  const focusedWindowId = useMemo(() => {
    if (windows.length === 0) return null;
    return windows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, windows[0]).id;
  }, [windows]);

  const focusedAppType = useMemo(() => {
    if (!focusedWindowId) return null;
    return focusedWindowId.split('-')[0];
  }, [focusedWindowId]);

  return (
    <div className="dark h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <div className="window-drag-boundary absolute top-7 left-0 right-0 bottom-0 pointer-events-none z-0" />
      <Desktop
        onDoubleClick={() => { }}
        icons={desktopIcons}
        onUpdateIconPosition={updateIconPosition}
        onIconDoubleClick={handleIconDoubleClick}
      />

      <MenuBar
        focusedApp={focusedAppType}
        onOpenApp={openWindow}
      />

      <Dock
        onOpenApp={openWindow}
        onRestoreWindow={focusWindow}
        onFocusWindow={focusWindow}
        windows={windows}
      />

      {windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
          onUpdateState={(updates) => updateWindowState(window.id, updates)}
          isFocused={window.id === focusedWindowId}
          bounds=".window-drag-boundary"
        />
      ))}



      <Toaster />
    </div>
  );
}


function AppContent() {
  const { currentUser } = useFileSystem();
  const { switchUser, isLocked } = useAppContext();

  // Sync Global Settings with Current User (or root for login screen)
  useEffect(() => {
    switchUser(currentUser || 'root');
  }, [currentUser, switchUser]);

  return (
    <>
      {/* Render OS if user is logged in (even if locked) */}
      {currentUser && <OS />}

      {/* Render Login Overlay if logged out OR locked */}
      {(!currentUser || isLocked) && (
        <div className="absolute inset-0 z-[20000]">
          <LoginScreen />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <FileSystemProvider>
        <AppContent />
      </FileSystemProvider>
    </AppProvider>
  );
}

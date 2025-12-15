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
import { feedback } from './services/soundFeedback';

import { STORAGE_KEYS } from './utils/memory';
import { useWindowManager } from './hooks/useWindowManager';

export interface DesktopIcon {
  id: string;
  name: string;
  type: 'folder' | 'file';
  position: { x: number; y: number };
  isEmpty?: boolean;
}

// ... existing code ...



// Load icon positions (supports both pixel and grid formats with migration)
function loadIconPositions(): Record<string, GridPosition> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DESKTOP_ICONS);
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
    localStorage.setItem(STORAGE_KEYS.DESKTOP_ICONS, JSON.stringify(iconGridPositions));
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

  // Use Window Manager Hook
  const {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowState
  } = useWindowManager(activeUser, getAppContent);

  useEffect(() => {
    openWindowRef.current = openWindow;
  }, [openWindow]);

  /* 
   * Window interaction handlers are now managed by useWindowManager
   * Persistence logic is also encapsulated there.
   */

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

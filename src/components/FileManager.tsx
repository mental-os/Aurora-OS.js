
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  FileText,
  Download,
  HardDrive,
  Search,
  Grid3x3,
  List,
  Monitor,
  Music,
  Image,
  Trash,
  Trash2,
  Settings,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from './AppContext';
import { AppTemplate } from './apps/AppTemplate';
import { ResponsiveGrid } from './ui/ResponsiveGrid';
import { useFileSystem, FileNode } from './FileSystemContext';
import { useMusic } from './MusicContext';
import { checkPermissions } from '../utils/fileSystemUtils';
import { useAppStorage } from '../hooks/useAppStorage';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { useElementSize } from '../hooks/useElementSize';
import { FileIcon } from './ui/FileIcon';
import { cn } from './ui/utils';
import { feedback } from '../services/soundFeedback';
import { useI18n } from '../i18n/index';

interface BreadcrumbPillProps {
  name: string;
  isLast: boolean;
  accentColor: string;
  onClick: () => void;
  onDrop: (e: React.DragEvent) => void;
}

function BreadcrumbPill({ name, isLast, accentColor, onClick, onDrop }: BreadcrumbPillProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e);
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`px-3 py-1 rounded-md text-sm transition-all duration-200 border ${isLast ? 'font-medium' : 'font-normal'
        }`}
      style={{
        backgroundColor: isDragOver || isHovered || isLast
          ? accentColor
          : 'rgba(55, 65, 81, 0.5)', // Default gray-700/50
        borderColor: isDragOver || isHovered || isLast
          ? accentColor
          : 'transparent',
        color: isDragOver || isHovered || isLast
          ? '#FFFFFF' // Always white for primary button style
          : 'rgba(255, 255, 255, 0.9)',
        cursor: isLast ? 'default' : 'pointer',
        boxShadow: isDragOver || isHovered || isLast ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
        fontWeight: isLast ? 600 : 400
      }}
    >
      {name}
    </button>
  );
}

export function FileManager({ initialPath, onOpenApp, owner }: { initialPath?: string; onOpenApp?: (id: string, args?: any, owner?: string) => void, owner?: string }) {
  const { accentColor, activeUser: desktopUser } = useAppContext();
  const { t } = useI18n();
  const activeUser = owner || desktopUser;
  useMusic();
  // Drag and Drop Logic
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const { listDirectory, homePath, moveNodeById, getNodeAtPath, moveToTrash, resolvePath, users } = useFileSystem();

  const [containerRefSetter, { width }] = useElementSize();
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = width < 450;

  // Persisted state (viewMode survives refresh AND Logout -> User Setting)
  const [appState, setAppState] = useAppStorage('finder', {
    viewMode: 'grid' as 'grid' | 'list',
  });

  // Each FileManager instance has its own navigation state (independent windows, NOT persisted)
  // Edit: User requested persistence but ONLY for Session (Cleared on Logout).
  // We use a shared "last path" preference for the DEFAULT opening path.
  const [lastPath, setLastPath] = useSessionStorage('finder-last-path', homePath);

  const startPath = initialPath || lastPath;
  const [currentPath, setCurrentPath] = useState(startPath);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<FileNode[]>([]);
  const [history, setHistory] = useState<string[]>([startPath]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync current path to storage (only if it matches user expectation of "Session")
  useEffect(() => {
    if (currentPath) {
      setLastPath(currentPath);
    }
  }, [currentPath, setLastPath]);

  // Load directory contents when path changes
  useEffect(() => {
    const contents = listDirectory(currentPath, activeUser);
    if (contents) {
      // Filter dotfiles and sort
      const filtered = contents.filter(item => !item.name.startsWith('.'));
      const sorted = [...filtered].sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });
      setItems(sorted);
    } else {
      setItems([]);
    }
    setSelectedItems(new Set());
  }, [currentPath, listDirectory, activeUser]);

  // Navigate to a directory
  const navigateTo = useCallback((path: string) => {
    const node = getNodeAtPath(path, activeUser);

    if (node) {
      // Find acting user object to check specific read permission on the target
      // We need 'read' to list contents in Finder
      const userObj = users.find(u => u.username === activeUser);
      if (userObj) {
        if (!checkPermissions(node, userObj, 'read')) {
          toast.error(t('fileManager.toasts.permissionDenied', { name: node.name }));
          return;
        }
        if (!checkPermissions(node, userObj, 'execute')) {
          toast.error(t('fileManager.toasts.permissionDenied', { name: node.name }));
          return;
        }
      }
    }

    // Add to history
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(path);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
    setCurrentPath(path);
    feedback.folder();
  }, [historyIndex, getNodeAtPath, users, activeUser, t]);

  // Handle item double-click
  const handleItemDoubleClick = useCallback((item: FileNode) => {
    if (item.type === 'directory') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      navigateTo(newPath);
    } else if (item.type === 'file') {

      const isMusic = /\.(mp3|wav|flac|ogg|m4a)$/i.test(item.name);
      const isText = /\.(txt|md|json|js|ts|tsx|css|html|sh)$/i.test(item.name);

      if (isMusic) {
        // Check if music app is installed by checking /usr/bin
        const musicBinary = getNodeAtPath('/usr/bin/music', activeUser);
        if (musicBinary) {
          const rawPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
          const fullPath = resolvePath(rawPath, activeUser);
          // Delegate playback to App via initialPath/data (gated by local logic)
          if (onOpenApp) onOpenApp('music', { path: fullPath, timestamp: Date.now() }, activeUser);
        } else {
          toast.error(t('fileManager.toasts.musicNotInstalled'));
        }
      } else if (isText) {
        // Check if notepad app is installed by checking /usr/bin
        const notepadBinary = getNodeAtPath('/usr/bin/notepad', activeUser);
        if (notepadBinary) {
          const rawPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
          const fullPath = resolvePath(rawPath, activeUser);
          if (onOpenApp) onOpenApp('notepad', { path: fullPath }, activeUser);
        } else {
          toast.error(t('fileManager.toasts.notepadNotInstalled'));
        }
      }
    }
  }, [currentPath, navigateTo, onOpenApp, activeUser, getNodeAtPath, resolvePath, t]);

  // Go back in history
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // Go forward in history
  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Handle Selection Logic
  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent container click from clearing selection

    if (e.metaKey || e.ctrlKey) {
      // Toggle selection
      setSelectedItems(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else if (e.shiftKey) {
      // Range selection
      if (selectedItems.size === 0) {
        setSelectedItems(new Set([id]));
        return;
      }

      // Find last selected item (or arbitrary one)
      const lastId = Array.from(selectedItems).pop();
      if (!lastId) return;

      const lastIndex = items.findIndex(i => i.id === lastId);
      const currentIndex = items.findIndex(i => i.id === id);

      if (lastIndex === -1 || currentIndex === -1) return;

      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);

      const range = items.slice(start, end + 1).map(i => i.id);
      // Union with existing or replace? Standard is replace + anchor, but union is easier
      setSelectedItems(new Set([...Array.from(selectedItems), ...range]));

    } else {
      // Single selection
      setSelectedItems(new Set([id]));
    }
  };


  const handleDragStart = useCallback((e: React.DragEvent, item: FileNode) => {
    console.log('Drag started:', item.id);
    // If dragging an item NOT in selection, select it exclusively
    let itemsToDrag = Array.from(selectedItems);
    if (!selectedItems.has(item.id)) {
      itemsToDrag = [item.id];
      setSelectedItems(new Set([item.id]));
    }

    e.dataTransfer.setData('application/json', JSON.stringify({
      id: item.id, // Legacy support for single item drops
      ids: itemsToDrag, // NEW: Multi-item payload
      name: item.name,
      type: item.type
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, [selectedItems]); // dependencies

  const handleDragOver = useCallback((e: React.DragEvent, item: FileNode) => {
    e.preventDefault(); // allow drop
    if (item.type === 'directory') {
      // Don't allow dropping onto itself if it's in the selection
      // But checking IDs in dragOver is hard without parsing data... 
      // We'll trust the user or handle it in Drop.
      e.dataTransfer.dropEffect = 'move';
      setDragTargetId(item.id);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDragTargetId(null);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragTargetId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetItem: FileNode) => {
    e.preventDefault();
    setDragTargetId(null);

    // If target is a directory, consume the event (drop INTO directory)
    if (targetItem.type === 'directory') {
      e.stopPropagation();
    } else {
      // If target is file, let it bubble to container (drop INTO current path)
      return;
    }

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      console.log('Drop data:', data);

      const idsToMove = data.ids || (data.id ? [data.id] : []);

      let movedCount = 0;
      idsToMove.forEach((id: string) => {
        if (id === targetItem.id) return; // Can't drop on self

        // Need to find the name for this ID to log/notify? 
        // We don't have the node object here for external drops easily, but moveNodeById handles it.
        // BUT we need the name to construct destination path? 
        // Wait, moveNodeById(id, destPath). destPath includes the filename?
        // If destPath is a directory, moveNodeById should handle "into"? 
        // Checking moveNodeById signature... 
        // implementation usually expects specific path. 
        // Let's verify moveNodeById behavior. 
        // If we move /foo/bar.txt to /baz/, the new path is /baz/bar.txt.
        // The current `moveNodeById` takes (id, newPath).
        // If `newPath` is a directory, does it automagically append filename?
        // Looking at usage in original file: 
        // `const destPath = ... /${targetItem.name}` which is the FOLDER path.
        // If moveNodeById expects FULL PATH including filename, we have a problem for external IDs where we don't know the name.
        // Let's assume for now we need the name. `data` payload has `name`. But only for the PRIMARY item.
        // CRITICAL: We need name for ALL items in multi-drag. 
        // FIX: The payload should include metadata for all items.

        // Since I can't easily change the payload to include map of id->name without iterating everything in dragStart...
        // I will assume for now `moveNodeById` can handle directory targets or I need to fetch names.
        // Actually, `moveNodeById` inside `useFileSystemMutations` likely updates the parent.

        // In the original code: 
        /* 
          const destPath = currentPath === '/'
            ? `/${targetItem.name}`
            : `${currentPath}/${targetItem.name}`;
           moveNodeById(data.id, destPath, activeUser);
        */
        // This implies passing the FOLDER as destPath works? 
        // If so, great. If acts as "Rename", then we have a bug for moving into folders.
        // Let's assume it works as "Move Into" based on context.

        const destPath = currentPath === '/'
          ? `/${targetItem.name}`
          : `${currentPath}/${targetItem.name}`;

        moveNodeById(id, destPath, activeUser);
        movedCount++;
      });

      if (movedCount > 0) toast.success(t('fileManager.toasts.movedItems', { count: movedCount }));

    } catch (err) {
      console.error('Failed to parse drag data', err);
      toast.error(t('fileManager.toasts.moveFailedInvalidData'));
    }
  }, [currentPath, moveNodeById, activeUser, t]);

  // Sidebar Drop Logic
  const handleSidebarDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSidebarDrop = useCallback((e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const idsToMove = data.ids || (data.id ? [data.id] : []);

      idsToMove.forEach((id: string) => {
        moveNodeById(id, targetPath, activeUser);
      });

      toast.success(
        t('fileManager.toasts.movedItemsTo', {
          count: idsToMove.length,
          target: targetPath.split('/').pop() || targetPath,
        })
      );
    } catch (err) {
      console.error('Failed to drop on sidebar', err);
      toast.error(t('fileManager.toasts.failedToProcessDrop'));
    }
  }, [moveNodeById, activeUser, t]);

  // Helper to create sidebar action props
  const sidebarDropProps = useCallback((path: string) => ({
    onDragOver: handleSidebarDragOver,
    onDrop: (e: React.DragEvent) => handleSidebarDrop(e, path)
  }), [handleSidebarDragOver, handleSidebarDrop]);

  // Sidebar configuration
  const fileManagerSidebar = useMemo(() => {
    const trashNode = getNodeAtPath(`${homePath}/.Trash`, activeUser);
    const isTrashEmpty = !trashNode?.children || trashNode.children.length === 0;

    return {
      sections: [
        {
          title: t('fileManager.sidebar.favorites'),
          items: [
            {
              id: 'home',
              icon: Home,
              label: t('fileManager.places.home'),
              action: () => navigateTo(homePath),
              ...sidebarDropProps(homePath)
            },
            {
              id: 'desktop',
              icon: Monitor,
              label: t('fileManager.places.desktop'),
              action: () => navigateTo(`${homePath}/Desktop`),
              ...sidebarDropProps(`${homePath}/Desktop`)
            },
            {
              id: 'documents',
              icon: FileText,
              label: t('fileManager.places.documents'),
              action: () => navigateTo(`${homePath}/Documents`),
              ...sidebarDropProps(`${homePath}/Documents`)
            },
            {
              id: 'downloads',
              icon: Download,
              label: t('fileManager.places.downloads'),
              action: () => navigateTo(`${homePath}/Downloads`),
              ...sidebarDropProps(`${homePath}/Downloads`)
            },
            {
              id: 'pictures',
              icon: Image,
              label: t('fileManager.places.pictures'),
              action: () => navigateTo(`${homePath}/Pictures`),
              ...sidebarDropProps(`${homePath}/Pictures`)
            },
            {
              id: 'music',
              icon: Music,
              label: t('fileManager.places.music'),
              action: () => navigateTo(`${homePath}/Music`),
              ...sidebarDropProps(`${homePath}/Music`)
            },
          ]
        },
        {
          title: t('fileManager.sidebar.system'),
          items: [
            {
              id: 'root',
              icon: HardDrive,
              label: '/',
              action: () => navigateTo('/'),
              ...sidebarDropProps('/')
            },
            {
              id: 'usr',
              icon: FolderOpen,
              label: '/usr',
              action: () => navigateTo('/usr'),
              ...sidebarDropProps('/usr')
            },
            {
              id: 'etc',
              icon: Settings,
              label: '/etc',
              action: () => navigateTo('/etc'),
              ...sidebarDropProps('/etc')
            },
          ]
        },
        {
          title: t('fileManager.sidebar.locations'),
          items: [
            {
              id: 'trash',
              icon: isTrashEmpty ? Trash : Trash2,
              label: t('fileManager.places.trash'),
              action: () => navigateTo(`${homePath}/.Trash`),
              ...sidebarDropProps(`${homePath}/.Trash`)
            },
          ]
        },
      ]
    };
  }, [homePath, navigateTo, sidebarDropProps, getNodeAtPath, activeUser, t]);

  const toolbar = (
    <div className="flex items-center w-full gap-2 px-0">
      {/* Left Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={goBack}
          disabled={historyIndex === 0}
          className={`p-1.5 rounded-md transition-colors ${historyIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5'}`}
        >
          <ChevronLeft className="w-4 h-4 text-white/50" />
        </button>
        <button
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
          className={`p-1.5 rounded-md transition-colors ${historyIndex >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5'}`}
        >
          <ChevronRight className="w-4 h-4 text-white/50" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          onClick={() => {
            if (selectedItems.size > 0) {
              selectedItems.forEach(id => {
                const item = items.find(i => i.id === id);
                if (item) {
                  const fullPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
                  moveToTrash(fullPath, activeUser);
                }
              });
              setSelectedItems(new Set());
              toast.success(t('fileManager.toasts.movedItemsToTrash', { count: selectedItems.size }));
            }
          }}
          disabled={selectedItems.size === 0}
          className={`p-1.5 rounded-md transition-colors ${selectedItems.size === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-500/20 text-red-400'}`}
          title={t('fileManager.actions.moveToTrash')}
        >
          <Trash2 className="w-4 h-4 text-white/50" />
        </button>
      </div>

      {/* Breadcrumbs - Flexible Middle */}
      <div className="flex-1 flex items-center gap-1.5 overflow-hidden mx-2 mask-linear-fade">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
          {currentPath === '/' ? (
            <BreadcrumbPill
              name="/"
              isLast={true}
              accentColor={accentColor}
              onClick={() => { }}
              onDrop={(e) => handleSidebarDrop(e, '/')}
            />
          ) : (
            (() => {
              // Convert to absolute path to avoid '~' which breaks navigation
              const resolvedPath = resolvePath(currentPath);
              const segments = resolvedPath.split('/').filter(Boolean);

              // Responsive Logic
              const CONTROLS_WIDTH = 260; // Safe width for left/right controls + padding
              const availableWidth = Math.max(0, width - CONTROLS_WIDTH);

              // If extremely narrow, hide breadcrumbs immediately
              if (availableWidth < 60) return null;

              // Calculate width of each segment (approximate)
              // 8px per char + 24px padding + 6px gap
              const segmentWidths = segments.map(s => s.length * 8 + 30);

              let visibleSegmentsCount = 0;
              let currentWidth = 0;

              // Add from end (right) to start (left)
              for (let i = segments.length - 1; i >= 0; i--) {
                if (currentWidth + segmentWidths[i] <= availableWidth) {
                  currentWidth += segmentWidths[i];
                  visibleSegmentsCount++;
                } else {
                  // No force show - if it doesn't fit, it doesn't show
                  break;
                }
              }

              // If we can't fit even one segment properly, show nothing (or maybe just root if that fits, but root is handled separately above)
              if (visibleSegmentsCount === 0) return null;

              const startIdx = segments.length - visibleSegmentsCount;
              const visibleSegments = segments.slice(startIdx);
              const hiddenSegments = segments.slice(0, startIdx);

              // Reconstruct path for the visible segments
              // The first visible segment's full path depends on previous hidden ones
              let cumulativePath = hiddenSegments.length > 0
                ? '/' + hiddenSegments.join('/')
                : '';

              return visibleSegments.map((segment, index) => {
                cumulativePath += `/${segment}`;
                const isLast = index === visibleSegments.length - 1;
                const path = cumulativePath; // Close over value
                const displayName = segment;

                return (
                  <BreadcrumbPill
                    key={path}
                    name={displayName}
                    isLast={isLast}
                    accentColor={accentColor}
                    onClick={() => navigateTo(path)}
                    onDrop={(e) => handleSidebarDrop(e, path)}
                  />
                );
              });
            })()
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => setAppState(s => ({ ...s, viewMode: 'grid' }))}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              appState.viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAppState(s => ({ ...s, viewMode: 'list' }))}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              appState.viewMode === 'list' ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <button className="p-1.5 hover:bg-white/5 rounded-md transition-colors">
          <Search className="w-4 h-4 text-white/50" />
        </button>
      </div>
    </div >
  );

  // State for container drop zone visual feedback
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Handle drop on the background (current directory)
  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDraggingOver) setIsDraggingOver(true);
  }, [isDraggingOver]);

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  }, []);

  const handleContainerDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const idsToMove = data.ids || (data.id ? [data.id] : []);

      let movedCount = 0;
      idsToMove.forEach((id: string) => {
        moveNodeById(id, currentPath, activeUser);
        movedCount++;
      });
      if (movedCount > 0) toast.success(t('fileManager.toasts.movedItems', { count: movedCount }));
    } catch (err) {
      console.error('Failed to handle container drop', err);
    }
  }, [moveNodeById, currentPath, activeUser, t]);

  // Selection Box State
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number }, current: { x: number, y: number } } | null>(null);

  // Selection Box Logic
  useEffect(() => {
    if (!selectionBox) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setSelectionBox(prev => prev ? { ...prev, current: { x: e.clientX, y: e.clientY } } : null);
    };

    const handleGlobalMouseUp = (_e: MouseEvent) => {
      if (selectionBox && gridRef.current) {
        // Calculate selection in container coordinates
        const containerRect = gridRef.current.getBoundingClientRect();
        const scrollLeft = gridRef.current.scrollLeft;
        const scrollTop = gridRef.current.scrollTop;

        // Convert viewport coordinates to container-relative (including scroll)
        const boxLeft = Math.min(selectionBox.start.x, selectionBox.current.x) - containerRect.left + scrollLeft;
        const boxTop = Math.min(selectionBox.start.y, selectionBox.current.y) - containerRect.top + scrollTop;
        const boxRight = Math.max(selectionBox.start.x, selectionBox.current.x) - containerRect.left + scrollLeft;
        const boxBottom = Math.max(selectionBox.start.y, selectionBox.current.y) - containerRect.top + scrollTop;

        const newSelection = new Set(selectedItems); // Union with 'Control' is handled in click, but box usually replaces or unions? 
        // macOS Finder: Box selection replaces unless Shift/Command held.
        // For simplicity, let's make it replace if no modifier, or union if modifier?
        // Let's go with union for now or clear first? Standard is Clean unless Shift.
        // We'll just Add to current for now to be safe, or Clear triggers on MouseDown.

        // Actually MouseDown clears it if not modifier.

        // We need to match items against this rect.
        // We need refs to item elements? Or just rough calculation?
        // Grid items are roughly known size/position... but list items are different.
        // Doing this accurately requires measuring DOM nodes.
        // Since we don't have refs to every item easily, we can use "range" logic if in Grid?
        // Or simpler: The DOM nodes exist. We can querySelectorAll button in container?

        const buttons = gridRef.current.querySelectorAll('button[draggable="true"]');
        buttons.forEach((btn: Element, index: number) => {
          // We map DOM index to items index (should match 1:1 if sorted same)
          const item = items[index];
          if (!item) return;

          const btnRect = (btn as HTMLElement).getBoundingClientRect();
          // Convert btn rect to container relative
          const btnLeft = btnRect.left - containerRect.left + scrollLeft;
          const btnTop = btnRect.top - containerRect.top + scrollTop;
          const btnRight = btnLeft + btnRect.width;
          const btnBottom = btnTop + btnRect.height;

          // Intersection check
          if (
            btnLeft < boxRight &&
            btnRight > boxLeft &&
            btnTop < boxBottom &&
            btnBottom > boxTop
          ) {
            newSelection.add(item.id);
          }
        });

        setSelectedItems(newSelection);
        setSelectionBox(null);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [selectionBox, selectedItems, items]); // items needed for index mapping

  const content = (
    <div
      ref={(node: HTMLDivElement | null) => {
        containerRefSetter(node);
        gridRef.current = node;
      }}
      className="flex-1 overflow-y-auto p-6 transition-colors duration-200 relative outline-none"
      tabIndex={0} // Allow focus for keyboard events
      style={{
        backgroundColor: isDraggingOver ? `${accentColor}10` : undefined, // 10% opacity
        boxShadow: isDraggingOver ? `inset 0 0 0 2px ${accentColor}80` : undefined // 50% opacity border
      }}
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
      onMouseDown={(e) => {
        // Deselect if clicking on background (not on a button)
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
            setSelectedItems(new Set());
          }
          // Start Selection Box
          setSelectionBox({
            start: { x: e.clientX, y: e.clientY },
            current: { x: e.clientX, y: e.clientY }
          });
        }
      }}
    >
      {/* Selection Box Overlay */}
      {selectionBox && gridRef.current && (
        (() => {
          const containerRect = gridRef.current!.getBoundingClientRect();
          const scrollLeft = gridRef.current!.scrollLeft;
          const scrollTop = gridRef.current!.scrollTop;

          const left = Math.min(selectionBox.start.x, selectionBox.current.x) - containerRect.left + scrollLeft;
          const top = Math.min(selectionBox.start.y, selectionBox.current.y) - containerRect.top + scrollTop;
          const width = Math.abs(selectionBox.current.x - selectionBox.start.x);
          const height = Math.abs(selectionBox.current.y - selectionBox.start.y);

          return (
            <div
              className="absolute border border-blue-400/50 bg-blue-500/20 z-50 pointer-events-none"
              style={{ left, top, width, height }}
            />
          );
        })()
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-white/40">
          <FolderOpen className="w-16 h-16 mb-4" />
          <p>This folder is empty</p>
        </div>
      ) : appState.viewMode === 'grid' ? (
        <ResponsiveGrid minItemWidth={110} className="gap-6">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={(e) => handleItemClick(e, item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors group relative
              ${selectedItems.has(item.id) ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}
              ${dragTargetId === item.id ? 'bg-blue-500/20 ring-2 ring-blue-500' : ''}`}
            >
              <div className="w-20 h-20 flex items-center justify-center pointer-events-none">
                <FileIcon name={item.name} type={item.type} accentColor={accentColor} isEmpty={item.children?.length === 0} />
              </div>
              <div className="w-full text-center pointer-events-none">
                <div className="text-sm text-white/90 truncate px-1 w-full">
                  {item.name}
                </div>
                {item.type === 'directory' && item.children && (
                  <div className="text-xs mt-0.5" style={{ color: accentColor }}>
                    {item.children.length} item{item.children.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </button>
          ))}
        </ResponsiveGrid>
      ) : (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={(e) => handleItemClick(e, item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors 
              ${selectedItems.has(item.id) ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}
              ${dragTargetId === item.id ? 'bg-blue-500/20 ring-1 ring-blue-500' : ''}`}
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 pointer-events-none">
                <FileIcon name={item.name} type={item.type} accentColor={accentColor} isEmpty={item.children?.length === 0} />
              </div>
              <div className="flex-1 text-left min-w-0 pointer-events-none">
                <div className="text-sm text-white/90 truncate">{item.name}</div>
              </div>
              <div className="text-xs text-white/40 shrink-0 pointer-events-none">
                {item.type === 'directory'
                  ? t('fileManager.details.items', { count: item.children?.length || 0 })
                  : item.size ? t('fileManager.details.bytes', { count: item.size }) : ''}
              </div>
              {item.permissions && !isMobile && (
                <div className="text-xs text-white/50 font-mono shrink-0 whitespace-nowrap text-right min-w-[90px] pointer-events-none">
                  {item.permissions}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return <AppTemplate sidebar={fileManagerSidebar} toolbar={toolbar} content={content} minContentWidth={600} />;
}

import { AppMenuConfig } from '../types';

export const finderMenuConfig: AppMenuConfig = {
  menus: ['File', 'Edit', 'View', 'Go', 'Window', 'Help'],
  items: {
    'File': [
      { labelKey: 'menubar.items.newWindow', shortcut: '⌘N', action: 'new-window' },
      { labelKey: 'menubar.items.newFolder', shortcut: '⇧⌘N', action: 'new-folder' },
      { type: 'separator' },
      { labelKey: 'menubar.items.closeWindow', shortcut: '⌘W', action: 'close-window' }
    ],
    'Edit': [
      { labelKey: 'menubar.items.undo', shortcut: '⌘Z', action: 'undo' },
      { labelKey: 'menubar.items.redo', shortcut: '⇧⌘Z', action: 'redo' },
      { type: 'separator' },
      { labelKey: 'menubar.items.cut', shortcut: '⌘X', action: 'cut' },
      { labelKey: 'menubar.items.copy', shortcut: '⌘C', action: 'copy' },
      { labelKey: 'menubar.items.paste', shortcut: '⌘V', action: 'paste' },
      { labelKey: 'menubar.items.selectAll', shortcut: '⌘A', action: 'select-all' }
    ],
    'Go': [
      { labelKey: 'menubar.items.back', shortcut: '⌘[', action: 'go-back' },
      { labelKey: 'menubar.items.forward', shortcut: '⌘]', action: 'go-forward' },
      { labelKey: 'menubar.items.enclosingFolder', shortcut: '⌘↑', action: 'go-up' },
      { type: 'separator' },
      { labelKey: 'fileManager.places.home', shortcut: '⇧⌘H', action: 'go-home' },
      { labelKey: 'fileManager.places.desktop', shortcut: '⇧⌘D', action: 'go-desktop' },
      { labelKey: 'fileManager.places.downloads', shortcut: '⌥⌘L', action: 'go-downloads' }
    ]
  }
};

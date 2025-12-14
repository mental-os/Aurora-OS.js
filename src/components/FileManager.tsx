/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { checkPermissions } from '../utils/fileSystemUtils';
import { useAppStorage } from '../hooks/useAppStorage';
import { useElementSize } from '../hooks/useElementSize';
import { FileIcon } from './ui/FileIcon';
import { cn } from './ui/utils';
import { feedback } from '../services/soundFeedback';

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

export function FileManager({ initialPath }: { initialPath?: string }) {
  const { accentColor } = useAppContext();
  // Drag and Drop Logic
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const { listDirectory, homePath, moveNodeById, getNodeAtPath, moveToTrash, resolvePath, users, currentUser } = useFileSystem();

  const [containerRef, { width }] = useElementSize();
  const isMobile = width < 450;

  // Persisted state (viewMode survives refresh)
  const [appState, setAppState] = useAppStorage('finder', {
    viewMode: 'grid' as 'grid' | 'list',
  });

  // Each FileManager instance has its own navigation state (independent windows, NOT persisted)
  const startPath = initialPath || homePath;
  const [currentPath, setCurrentPath] = useState(startPath);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [items, setItems] = useState<FileNode[]>([]);
  const [history, setHistory] = useState<string[]>([startPath]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load directory contents when path changes
  useEffect(() => {
    const contents = listDirectory(currentPath);
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
    setSelectedItem(null);
  }, [currentPath, listDirectory]);

  // Navigate to a directory
  const navigateTo = useCallback((path: string) => {
    // Check permissions before navigating
    // 1. Resolve path
    // We need to resolve to absolute path to check permissions properly
    // But resolvePath dep is available.
    // However, the node might not populate if we don't have traversal permissions on parents.
    // getNodeAtPath handles traversal checks implicitly (returns null if blocked).

    const node = getNodeAtPath(path);

    if (node) {
      // Find current user object to check specific read permission on the target
      // We need 'read' to list contents in Finder
      const userObj = users.find(u => u.username === currentUser);
      if (userObj) {
        if (!checkPermissions(node, userObj, 'read')) {
          toast.error(`Permission denied: ${node.name}`);
          return;
        }
        // Also check execute just in case (though usually if we can't execute parents we won't get the node)
        // But for the target dir itself, we need execute to 'enter' it technically, but read to see it.
        if (!checkPermissions(node, userObj, 'execute')) {
          toast.error(`Permission denied: ${node.name}`);
          return;
        }
      }
    } else {
      // Node not found OR traversal failed
      // In strict mode we might block, but here let's allow it to fall through to empty?
      // No, if node is null it means path doesn't exist or we can't reach it.
      // But existing logic might allow creating new paths? No, its a file manager.
      if (path !== '/') { // Root always exists
        // Check if it's a valid navigation attempt (sometimes we navigate to new folders)
        // For now, if getNodeAtPath fails, likely blocked or non-existent.
        // navigateTo is usually called on existing items.
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
  }, [historyIndex, getNodeAtPath, users, currentUser]);

  // Handle item double-click
  const handleItemDoubleClick = useCallback((item: FileNode) => {
    if (item.type === 'directory') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      navigateTo(newPath);
    }
  }, [currentPath, navigateTo]);

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

  /* const getCurrentDirName = useCallback(() => {
    if (currentPath === '/') return '/';
    const parts = currentPath.split('/');
    return parts[parts.length - 1] || '/';
  }, [currentPath]); */

  const handleDragStart = useCallback((e: React.DragEvent, item: FileNode) => {
    console.log('Drag started:', item.id);
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: item.id,
      name: item.name,
      type: item.type
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, item: FileNode) => {
    e.preventDefault(); // allow drop
    if (item.type === 'directory') {
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
      if (data.id && data.id !== targetItem.id) {
        // Resolve destination path (currentPath + targetName)
        const destPath = currentPath === '/'
          ? `/${targetItem.name}`
          : `${currentPath}/${targetItem.name}`;

        console.log('Moving to:', destPath);
        // Execute robust ID-based move
        const success = moveNodeById(data.id, destPath);
        if (success) {
          toast.success(`Moved ${data.name} to ${targetItem.name}`);
        } else {
          toast.error(`Failed to move ${data.name} (Duplicate or Locked)`);
        }
      }
    } catch (err) {
      console.error('Failed to parse drag data', err);
      toast.error('Move failed: Invalid data');
    }
  }, [currentPath, moveNodeById]);

  // Sidebar Drop Logic
  const handleSidebarDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSidebarDrop = useCallback((e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.id) {
        const success = moveNodeById(data.id, targetPath);
        if (success) {
          toast.success(`Moved to ${targetPath.split('/').pop()}`);
        } else {
          toast.error(`Could not move to ${targetPath.split('/').pop()}`);
        }
      }
    } catch (err) {
      console.error('Failed to drop on sidebar', err);
      toast.error('Failed to process drop');
    }
  }, [moveNodeById]);

  // Helper to create sidebar action props
  const sidebarDropProps = useCallback((path: string) => ({
    onDragOver: handleSidebarDragOver,
    onDrop: (e: React.DragEvent) => handleSidebarDrop(e, path)
  }), [handleSidebarDragOver, handleSidebarDrop]);

  // Sidebar configuration
  const fileManagerSidebar = useMemo(() => {
    const trashNode = getNodeAtPath(`${homePath}/.Trash`);
    const isTrashEmpty = !trashNode?.children || trashNode.children.length === 0;

    return {
      sections: [
        {
          title: 'Favourites',
          items: [
            {
              id: 'home',
              icon: Home,
              label: 'Home',
              action: () => navigateTo(homePath),
              ...sidebarDropProps(homePath)
            },
            {
              id: 'desktop',
              icon: Monitor,
              label: 'Desktop',
              action: () => navigateTo(`${homePath}/Desktop`),
              ...sidebarDropProps(`${homePath}/Desktop`)
            },
            {
              id: 'documents',
              icon: FileText,
              label: 'Documents',
              action: () => navigateTo(`${homePath}/Documents`),
              ...sidebarDropProps(`${homePath}/Documents`)
            },
            {
              id: 'downloads',
              icon: Download,
              label: 'Downloads',
              action: () => navigateTo(`${homePath}/Downloads`),
              ...sidebarDropProps(`${homePath}/Downloads`)
            },
            {
              id: 'pictures',
              icon: Image,
              label: 'Pictures',
              action: () => navigateTo(`${homePath}/Pictures`),
              ...sidebarDropProps(`${homePath}/Pictures`)
            },
            {
              id: 'music',
              icon: Music,
              label: 'Music',
              action: () => navigateTo(`${homePath}/Music`),
              ...sidebarDropProps(`${homePath}/Music`)
            },
          ]
        },
        {
          title: 'System',
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
          title: 'Locations',
          items: [
            {
              id: 'trash',
              icon: isTrashEmpty ? Trash : Trash2,
              label: 'Trash',
              action: () => navigateTo(`${homePath}/.Trash`),
              ...sidebarDropProps(`${homePath}/.Trash`)
            },
          ]
        },
      ]
    };
  }, [homePath, navigateTo, sidebarDropProps, getNodeAtPath]);

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

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        <button
          onClick={() => {
            if (selectedItem) {
              const item = items.find(i => i.id === selectedItem);
              if (item) {
                const fullPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
                moveToTrash(fullPath);
                setSelectedItem(null);
                toast.success('Moved to Trash');
              }
            }
          }}
          disabled={!selectedItem}
          className={`p-1.5 rounded-md transition-colors ${!selectedItem ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-500/20 text-red-400'}`}
          title="Move to Trash"
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
                const displayName = segment === '.Trash' ? 'Trash' : segment;

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
      if (data.id) {
        moveNodeById(data.id, currentPath);
      }
    } catch (err) {
      console.error('Failed to handle container drop', err);
    }
  }, [moveNodeById, currentPath]);

  const content = (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 transition-colors duration-200"
      style={{
        backgroundColor: isDraggingOver ? `${accentColor}10` : undefined, // 10% opacity
        boxShadow: isDraggingOver ? `inset 0 0 0 2px ${accentColor}80` : undefined // 50% opacity border
      }}
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
      onClick={(e) => {
        // Deselect if clicking on background (not on a button)
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          setSelectedItem(null);
        }
      }}
    >
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
              onClick={() => setSelectedItem(item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors group relative
              ${selectedItem === item.id ? 'bg-white/10' : 'hover:bg-white/5'}
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
              onClick={() => setSelectedItem(item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors 
              ${selectedItem === item.id ? 'bg-white/10' : 'hover:bg-white/5'}
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
                  ? `${item.children?.length || 0} items`
                  : item.size ? `${item.size} bytes` : ''}
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

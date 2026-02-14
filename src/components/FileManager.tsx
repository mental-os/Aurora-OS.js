
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, FolderOpen, FileText, Download, HardDrive, Search, Grid3x3, List, Monitor, Music, Image, Trash, Trash2, Settings, Home, Info, Scissors, Copy } from 'lucide-react';
import { notify } from '@/services/notifications';
import { useAppContext } from '@/components/AppContext';
import { AppTemplate } from '@/components/apps/AppTemplate';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { useFileSystem, FileNode } from '@/components/FileSystemContext';
import { useMusic } from '@/components/MusicContext';
import { checkPermissions } from '@/utils/fileSystemUtils';
import { useAppStorage } from '@/hooks/useAppStorage';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useElementSize } from '@/hooks/useElementSize';
import { FileIcon } from '@/components/ui/FileIcon';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';
import { useI18n } from '@/i18n/index';
import { EmptyState } from '@/components/ui/empty-state';

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

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import { renderContextMenuItems } from '@/components/ui/context-menu-utils';
import { finderContextMenuConfig } from '@/config/app-menus';

export function FileManager({ id, initialPath, onOpenApp, owner }: { id: string; initialPath?: string; onOpenApp?: (id: string, args?: any, owner?: string) => void, owner?: string }) {
  const { accentColor, activeUser: desktopUser } = useAppContext();
  const { t } = useI18n();
  const activeUser = owner || desktopUser;
  useMusic();
  // Drag and Drop Logic
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const { listDirectory, moveNodeById, getNodeAtPath, moveToTrash, resolvePath, users, createDirectory, clipboard, copyNodes, cutNodes, pasteNodes } = useFileSystem();

  // Calculate effective home path for the active user (which might differ from logged-in user)
  const homePath = useMemo(() => {
    if (activeUser === 'root') return '/root';
    // Attempt to find user
    const userObj = users.find(u => u.username === activeUser);
    return userObj ? `/home/${userObj.username}` : `/home/${activeUser}`;
  }, [activeUser, users]);

  const [containerRefSetter, { width }] = useElementSize();
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = width < 450;

  // Persisted state (viewMode survives refresh AND Logout -> User Setting)
  const [appState, setAppState] = useAppStorage('finder', {
    viewMode: 'grid' as 'grid' | 'list',
  });

  // Each FileManager instance has its own navigation state (independent windows, NOT persisted)
  // Edit: User requested persistence but ONLY for Session (Cleared on Logout).
  // We use a shared "last path" preference for the DEFAULT opening path (Scoped to user!)
  const [lastPath, setLastPath] = useSessionStorage(`finder-last-path-${activeUser}`, homePath);

  const startPath = initialPath
    ? (initialPath === '~' || initialPath === '~/' ? homePath : initialPath)
    : lastPath;
  const [currentPath, setCurrentPath] = useState(startPath);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<FileNode[]>([]);
  const [history, setHistory] = useState<string[]>([startPath]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Recursive search logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: { node: FileNode; path: string }[] = [];
    const rootNode = getNodeAtPath(currentPath, activeUser);

    if (!rootNode) return [];

    const search = (node: FileNode, path: string) => {
      // Exclude hidden files from search for cleanliness
      if (node.name.toLowerCase().includes(searchQuery.toLowerCase()) && node.name !== '.' && node.name !== '..') {
        results.push({ node, path });
      }

      if (node.type === 'directory' && node.children) {
        node.children.forEach(child => {
          search(child, path === '/' ? `/${child.name}` : `${path}/${child.name}`);
        });
      }
    };

    // Start search from children of current path
    if (rootNode.children) {
      rootNode.children.forEach(child => {
        search(child, currentPath === '/' ? `/${child.name}` : `${currentPath}/${child.name}`);
      });
    }

    return results;
  }, [searchQuery, currentPath, getNodeAtPath, activeUser]);


  // Sync current path to storage (only if it matches user expectation of "Session")
  useEffect(() => {
    if (currentPath) {
      setLastPath(currentPath);
    }
  }, [currentPath, setLastPath]);

  // Handle Context Menu Actions
  const handleGetInfo = useCallback((pathOrNode: string | FileNode) => {
    let node: FileNode | null | undefined;
    if (typeof pathOrNode === 'string') {
      node = getNodeAtPath(pathOrNode, activeUser);
    } else {
      node = pathOrNode;
    }

    if (node) {
      const modDate = node.modified ? new Date(node.modified).toLocaleDateString() : t('a11y.common.notAvailable');
      const details = (
        <div className="flex flex-col gap-1 mt-1">
          <div className="grid grid-cols-[max-content_1fr] gap-x-2">
            <span className="text-white/50">{t('fileManager.details.type')}:</span>
            <span className="text-white/90">{node.type}</span>
            <span className="text-white/50">{t('fileManager.details.owner')}:</span>
            <span className="text-white/90">{node.owner}</span>
            <span className="text-white/50">{t('fileManager.details.permissions')}:</span>
            <span className="text-white/90 font-mono text-[11px]">{node.permissions || t('a11y.common.notAvailable')}</span>
            <span className="text-white/50">{t('fileManager.details.modified')}:</span>
            <span className="text-white/90">{modDate}</span>
            {node.size !== undefined && (
              <>
                <span className="text-white/50">{t('fileManager.details.size')}:</span>
                <span className="text-white/90">{t('fileManager.details.bytes', { count: node.size })}</span>
              </>
            )}
          </div>
        </div>
      );
      notify.system('success', node.name || t('notifications.subtitles.info'), details, t('notifications.subtitles.info'));
    } else {
      notify.system('error', t('notifications.subtitles.error'), t('fileManager.toasts.couldNotGetInfo'), t('notifications.subtitles.error'));
    }
  }, [getNodeAtPath, activeUser, t]);

  useEffect(() => {
    const handleMenuAction = (e: CustomEvent) => {
      const { action, appId, windowId } = e.detail;
      if (appId !== 'finder' || (windowId && windowId !== id)) return;

      switch (action) {
        case 'new-folder': {
          // Replaced handleCreateFolder logic here
          let name = t('menubar.items.newFolder');
          let counter = 1;
          const checkExists = (n: string) => items.some(i => i.name === n);
          while (checkExists(name)) {
            name = `${t('menubar.items.newFolder')} ${counter}`;
            counter++;
          }
          createDirectory(currentPath, name, activeUser);
          break;
        }
        case 'paste':
          pasteNodes(currentPath, activeUser);
          break;
        case 'get-info': {
          handleGetInfo(currentPath);
          break;
        }
      }
    };

    window.addEventListener('app-menu-action', handleMenuAction as EventListener);
    return () => window.removeEventListener('app-menu-action', handleMenuAction as EventListener);
  }, [currentPath, createDirectory, activeUser, t, id, items, pasteNodes, getNodeAtPath, handleGetInfo]);

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
          notify.system('error', 'Finder', t('fileManager.toasts.permissionDenied', { name: node.name }), t('notifications.subtitles.permissionDenied'));
          return;
        }
        if (!checkPermissions(node, userObj, 'execute')) {
          notify.system('error', 'Finder', t('fileManager.toasts.permissionDenied', { name: node.name }), t('notifications.subtitles.permissionDenied'));
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

  // Handle item double-click (or single click in search results)
  const handleOpenItem = useCallback((item: FileNode, path: string) => {
    if (item.type === 'directory') {
      // If we are searching, clear search state so we enter the folder in normal view
      if (isSearchOpen || searchQuery) {
        setSearchQuery('');
        setIsSearchOpen(false);
      }
      navigateTo(path);
    } else if (item.type === 'file') {

      const isMusic = /\.(mp3|wav|flac|ogg|m4a)$/i.test(item.name);
      const isText = /\.(txt|md|json|js|ts|tsx|css|html|sh)$/i.test(item.name);
      const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(item.name);

      if (isMusic) {
        // Check if music app is installed by checking /usr/bin
        const musicBinary = getNodeAtPath('/usr/bin/music', activeUser);
        if (musicBinary) {
          // Resolve full physical/virtual path for app usage
          const fullPath = resolvePath(path, activeUser);
          // Delegate playback to App via initialPath/data (gated by local logic)
          if (onOpenApp) onOpenApp('music', { path: fullPath, timestamp: Date.now() }, activeUser);
        } else {
          notify.system('error', 'Finder', t('fileManager.toasts.musicNotInstalled'), t('notifications.subtitles.appMissing'));
        }
      } else if (isText) {
        // Check if notepad app is installed by checking /usr/bin
        const notepadBinary = getNodeAtPath('/usr/bin/notepad', activeUser);
        if (notepadBinary) {
          const fullPath = resolvePath(path, activeUser);
          if (onOpenApp) onOpenApp('notepad', { path: fullPath, timestamp: Date.now() }, activeUser);
        } else {
          notify.system('error', 'Finder', t('fileManager.toasts.notepadNotInstalled'), t('notifications.subtitles.appMissing'));
        }
      } else if (isImage) {
        // Check if photos app is installed by checking /usr/bin
        const photosBinary = getNodeAtPath('/usr/bin/photos', activeUser);
        if (photosBinary) {
          const fullPath = resolvePath(path, activeUser);
          if (onOpenApp) onOpenApp('photos', { path: fullPath, timestamp: Date.now() }, activeUser);
        } else {
          notify.system('error', 'Finder', t('fileManager.toasts.photosNotInstalled'), t('notifications.subtitles.appMissing'));
        }
      } else {
        // Fallback or unknowns: maybe open in text editor or show info?
        // For now, just generic "Cannot open"
        notify.system('error', 'Finder', t('fileManager.toasts.fileTypeNotSupported', { type: item.name.split('.').pop() || 'unknown' }), t('notifications.subtitles.fileError'));
      }
    }
  }, [getNodeAtPath, activeUser, resolvePath, onOpenApp, navigateTo, t, isSearchOpen, searchQuery]);

  const handleItemDoubleClick = useCallback((item: FileNode) => {
    const fullPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
    handleOpenItem(item, fullPath);
  }, [currentPath, handleOpenItem]);

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
      type: item.type,
      sourceUser: activeUser // Pass source user context for permission checks
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, [selectedItems, activeUser]); // dependencies

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
      setIsDraggingOver(false);
      e.stopPropagation();
    } else {
      // If target is file, let it bubble to container (drop INTO current path)
      return;
    }

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      const idsToMove = data.ids || (data.id ? [data.id] : []);

      let movedCount = 0;
      idsToMove.forEach((id: string) => {
        if (id === targetItem.id) return; // Can't drop on self

        const destPath = currentPath === '/'
          ? `/${targetItem.name}`
          : `${currentPath}/${targetItem.name}`;

        if (moveNodeById(id, destPath, activeUser, data.sourceUser)) {
          movedCount++;
        }
      });


      if (movedCount > 0) {
        const key = movedCount === 1 ? 'fileManager.toasts.movedItemTo' : 'fileManager.toasts.movedItemsTo';
        notify.system('success', 'Finder', t(key, { count: movedCount, target: targetItem.name }), t('notifications.subtitles.moved'));
      }

    } catch (err) {
      console.error('Failed to parse drag data', err);
      notify.system('error', 'Finder', t('fileManager.toasts.moveFailedInvalidData'), t('notifications.subtitles.failed'));
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

      let movedCount = 0;
      idsToMove.forEach((id: string) => {
        if (moveNodeById(id, targetPath, activeUser, data.sourceUser)) {
          movedCount++;
        }
      });

      if (movedCount > 0) {
        const key = movedCount === 1 ? 'fileManager.toasts.movedItemTo' : 'fileManager.toasts.movedItemsTo';
        notify.system('success', 'Finder', t(key, { count: movedCount, target: targetPath.split('/').pop() || targetPath }), t('notifications.subtitles.moved'));
      }
    } catch (err) {
      console.error('Failed to drop on sidebar', err);
      notify.system('error', 'Finder', t('fileManager.toasts.failedToProcessDrop'), t('notifications.subtitles.failed'));
    }
  }, [moveNodeById, activeUser, t]);

  // Helper to create sidebar action props
  const sidebarDropProps = useCallback((path: string) => ({
    onDragOver: handleSidebarDragOver,
    onDrop: (e: React.DragEvent) => handleSidebarDrop(e, path)
  }), [handleSidebarDragOver, handleSidebarDrop]);

  // Sidebar configuration
  const fileManagerSidebar = useMemo(() => {
    // Determine the home path for the ACTIVE user (owner of this window), not necessarily the logged-in user
    const userHomePath = activeUser === 'root' ? '/root' : `/home/${activeUser}`;

    // Helper to Create Items if they exist
    const createSidebarItem = (id: string, icon: any, label: string, path: string) => {
      const node = getNodeAtPath(path, activeUser);
      // Only show if node exists
      if (!node) return null;

      const badge = (node.type === 'directory' && node.children && node.children.length > 0)
        ? node.children.length.toString()
        : undefined;

      return {
        id,
        icon,
        label,
        badge,
        action: () => navigateTo(path),
        ...sidebarDropProps(path)
      };
    };

    const favoritesToCheck = [
      { id: 'home', icon: Home, label: t('fileManager.places.home'), path: userHomePath },
      { id: 'desktop', icon: Monitor, label: t('fileManager.places.desktop'), path: `${userHomePath}/Desktop` },
      { id: 'documents', icon: FileText, label: t('fileManager.places.documents'), path: `${userHomePath}/Documents` },
      { id: 'downloads', icon: Download, label: t('fileManager.places.downloads'), path: `${userHomePath}/Downloads` },
      { id: 'pictures', icon: Image, label: t('fileManager.places.pictures'), path: `${userHomePath}/Pictures` },
      { id: 'music', icon: Music, label: t('fileManager.places.music'), path: `${userHomePath}/Music` },
    ];

    const trashPath = `${userHomePath}/.Trash`;
    const trashNode = getNodeAtPath(trashPath, activeUser);
    const isTrashEmpty = !trashNode?.children || trashNode.children.length === 0;

    // Only show Trash if it exists (it should, but good to be safe)
    const trashItem = trashNode ? {
      id: 'trash',
      icon: isTrashEmpty ? Trash : Trash2,
      label: t('fileManager.places.trash'),
      badge: (trashNode.children && trashNode.children.length > 0) ? trashNode.children.length.toString() : undefined,
      action: () => navigateTo(trashPath),
      ...sidebarDropProps(trashPath)
    } : null;

    // Filter out nulls
    const favorites = favoritesToCheck
      .map(item => createSidebarItem(item.id, item.icon, item.label, item.path))
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      sections: [
        {
          title: t('fileManager.sidebar.favorites'),
          items: favorites
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
          items: trashItem ? [trashItem] : []
        },
      ]
    };
  }, [activeUser, navigateTo, sidebarDropProps, getNodeAtPath, t]);

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
              const key = selectedItems.size === 1 ? 'fileManager.toasts.movedItemToTrash' : 'fileManager.toasts.movedItemsToTrash';
              notify.system('success', 'Finder', t(key, { count: selectedItems.size }), t('notifications.subtitles.trash'));
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
          {isSearchOpen ? (
            <div className="relative w-full max-w-md mx-auto flex items-center animate-in fade-in duration-200">
              <Search className="absolute left-3 w-4 h-4 text-white/40" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('fileManager.actions.search')}
                className="w-full bg-black/20 border border-white/10 rounded-full py-1.5 pl-9 pr-8 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-black/30 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                    // Refocus grid on escape?
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white"
                >
                  <span className="sr-only">Clear</span>
                  <div className="w-3 h-3 flex items-center justify-center font-bold text-[10px]">✕</div>
                </button>
              )}
            </div>
          ) : (
            currentPath === '/' ? (
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
                const resolvedPath = resolvePath(currentPath, activeUser);
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
            )
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
        <button
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (!isSearchOpen) setTimeout(() => (document.querySelector('input[type="text"]') as HTMLElement)?.focus(), 50);
          }}
          className={`p-1.5 rounded-md transition-colors ${isSearchOpen ? 'bg-white/20 text-white' : 'hover:bg-white/5 text-white/50'}`}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
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
        // Logic for Container Drop (into currentPath):
        // We don't have the original filename easily unless we look it up or passed it.
        // `moveNodeById` logic: `destParentPath` should be the folder path.
        // But `moveNodeById` implementation expects `destParentPath` ??
        // Actually, let's re-read `moveNodeById` implementation I JUST CHANGED.
        // `const destParent = getNodeAtPath(resolvePath(destParentPath), asUser);`
        // So `destParentPath` is indeed the PARENT folder.
        // AND it does `if (destParent.children.some(child => child.name === nodeToMove.name)) return false;`
        // So it uses the node's EXISTING name.

        // Therefore, we just pass `currentPath` as `destParentPath`.

        if (moveNodeById(id, currentPath, activeUser, data.sourceUser)) {
          movedCount++;
        }
      });

      if (movedCount > 0) {
        if (movedCount === 1) {
          notify.system('success', t('notifications.subtitles.moved') || 'Moved', t('fileManager.toasts.movedItem') || 'Moved 1 item');
        } else {
          notify.system('success', t('notifications.subtitles.moved') || 'Moved', t('fileManager.toasts.movedItems', { count: movedCount }) || `Moved ${movedCount} items`);
        }
        // feedback.move(); // Assuming feedback is defined elsewhere
      }
    } catch (err) {
      console.error('Drop error:', err);
      notify.system('error', t('notifications.subtitles.failed') || 'Failed', t('fileManager.toasts.failedToProcessDrop') || 'Failed to process drop');
    }
  }, [currentPath, moveNodeById, activeUser, t, setIsDraggingOver]);

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

  // Context Menu Helpers
  const handleCopy = useCallback((id: string) => {
    const node = items.find(i => i.id === id);
    if (!node) return;
    // Check READ permission
    if (!checkPermissions(node, users.find(u => u.username === activeUser) || { username: activeUser } as any, 'read')) {
      notify.system('error', 'Permission Denied', 'Cannot copy item');
      return;
    }
    copyNodes([id], activeUser);
  }, [items, users, activeUser, copyNodes]);

  const handleCut = useCallback((id: string) => {
    const node = items.find(i => i.id === id);
    if (!node) return;
    // Check WRITE permission (to delete original)
    // Actually cut doesn't check until move? But UI usually checks.
    // Let's defer to operation time or check generic write on parent?
    // We'll just allow it and let paste fail if needed.
    cutNodes([id], activeUser);
  }, [items, activeUser, cutNodes]);





  // Context Menu for Items (Grid/List)
  const renderItemContextMenu = (item: FileNode, children: React.ReactNode) => (
    <ContextMenu key={item.id}>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => {
          const fullPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
          handleOpenItem(item, fullPath);
        }}>
          <FolderOpen className="mr-2 h-4 w-4" /> {t('a11y.common.open')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleCopy(item.id)}>
          <Copy className="mr-2 h-4 w-4" /> {t('menubar.items.copy')}
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleCut(item.id)}>
          <Scissors className="mr-2 h-4 w-4" /> {t('menubar.items.cut')}
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => handleGetInfo(item)}>
          <Info className="mr-2 h-4 w-4" /> {t('menubar.items.getInfo')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => {
            const fullPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
            moveToTrash(fullPath, activeUser);
          }}
          className="text-red-400 focus:text-red-400 focus:bg-red-500/20"
        >
          <Trash2 className="mr-2 h-4 w-4" /> {t('fileManager.actions.moveToTrash')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  const content = (
    <ContextMenu>
      <ContextMenuTrigger asChild disabled={selectedItems.size > 0 && !selectionBox}>
        {/* Explicitly disable background context menu if items are selected? 
        Actually, usually clicking on background clears selection unless modifier. 
        Our onMouseDown clears selection if not clicking a button.
        But Right Click (Context Menu) ALSO fires mousedown usually?
        If I right click background, `onMouseDown` fires -> clears selection -> Background Menu opens.
        So this is fine.
    */}
        <div
          ref={(node: HTMLDivElement | null) => {
            containerRefSetter(node);
            gridRef.current = node;
          }}
          // ... props ...
          className="flex-1 overflow-y-auto p-6 transition-colors duration-200 relative outline-none"
          tabIndex={0}
          style={{
            backgroundColor: isDraggingOver ? `${accentColor}10` : undefined,
            boxShadow: isDraggingOver ? `inset 0 0 0 2px ${accentColor}80` : undefined
          }}
          onDragOver={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={handleContainerDrop}
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('button')) {
              if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
                setSelectedItems(new Set());
              }
              setSelectionBox({
                start: { x: e.clientX, y: e.clientY },
                current: { x: e.clientX, y: e.clientY }
              });
            }
          }}
        >
          {/* ... selection box ... */}
          {selectionBox && gridRef.current && (
            // ... (abbreviated, use original code if possible or keep logic)
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

          {searchQuery ? (
            // Search Logic (keep as is)
            <div className="flex flex-col gap-1 w-full relative h-full">
              {searchResults.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title={t('fileManager.search.noResultsTitle')}
                  description={t('fileManager.search.noResultsDesc', { query: searchQuery })}
                  className="h-full"
                />
              ) : (
                <div className="flex flex-col gap-1 p-2 w-full">
                  <h3 className="text-white/50 text-xs uppercase font-medium px-2 mb-2 sticky top-0 backdrop-blur-md bg-black/20 z-10 py-2 rounded-lg">
                    {t('fileManager.search.resultsTitle', { count: searchResults.length })}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {searchResults.map(({ node, path }) => (
                      <button
                        key={path}
                        onClick={() => handleOpenItem(node, path)}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 text-left group w-full transition-colors"
                      >
                        <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                          <FileIcon name={node.name} type={node.type} accentColor={accentColor} className="w-full h-full" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-white group-hover:text-white transition-colors truncate">{node.name}</span>
                          <span className="text-xs text-white/40 truncate">{path}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title={t('fileManager.emptyFolder')}
              className="h-full"
            />
          ) : appState.viewMode === 'grid' ? (
            <ResponsiveGrid minItemWidth={110} className="gap-6">
              {items.map((item) =>
                renderItemContextMenu(item, (
                  <button
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
                ))
              )}
            </ResponsiveGrid>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((item) =>
                renderItemContextMenu(item, (
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
                ))
              )}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {renderContextMenuItems(
          finderContextMenuConfig.items.map(item => {
            if (item.type === 'item' && item.action === 'paste') {
              return { ...item, disabled: clipboard.items.length === 0 };
            }
            return item;
          }),
          t,
          'finder',
          id
        )}
      </ContextMenuContent>
    </ContextMenu>
  );

  return <AppTemplate sidebar={fileManagerSidebar} toolbar={toolbar} content={content} minContentWidth={600} />;
}


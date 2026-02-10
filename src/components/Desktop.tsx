import React, { useState, useEffect, memo, useRef, forwardRef } from 'react';
import { useAppContext } from './AppContext';

export interface DesktopIcon {
  id: string;
  name: string;
  type: 'folder' | 'file';
  position: { x: number; y: number };
  isEmpty?: boolean;
}
// import { lightenColor } from '../utils/colors';
import { FileIcon } from './ui/FileIcon';
import { useFileSystem } from './FileSystemContext';
import { ContextMenuItem as ContextMenuItemType } from '../types';
import { useI18n } from '../i18n';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from './ui/context-menu';
import { renderContextMenuItems } from './ui/context-menu-utils';
// import { checkPermissions } from '../utils/fileSystemUtils';
import { FolderOpen, Trash2, Clipboard, Image as ImageIcon, Scissors, Copy, Info } from 'lucide-react';
import { notify } from '../services/notifications';
// Default wallpaper is now pulled from the public folder (user-provided yAMI wallpaper)
const defaultWallpaper = '/yami-wallpaper.jpg';
import orbitWallpaper from '../assets/images/wallpaper-orbit.png';
import meshWallpaper from '../assets/images/wallpaper-mesh.png';
import dunesWallpaper from '../assets/images/wallpaper-dunes.png';

const WALLPAPERS: Record<string, string> = {
  default: defaultWallpaper,
  orbit: orbitWallpaper,
  mesh: meshWallpaper,
  dunes: dunesWallpaper,
};

interface DesktopProps {
  onDoubleClick: () => void;
  icons: DesktopIcon[];
  onUpdateIconsPositions: (updates: Record<string, { x: number; y: number }>) => void; // Batch update
  onIconDoubleClick: (iconId: string) => void;
  onOpenApp: (type: string, data?: any) => void;
}

// Helper for hiding native drag ghost
const emptyImage = new Image();
emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const desktopContextMenu: ContextMenuItemType[] = [
  { type: 'item', labelKey: 'menubar.items.newFolder', label: 'New Folder', action: 'new-folder', icon: FolderOpen },
  { type: 'item', labelKey: 'menubar.items.paste', label: 'Paste', action: 'paste', disabled: true, icon: Clipboard },
  { type: 'separator' },
  { type: 'item', labelKey: 'menubar.items.changeWallpaper', label: 'Change Wallpaper', action: 'change-wallpaper', icon: ImageIcon },
];

function DesktopComponent({ onDoubleClick, icons, onUpdateIconsPositions, onIconDoubleClick, onOpenApp }: DesktopProps) {
  const { accentColor, reduceMotion, disableShadows, wallpaper, activeUser } = useAppContext();
  const { moveNodeById, createDirectory, resolvePath, clipboard, copyNodes, cutNodes, pasteNodes, moveToTrash, getNodeAtPath } = useFileSystem();
  const { t } = useI18n();

  // Helpers
  const handleCopy = (id: string) => {
      copyNodes([id], activeUser);
  };

  const handleCut = (id: string) => {
      cutNodes([id], activeUser);
  };



  const handleMoveToTrash = (name: string) => {
      const fullPath = resolvePath(`~/Desktop/${name}`);
      moveToTrash(fullPath, activeUser);
  };

  const handleGetInfo = (name: string) => {
      const fullPath = resolvePath(`~/Desktop/${name}`);
      const node = getNodeAtPath(fullPath, activeUser);
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
  };
  useEffect(() => {
    const handleMenuAction = (e: CustomEvent) => {
      const { action, appId } = e.detail;
      if (appId !== 'desktop') return;

      switch (action) {
        case 'new-folder':
          createDirectory(resolvePath('~/Desktop'), t('menubar.items.newFolder'), activeUser);
          break;
        case 'paste':
          pasteNodes(resolvePath('~/Desktop'), activeUser);
          break;
        case 'change-wallpaper':
          // Open Settings -> Wallpapers section (via event + app open)
          window.dispatchEvent(new CustomEvent('aurora-open-settings-section', { detail: 'wallpapers' }));
          onOpenApp('settings');
          break;
      }
    };

    window.addEventListener('app-menu-action', handleMenuAction as EventListener);
    return () => window.removeEventListener('app-menu-action', handleMenuAction as EventListener);
  }, [createDirectory, resolvePath, onOpenApp, activeUser, pasteNodes, t]);

  // Selection State

  // Selection State
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number }, current: { x: number, y: number } } | null>(null);

  // Dragging State
  const [draggingIcons, setDraggingIcons] = useState<string[]>([]);
  const [dragStartPos, setDragStartPos] = useState<{ x: number, y: number } | null>(null);
  const [dragDelta, setDragDelta] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Refs for current values in event listeners
  const iconsRef = useRef(icons);
  useEffect(() => { iconsRef.current = icons; }, [icons]);

  // Ref for mutable drag state to keep event listeners stable
  const dragStateRef = useRef({
    draggingIcons: [] as string[],
    dragStartPos: null as { x: number, y: number } | null,
  });

  // Sync refs with state
  useEffect(() => {
    dragStateRef.current.draggingIcons = draggingIcons;
    dragStateRef.current.dragStartPos = dragStartPos;
  }, [draggingIcons, dragStartPos]);

  // Handle Internal Drag Visuals via DragOver (Native DnD)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const { draggingIcons, dragStartPos } = dragStateRef.current;

    // If we are dragging internal icons, update the visual delta
    // We use e.clientX/Y from the dragover event on the container
    if (draggingIcons.length > 0 && dragStartPos) {
      setDragDelta({
        x: e.clientX - dragStartPos.x,
        y: e.clientY - dragStartPos.y
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      // Case 1: Internal Drop (Desktop -> Desktop)
      if (data.source === 'desktop') {
        const { draggingIcons, dragStartPos } = dragStateRef.current;
        if (draggingIcons.length > 0 && dragStartPos) {
          const deltaX = e.clientX - dragStartPos.x;
          const deltaY = e.clientY - dragStartPos.y;

          const updates: Record<string, { x: number; y: number }> = {};

          draggingIcons.forEach(id => {
            const icon = iconsRef.current.find(i => i.id === id);
            if (icon) {
              const newX = icon.position.x + deltaX;
              let newY = icon.position.y + deltaY;
              newY = Math.max(0, newY);
              updates[id] = { x: newX, y: newY };
            }
          });

          if (Object.keys(updates).length > 0) {
            onUpdateIconsPositions(updates);
          }
        }
      }
      // Case 2: External Drop (Finder -> Desktop)
      else if (data.ids || data.id) {
        const idsToMove: string[] = data.ids || [data.id];

        idsToMove.forEach(id => {
           moveNodeById(id, '~/Desktop', undefined, data.sourceUser);
        });
      }
    } catch (err) {
      console.error('Failed to handle desktop drop', err);
    }

    // Reset state
    setDraggingIcons([]);
    setDragStartPos(null);
    setDragDelta({ x: 0, y: 0 });
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    // Fired on the source element when drag completes (success or cancel)
    // This ensures we clean up if the drop happened outside or was cancelled
    setDraggingIcons([]);
    setDragStartPos(null);
    setDragDelta({ x: 0, y: 0 });
  };

  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    // If clicking on background, clear selection unless Shift/Ctrl
    if (!e.shiftKey && !e.ctrlKey) {
      setSelectedIcons(new Set());
    }

    // Start selection box
    setSelectionBox({
      start: { x: e.clientX, y: e.clientY },
      current: { x: e.clientX, y: e.clientY }
    });
  };

  // Selection Box Logic (Keep mouse events for selection box ONLY)
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (selectionBox) {
        setSelectionBox(prev => prev ? { ...prev, current: { x: e.clientX, y: e.clientY } } : null);
      }
    };

    const handleGlobalMouseUp = (_e: MouseEvent) => {
      if (selectionBox) {
        // Selection Box Commit
        const boxRect = {
          left: Math.min(selectionBox.start.x, selectionBox.current.x),
          top: Math.min(selectionBox.start.y, selectionBox.current.y),
          right: Math.max(selectionBox.start.x, selectionBox.current.x),
          bottom: Math.max(selectionBox.start.y, selectionBox.current.y)
        };

        const newSelection = new Set(selectedIcons);
        iconsRef.current.forEach(icon => {
          const iconCenter = { x: icon.position.x + 50, y: icon.position.y + 50 };
          if (
            iconCenter.x >= boxRect.left &&
            iconCenter.x <= boxRect.right &&
            iconCenter.y >= boxRect.top &&
            iconCenter.y <= boxRect.bottom
          ) {
            newSelection.add(icon.id);
          }
        });
        setSelectedIcons(newSelection);
        setSelectionBox(null);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [selectionBox, selectedIcons]);

  const handleIconMouseDown = (e: React.MouseEvent, iconId: string) => {
    e.stopPropagation();
    const newSelection = new Set(selectedIcons);
    if (e.ctrlKey || e.shiftKey || e.metaKey) {
      if (newSelection.has(iconId)) newSelection.delete(iconId);
      else newSelection.add(iconId);
    } else {
      if (!newSelection.has(iconId)) {
        newSelection.clear();
        newSelection.add(iconId);
      }
    }
    setSelectedIcons(newSelection);
  };

  // --- Native Drag Support ---
  const handleNativeDragStart = (e: React.DragEvent, icon: DesktopIcon) => {
    // START DRAG
    const { clientX, clientY } = e;
    setDragStartPos({ x: clientX, y: clientY });

    // Set Dragged Items
    let itemsToDrag = Array.from(selectedIcons);
    if (!itemsToDrag.includes(icon.id)) {
      itemsToDrag = [icon.id];
      setSelectedIcons(new Set([icon.id]));
    }
    setDraggingIcons(itemsToDrag);

    // Set Native Data
    e.dataTransfer.setDragImage(emptyImage, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: icon.id,
      ids: itemsToDrag, // Multi-item support
      name: icon.name,
      type: icon.type === 'folder' ? 'directory' : 'file',
      source: 'desktop',
      sourceUser: activeUser // Pass source user context!
    }));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild disabled={selectedIcons.size > 0 && !selectionBox}>
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-[background-image] duration-500"
          onMouseDown={handleDesktopMouseDown}
          onDoubleClick={onDoubleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            backgroundImage: `url(${WALLPAPERS[wallpaper] || WALLPAPERS.default})`,
          }}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" />

          {/* Selection Box */}
          {selectionBox && (
            <div
              className="absolute border border-blue-400/50 bg-blue-500/20 z-50 pointer-events-none"
              style={{
                left: Math.min(selectionBox.start.x, selectionBox.current.x),
                top: Math.min(selectionBox.start.y, selectionBox.current.y),
                width: Math.abs(selectionBox.current.x - selectionBox.start.x),
                height: Math.abs(selectionBox.current.y - selectionBox.start.y),
              }}
            />
          )}

          {/* Desktop Icons */}
          {icons.map((icon) => (
            <ContextMenu key={icon.id}>
             <ContextMenuTrigger asChild>
                <DesktopIconItem
                  icon={icon}
                  selected={selectedIcons.has(icon.id)}
                  dragging={draggingIcons.includes(icon.id)}
                  dragDelta={dragDelta}
                  reduceMotion={reduceMotion}
                  disableShadows={disableShadows}
                  accentColor={accentColor}
                  onMouseDown={handleIconMouseDown}
                  onDragStart={handleNativeDragStart}
                  onDragEnd={handleDragEnd}
                  onDoubleClick={onIconDoubleClick}
                />
             </ContextMenuTrigger>
             <ContextMenuContent className="w-48">
                <ContextMenuItem onClick={() => onIconDoubleClick(icon.id)}>
                    <FolderOpen className="mr-2 h-4 w-4" /> {t('menubar.items.open') || 'Open'}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleCopy(icon.id)}>
                    <Copy className="mr-2 h-4 w-4" /> {t('menubar.items.copy') || 'Copy'} <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleCut(icon.id)}>
                    <Scissors className="mr-2 h-4 w-4" /> {t('menubar.items.cut') || 'Cut'} <ContextMenuShortcut>⌘X</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleGetInfo(icon.name)}>
                    <Info className="mr-2 h-4 w-4" /> {t('menubar.items.getInfo') || 'Get Info'}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                    onClick={() => handleMoveToTrash(icon.name)}
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/20"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> {t('menubar.items.moveToTrash') || 'Move to Trash'}
                </ContextMenuItem>
             </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {renderContextMenuItems(
          desktopContextMenu.map(item => {
            if (item.type === 'item' && item.action === 'paste') {
               return { ...item, disabled: clipboard.items.length === 0 };
            }
            return item;
          }),
          t,
          'desktop',
          'desktop'
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Memoized Icon Component to prevent unnecessary re-renders
interface DesktopIconItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDoubleClick' | 'onMouseDown' | 'onDragStart'> {
  icon: DesktopIcon;
  selected: boolean;
  dragging: boolean;
  dragDelta: { x: number; y: number };
  reduceMotion: boolean;
  disableShadows: boolean;
  accentColor: string;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onDragStart: (e: React.DragEvent, icon: DesktopIcon) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDoubleClick: (id: string) => void;
}

const DesktopIconItem = memo(forwardRef<HTMLDivElement, DesktopIconItemProps>(function DesktopIconItem({
  icon,
  selected,
  dragging,
  dragDelta,
  reduceMotion,
  disableShadows,
  accentColor,
  onMouseDown,
  onDragStart,
  onDragEnd,
  onDoubleClick,
  ...props
}, ref) {
  // Calculate temporary position if being dragged
  const position = dragging
    ? { x: icon.position.x + dragDelta.x, y: icon.position.y + dragDelta.y }
    : icon.position;

  return (
    <div
      ref={ref}
      {...props}
      draggable
      onDragStart={(e) => onDragStart(e, icon)}
      onDragEnd={onDragEnd}
      className={`absolute flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer select-none 
      ${(!reduceMotion && !dragging) ? 'transition-all duration-75' : ''} 
      ${selected ? 'bg-white/20 backdrop-blur-sm ring-1 ring-white/30' : 'hover:bg-white/5'} ${props.className || ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: '100px',
        // Disable transition during drag for instant feel
        transition: dragging ? 'none' : undefined
      }}
      onMouseDown={(e) => onMouseDown(e, icon.id)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(icon.id);
      }}
    >
      <div className={`relative w-14 h-14 mb-1 ${!disableShadows ? 'drop-shadow-lg' : ''}`}>
        <FileIcon
          name={icon.name}
          type={icon.type === 'folder' ? 'directory' : 'file'}
          accentColor={accentColor}
          className="w-full h-full"
          isEmpty={icon.isEmpty}
        />
      </div>

      <div className={`text-[11px] leading-tight text-white text-center px-2 py-0.5 rounded
      ${!disableShadows ? 'drop-shadow-md text-shadow-sm' : ''} truncate w-full`}>
        {icon.name}
      </div>
    </div>
  );
}));

export const Desktop = memo(DesktopComponent);

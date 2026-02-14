import { useState, useCallback, useMemo, useEffect, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Desktop, DesktopIcon } from '@/components/Desktop';
import { MenuBar } from '@/components/MenuBar';
import { Dock } from '@/components/Dock';
import { Window } from '@/components/Window';
import { PlaceholderApp } from '@/components/apps/PlaceholderApp';
import { useAppContext } from '@/components/AppContext';
import { useFileSystem, type FileSystemContextType } from '@/components/FileSystemContext';
import { Toaster } from '@/components/ui/sonner';
import { notify } from '@/services/notifications';
import { getGridConfig, gridToPixel, pixelToGrid, findNextFreeCell, gridPosToKey, rearrangeGrid, type GridPosition } from '@/utils/gridSystem';
import { STORAGE_KEYS } from '@/utils/memory';
import { safeParseLocal } from '@/utils/safeStorage';
import { useWindowManager } from '@/hooks/useWindowManager';
import { useI18n } from '@/i18n/index';
import { AppNotificationsProvider } from '@/components/AppNotificationsContext';
import { WindowLoading } from '@/components/ui/WindowLoading';
import { APP_REGISTRY } from '@/config/appRegistry';

// Load icon positions (supports both pixel and grid formats with migration)
function loadIconPositions(): Record<string, GridPosition> {
    try {
        const data = safeParseLocal<Record<string, any>>(STORAGE_KEYS.DESKTOP_ICONS);
        if (data && typeof data === 'object') {
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
            return data as Record<string, GridPosition>;
        }
    } catch (e) {
        console.warn('Failed to load desktop positions:', e);
    }
    return {};
}

export default function OS() {
    const { activeUser, reduceMotion } = useAppContext();
    const { t } = useI18n();

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

    const openWindowRef = useRef<(type: string, data?: { path?: string; timestamp?: number }, owner?: string) => void>(() => { });

    // Helper to generate content
    const getAppContent = useCallback((type: string, data?: any, owner?: string): { content: React.ReactNode, title: string } => {
        // Special Case: Trash (uses Finder)
        if (type === 'trash') {
            const Finder = APP_REGISTRY.finder.component;
            return {
                title: 'Trash',
                content: (
                    <Suspense fallback={<WindowLoading />}>
                        <Finder id="template" owner={owner} initialPath="~/.Trash" onOpenApp={(type: string, data?: any, owner?: string) => openWindowRef.current(type, data, owner)} />
                    </Suspense>
                )
            };
        }

        const appConfig = APP_REGISTRY[type];
        if (!appConfig) {
            const title = type.charAt(0).toUpperCase() + type.slice(1);
            return { content: <PlaceholderApp title={title} />, title };
        }

        const Component = appConfig.component;
        const title = appConfig.name;

        // Construct props dynamically
        const props: any = { owner };

        // ID="template" for window-instantiated apps that need internal state isolation or unique IDs
        if (['finder', 'music', 'notepad', 'terminal'].includes(type)) {
            props.id = 'template';
        }

        // Common Data Props
        if (data?.path) props.initialPath = data.path;

        // App-Specific Props
        if (type === 'messages' && data?.partner) {
            props.initialPartner = data.partner;
        }

        // Open App Handlers
        if (['finder', 'photos', 'music', 'appstore'].includes(type)) {
            props.onOpenApp = (type: string, data?: any, owner?: string) => openWindowRef.current(type, data, owner);
        }

        // Terminal Special Handler
        if (type === 'terminal') {
            props.onLaunchApp = (id: string, args: any[], owner: string) => 
                openWindowRef.current(id, { path: args?.[0], timestamp: Date.now() }, owner);
        }

        return {
            title,
            content: (
                <Suspense fallback={<WindowLoading />}>
                    <Component {...props} />
                </Suspense>
            )
        };
    }, []); // openWindowRef is stable

    // Use Window Manager Hook
    const {
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowState
    } = useWindowManager(activeUser, getAppContent, useAppContext().totalMemoryGB);

    useEffect(() => {
        openWindowRef.current = openWindow;
    }, [openWindow]);

    /* 
     * Window interaction handlers are now managed by useWindowManager
     * Persistence logic is also encapsulated there.
     */

    const updateIconsPositions = useCallback((updates: Record<string, { x: number; y: number }>) => {
        const config = getGridConfig(window.innerWidth, window.innerHeight);

        // 1. Prepare maps
        const newPositionsMap = { ...iconGridPositions };
        const itemsToMoveIntoFolders: { id: string, folderName: string }[] = [];
        const itemsToUpdateGrid: { id: string, gridPos: GridPosition }[] = [];

        // 2. First Pass: Check for Folder Drops and calculate initial Grid Targets
        Object.entries(updates).forEach(([id, position]) => {
            const targetGridPos = pixelToGrid(position.x, position.y, config);
            const targetCellKey = gridPosToKey(targetGridPos);

            // Check collision with existing folders (excluding self and other dragged items essentially)
            // We check against the *entire* current desktopIcons list to find folders.
            // If we drop ON A FOLDER, we move it.

            const conflictingIcon = desktopIcons.find(icon => {
                const iconGridPos = iconGridPositions[icon.id];
                // Must be different ID, and at the target cell
                return icon.id !== id && iconGridPos && gridPosToKey(iconGridPos) === targetCellKey;
            });

            if (conflictingIcon && conflictingIcon.type === 'folder') {
                const targetPixelPos = gridToPixel(iconGridPositions[conflictingIcon.id], config);
                const targetCenter = { x: targetPixelPos.x + 50, y: targetPixelPos.y + 50 };
                const dragCenter = { x: position.x + 50, y: position.y + 50 };
                const dx = targetCenter.x - dragCenter.x;
                const dy = targetCenter.y - dragCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 35) {
                    itemsToMoveIntoFolders.push({ id, folderName: conflictingIcon.name });
                    // Remove from grid map immediately if we are moving it away
                    delete newPositionsMap[id];
                    return; // Skip grid placement for this item
                }
            }

            // If not moving into folder, it counts as a grid update
            itemsToUpdateGrid.push({ id, gridPos: targetGridPos });
            // Temporarily place it in the map for collision checks with *subsequent* items?
            // Actually we should place them all, then resolving conflicts.
            newPositionsMap[id] = targetGridPos;
        });

        // 3. Process Folder Moves
        itemsToMoveIntoFolders.forEach(({ id, folderName }) => {
            const destParentPath = resolvePath(`~/Desktop/${folderName}`);
            moveNodeById(id, destParentPath);
        });

        // 4. Process Grid Collisions & Rearrangement
        // We iterate through our proposed grid updates and verify if they collide with *static* items or *other dragged* items?
        // Actually, rearrangeGrid handles shifting *others* out of the way.
        // If we have multiple items, we should apply them sequentially or as a group?
        // Sequential application on top of accumulated state is safest.

        let finalPositions = { ...newPositionsMap };

        itemsToUpdateGrid.forEach(({ id, gridPos }) => {
            // Apply rearrangement for this single update against the *current accumulated* grid
            // This ensures subsequent items in the batch see the shifted obstacles of previous items.
            finalPositions = rearrangeGrid(
                Object.keys(finalPositions), // All currently tracked IDs
                finalPositions,
                id,
                gridPos,
                windowSize.height,
                config
            );
        });

        // 5. Update State
        setIconGridPositions(finalPositions);

    }, [desktopIcons, iconGridPositions, windowSize, resolvePath, moveNodeById]);



    const handleIconDoubleClick = useCallback((iconId: string) => {
        const icon = desktopIcons.find(i => i.id === iconId);
        if (!icon) return;

        const path = resolvePath(`~/Desktop/${icon.name}`);
        const node = getNodeAtPath(path);

        if (node?.type === 'directory') {
            openWindow('finder', { path });
        } else if (node?.type === 'file') {
            // Check file extension to determine which app to use
            const isMusic = /\.(mp3|wav|flac|ogg|m4a)$/i.test(icon.name);
            const isText = /\.(txt|md|json|js|ts|tsx|css|html|sh)$/i.test(icon.name);
            const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(icon.name);

            if (isMusic) {
                // Check if music app is installed by checking /usr/bin
                const musicBinary = getNodeAtPath('/usr/bin/music');
                if (musicBinary) {
                    // Inject timestamp to force update and allow Music app to handle playback on mount/update
                    openWindowRef.current('music', { path, timestamp: Date.now() });
                } else {
                    notify.system('error', 'OS', t('os.toasts.musicNotInstalled'), t('notifications.subtitles.appMissing'));
                }
            } else if (isText) {
                // Check if notepad app is installed by checking /usr/bin
                const notepadBinary = getNodeAtPath('/usr/bin/notepad');
                if (notepadBinary) {
                    openWindow('notepad', { path, timestamp: Date.now() });
                } else {
                    notify.system('error', 'OS', t('os.toasts.notepadNotInstalled'), t('notifications.subtitles.appMissing'));
                }
            } else if (isImage) {
                const photosBinary = getNodeAtPath('/usr/bin/photos');
                if (photosBinary) {
                    openWindow('photos', { path, timestamp: Date.now() });
                } else {
                    notify.system('error', 'OS', t('os.toasts.photosNotInstalled'), t('notifications.subtitles.appMissing'));
                }
            }
        }

    }, [desktopIcons, resolvePath, getNodeAtPath, openWindow, t]);

    const focusedWindowId = useMemo(() => {
        if (windows.length === 0) return null;
        return windows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, windows[0]).id;
    }, [windows]);

    const focusedAppType = useMemo(() => {
        if (!focusedWindowId) return null;
        return focusedWindowId.split('-')[0];
    }, [focusedWindowId]);

    return (
        <AppNotificationsProvider onOpenApp={openWindow}>
        <div className="dark h-screen w-screen overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative">
            <div className="window-drag-boundary absolute top-7 left-0 right-0 bottom-0 pointer-events-none z-0" />
            <Desktop
                onDoubleClick={() => { }}
                icons={desktopIcons}
                onUpdateIconsPositions={updateIconsPositions}
                onIconDoubleClick={handleIconDoubleClick}
                onOpenApp={openWindow}
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

            <AnimatePresence>
                {windows.map(window => {
                    // Memoization Fix: We pass the Window object directly.
                    // The 'content' property inside 'window' is stable from useWindowManager.
                    // We DO NOT cloneElement here anymore, avoiding new object creation on every render.
                    // This allows React.memo(Window) to actually prevent re-renders of unfocused windows.
                    return (
                    <motion.div
                        key={window.id}
                        initial={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
                        animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{ zIndex: window.zIndex }}
                    >
                        <Window
                            window={window} // Pass the stable state object directly
                            onClose={() => closeWindow(window.id)}
                            onMinimize={() => minimizeWindow(window.id)}
                            onMaximize={() => maximizeWindow(window.id)}
                            onFocus={() => focusWindow(window.id)}
                            onUpdateState={(updates: any) => updateWindowState(window.id, updates)}
                            isFocused={window.id === focusedWindowId}
                            bounds=".window-drag-boundary"
                        />
                    </motion.div>
                );
                })}
            </AnimatePresence>

            <Toaster />
        </div>
        </AppNotificationsProvider>
    );
}

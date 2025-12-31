import { useState, useCallback, useRef, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/memory';
import { feedback } from '../services/soundFeedback';
import { notify } from '../services/notifications';

export interface WindowState {
    id: string;
    type: string;
    title: string;
    content: React.ReactNode;
    isMinimized: boolean;
    isMaximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    data?: any;
    owner: string;
}

export interface WindowSession {
    id: string;
    type: string;
    title: string;
    isMinimized: boolean;
    isMaximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    data?: any;
    owner: string;
}

export function useWindowManager(
    activeUser: string | null,
    getAppContent: (type: string, data?: any, owner?: string) => { content: React.ReactNode; title: string }
) {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [isRestoring, setIsRestoring] = useState(true);
    const topZIndexRef = useRef(100);

    // Load windows on mount / user change
    useEffect(() => {
        setIsRestoring(true);
        const key = `${STORAGE_KEYS.WINDOWS_PREFIX}${activeUser}`;
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const sessions: WindowSession[] = JSON.parse(stored);
                const restoredWindows: WindowState[] = sessions.map((session) => {
                    const { content } = getAppContent(session.type, session.data, session.owner);
                    return {
                        ...session,
                        content,
                    };
                });

                const maxZ = Math.max(100, ...restoredWindows.map((w) => w.zIndex));
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
        if (isRestoring || !activeUser) return;

        const key = `${STORAGE_KEYS.WINDOWS_PREFIX}${activeUser}`;
        const sessions: WindowSession[] = windows.map((w) => ({
            id: w.id,
            type: w.type,
            title: w.title,
            isMinimized: w.isMinimized,
            isMaximized: w.isMaximized,
            position: w.position,
            size: w.size,
            zIndex: w.zIndex,
            data: w.data,
            owner: w.owner,
        }));

        try {
            localStorage.setItem(key, JSON.stringify(sessions));
        } catch (e) {
            console.warn('Failed to save windows:', e);
        }
    }, [windows, activeUser, isRestoring]);

    const openWindow = useCallback(
        (type: string, data?: { path?: string }, owner?: string) => {
            const MULTI_INSTANCE_APPS = ['finder', 'terminal', 'browser'];

            setWindows((prevWindows) => {
                // Check for existing instance if not multi-instance
                if (!MULTI_INSTANCE_APPS.includes(type)) {
                    const windowOwner = owner || activeUser;
                    const existing = prevWindows.find(w => w.type === type && w.owner === windowOwner);
                    if (existing) {
                        feedback.click(); // Sound on focus

                        // Focus and Update Data (e.g. change song)
                        topZIndexRef.current += 1;
                        const newZIndex = topZIndexRef.current;

                        // Regenerate content with new data to ensure props update
                        const { content } = getAppContent(type, data, windowOwner || undefined);

                        return prevWindows.map(w =>
                            w.id === existing.id
                                ? { ...w, zIndex: newZIndex, isMinimized: false, data, content }
                                : w
                        );
                    }
                }

                feedback.windowOpen();
                const windowOwner = owner || activeUser || 'guest';
                const { content, title } = getAppContent(type, data, windowOwner);

                topZIndexRef.current += 1;
                const newZIndex = topZIndexRef.current;
                const newWindow: WindowState = {
                    id: `${type}-${Date.now()}`,
                    type,
                    title,
                    content,
                    isMinimized: false,
                    isMaximized: false,
                    position: { x: 100 + prevWindows.length * 30, y: 80 + prevWindows.length * 30 },
                    size: { width: 900, height: 600 },
                    zIndex: newZIndex,
                    data,
                    owner: owner || activeUser || 'guest',
                };
                return [...prevWindows, newWindow];
            });
        },
        [getAppContent, activeUser]
    );

    const closeWindow = useCallback((id: string) => {
        feedback.windowClose();
        setWindows((prevWindows) => prevWindows.filter((w) => w.id !== id));
    }, []);

    const minimizeWindow = useCallback((id: string) => {
        notify.system('success', id, 'Application minimized successfully');
        setWindows((prevWindows) => {
            const updated = prevWindows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w));

            const visibleWindows = updated.filter((w) => !w.isMinimized);
            if (visibleWindows.length > 0) {
                const topWindow = visibleWindows.reduce(
                    (max, w) => (w.zIndex > max.zIndex ? w : max),
                    visibleWindows[0]
                );
                topZIndexRef.current += 1;
                const newZIndex = topZIndexRef.current;
                return updated.map((w) => (w.id === topWindow.id ? { ...w, zIndex: newZIndex } : w));
            }

            return updated;
        });
    }, []);

    const maximizeWindow = useCallback((id: string) => {
        notify.system('success', id, 'Application maximized successfully');
        setWindows((prevWindows) =>
            prevWindows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
        );
    }, []);

    const focusWindow = useCallback((id: string) => {
        setWindows((prevWindows) => {
            topZIndexRef.current += 1;
            const newZIndex = topZIndexRef.current;
            return prevWindows.map((w) =>
                w.id === id ? { ...w, zIndex: newZIndex, isMinimized: false } : w
            );
        });
    }, []);

    const updateWindowState = useCallback((id: string, updates: Partial<WindowState>) => {
        setWindows((prevWindows) =>
            prevWindows.map((w) => (w.id === id ? { ...w, ...updates } : w))
        );
    }, []);

    return {
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowState,
    };
}

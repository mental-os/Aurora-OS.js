import type React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/memory';
import { safeParseLocal } from '../utils/safeStorage';
import { feedback } from '../services/soundFeedback';
import { notify } from '../services/notifications';
import { getApp } from '../config/appRegistry';
import { calculateTotalRamUsage } from '../utils/resourceMonitor';
import { useI18n } from '@/i18n';

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
    getAppContent: (type: string, data?: any, owner?: string) => { content: React.ReactNode; title: string },
    totalMemoryGB: number
) {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [isRestoring, setIsRestoring] = useState(true);
    const topZIndexRef = useRef(100);
    const { t } = useI18n();

    // Load windows on mount / user change
    useEffect(() => {
        setIsRestoring(true);
        const key = `${STORAGE_KEYS.WINDOWS_PREFIX}${activeUser}`;
        try {
            const sessionsRaw = safeParseLocal<any[]>(key);
            if (sessionsRaw && Array.isArray(sessionsRaw)) {
                const sessions: WindowSession[] = sessionsRaw
                    .filter(s => s && typeof s.id === 'string' && typeof s.type === 'string')
                    .map((s) => ({
                        id: String(s.id),
                        type: String(s.type),
                        title: typeof s.title === 'string' ? s.title : String(s.type || 'Window'),
                        isMinimized: !!s.isMinimized,
                        isMaximized: !!s.isMaximized,
                        position: {
                            x: typeof s.position?.x === 'number' ? s.position.x : 100,
                            y: typeof s.position?.y === 'number' ? s.position.y : 80,
                        },
                        size: {
                            width: typeof s.size?.width === 'number' ? s.size.width : 900,
                            height: typeof s.size?.height === 'number' ? s.size.height : 600,
                        },
                        zIndex: typeof s.zIndex === 'number' ? s.zIndex : 100,
                        data: s.data,
                        owner: typeof s.owner === 'string' ? s.owner : (activeUser || 'guest'),
                    }));

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
    // Persist windows on change (Debounced)
    const persistTimeoutRef = useRef<number | null>(null);

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

        // Debounce writes to reduce localStorage I/O during rapid UI changes
        if (persistTimeoutRef.current) {
            clearTimeout(persistTimeoutRef.current as any);
        }
        persistTimeoutRef.current = window.setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(sessions));
            } catch (e) {
                console.warn('Failed to save windows:', e);
            }
            persistTimeoutRef.current = null;
        }, 300);

        // Flush on cleanup/unmount: ensure the latest state is saved
        return () => {
            if (persistTimeoutRef.current) {
                clearTimeout(persistTimeoutRef.current as any);
                persistTimeoutRef.current = null;
                try {
                    localStorage.setItem(key, JSON.stringify(sessions));
                } catch (e) {
                    console.warn('Failed to flush windows on unmount:', e);
                }
            }
        };
    }, [windows, activeUser, isRestoring]);

    const openWindow = useCallback(
        (type: string, data?: { path?: string; timestamp?: number; [key: string]: any }, owner?: string) => {
            const MULTI_INSTANCE_APPS = ['finder', 'terminal', 'browser'];
            const windowOwner = owner || activeUser || 'guest';
            
            // --- Memory Check ---
            const app = getApp(type);
            if (app && app.ramUsage) {
                // 1. Calculate potential cost
                // We need to know if we are opening a "Main" or "Extra" window.
                // Since 'setWindows' is async, we can't easily peek at the "future" state inside the check if we rely on 'windows' dependency.
                // However, we can approximate by looking at 'windows' state from closure IF we add it to dependency, 
                // OR we can trust localStorage + simple heuristic.
                // Let's rely on localStorage via calculateTotalRamUsage for the *Base* state, 
                // but we also need to know if *this specific app* is already open for *this specific user* to determine strict cost.
                
                // We'll read the current usage
                const currentReport = calculateTotalRamUsage(activeUser || 'guest'); // Using activeUser for context
                const usedMB = currentReport.totalMB;
                
                // Determine cost: Check if this app type is already in the current *windows state* 
                // We unfortunately don't have access to the *pending* state update here easily without 'windows' dependency.
                // But we can check 'windows' from the outer scope if we add it to deps.
                // Let's assume we use the state 'windows'.
                const isAppAlreadyOpen = windows.some(w => w.type === type && w.owner === windowOwner);
                const weight = windowOwner === activeUser ? 1.0 : 0.5;
                const cost = isAppAlreadyOpen 
                    ? (app.ramUsage / 2) * weight // Extra Window
                    : app.ramUsage * weight;      // Main Window
                
                const totalMemoryMB = totalMemoryGB * 1024;

                if (usedMB + cost > totalMemoryMB) {
                    notify.system('error', t('memory.error.title'), t('memory.error.description', { appName: app.name }));
                    return; // PREVENT LAUNCH
                }
            }

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
                const { content, title } = getAppContent(type, data, windowOwner);

                topZIndexRef.current += 1;
                const newZIndex = topZIndexRef.current;
                // Calculate safe dimensions based on screen size
                const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024;
                const screenH = typeof window !== 'undefined' ? window.innerHeight : 768;

                const defaultWidth = 900;
                const defaultHeight = 600;

                // Ensure window fits on screen with some padding
                const width = Math.min(defaultWidth, screenW - 100); 
                const height = Math.min(defaultHeight, screenH - 150); 

                // Calculate diagonal cascade with dynamic wrapping
                const stepSize = 30;
                const startX = 100;
                const startY = 80;
                const rightPadding = 80;
                const bottomPadding = 80;
                
                // Calculate how many steps fit before hitting screen boundaries
                const maxStepsX = Math.floor((screenW - width - startX - rightPadding) / stepSize);
                const maxStepsY = Math.floor((screenH - height - startY - bottomPadding) / stepSize);
                const calculatedSteps = Math.min(maxStepsX, maxStepsY);
                
                // Use calculated steps but ensure at least 3 for variety
                const maxSteps = Math.max(3, calculatedSteps);
                
                const windowIndex = prevWindows.length % maxSteps;
                const cascadeOffset = windowIndex * stepSize;
                
                const x = startX + cascadeOffset;
                const y = startY + cascadeOffset;

                const newWindow: WindowState = {
                    id: `${type}-${Date.now()}`,
                    type,
                    title,
                    content,
                    isMinimized: false,
                    isMaximized: false,
                    position: { x, y },
                    size: { width, height },
                    zIndex: newZIndex,
                    data,
                    owner: owner || activeUser || 'guest',
                };
                return [...prevWindows, newWindow];
            });
        },
        [getAppContent, activeUser, windows, totalMemoryGB, t]
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

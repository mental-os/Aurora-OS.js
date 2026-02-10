import { useState, useEffect, useCallback } from 'react';

/**
 * A hook for persisting app-specific state to localStorage.
 * Each app gets its own namespaced storage key.
 * 
 * @param appId - Unique identifier for the app (e.g., 'finder', 'music', 'photos')
 * @param initialState - Default state if nothing is stored
 * @returns [state, setState, resetState] - State, setter, and reset function
 * 
 * @example
 * const [state, setState] = useAppStorage('music', { 
 *   volume: 80, 
 *   currentPlaylist: null 
 * });
 */
export function useAppStorage<T>(appId: string, initialState: T, owner?: string): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const storageKey = owner ? `yami-os-app-${appId}-${owner}` : `yami-os-app-${appId}`;

    // Load initial state from localStorage or use default
    const [state, setStateInternal] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored) as T;
            }
        } catch (e) {
            console.warn(`Failed to load ${appId} state:`, e);
        }
        return initialState;
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (e) {
            console.warn(`Failed to save ${appId} state:`, e);
        }
    }, [state, storageKey, appId]);

    // Wrapper for setState that handles both value and function updates
    const setState = useCallback((value: T | ((prev: T) => T)) => {
        setStateInternal(prev => {
            const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
            return newValue;
        });
    }, []);

    // Reset to initial state
    const resetState = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch (e) {
            console.warn(`Failed to reset ${appId} state:`, e);
        }
        setStateInternal(initialState);
    }, [storageKey, appId, initialState]);

    return [state, setState, resetState];
}

/**
 * Helper to clear all app storage (useful for "reset all settings" feature)
 */
export function clearAllAppStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('yami-os-app-')) {
            localStorage.removeItem(key);
        }
    });
}

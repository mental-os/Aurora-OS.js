import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { safeParseLocal } from '../utils/safeStorage';
import { STORAGE_KEYS } from '../utils/memory';

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
    // Legacy: `aurora-os-app-${appId}`
    // New: `os_app_data_${appId}`
    const prefix = STORAGE_KEYS.APP_DATA_PREFIX;
    const storageKey = owner ? `${prefix}${appId}-${owner}` : `${prefix}${appId}`;

    // Load initial state safely
    const [state, setStateInternal] = useState<T>(() => {
        const stored = safeParseLocal<T>(storageKey);
        // If stored is null (missing or invalid), use initialState
        return stored !== null ? stored : initialState;
    });

    // Debounce the state value to prevent rapid localStorage writes
    const debouncedState = useDebounce(state, 500);

    // Save state to localStorage whenever the DEBOUNCED state changes
    useEffect(() => {
        try {
            // Only save if it's not undefined (though T usually isn't)
            if (debouncedState !== undefined) {
                localStorage.setItem(storageKey, JSON.stringify(debouncedState));
            }
        } catch (e) {
            console.warn(`Failed to save ${appId} state:`, e);
        }
    }, [debouncedState, storageKey, appId]);

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
        if (key.startsWith(STORAGE_KEYS.APP_DATA_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
}

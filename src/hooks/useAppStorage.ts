import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { safeParseLocal } from '../utils/safeStorage';
import { STORAGE_KEYS, memory } from '../utils/memory';
import { useAppContext } from '@/components/AppContext';

/**
 * A hook for persisting app-specific state to memory (Session/HDD).
 * Each app gets its own namespaced storage key (by default, namespaced by the current user).
 * 
 * @param appId - Unique identifier for the app (e.g., 'finder', 'music', 'photos')
 * @param initialState - Default state if nothing is stored
 * @param owner - Optional: override the owner (defaults to desktop owner). 
 *                Useful for 'sudo' or 'su guest' apps.
 * @returns [state, setState, resetState] - State, setter, and reset function
 */
export function useAppStorage<T>(appId: string, initialState: T, owner?: string): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const { activeUser } = useAppContext();
    const prefix = STORAGE_KEYS.APP_DATA_PREFIX;
    
    // Determine effective owner (provided override or desktop owner)
    const effectiveOwner = owner || activeUser;
    const storageKey = `${prefix}${appId}-${effectiveOwner}`;

    // We use a "Locked-Pair" state to ensure state and key are always atomically updated.
    const [statePair, setStatePairInternal] = useState(() => {
        const stored = safeParseLocal<T>(storageKey);
        return {
            state: stored !== null ? stored : initialState,
            key: storageKey
        };
    });

    // Sync during render if the external storageKey changed (e.g. user switch)
    if (storageKey !== statePair.key) {
        const stored = safeParseLocal<T>(storageKey);
        const newState = stored !== null ? stored : initialState;
        setStatePairInternal({
            state: newState,
            key: storageKey
        });
    }

    // Debounce the entire pair. This ensures that when the debounce fires, 
    // the 'state' and 'key' are guaranteed to belong to each other.
    const debounced = useDebounce(statePair, 500);

    // Save state to memory whenever the DEBOUNCED state changes
    useEffect(() => {
        try {
            // SAFETY CHECK: Ensure the debounced data actually belongs to the CURRENT key.
            if (debounced.key !== storageKey) {
                return;
            }

            if (debounced.state !== undefined) {
                memory.setItem(storageKey, JSON.stringify(debounced.state));
            }
        } catch (e) {
            console.warn(`Failed to save ${appId} state:`, e);
        }
    }, [debounced, storageKey, appId]);

    const state = statePair.state;

    // Wrapper for setState that handles both value and function updates
    const setState = useCallback((value: T | ((prev: T) => T)) => {
        setStatePairInternal(prev => {
            const newState = typeof value === 'function' ? (value as (prev: T) => T)(prev.state) : value;
            return {
                ...prev,
                state: newState
            };
        });
    }, []);

    // Reset to initial state
    const resetState = useCallback(() => {
        try {
            memory.removeItem(storageKey);
        } catch (e) {
            console.warn(`Failed to reset ${appId} state:`, e);
        }
        setStatePairInternal({
            state: initialState,
            key: storageKey
        });
    }, [storageKey, appId, initialState]);

    return [state, setState, resetState];
}

/**
 * Helper to clear all app storage (useful for "reset all settings" feature)
 */
export function clearAllAppStorage() {
    const keys: string[] = [];
    for (let i = 0; i < memory.length; i++) {
        const key = memory.key(i);
        if (key) keys.push(key);
    }
    
    keys.forEach(key => {
        if (key.startsWith(STORAGE_KEYS.APP_DATA_PREFIX)) {
            memory.removeItem(key);
        }
    });
}

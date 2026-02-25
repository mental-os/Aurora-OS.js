import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, memory } from '../utils/memory';
import { useAppContext } from '../components/AppContext';
import { useDebounce } from './useDebounce';

/**
 * A hook for persisting ephemeral session state that should be cleared on Logout.
 * Uses `aurora-session-USERNAME-KEY` format.
 * 
 * @param key - Unique key for the setting
 * @param initialState - Default state
 * @returns [state, setState, resetState]
 */
export function useSessionStorage<T>(key: string, initialState: T, owner?: string): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const { activeUser: desktopUser } = useAppContext();
    const activeUser = owner || desktopUser;
    // If no user, fallback to 'guest' or global?
    // Using current user from context is safer.

    // We need to access the current user. AppContext provides activeUser.

    const storageKey = `${STORAGE_KEYS.SESSION_META}${activeUser || 'system'}-${key}`;

    // We use a "Locked-Pair" state to ensure state and key are always atomically updated.
    const [statePair, setStatePairInternal] = useState(() => {
        try {
            const stored = memory.getItem(storageKey);
            return {
                state: stored ? (JSON.parse(stored) as T) : initialState,
                key: storageKey
            };
        } catch {
            return { state: initialState, key: storageKey };
        }
    });

    // Sync during render if the external storageKey changed
    if (storageKey !== statePair.key) {
        try {
            const stored = memory.getItem(storageKey);
            const newState = stored ? (JSON.parse(stored) as T) : initialState;
            setStatePairInternal({
                state: newState,
                key: storageKey
            });
        } catch {
            setStatePairInternal({ state: initialState, key: storageKey });
        }
    }

    // Debounce the entire pair to ensure label integrity
    const debounced = useDebounce(statePair, 500);

    // Save state
    useEffect(() => {
        if (!activeUser) return;
        
        // SAFETY CHECK: Ensure label matches current context
        if (debounced.key !== storageKey) {
            return;
        }

        try {
            const isDefault = JSON.stringify(debounced.state) === JSON.stringify(initialState);
            if (isDefault) {
                memory.removeItem(storageKey);
            } else {
                memory.setItem(storageKey, JSON.stringify(debounced.state));
            }
        } catch {
            console.warn(`Failed to save session state ${key}`);
        }
    }, [debounced, storageKey, activeUser, key, initialState]);

    // Derived values
    const state = statePair.state;

    // Wrapper for setState
    const setState = useCallback((value: T | ((prev: T) => T)) => {
        setStatePairInternal(prev => {
            const newState = typeof value === 'function' ? (value as (prev: T) => T)(prev.state) : value;
            return { ...prev, state: newState };
        });
    }, []);

    // Reset
    const resetState = useCallback(() => {
        try {
            memory.removeItem(storageKey);
        } catch (e) {
            console.warn(`Failed to reset session state ${key}:`, e);
        }
        setStatePairInternal({ state: initialState, key: storageKey });
    }, [storageKey, initialState, key]);

    return [state, setState, resetState];
}

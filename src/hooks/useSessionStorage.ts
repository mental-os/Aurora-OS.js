import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/memory';
import { useAppContext } from '../components/AppContext';

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

    const storageKey = `${STORAGE_KEYS.SESSION_PREFIX}${activeUser || 'system'}-${key}`;

    // Load initial state
    const [state, setStateInternal] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored) as T;
            }
        } catch (e) {
            console.warn(`Failed to load session state ${key}:`, e);
        }
        return initialState;
    });

    // Save state
    // Save state (Smart Persistence: only save if diff from default)
    useEffect(() => {
        if (!activeUser) return;
        try {
            // Check if state matches initial default
            // This prevents cluttering storage with default values on mount
            const isDefault = JSON.stringify(state) === JSON.stringify(initialState);
            
            if (isDefault) {
                localStorage.removeItem(storageKey);
            } else {
                localStorage.setItem(storageKey, JSON.stringify(state));
            }
        } catch (e) {
            console.warn(`Failed to save session state ${key}:`, e);
        }
    }, [state, storageKey, activeUser, key, initialState]);
    
    // Wrapper for setState
    const setState = useCallback((value: T | ((prev: T) => T)) => {
        setStateInternal(prev => {
            return typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        });
    }, []);

    // Reset
    const resetState = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch (e) {
            console.warn(`Failed to reset session state ${key}:`, e);
        }
        setStateInternal(initialState);
    }, [storageKey, initialState, key]);

    return [state, setState, resetState];
}

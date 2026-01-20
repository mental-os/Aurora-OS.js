/**
 * Aurora OS Memory Management Utilities
 * 
 * Organizes storage into two tiers:
 * - Soft Memory: Preferences and UI state (safe to reset)
 * - Hard Memory: Core data like filesystem (dangerous to reset)
 */

// Storage key prefixes/names
export const STORAGE_KEYS = {
    // Soft memory keys (preferences, safe to forget)
    SETTINGS: 'aurora-os-settings', // Prefix for user settings
    DESKTOP_ICONS: 'aurora-os-desktop-positions',
    SOUND: 'aurora-os-sound-settings',
    APP_PREFIX: 'aurora-os-app-', // Pattern for app-specific storage
    WINDOWS_PREFIX: 'aurora-os-windows-', // Window sessions
    SESSION_PREFIX: 'aurora-session-', // Ephemeral session state (last paths, etc)
    SYSTEM_CONFIG: 'aurora-system-config', // Global system settings (Dev Mode, etc)
    LANGUAGE: 'aurora-system-language', // System Language
    TERMINAL_HISTORY: 'aurora-terminal-history-', // Command output history prefix
    TERMINAL_INPUT: 'aurora-terminal-input-', // Command input history prefix
    BATTERY: 'aurora-os-battery-settings', // Battery preferences
    TIME_MODE: 'aurora-time-mode', // Clock display preference (server/local)
    INSTALL_DATE: 'aurora-install-date', // System installation timestamp

    // Hard memory keys (core data, dangerous to forget)
    FILESYSTEM: 'aurora-filesystem',
    USERS: 'aurora-users',
    VERSION: 'aurora-version',
    INSTALLED_APPS: 'aurora-installed-apps', // App Store installed apps

    // Website specific memory
    MAIL_SERVER_DB: 'aurora_mail_server_db', // Simulated Cloud Mail Server DB
    MESSAGES_DB: 'aurora_messages_db', // Simulated Cloud Messages DB
} as const;

const MEMORY_CONFIG = {
    soft: {
        exact: [
            STORAGE_KEYS.DESKTOP_ICONS,
            STORAGE_KEYS.SOUND,
            STORAGE_KEYS.SYSTEM_CONFIG,
            STORAGE_KEYS.LANGUAGE,
            STORAGE_KEYS.BATTERY, // Battery settings
            STORAGE_KEYS.TIME_MODE, // Time preference
            STORAGE_KEYS.INSTALL_DATE, // Installation timestamp
        ] as string[],
        prefixes: [
            STORAGE_KEYS.SETTINGS,
            STORAGE_KEYS.APP_PREFIX,
            STORAGE_KEYS.WINDOWS_PREFIX,
            STORAGE_KEYS.SESSION_PREFIX,
            STORAGE_KEYS.TERMINAL_HISTORY,
            STORAGE_KEYS.TERMINAL_INPUT
        ]
    },
    hard: {
        exact: [
            STORAGE_KEYS.FILESYSTEM,
            STORAGE_KEYS.USERS,
            STORAGE_KEYS.VERSION,
            STORAGE_KEYS.INSTALLED_APPS,
            STORAGE_KEYS.MAIL_SERVER_DB, // Simulated Cloud DB
            STORAGE_KEYS.MESSAGES_DB // Simulated Cloud Messages DB
        ] as string[],
        prefixes: [] // Future proofing
    }
};

/**
 * Determines the type of memory a storage key belongs to via centralized config
 */
function getMemoryType(key: string): 'soft' | 'hard' | null {
    // Check Hard Memory
    if (MEMORY_CONFIG.hard.exact.includes(key)) return 'hard';
    if (MEMORY_CONFIG.hard.prefixes.some(prefix => key.startsWith(prefix))) return 'hard';

    // Check Soft Memory
    if (MEMORY_CONFIG.soft.exact.includes(key)) return 'soft';
    if (MEMORY_CONFIG.soft.prefixes.some(prefix => key.startsWith(prefix))) return 'soft';

    return null;
}

/**
 * Soft Reset - Clears all preferences and app states
 * User will need to reconfigure settings, but no data is lost
 */
export function softReset(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && getMemoryType(key) === 'soft') {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log(`Soft reset: Cleared ${keysToRemove.length} preference keys`);
}


/**
 * Hard Reset - Clears everything including the filesystem
 * This is destructive and will wipe all user data
 */
export function hardReset(): void {
    const count = localStorage.length;
    localStorage.clear();
    console.log(`Hard reset: Cleared ${count} total keys (Full Wipe)`);
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
    softMemory: { keys: number; bytes: number };
    hardMemory: { keys: number; bytes: number };
    total: { keys: number; bytes: number };
} {
    let softKeys = 0;
    let softBytes = 0;
    let hardKeys = 0;
    let hardBytes = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const type = getMemoryType(key);

            if (type === 'soft' || type === 'hard') {
                const value = localStorage.getItem(key) || '';
                const bytes = new Blob([key + value]).size;

                if (type === 'hard') {
                    hardKeys++;
                    hardBytes += bytes;
                } else {
                    softKeys++;
                    softBytes += bytes;
                }
            }
        }
    }

    return {
        softMemory: { keys: softKeys, bytes: softBytes },
        hardMemory: { keys: hardKeys, bytes: hardBytes },
        total: { keys: softKeys + hardKeys, bytes: softBytes + hardBytes },
    };
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if a user has a saved window session
 */
export function hasSavedSession(username: string): boolean {
    const key = `${STORAGE_KEYS.WINDOWS_PREFIX}${username}`;
    return !!localStorage.getItem(key);
}

/**
 * Clear a user's session (Windows + Ephemeral Data)
 * Called on Logout
 */
export function clearSession(username: string): void {
    // 1. Clear Window Session
    const windowKey = `${STORAGE_KEYS.WINDOWS_PREFIX}${username}`;
    localStorage.removeItem(windowKey);

    // 2. Clear Session Data (Prefix includes username to support multiple users?)
    // Note: STORAGE_KEYS.SESSION_PREFIX is 'aurora-session-'. 
    // We should assume session keys might be 'aurora-session-USERNAME-key' or just global if single user active.
    // For now, let's aggressively clear all session keys if we can't filter by user, 
    // OR we standardize session keys to include username.

    const keysToRemove: string[] = [];
    const userSessionPrefix = `${STORAGE_KEYS.SESSION_PREFIX}${username}-`;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(userSessionPrefix)) {
            keysToRemove.push(key);
        }
    }

    // Clean up localStorage
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 3. Clear Terminal History for this user
    localStorage.removeItem(`${STORAGE_KEYS.TERMINAL_HISTORY}${username}`);
    localStorage.removeItem(`${STORAGE_KEYS.TERMINAL_INPUT}${username}`);

    console.log(`Cleared session for user: ${username} (${keysToRemove.length + 3} keys)`);
}

/**
 * Get the storage key for an app's persisted state
 */
export function getAppStateKey(appId: string, username: string): string {
    return `${STORAGE_KEYS.APP_PREFIX}${appId}-state-${username}`;
}

/**
 * Get the storage key for a user's window session
 */
export function getWindowKey(username: string): string {
    return `${STORAGE_KEYS.WINDOWS_PREFIX}${username}`;
}

/**
 * Initializes the storage observer to track memory access
 * This monkey-patches localStorage to emit events for UI feedback
 */
export const STORAGE_EVENT = 'aurora-storage-event';

export type StorageOperation = 'read' | 'write' | 'clear';

export function initStorageObserver() {
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    const dispatch = (op: StorageOperation) => {
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { op } }));
    };

    localStorage.setItem = function(key: string, value: string) {
        dispatch('write');
        return originalSetItem.apply(this, [key, value]);
    };

    localStorage.getItem = function(key: string) {
        // Only trigger "Load" indicator for Hard Memory reads (Core System Data)
        // Soft memory (preferences, UI state) reads should be silent to avoid noise
        if (getMemoryType(key) === 'hard') {
            dispatch('read');
        }
        return originalGetItem.apply(this, [key]);
    };

    localStorage.removeItem = function(key: string) {
        dispatch('write');
        return originalRemoveItem.apply(this, [key]);
    };

    localStorage.clear = function() {
        dispatch('clear');
        return originalClear.apply(this, []);
    };

    console.log('Storage Observer initialized');
}


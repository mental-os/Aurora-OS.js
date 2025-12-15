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
    SYSTEM_CONFIG: 'aurora-system-config', // Global system settings (Dev Mode, etc)

    // Hard memory keys (core data, dangerous to forget)
    FILESYSTEM: 'aurora-filesystem',
    USERS: 'aurora-users',
} as const;

const MEMORY_CONFIG = {
    soft: {
        exact: [
            STORAGE_KEYS.DESKTOP_ICONS,
            STORAGE_KEYS.SOUND,
            STORAGE_KEYS.SYSTEM_CONFIG
        ] as string[],
        prefixes: [
            STORAGE_KEYS.SETTINGS,
            STORAGE_KEYS.APP_PREFIX,
            STORAGE_KEYS.WINDOWS_PREFIX
        ]
    },
    hard: {
        exact: [
            STORAGE_KEYS.FILESYSTEM,
            STORAGE_KEYS.USERS
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
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const type = getMemoryType(key);
            if (type === 'soft' || type === 'hard') {
                keysToRemove.push(key);
            }
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Hard reset: Cleared ${keysToRemove.length} total keys (including filesystem)`);
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
 * Clear a user's saved window session
 */
export function clearSession(username: string): void {
    const key = `${STORAGE_KEYS.WINDOWS_PREFIX}${username}`;
    localStorage.removeItem(key);
    console.log(`Cleared session for user: ${username}`);
}


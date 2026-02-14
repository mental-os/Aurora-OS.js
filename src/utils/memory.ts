/**
 * Aurora OS Memory Management Utilities
 * 
 * Organizes storage into two tiers:
 * - Soft Memory: Preferences and UI state (safe to reset)
 * - Hard Memory: Core data like filesystem (dangerous to reset)
 */

// Storage key prefixes/names
// Storage key prefixes/names
export const STORAGE_KEYS = {
    // TIER 1: BIOS / Hardware (Prefix: sys_)
    // Persistent across ALL resets (Hard/Soft/Crash). Only wiped by manual Factory Reset.
    SYSTEM_CONFIG: 'sys_config_v1',         // Global system settings (Dev Mode, etc)
    LANGUAGE: 'sys_locale',                 // System Language
    BATTERY: 'sys_battery',                 // Battery preferences
    TIME_MODE: 'sys_time_mode',             // Clock display preference
    INSTALL_DATE: 'sys_install_date',       // System installation timestamp
    SOUND: 'sys_sound_settings',            // Audio Mixer
    DISPLAY: 'sys_display_settings',        // Screen/Window config (if migrated from file)

    // TIER 2: HDD / OS Storage (Prefix: os_)
    // Persistent across Soft Resets/Reboots. Wiped on Hard Reset (New Game).
    FILESYSTEM: 'os_filesystem',            // The VFS Tree
    USERS: 'os_users_db',                   // /etc/passwd equivalent
    GROUPS: 'os_groups_db',                 // /etc/group equivalent
    VERSION: 'os_version',                  // Save Game Version / Flag
    INSTALLED_APPS: 'os_installed_apps',    // Registry of installed apps
    SETTINGS: 'os_settings',                // User preferences (if not in VFS)
    DESKTOP_ICONS: 'os_desktop_icons',      // Icon positions
    APP_DATA_PREFIX: 'os_app_data_',        // App-specific persistent data (e.g. notes)
    MAIL_DB: 'os_mail_db',                  // Simulated Cloud Mail DB
    MESSAGES_DB: 'os_messages_db',          // Simulated Cloud Messages DB
    KNOWN_NETWORKS: 'os_networks_db',       // Known Wifi Networks (Security/Pass/BSSID)

    // TIER 3: RAM / Session State (Prefix: session_)
    // Wiped on Soft Reset (Logout/Reboot) OR Hard Reset.
    WINDOWS_PREFIX: 'session_windows_',     // Open window states
    TERM_HISTORY_PREFIX: 'session_term_',   // Terminal command history
    TERM_INPUT_PREFIX: 'session_term_input_', // Terminal input history
    SESSION_META: 'session_meta_',          // Ephemeral session flags
    CURRENT_USER: 'session_current_user',   // Currently logged in user
    NETWORK_USAGE: 'session_net_usage',     // Data usage for current session
} as const;

/**
 * Determines the type of memory a storage key belongs to via Prefix Check
 */
function getMemoryType(key: string): 'bios' | 'hdd' | 'ram' | 'unknown' {
    if (key.startsWith('sys_')) return 'bios';
    if (key.startsWith('os_')) return 'hdd';
    if (key.startsWith('session_')) return 'ram';
    return 'unknown';
}

/**
 * Soft Reset (Reboot/Logout)
 * Wipes RAM (Session) only.
 * Keeps BIOS + HDD.
 */
export function softReset(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && getMemoryType(key) === 'ram') {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Soft Reset: Wiped RAM (${keysToRemove.length} session keys)`);
}


/**
 * Hard Reset (New Game)
 * Wipes HDD + RAM.
 * KEEPS BIOS (System Config).
 */
export function hardReset(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const type = getMemoryType(key);
        // Wipe HDD and RAM, Keep BIOS
        if (type === 'hdd' || type === 'ram' || type === 'unknown') {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Hard Reset: Wiped HDD + RAM (${keysToRemove.length} keys). Preserved BIOS.`);
}

/**
 * Factory Reset (Complete Wipe)
 * Wipes EVERYTHING logic.
 */
export function factoryReset(): void {
    localStorage.clear();
    console.log('Factory Reset: Wiped EVERYTHING.');
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
    biosMemory: { keys: number; bytes: number };
    hddMemory: { keys: number; bytes: number };
    ramMemory: { keys: number; bytes: number };
    total: { keys: number; bytes: number };
} {
    let biosKeys = 0; let biosBytes = 0;
    let hddKeys = 0; let hddBytes = 0;
    let ramKeys = 0; let ramBytes = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const type = getMemoryType(key);
            const value = localStorage.getItem(key) || '';
            const bytes = new Blob([key + value]).size;

            if (type === 'bios') {
                biosKeys++; biosBytes += bytes;
            } else if (type === 'hdd') {
                hddKeys++; hddBytes += bytes;
            } else if (type === 'ram') {
                ramKeys++; ramBytes += bytes;
            }
        }
    }

    return {
        biosMemory: { keys: biosKeys, bytes: biosBytes },
        hddMemory: { keys: hddKeys, bytes: hddBytes },
        ramMemory: { keys: ramKeys, bytes: ramBytes },
        total: { keys: biosKeys + hddKeys + ramKeys, bytes: biosBytes + hddBytes + ramBytes },
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

    // 2. Clear Session Data
    const keysToRemove: string[] = [];
    const userSessionPrefix = `${STORAGE_KEYS.SESSION_META}${username}-`;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(userSessionPrefix)) {
            keysToRemove.push(key);
        }
    }

    // Clean up localStorage
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 3. Clear Terminal History for this user
    localStorage.removeItem(`${STORAGE_KEYS.TERM_HISTORY_PREFIX}${username}`);
    localStorage.removeItem(`${STORAGE_KEYS.TERM_INPUT_PREFIX}${username}`);
    // Assuming standard session prefix covers most inputs or we add a specific one.
    // For now, let's just clear the main history which matches the new key.

    console.log(`Cleared session for user: ${username} (${keysToRemove.length + 2} keys)`);
}

/**
 * Get the storage key for an app's persisted state
 */
export function getAppStateKey(appId: string, username: string): string {
    return `${STORAGE_KEYS.APP_DATA_PREFIX}${appId}-${username}`;
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
        // Defer dispatch to avoid "Cannot update component while rendering" errors
        // when localStorage is accessed during render (e.g. useState initializers)
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { op } }));
        }, 0);
    };

    localStorage.setItem = function (key: string, value: string) {
        dispatch('write');
        return originalSetItem.apply(this, [key, value]);
    };

    localStorage.getItem = function (key: string) {
        dispatch('read');
        return originalGetItem.apply(this, [key]);
    };

    localStorage.removeItem = function (key: string) {
        dispatch('write');
        return originalRemoveItem.apply(this, [key]);
    };

    localStorage.clear = function () {
        dispatch('clear');
        return originalClear.apply(this, []);
    };

    console.log('Storage Observer initialized');
}


/**
 * Get current session data usage in MB
 */
export function getSessionDataUsage(): number {
    const val = localStorage.getItem(STORAGE_KEYS.NETWORK_USAGE);
    return val ? parseFloat(val) : 0;
}

/**
 * Increment session data usage
 * @param mb Megabytes to add
 */
export function incrementSessionDataUsage(mb: number): void {
    const current = getSessionDataUsage();
    const newVal = current + mb;
    localStorage.setItem(STORAGE_KEYS.NETWORK_USAGE, newVal.toString());
}

/**
 * Reset session data usage (on disconnect/new session)
 */
export function resetSessionDataUsage(): void {
    localStorage.removeItem(STORAGE_KEYS.NETWORK_USAGE);
}

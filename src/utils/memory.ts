/**
 * Aurora OS Memory Management Utilities
 * 
 * MODERNIZED: Now uses an In-Memory Cache logic backed by the Save System.
 * Replaces direct localStorage usage.
 */

import { saveManager } from '@/utils/save/SaveManager';
import { createSnapshot, restoreSnapshot } from '@/utils/save/SnapshotEngine';
import pkg from '../../package.json';

// --- IN-MEMORY CACHE ---
let memoryCache: Record<string, string> = {};
let isInitialized = false;

// Mocking Storage Event for reactivity (In-memory changes)
export const STORAGE_EVENT = 'aurora-storage-event';
export type StorageOperation = 'read' | 'write' | 'clear';

// Physical I/O tracking for the "Hard Drive" indicator
export const PHYSICAL_IO_EVENT = 'aurora-physical-io';
export type PhysicalIOOp = 'save' | 'load';

export function dispatchPhysicalIO(op: PhysicalIOOp, active: boolean) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(PHYSICAL_IO_EVENT, { detail: { op, active } }));
    }
}

function dispatchStorageEvent(op: StorageOperation) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { op } }));
    }
}

// --- PUBLIC API (localStorage replacement) ---

export const memory = {
    getItem(key: string): string | null {
        return memoryCache[key] ?? null;
    },

    setItem(key: string, value: string): void {
        // DIRTY CHECK: Avoid redundant saves if value hasn't changed
        if (memoryCache[key] === value) return;

        memoryCache[key] = value;
        dispatchStorageEvent('write');
        if (isInitialized) saveGame(); // Auto-save
    },

    removeItem(key: string): void {
        delete memoryCache[key];
        dispatchStorageEvent('write');
        if (isInitialized) saveGame(); // Auto-save
    },

    clear(): void {
        memoryCache = {};
        dispatchStorageEvent('clear');
    },

    key(index: number): string | null {
        const keys = Object.keys(memoryCache);
        return keys[index] || null;
    },

    get length(): number {
        return Object.keys(memoryCache).length;
    }
};


// --- CONSTANTS ---

export const STORAGE_KEYS = {
    // TIER 1: BIOS / Hardware (Prefix: sys_)
    SYSTEM_CONFIG: 'sys_config_v1',         
    LANGUAGE: 'sys_locale',                 
    BATTERY: 'sys_battery',                 
    TIME_MODE: 'sys_time_mode',             
    INSTALL_DATE: 'sys_install_date',       
    SOUND: 'sys_sound_settings',            
    DISPLAY: 'sys_display_settings',        

    // TIER 2: HDD / OS Storage (Prefix: os_)
    FILESYSTEM: 'os_filesystem',            
    USERS: 'os_users_db',                   
    GROUPS: 'os_groups_db',                 
    VERSION: 'os_version',                  
    INSTALLED_APPS: 'os_installed_apps',    
    SETTINGS: 'os_settings',                
    DESKTOP_ICONS: 'os_desktop_icons',      
    APP_DATA_PREFIX: 'os_app_data_',        
    MAIL_DB: 'os_mail_db',                  
    MESSAGES_DB: 'os_messages_db',          
    KNOWN_NETWORKS: 'os_networks_db',       
    NPC_STATE_PREFIX: 'os_npc_',            // NPC computer state (VFS, runtime). Wiped on hardReset().

    // TIER 3: RAM / Session State (Prefix: session_)
    WINDOWS_PREFIX: 'session_windows_',     
    TERM_HISTORY_PREFIX: 'session_term_',   
    TERM_INPUT_PREFIX: 'session_term_input_', 
    SESSION_META: 'session_meta_',          
    CURRENT_USER: 'session_current_user',   
    LAST_ACTIVE_USER: 'session_last_active_user',
    NETWORK_USAGE: 'session_net_usage',     
    SESSION_WINDOWS: 'session_windows',
    SESSION_TERMINAL_HISTORY: 'session_terminal_history',
} as const;


// --- HELPER FUNCTIONS (Refactored to use `memory`) ---

function getMemoryType(key: string): 'bios' | 'hdd' | 'ram' | 'unknown' {
    if (key.startsWith('sys_')) return 'bios';
    if (key.startsWith('os_')) return 'hdd';
    if (key.startsWith('session_')) return 'ram';
    return 'unknown';
}

export type ResetTarget = 'session' | 'hdd' | 'bios' | 'users' | 'filesystem' | 'settings';

/**
 * Partial Reset
 * Wipes specific subsets of memory
 */
export function partialReset(target: ResetTarget): void {
    const keysToRemove: string[] = [];
    
    // Helper to find keys by prefix or exact match
    const findKeys = (predicate: (key: string) => boolean) => {
        const total = memory.length;
        for (let i = 0; i < total; i++) {
            const key = memory.key(i);
            if (key && predicate(key)) {
                keysToRemove.push(key);
            }
        }
    };

    switch (target) {
        case 'session':
            findKeys(k => k.startsWith('session_'));
            break;
        case 'hdd':
            findKeys(k => k.startsWith('os_'));
            break;
        case 'bios':
            findKeys(k => k.startsWith('sys_'));
            break;
        case 'users':
            findKeys(k => k === STORAGE_KEYS.USERS || k === STORAGE_KEYS.GROUPS || k === STORAGE_KEYS.CURRENT_USER);
            break;
        case 'filesystem':
            findKeys(k => k === STORAGE_KEYS.FILESYSTEM); // Only file tree
            break;
        case 'settings':
            findKeys(k => k === STORAGE_KEYS.SETTINGS || k.startsWith(STORAGE_KEYS.APP_DATA_PREFIX));
            break;
    }

    keysToRemove.forEach(key => memory.removeItem(key));
    console.log(`Partial Reset [${target}]: Removed ${keysToRemove.length} keys.`);
}

/**
 * Soft Reset (Reboot/Logout)
 * Wipes RAM (Session) only.
 * Keeps BIOS + HDD.
 */
export async function softReset(): Promise<void> {
    partialReset('session');
    await forceSaveGame();
    console.log(`Soft Reset: Wiped RAM and committed to storage.`);
}

/**
 * Hard Reset (New Game)
 * Wipes HDD + RAM.
 * KEEPS BIOS (System Config).
 */
export async function hardReset(): Promise<void> {
    partialReset('hdd'); 
    partialReset('session'); 
    await forceSaveGame();
    console.log(`Hard Reset: Wiped HDD + RAM. Preserved BIOS and committed to storage.`);
}

/**
 * Factory Reset (Complete Wipe)
 * Wipes EVERYTHING logic.
 */
export async function factoryReset(): Promise<void> {
    memoryCache = {};
    await deleteSave();
    console.log('Factory Reset: Wiped EVERYTHING and deleted physical save.');
}


// --- STATISTICS ---

export function getStorageStats(): {
    biosMemory: { keys: number; bytes: number };
    hddMemory: { keys: number; bytes: number };
    ramMemory: { keys: number; bytes: number };
    total: { keys: number; bytes: number };
} {
    let biosKeys = 0; let biosBytes = 0;
    let hddKeys = 0; let hddBytes = 0;
    let ramKeys = 0; let ramBytes = 0;

    Object.keys(memoryCache).forEach(key => {
        const type = getMemoryType(key);
        const value = memoryCache[key] || '';
        const bytes = new Blob([key + value]).size;

        if (type === 'bios') { biosKeys++; biosBytes += bytes; }
        else if (type === 'hdd') { hddKeys++; hddBytes += bytes; }
        else if (type === 'ram') { ramKeys++; ramBytes += bytes; }
    });

    return {
        biosMemory: { keys: biosKeys, bytes: biosBytes },
        hddMemory: { keys: hddKeys, bytes: hddBytes },
        ramMemory: { keys: ramKeys, bytes: ramBytes },
        total: { keys: biosKeys + hddKeys + ramKeys, bytes: biosBytes + hddBytes + ramBytes },
    };
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}


// --- SESSION UTILS ---

export function hasSavedSession(username: string): boolean {
    const key = `${STORAGE_KEYS.WINDOWS_PREFIX}${username}`;
    return !!memory.getItem(key);
}

export function clearSession(username: string): void {
    const windowKey = `${STORAGE_KEYS.WINDOWS_PREFIX}${username}`;
    memory.removeItem(windowKey);

    const userSessionPrefix = `${STORAGE_KEYS.SESSION_META}${username}-`;
    Object.keys(memoryCache).forEach(key => {
        if (key.startsWith(userSessionPrefix)) memory.removeItem(key);
    });

    memory.removeItem(`${STORAGE_KEYS.TERM_HISTORY_PREFIX}${username}`);
    memory.removeItem(`${STORAGE_KEYS.TERM_INPUT_PREFIX}${username}`);

    console.log(`Cleared session for user: ${username}`);
}

export function getAppStateKey(appId: string, username: string): string {
    return `${STORAGE_KEYS.APP_DATA_PREFIX}${appId}-${username}`;
}

export function getWindowKey(username: string): string {
    return `${STORAGE_KEYS.WINDOWS_PREFIX}${username}`;
}

export function getSessionDataUsage(): number {
    const val = memory.getItem(STORAGE_KEYS.NETWORK_USAGE);
    return val ? parseFloat(val) : 0;
}

export function incrementSessionDataUsage(mb: number): void {
    const current = getSessionDataUsage();
    const newVal = current + mb;
    memory.setItem(STORAGE_KEYS.NETWORK_USAGE, newVal.toString());
}

export function resetSessionDataUsage(): void {
    memory.removeItem(STORAGE_KEYS.NETWORK_USAGE);
}


// --- INITIALIZATION & SAVE SYSTEM ---

const EMERGENCY_KEY = 'sys_emergency_save_v1';

/**
 * Emergency Synchronous Dump
 * Used during beforeunload to capture state when async saves might be killed.
 */
export function emergencySave(): void {
    try {
        localStorage.setItem(EMERGENCY_KEY, JSON.stringify(memoryCache));
        console.log('[Memory] Emergency dump saved to localStorage.');
    } catch (e) {
        console.warn('[Memory] Emergency dump failed:', e);
    }
}

/**
 * Initializes the memory system by loading from valid storage (Emergency Buffer > IDB/Electron).
 * Must be called before the app renders.
 */
export async function initMemory(): Promise<boolean> {
    if (isInitialized) return true;

    try {
        console.log('[Memory] Initializing...');
        
        // 1. Check for Emergency Buffer (localStorage)
        const emergencyBuffer = localStorage.getItem(EMERGENCY_KEY);
        if (emergencyBuffer) {
            console.log('[Memory] Found emergency buffer! Recovering crash-safe state...');
            try {
                memoryCache = JSON.parse(emergencyBuffer);
                localStorage.removeItem(EMERGENCY_KEY); // Purge after use
                isInitialized = true;
                dispatchStorageEvent('clear');
                return true;
            } catch {
                console.warn('[Memory] Emergency buffer corrupt. Falling back to normal save.');
                localStorage.removeItem(EMERGENCY_KEY);
            }
        }

        // 2. Normal Path: Hydrate from IDB/Electron
        const snapshot = await saveManager.loadSnapshot();
        
        if (snapshot) {
            console.log('[Memory] Hydrating from save...');
            memoryCache = restoreSnapshot(snapshot, {});
        } else {
            console.log('[Memory] No save found. Starting empty.');
            memoryCache = {};
        }

        isInitialized = true;
        // Dispatch clear/update to ensure UI is in sync if needed
        dispatchStorageEvent('clear'); 
        return true;
    } catch (e) {
        console.error('[Memory] Init failed:', e);
        memoryCache = {}; // Fallback
        return false;
    }
}

export async function saveGame(): Promise<void> {
    const snapshot = createSnapshot(memoryCache);
    // Use scheduled save to prevent spamming IDB/IO
    saveManager.scheduleAutoSave(snapshot);
}

export async function forceSaveGame(): Promise<boolean> {
    const snapshot = createSnapshot(memoryCache);
    return await saveManager.saveSnapshot(snapshot);
}

export async function loadGame(): Promise<boolean> {
    const snapshot = await saveManager.loadSnapshot();
    if (snapshot) {
        memoryCache = restoreSnapshot(snapshot, memoryCache);
        dispatchStorageEvent('clear'); // Force update
        return true;
    }
    return false;
}

export async function hasSave(): Promise<boolean> {
    return await saveManager.hasSave();
}

export async function deleteSave(): Promise<void> {
    await saveManager.deleteSave();
}

/**
 * Migration Helpers
 * (Centralized version check using the core memory API)
 */
export function checkMigrationNeeded(): boolean {
    const storedVersion = memory.getItem(STORAGE_KEYS.VERSION);
    return storedVersion !== pkg.version;
}

export function updateStoredVersion(): void {
    memory.setItem(STORAGE_KEYS.VERSION, pkg.version);
}

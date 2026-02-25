import { STORAGE_KEYS } from '../../utils/memory';
import { SaveSnapshot, SaveOptions } from '@/types/save';

const CURRENT_VERSION = 1;

/**
 * Calculates a simple checksum for data integrity
 * Uses DJB2 algorithm for speed
 */
function calculateChecksum(data: string): string {
    let hash = 5381;
    for (let i = 0; i < data.length; i++) {
        hash = (hash * 33) ^ data.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
}

/**
 * Collects data from the provided state object based on requested tiers
 * @param state - The complete key-value storage state (e.g. from memory.ts)
 */
export function createSnapshot(state: Record<string, string>, options: SaveOptions = { includeHdd: true, includeSession: true, includeSys: true }): SaveSnapshot {
    const snapshot: SaveSnapshot = {
        version: CURRENT_VERSION,
        createdAt: Date.now(),
        metadata: {
            playtime: 0, 
            username: state[STORAGE_KEYS.CURRENT_USER] || 'guest',
        },
    };

    // 1. BIOS Tier
    if (options.includeSys) {
        snapshot.sys = {};
        Object.keys(state).forEach((key) => {
            if (key.startsWith('sys_')) {
                snapshot.sys![key] = state[key];
            }
        });
    }

    // 2. HDD Tier
    if (options.includeHdd) {
        snapshot.hdd = {};
        Object.keys(state).forEach((key) => {
            if (key.startsWith('os_')) {
                snapshot.hdd![key] = state[key];
            }
        });
    }

    // 3. Session Tier
    if (options.includeSession) {
        snapshot.session = {};
        Object.keys(state).forEach((key) => {
            if (key.startsWith('session_')) {
                snapshot.session![key] = state[key];
            }
        });
    }

    // 4. Calculate Checksum
    const content = JSON.stringify(snapshot);
    snapshot.checksum = calculateChecksum(content);

    return snapshot;
}

/**
 * Restores a snapshot into a flattened state object
 * @param snapshot - The snapshot to restore
 * @param currentState - The current state (used to strictly clear specific tiers)
 * @returns The new complete state object
 */
export function restoreSnapshot(snapshot: SaveSnapshot, currentState: Record<string, string>): Record<string, string> {
    const newState = { ...currentState };

    try {
        if (!snapshot || typeof snapshot !== 'object') {
            throw new Error('Invalid snapshot format');
        }

        // 1. Restore BIOS (Merge/Overwrite)
        if (snapshot.sys) {
            Object.assign(newState, snapshot.sys);
        }

        // 2. Restore HDD (Wipe existing OS keys first)
        if (snapshot.hdd) {
            // Clear current os_ keys
            Object.keys(newState).forEach(key => {
                 if (key.startsWith('os_')) delete newState[key];
            });
            // Apply new
            Object.assign(newState, snapshot.hdd);
        }

        // 3. Restore Session (Wipe existing session data)
        if (snapshot.session) {
            Object.keys(newState).forEach(key => {
                 if (key.startsWith('session_')) delete newState[key];
            });
            Object.assign(newState, snapshot.session);
        }

        return newState;
    } catch (e) {
        console.error('Failed to restore snapshot:', e);
        return currentState; // Return original on failure
    }
}


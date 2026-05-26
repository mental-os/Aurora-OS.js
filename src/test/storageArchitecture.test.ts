import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memory, STORAGE_KEYS, partialReset, softReset, hardReset, factoryReset, initMemory, forceSaveGame, loadGame } from '../utils/memory';
import { saveManager } from '@/utils/save/SaveManager';
import { restoreSnapshot } from '@/utils/save/SnapshotEngine';

// Mock SaveManager to use a simple in-memory adapter for testing
// We don't want to actually write to disk or use IndexedDB in unit tests
const mockAdapter = {
    data: null as any,
    async init() {},
    async save(snapshot: any) { this.data = snapshot; return true; },
    async load() { return this.data; },
    async exists() { return !!this.data; },
    async delete() { this.data = null; return true; }
};

// We need to inject this mock into saveManager, but saveManager is a singleton.
// We can spy on it.

describe('Storage Architecture Verification', () => {
    
    beforeEach(async () => {
        // Reset memory before each test
        memory.clear();
        mockAdapter.data = null;
        
        // Mock the adapter methods on saveManager
        // @ts-expect-error - private access for testing
        saveManager.adapter = mockAdapter;
        
        await initMemory();
    });

    it('should implement the 3-tier memory model correctly', () => {
        // 1. Set data in all tiers
        memory.setItem(STORAGE_KEYS.SYSTEM_CONFIG, 'bios_data'); // Tier 1: BIOS
        memory.setItem(STORAGE_KEYS.FILESYSTEM, 'hdd_data');     // Tier 2: HDD
        memory.setItem(STORAGE_KEYS.WINDOWS_PREFIX + 'root', 'ram_data'); // Tier 3: Session

        expect(memory.getItem(STORAGE_KEYS.SYSTEM_CONFIG)).toBe('bios_data');
        expect(memory.getItem(STORAGE_KEYS.FILESYSTEM)).toBe('hdd_data');
        expect(memory.getItem(STORAGE_KEYS.WINDOWS_PREFIX + 'root')).toBe('ram_data');
    });

    it('should handle Soft Reset (Wipe Session Only)', () => {
        memory.setItem(STORAGE_KEYS.SYSTEM_CONFIG, 'bios');
        memory.setItem(STORAGE_KEYS.FILESYSTEM, 'hdd');
        memory.setItem('session_test', 'ram');

        softReset();

        expect(memory.getItem(STORAGE_KEYS.SYSTEM_CONFIG)).toBe('bios'); // Kept
        expect(memory.getItem(STORAGE_KEYS.FILESYSTEM)).toBe('hdd');     // Kept
        expect(memory.getItem('session_test')).toBeNull();               // Wiped
    });

    it('should handle Hard Reset (Wipe HDD + Session, Keep BIOS)', () => {
        memory.setItem(STORAGE_KEYS.SYSTEM_CONFIG, 'bios');
        memory.setItem(STORAGE_KEYS.FILESYSTEM, 'hdd');
        memory.setItem('session_test', 'ram');

        hardReset();

        expect(memory.getItem(STORAGE_KEYS.SYSTEM_CONFIG)).toBe('bios'); // Kept
        expect(memory.getItem(STORAGE_KEYS.FILESYSTEM)).toBeNull();      // Wiped
        expect(memory.getItem('session_test')).toBeNull();               // Wiped
    });

    it('should handle Factory Reset (Wipe Everything)', () => {
        memory.setItem(STORAGE_KEYS.SYSTEM_CONFIG, 'bios');
        memory.setItem(STORAGE_KEYS.FILESYSTEM, 'hdd');
        
        factoryReset();

        expect(memory.getItem(STORAGE_KEYS.SYSTEM_CONFIG)).toBeNull();
        expect(memory.getItem(STORAGE_KEYS.FILESYSTEM)).toBeNull();
        expect(memory.length).toBe(0);
    });

    it('should handle Partial Reset (Users)', () => {
        memory.setItem(STORAGE_KEYS.USERS, 'user_db');
        memory.setItem(STORAGE_KEYS.FILESYSTEM, 'fs_data');
        
        partialReset('users');

        expect(memory.getItem(STORAGE_KEYS.USERS)).toBeNull();
        expect(memory.getItem(STORAGE_KEYS.FILESYSTEM)).toBe('fs_data');
    });

    // Snapshot creation structure is implicitly tested via saveGame below


    it('should persist state to adapter via saveGame()', async () => {
        memory.setItem(STORAGE_KEYS.FILESYSTEM, 'vital_data');

        const success = await forceSaveGame();
        expect(success).toBe(true);
        expect(mockAdapter.data).toBeTruthy();
        expect(mockAdapter.data.hdd[STORAGE_KEYS.FILESYSTEM]).toBe('vital_data');
        expect(mockAdapter.data.checksum).toBeDefined();
        expect(mockAdapter.data.version).toBe(1);
    });

    it('should load state from adapter via loadGame()', async () => {
        // Setup initial save data in adapter
        const snapshot = {
            version: 1,
            createdAt: Date.now(),
            metadata: { username: 'tester', playtime: 100 },
            sys: { [STORAGE_KEYS.SYSTEM_CONFIG]: 'loaded_bios' },
            hdd: { [STORAGE_KEYS.FILESYSTEM]: 'loaded_fs' },
            session: {},
            checksum: 'mock_checksum'
        };
        mockAdapter.data = snapshot;

        // Clear memory first
        memory.clear();

        const success = await loadGame();
        
        expect(success).toBe(true);
        expect(memory.getItem(STORAGE_KEYS.SYSTEM_CONFIG)).toBe('loaded_bios');
        expect(memory.getItem(STORAGE_KEYS.FILESYSTEM)).toBe('loaded_fs');
    });

    it('should protect against invalid snapshots', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const invalidSnapshot = null;
        const result = restoreSnapshot(invalidSnapshot as any, {});
        expect(result).toEqual({});
        consoleSpy.mockRestore();
    });
});

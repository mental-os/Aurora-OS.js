import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateTotalRamUsage } from './resourceMonitor';
import { getAppStateKey, getWindowKey } from './memory';

// Mock APP_REGISTRY by mocking the module
vi.mock('../config/appRegistry', () => ({
    getApp: (id: string) => {
        const mockRegistry: Record<string, any> = {
            'notepad': { name: 'Notepad', ramUsage: 30 },
            'finder': { name: 'Finder', ramUsage: 40 },
            'browser': { name: 'Browser', ramUsage: 100 }, // Simplified for test
        };
        return mockRegistry[id];
    }
}));

describe('resourceMonitor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should calculate base RAM for active session only', () => {
        const report = calculateTotalRamUsage('user1');
        
        // Active session base = 512
        expect(report.totalMB).toBe(512);
        expect(report.breakdown).toHaveLength(1);
        expect(report.breakdown[0].user).toBe('user1');
        expect(report.breakdown[0].sessionRam).toBe(512);
    });

    it('should calculate base RAM for active + inactive sessions', () => {
        // Setup inactive session via windows key existence
        localStorage.setItem(getWindowKey('user2'), '[]');
        
        const report = calculateTotalRamUsage('user1');
        
        // Active (512) + Inactive (128) = 640
        expect(report.totalMB).toBe(640);
        expect(report.breakdown).toHaveLength(2);
        
        const user1 = report.breakdown.find(b => b.user === 'user1');
        const user2 = report.breakdown.find(b => b.user === 'user2');
        
        expect(user1?.sessionRam).toBe(512);
        expect(user2?.sessionRam).toBe(128);
    });

    it('should calculate RAM for active user windows', () => {
        // User1 has 1 Finder (Main) + 1 Notepad (Active)
        const windows = [
            { id: '1', type: 'finder', owner: 'user1' },
            { id: '2', type: 'notepad', owner: 'user1' }
        ];
        localStorage.setItem(getWindowKey('user1'), JSON.stringify(windows));

        const report = calculateTotalRamUsage('user1');
        
        // Session: 512
        // Finder: 40 * 1.0 = 40
        // Notepad: 30 * 1.0 = 30
        // Total: 582
        expect(report.totalMB).toBe(582);
    });

    it('should apply 50% weight for inactive user windows', () => {
        // User2 (Inactive) has 1 Finder
        const windows = [
            { id: '1', type: 'finder', owner: 'user2' }
        ];
        localStorage.setItem(getWindowKey('user2'), JSON.stringify(windows));

        const report = calculateTotalRamUsage('user1');
        
        // Active Session: 512
        // Inactive Session: 128
        // User2 Finder: 40 * 0.5 = 20
        // Total: 512 + 128 + 20 = 660
        expect(report.totalMB).toBe(660);
    });

    it('should apply 50% cost for additional windows of same app', () => {
        // User1 has 2 Finders
        const windows = [
            { id: '1', type: 'finder', owner: 'user1' },
            { id: '2', type: 'finder', owner: 'user1' }
        ];
        localStorage.setItem(getWindowKey('user1'), JSON.stringify(windows));

        const report = calculateTotalRamUsage('user1');
        
        // Session: 512
        // Finder 1: 40
        // Finder 2: 20 (40/2)
        // Total: 572
        expect(report.totalMB).toBe(572);
    });

    it('should count extra tabs for Notepad', () => {
        // User1 has Notepad window
        const windows = [{ id: '1', type: 'notepad', owner: 'user1' }];
        localStorage.setItem(getWindowKey('user1'), JSON.stringify(windows));
        
        // Notepad has 3 tabs (1 main + 2 extra)
        const notepadState = {
            tabs: [{ id: '1' }, { id: '2' }, { id: '3' }]
        };
        localStorage.setItem(getAppStateKey('notepad', 'user1'), JSON.stringify(notepadState));

        const report = calculateTotalRamUsage('user1');

        // Session: 512
        // Notepad Window: 30
        // Extra Tabs (2): (30/4) * 2 = 7.5 * 2 = 15
        // Total: 557
        expect(report.totalMB).toBe(557);
    });
});

import { SaveSnapshot } from '@/types/save';

/**
 * Migration Strategy:
 * 1. Define migration functions for each version step (v1->v2, v2->v3).
 * 2. Run them sequentially based on current snapshot version.
 */

// Example V2 data structure (hypothetical)
export interface SaveSnapshotV2 extends SaveSnapshot {
    version: 2;
    newFeatureData: { enabled: boolean };
}

export function migrateSnapshot(snapshot: any): SaveSnapshot {
    let currentVersion = snapshot.version || 0;

    // Ordered list of migrations
    const migrations = [
        {
            version: 1, // Target version
            migrate: (data: any) => {
                console.log('Migrating to v1...');
                // Verify basic structure
                if (!data.metadata) data.metadata = { playtime: 0, username: 'guest' };
                return data;
            }
        },
        {
            version: 2, // Target version
            migrate: (data: any) => {
                console.log('Migrating to v2...');
                data.newFeatureData = { enabled: true };
                return data;
            }
        }
    ];

    for (const m of migrations) {
        if (currentVersion < m.version) {
            try {
                snapshot = m.migrate(snapshot);
                snapshot.version = m.version;
                currentVersion = m.version;
            } catch (e) {
                console.error(`Migration to v${m.version} failed:`, e);
                throw e; // Abort load if migration fails
            }
        }
    }

    return snapshot as SaveSnapshot;
}

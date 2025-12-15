import { FileNode, User, Group, deepCloneFileNode } from './fileSystemUtils';
import pkg from '../../package.json';

// ... (existing imports)

/**
 * Healing migration for Groups
 */
export function migrateGroups(storedGroups: Group[], defaultGroups: Group[]): Group[] {
    console.log('Migrating Groups...');
    const migrated = [...storedGroups];

    for (const defGroup of defaultGroups) {
        const existingIndex = migrated.findIndex(g => g.groupName === defGroup.groupName);
        if (existingIndex === -1) {
            console.log(`Migration: Restoring missing default group ${defGroup.groupName}`);
            migrated.push(defGroup);
        } else {
            // Optional: Force IDs?
            if (defGroup.groupName === 'root' && migrated[existingIndex].gid !== 0) {
                migrated[existingIndex].gid = 0;
            }
        }
    }
    return migrated;
}

export const SYSTEM_VERSION_KEY = 'aurora-version';

// Paths that should be forcefully reset ONLY if they are critically 
// incompatible with the new engine (Schema/Format changes). 
// Otherwise, we respect user modifications.
// Example: '/etc/os-release' might be forced if we want to show correct version,
// but for a hack-sim, maybe even that should remain if user spoofed it?
// Let's force only purely structural/internal things if any.
const CRITICAL_UPDATES: string[] = [
    // Empty for now - respecting user freedom is paramount.
    // Add paths here only if the *Format* of the file changed in a way that crashes the engine.
];

/**
 * Checks if migration is needed based on stored version.
 */
export function checkMigrationNeeded(): boolean {
    const storedVersion = localStorage.getItem(SYSTEM_VERSION_KEY);
    return storedVersion !== pkg.version;
}

/**
 * Updates the stored version to the current version.
 */
export function updateStoredVersion(): void {
    localStorage.setItem(SYSTEM_VERSION_KEY, pkg.version);
}

/**
 * Merges the new system state (initialFS) into the stored user state (storedFS).
 * Strategy: "Smart Merge"
 * - New Files/Dirs in initialFS -> Added to storedFS (New Features).
 * - Existing Files in storedFS -> Preserved (Respect User Hacks).
 * - Critical Files -> Overwritten (Engine Compatibility).
 */
export function migrateFileSystem(storedFS: FileNode, initialFS: FileNode): FileNode {
    console.log(`Migrating Filesystem to ${pkg.version}...`);

    // Recursive Smart Merge
    function mergeNodes(stored: FileNode, fresh: FileNode, currentPath: string) {
        if (!fresh.children) return;
        if (!stored.children) stored.children = [];

        for (const freshChild of fresh.children) {
            const childPath = `${currentPath === '/' ? '' : currentPath}/${freshChild.name}`;
            const storedChildIndex = stored.children.findIndex(c => c.name === freshChild.name);

            if (storedChildIndex === -1) {
                // Case 1: New feature found in fresh FS (e.g. /bin/netcat)
                // Action: Add it.
                console.log(`Migration: Adding new system node: ${childPath}`);
                stored.children.push(deepCloneFileNode(freshChild));
            } else {
                // Case 2: Node exists in user FS.
                // Action: Check if it's a directory to recurse, or a file to potentially update.
                const storedChild = stored.children[storedChildIndex];

                // If Critical Update strictly required
                if (CRITICAL_UPDATES.includes(childPath)) {
                    console.log(`Migration: Force updating critical node: ${childPath}`);
                    stored.children[storedChildIndex] = deepCloneFileNode(freshChild);
                    continue;
                }

                // If it's a directory, we merge its contents (to find new sub-files)
                if (storedChild.type === 'directory' && freshChild.type === 'directory') {
                    mergeNodes(storedChild, freshChild, childPath);
                }

                // If it's a file, we DO NOT touch it.
                // User may have hex-edited the binary or changed config.
                // We respect the "State of the Machine".
            }
        }
    }

    mergeNodes(storedFS, initialFS, '/');

    // Explicit Healing: Ensure ID consistency (Schema integrity)
    // This runs after structure merge to ensure any new nodes get IDs if deepClone didn't (though it should have logic for that elsewhere)
    // Actually ensureIds is usually called on load, but let's be safe.

    return storedFS;
}

/**
 * Healing migration for Users
 * Ensures strict default users exist and have correct UIDs/GIDs
 * merging with whatever user data is there.
 */
export function migrateUsers(storedUsers: User[], defaultUsers: User[]): User[] {
    console.log('Migrating Users...');
    const migrated = [...storedUsers];

    // Ensure all defaults exist
    for (const defUser of defaultUsers) {
        const existingIndex = migrated.findIndex(u => u.username === defUser.username);

        if (existingIndex === -1) {
            // Missing entirely, add it
            console.log(`Migration: Restoring missing default user ${defUser.username}`);
            migrated.push(defUser);
        } else {
            // Exists, check for critical corruptions (missing UID, etc)
            const existing = migrated[existingIndex];
            if (!existing.password && defUser.password) {
                // Heal password
                console.log(`Migration: Healing password for ${defUser.username}`);
                migrated[existingIndex] = { ...existing, password: defUser.password };
            }
            // Force UID/GID consistency for Root?
            if (defUser.username === 'root') {
                if (existing.uid !== 0) migrated[existingIndex].uid = 0;
                if (existing.gid !== 0) migrated[existingIndex].gid = 0;
            }
        }
    }

    return migrated;
}

import { useState, useEffect, useCallback } from 'react';
import {
    FileNode,
    deepCloneFileSystem,
    ensureIds,
    initialFileSystem
} from '../../utils/fileSystemUtils';
import {
    checkMigrationNeeded,
    migrateFileSystem
} from '../../utils/migrations';
import { validateIntegrity } from '../../utils/integrity';
import { hardReset } from '../../utils/memory';

const STORAGE_KEY = 'yami-filesystem';

function loadFileSystem(): FileNode {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            let parsed = JSON.parse(stored);
            if (checkMigrationNeeded()) {
                parsed = migrateFileSystem(parsed, initialFileSystem);
            }
            return ensureIds(parsed);
        }
    } catch (e) {
        console.warn('Failed to load filesystem from storage:', e);
    }
    return deepCloneFileSystem(initialFileSystem);
}

function saveFileSystemToStorage(fs: FileNode): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fs));
    } catch (e) {
        console.warn('Failed to save filesystem to storage:', e);
    }
}

export function useFileSystemState() {
    const [fileSystem, setFileSystem] = useState<FileNode>(() => loadFileSystem());
    const [isSafeMode] = useState<boolean>(() => {
        const isIntegrityOK = validateIntegrity();
        if (!isIntegrityOK) {
            console.error('SYSTEM INTEGRITY COMPROMISED: Entering Safe Mode (Read-Only).');
            return true;
        }
        return false;
    });

    // Persist filesystem changes to localStorage (Debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            saveFileSystemToStorage(fileSystem);
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [fileSystem]);

    const resetFileSystemState = useCallback(() => {
        hardReset();
        setFileSystem(deepCloneFileSystem(initialFileSystem));
    }, []);

    const saveNow = useCallback(() => {
        saveFileSystemToStorage(fileSystem);
    }, [fileSystem]);

    return {
        fileSystem,
        setFileSystem,
        isSafeMode,
        resetFileSystemState,
        saveNow
    };
}

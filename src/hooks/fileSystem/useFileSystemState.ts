import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileNode,
  deepCloneFileSystem,
  ensureIds,
  initialFileSystem,
  migrateFileSystem,
} from "@/utils/fileSystemUtils";
import { validateIntegrity } from "@/utils/integrity";
import {
  hardReset,
  memory,
  STORAGE_KEYS,
  checkMigrationNeeded,
} from "@/utils/memory";
import { safeParseLocal } from "@/utils/safeStorage";
import { useDebounce } from "@/hooks/useDebounce";

const STORAGE_KEY = STORAGE_KEYS.FILESYSTEM;

function loadFileSystem(): FileNode {
  try {
    const stored = safeParseLocal<FileNode>(STORAGE_KEY);
    if (stored) {
      let parsed = stored;
      if (checkMigrationNeeded()) {
        parsed = migrateFileSystem(parsed, initialFileSystem);
      }
      return ensureIds(parsed);
    }
  } catch (e) {
    console.warn("Failed to load filesystem from storage:", e);
  }
  return deepCloneFileSystem(initialFileSystem);
}

function saveFileSystemToStorage(fs: FileNode): void {
  try {
    memory.setItem(STORAGE_KEY, JSON.stringify(fs));
  } catch (e) {
    console.warn("Failed to save filesystem to storage:", e);
  }
}

export function useFileSystemState() {
  const [fileSystem, _setFileSystem] = useState<FileNode>(() =>
    loadFileSystem(),
  );
  const fsRef = useRef(fileSystem);

  const setFileSystem = useCallback(
    (updater: React.SetStateAction<FileNode>) => {
      const next =
        typeof updater === "function"
          ? (updater as (prev: FileNode) => FileNode)(fsRef.current)
          : updater;
      fsRef.current = next;
      _setFileSystem(next);
    },
    [],
  );

  const getFileSystem = useCallback(() => fsRef.current, []);

  const [isSafeMode] = useState<boolean>(() => {
    const isIntegrityOK = validateIntegrity();
    if (!isIntegrityOK) {
      console.error(
        "SYSTEM INTEGRITY COMPROMISED: Entering Safe Mode (Read-Only).",
      );
      return true;
    }
    return false;
  });

  // Persist filesystem changes to localStorage (Debounced)
  const debouncedFileSystem = useDebounce(fileSystem, 1000);

  useEffect(() => {
    saveFileSystemToStorage(debouncedFileSystem);
  }, [debouncedFileSystem]);

  const resetFileSystemState = useCallback(() => {
    hardReset();
    const initial = deepCloneFileSystem(initialFileSystem);
    fsRef.current = initial;
    _setFileSystem(initial);
  }, []);

  const saveNow = useCallback(() => {
    saveFileSystemToStorage(fsRef.current);
  }, []);

  return {
    fileSystem,
    setFileSystem,
    getFileSystem,
    isSafeMode,
    resetFileSystemState,
    saveNow,
  };
}

export interface SaveSnapshot {
  version: number;
  createdAt: number; // Timestamp
  metadata: {
    playtime: number;
    username?: string;
    location?: string; // Optional: e.g. "Desktop", "Terminal"
  };
  sys?: Record<string, any>; // BIOS Tier (Settings)
  hdd?: Record<string, any>; // OS Tier (Filesystem, Users)
  session?: Record<string, any>; // RAM Tier (Windows, History)
  checksum?: string;
}

export interface SaveOptions {
  includeSys?: boolean;
  includeHdd?: boolean;
  includeSession?: boolean;
  compress?: boolean; // Default: true for Electron
}

export interface StorageAdapter {
  /**
   * Initialize the storage backend (if needed)
   */
  init(): Promise<void>;

  /**
   * Write the snapshot to the single save slot
   */
  save(snapshot: SaveSnapshot): Promise<void>;

  /**
   * Read the snapshot from the single save slot
   */
  load(): Promise<SaveSnapshot | null>;

  /**
   * Check if a save exists in the slot
   */
  exists(): Promise<boolean>;

  /**
   * Delete the save slot
   */
  delete(): Promise<void>;
}

export interface SaveManagerConfig {
  adapter: StorageAdapter;
  autoSaveInterval?: number;
}

import { StorageAdapter } from '@/types/save';
import { WebStorageAdapter } from './adapters/WebStorageAdapter';
import { ElectronStorageAdapter } from './adapters/ElectronStorageAdapter';
import { dispatchPhysicalIO } from '../memory';

class SaveManager {
    private adapter: StorageAdapter;
    private initialized = false;

    constructor() {
        // Detect environment
        const isElectron = typeof window !== 'undefined' && window.electron !== undefined;
        
        if (isElectron) {
            console.log('[SaveManager] Using Electron Adapter');
            this.adapter = new ElectronStorageAdapter();
        } else {
            console.log('[SaveManager] Using Web Adapter (IndexedDB)');
            this.adapter = new WebStorageAdapter();
        }
    }

    async init() {
        if (!this.initialized) {
            await this.adapter.init();
            this.initialized = true;
        }
    }

    /**
     * Persist a snapshot object to storage
     */
    public async saveSnapshot(snapshot: any): Promise<boolean> {
        try {
            await this.init();
            
            // If there's a pending auto-save, we can cancel it since we're doing it now
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
                this.saveTimeout = null;
            }

            dispatchPhysicalIO('save', true);
            await this.adapter.save(snapshot);
            dispatchPhysicalIO('save', false);
            console.log('[SaveManager] Snapshot saved successfully.');
            return true;
        } catch (e) {
            console.error('[SaveManager] Failed to save snapshot:', e);
            return false;
        }
    }

    /**
     * Load a snapshot object from storage
     */
    public async loadSnapshot(): Promise<any | null> {
        try {
            await this.init();
            dispatchPhysicalIO('load', true);
            const data = await this.adapter.load();
            dispatchPhysicalIO('load', false);
            if (data) {
                console.log('[SaveManager] Snapshot loaded successfully.');
                return data;
            }
            return null;
        } catch (e) {
            console.error('[SaveManager] Failed to load snapshot:', e);
            return null;
        }
    }

    public async hasSave(): Promise<boolean> {
        await this.init();
        return await this.adapter.exists();
    }

    private saveTimeout: NodeJS.Timeout | null = null;
    private readonly DEBOUNCE_MS = 100;

    /**
     * Schedules a debounced save operation (Auto-Save)
     */
    public scheduleAutoSave(snapshot: any): void {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(async () => {
            await this.saveSnapshot(snapshot);
            this.saveTimeout = null;
        }, this.DEBOUNCE_MS);
    }

    public async deleteSave(): Promise<void> {
        await this.init();
        await this.adapter.delete();
    }
}

// Export singleton
export const saveManager = new SaveManager();

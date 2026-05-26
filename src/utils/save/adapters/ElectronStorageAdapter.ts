import { BaseStorageAdapter } from './StorageAdapter';
import { SaveSnapshot } from '@/types/save';

export class ElectronStorageAdapter extends BaseStorageAdapter {
    async init(): Promise<void> {
        // No init needed for IPC
        return Promise.resolve();
    }

    async save(snapshot: SaveSnapshot): Promise<void> {
        // IPC expects Uint8Array or serialized object? 
        // We'll send the object, let the main process handle serialization/gzip
        // Actually main process needs string/buffer. 
        // Let's send the raw JSON object stringified to buffer to ensure consistency?
        // Or just send the object and let main process JSON.stringify -> GZIP.
        try {
            const data = JSON.stringify(snapshot);
            // Convert to buffer/uint8array for IPC transport efficiency?
            // Actually Electron handles JSON objects fine. 
            // BUT implementation plan said "zlib". 
            // We can let main process do the heavy lifting of GZIP.
            // We just send the object. 
            
            // Wait, typing for window.electron is needed later. Assuming it exists.
            // @ts-expect-error - electron is defined in preload but TS might not see it in test env
            await window.electron.savedata.save(data);
        } catch (e) {
            this.error('Failed to save to Electron backend', e);
            throw e;
        }
    }

    async load(): Promise<SaveSnapshot | null> {
        try {
             // @ts-expect-error - electron is defined in preload but TS might not see it in test env
             const data = await window.electron.savedata.load();
             if (!data) return null;
             
             // Data comes back as string (decompressed JSON)
             return JSON.parse(data);
        } catch (e) {
            this.error('Failed to load from Electron backend', e);
            return null;
        }
    }

    async exists(): Promise<boolean> {
        try {
            // @ts-expect-error - electron is defined in preload but TS might not see it in test env
            return await window.electron.savedata.exists();
        } catch {
            return false;
        }
    }

    async delete(): Promise<void> {
        try {
            // @ts-expect-error - electron is defined in preload but TS might not see it in test env
            await window.electron.savedata.delete();
        } catch (e) {
            this.error('Failed to delete save', e);
            throw e;
        }
    }
}

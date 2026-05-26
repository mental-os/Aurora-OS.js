import { BaseStorageAdapter } from './StorageAdapter';
import { SaveSnapshot } from '@/types/save';

const DB_NAME = 'AuroraOS';
const DB_VERSION = 1;
const STORE_NAME = 'saves';
const SAVE_KEY = 'save.aurora'; // Single slot key

export class WebStorageAdapter extends BaseStorageAdapter {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                this.error('Failed to open IndexedDB', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.log('IndexedDB initialized');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    }

    async save(snapshot: SaveSnapshot): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(snapshot, SAVE_KEY);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async load(): Promise<SaveSnapshot | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(SAVE_KEY);

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async exists(): Promise<boolean> {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
             const transaction = this.db!.transaction([STORE_NAME], 'readonly');
             const store = transaction.objectStore(STORE_NAME);
             const request = store.count(SAVE_KEY);
             
             request.onsuccess = () => {
                 resolve(request.result > 0);
             };
             request.onerror = () => reject(request.error);
        });
    }

    async delete(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(SAVE_KEY);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

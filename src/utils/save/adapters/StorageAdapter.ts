import { StorageAdapter, SaveSnapshot } from '@/types/save';

/**
 * Abstract base class for Storage Adapters to enforce consistent logging/error patterns
 */
export abstract class BaseStorageAdapter implements StorageAdapter {
    abstract init(): Promise<void>;
    abstract save(snapshot: SaveSnapshot): Promise<void>;
    abstract load(): Promise<SaveSnapshot | null>;
    abstract exists(): Promise<boolean>;
    abstract delete(): Promise<void>;

    protected log(message: string, data?: any) {
        console.log(`[StorageAdapter] ${message}`, data || '');
    }

    protected error(message: string, error: any) {
        console.error(`[StorageAdapter] ${message}`, error);
    }
}

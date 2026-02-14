import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useFileSystem } from '@/components/FileSystemContext';
import { useAppContext } from '@/components/AppContext';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useI18n } from '@/i18n/index';
import { STORAGE_KEYS } from '@/utils/memory';

export interface Photo {
    id: string;
    path: string;
    url: string;
    name: string;
    album: string;
    isFavorite: boolean;
    modified: number;
}

interface PhotosContextType {
    libraryPhotos: Photo[];
    recentPhotos: Photo[];
    favorites: Photo[];
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    toggleFavorite: (photoId: string) => void;
    addToRecent: (photo: Photo) => void;
    openPhoto: (path: string) => Photo | null;
    isPhotosOpen: boolean;
    setPhotosOpen: (isOpen: boolean) => void;
    activeUser: string;
}

const PhotosContext = createContext<PhotosContextType | null>(null);

export function usePhotos() {
    const context = useContext(PhotosContext);
    if (!context) throw new Error('usePhotos must be used within PhotosProvider');
    return context;
}

export function PhotosProvider({ children, owner }: { children: React.ReactNode, owner?: string }) {
    const { t } = useI18n();
    const { fileSystem, readFile, getNodeAtPath, resolvePath, listDirectory } = useFileSystem();
    const { activeUser: desktopUser } = useAppContext();
    const activeUser = owner || desktopUser;

    const [isPhotosOpen, setPhotosOpen] = useState(false);
    const [libraryPhotos, setLibraryPhotos] = useState<Photo[]>([]);
    const [storedRecentPhotos, setStoredRecentPhotos] = useState<Photo[]>(() => {
        try {
            const key = `${STORAGE_KEYS.APP_DATA_PREFIX}photos-recent-${activeUser}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved) as Photo[];
                // Deduplicate and Sanitize (exclude library photos)
                const unique = new Map();
                parsed.forEach(p => {
                    if (!p.path.startsWith('~/Pictures/') && !unique.has(p.id)) {
                        unique.set(p.id, p);
                    }
                });
                return Array.from(unique.values());
            }
        } catch (e) { console.warn('Failed to load photos recents', e); }
        return [];
    });
    const [favoriteIds, setFavoriteIds] = useSessionStorage<string[]>(`${STORAGE_KEYS.APP_DATA_PREFIX}photos-favorites-${activeUser}`, [], activeUser);
    const [activeCategory, setActiveCategory] = useSessionStorage<string>(`${STORAGE_KEYS.APP_DATA_PREFIX}photos-active-category`, 'all', activeUser);
    const [hasValidatedRecent, setHasValidatedRecent] = useState(false);

    // Persistence for recentPhotos
    useEffect(() => {
        if (!isPhotosOpen) return;
        const key = `${STORAGE_KEYS.APP_DATA_PREFIX}photos-recent-${activeUser}`;
        if (storedRecentPhotos.length > 0) {
            localStorage.setItem(key, JSON.stringify(storedRecentPhotos));
        } else {
            localStorage.removeItem(key);
        }
    }, [storedRecentPhotos, activeUser, isPhotosOpen]);

    // Sync recentPhotos with file system (Zombie Check & Moved-to-Library check)
    useEffect(() => {
        if (!isPhotosOpen || hasValidatedRecent) return;

        setTimeout(() => {
            setStoredRecentPhotos(prev => {
                const existing = prev.filter(photo => {
                    // 1. Check if file still exists
                    const node = getNodeAtPath(photo.path, activeUser);
                    if (!node || node.type !== 'file') return false;

                    // 2. Check if file was moved into library (~/Pictures/)
                    // If it's in the library now, it should be removed from Recent to avoid duplication
                    if (photo.path.startsWith('~/Pictures/')) return false;

                    return true;
                });
                return existing.length === prev.length ? prev : existing;
            });
            setHasValidatedRecent(true);
        }, 0);
    }, [isPhotosOpen, hasValidatedRecent, activeUser, getNodeAtPath]);

    // Reset validation flag when app closes
    useEffect(() => {
        if (!isPhotosOpen) {
            setTimeout(() => setHasValidatedRecent(false), 0);
        }
    }, [isPhotosOpen]);

    // Scan ~/Pictures for photos
    useEffect(() => {
        if (!isPhotosOpen) return;

        let picturesPath = resolvePath("~/Pictures", activeUser);
        let pathPrefix = "~/Pictures/";

        if (!getNodeAtPath(picturesPath, activeUser)) {
            picturesPath = resolvePath("~", activeUser);
            pathPrefix = "~/";
        }

        const scanRecursive = (path: string, prefix: string): Photo[] => {
            const nodes = listDirectory(path, activeUser);
            if (!nodes) return [];

            let results: Photo[] = [];
            nodes.forEach(node => {
                if (node.type === 'directory') {
                    results = [...results, ...scanRecursive(`${path}/${node.name}`, `${prefix}${node.name}/`)];
                } else if (node.type === 'file' && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(node.name)) {
                    results.push({
                        id: node.id,
                        path: `${prefix}${node.name}`,
                        url: node.content || '',
                        name: node.name,
                        album: path.split('/').pop() || t('photos.folders.misc'),
                        isFavorite: favoriteIds.includes(node.id),
                        modified: node.modified?.getTime() || Date.now()
                    });
                }
            });
            return results;
        };

        const photos = scanRecursive(picturesPath, pathPrefix);
        setTimeout(() => setLibraryPhotos(photos), 0);
    }, [isPhotosOpen, activeUser, fileSystem, favoriteIds, resolvePath, getNodeAtPath, listDirectory, t]);

    const favorites = libraryPhotos.filter(p => favoriteIds.includes(p.id));

    // Reactive Recent list that injects live favorite status
    const recentPhotos = useMemo(() => {
        return storedRecentPhotos.map(p => ({
            ...p,
            isFavorite: favoriteIds.includes(p.id)
        }));
    }, [storedRecentPhotos, favoriteIds]);

    const toggleFavorite = useCallback((photoId: string) => {
        setFavoriteIds(prev =>
            prev.includes(photoId)
                ? prev.filter(id => id !== photoId)
                : [...prev, photoId]
        );
    }, [setFavoriteIds]);

    const addToRecent = useCallback((photo: Photo) => {
        // Only add to Recent if it's an ad-hoc file (not in ~/Pictures/)
        if (photo.path.startsWith('~/Pictures/')) return;

        setStoredRecentPhotos(prev => {
            const filtered = prev.filter(p => p.id !== photo.id);
            return [photo, ...filtered].slice(0, 50);
        });
    }, []);

    const openPhoto = useCallback((path: string): Photo | null => {
        const node = getNodeAtPath(path, activeUser);
        if (node && node.type === 'file') {
            const content = readFile(path, activeUser);
            const photo: Photo = {
                id: node.id,
                path: path,
                url: content || '',
                name: node.name,
                album: path.startsWith('~/Pictures/') ? (path.split('/').slice(-2, -1)[0] || t('photos.folders.pictures')) : t('photos.folders.recent'),
                isFavorite: favoriteIds.includes(node.id),
                modified: node.modified?.getTime() || Date.now()
            };
            addToRecent(photo);
            if (!path.startsWith('~/Pictures/')) {
                setActiveCategory('recent');
            }
            return photo;
        } else {
            // Prune if not found and it was in recents
            setStoredRecentPhotos(prev => prev.filter(p => p.path !== path));
        }
        return null;
    }, [getNodeAtPath, activeUser, readFile, favoriteIds, addToRecent, setActiveCategory, t]);

    return (
        <PhotosContext.Provider value={{
            libraryPhotos,
            recentPhotos,
            favorites,
            activeCategory,
            setActiveCategory,
            toggleFavorite,
            addToRecent,
            openPhoto,
            isPhotosOpen,
            setPhotosOpen,
            activeUser: activeUser
        }}>
            {children}
        </PhotosContext.Provider>
    );
}

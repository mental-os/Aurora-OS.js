import { useState, useMemo, useEffect, useRef } from 'react';
import { Heart, Folder, Clock, Image, Grid3x3, List, FolderOpen } from 'lucide-react';
import { AppTemplate } from '@/components/apps/AppTemplate';
import { usePhotos, Photo, PhotosProvider } from '@/components/PhotosContext';
import { cn } from '@/components/ui/utils';
import { useI18n } from '@/i18n/index';
import { useWindow } from '@/components/WindowContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useFileSystem } from "@/components/FileSystemContext";
import { useAppContext } from "@/components/AppContext";
import { Lightbox } from '@/components/ui/Lightbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { getSafeImageUrl } from '@/utils/urlUtils';

export function Photos(props: { owner?: string, onOpenApp?: (type: string, data?: any, owner?: string) => void }) {
  const { activeUser: desktopUser } = useAppContext();
  const isElevated = props.owner && props.owner !== desktopUser;

  if (isElevated) {
    return (
      <PhotosProvider owner={props.owner}>
        <PhotosInner {...props} />
      </PhotosProvider>
    );
  }

  return <PhotosInner {...props} />;
}

function PhotosInner({ owner, onOpenApp }: { owner?: string, onOpenApp?: (type: string, data?: any, owner?: string) => void }) {
  const { t } = useI18n();
  const { activeUser: desktopUser } = useAppContext();
  const windowContext = useWindow();
  const { getBackgroundColor, blurStyle } = useThemeColors();
  const { resolvePath, getNodeAtPath } = useFileSystem();

  const {
    libraryPhotos,
    recentPhotos,
    favorites,
    activeCategory,
    setActiveCategory,
    toggleFavorite,
    openPhoto,
    setPhotosOpen,
    activeUser
  } = usePhotos();

  // Local state
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const lastProcessedTimestampRef = useRef<number | null>(null);

  // Reactive lookup for the selected photo to ensure state sync (favorites, etc.)
  const activeSelectedPhoto = useMemo(() => {
    if (!selectedPhotoId) return null;
    return libraryPhotos.find(p => p.id === selectedPhotoId) ||
      recentPhotos.find(p => p.id === selectedPhotoId);
  }, [selectedPhotoId, libraryPhotos, recentPhotos]);

  const handlePhotoClick = (photo: Photo) => {
    if (activeCategory === 'recent') {
      const validated = openPhoto(photo.path);
      if (validated) {
        setSelectedPhotoId(validated.id);
      }
    } else {
      setSelectedPhotoId(photo.id);
    }
  };

  useEffect(() => {
    setPhotosOpen(true);
    return () => setPhotosOpen(false);
  }, [setPhotosOpen]);

  // Handle external open (from Finder/OS)
  useEffect(() => {
    const path = windowContext?.data?.path;
    const timestamp = windowContext?.data?.timestamp;
    const isFresh = timestamp && (Date.now() - timestamp < 2000);

    if (path && timestamp && isFresh && timestamp !== lastProcessedTimestampRef.current) {
      lastProcessedTimestampRef.current = timestamp;
      const openedPhoto = openPhoto(path);
      if (openedPhoto) {
        setTimeout(() => setSelectedPhotoId(openedPhoto.id), 0);
      }
    }
  }, [windowContext?.data, openPhoto]);

  const photosSidebar = {
    sections: [
      {
        title: t('photos.sidebar.libraryTitle'),
        items: [
          { id: 'all', label: t('photos.library.allPhotos'), icon: Image, badge: libraryPhotos.length > 0 ? libraryPhotos.length.toString() : undefined },
          { id: 'favorites', label: t('photos.library.favorites'), icon: Heart, badge: favorites.length > 0 ? favorites.length.toString() : undefined },
          { id: 'recent', label: t('photos.library.recent'), icon: Clock, badge: recentPhotos.length > 0 ? recentPhotos.length.toString() : undefined },
        ],
      },
      {
        title: t('photos.sidebar.albumsTitle'),
        items: [...new Set(libraryPhotos.map(p => p.album))].map(album => {
          const count = libraryPhotos.filter(p => p.album === album).length;
          return {
            id: `album-${album}`,
            label: album,
            icon: Folder,
            badge: count > 0 ? count.toString() : undefined
          };
        })
      },
    ],
  };

  const displayPhotos = useMemo(() => {
    if (activeCategory === 'favorites') return favorites;
    if (activeCategory === 'recent') return recentPhotos;
    if (activeCategory.startsWith('album-')) {
      const albumName = activeCategory.replace('album-', '');
      return libraryPhotos.filter(p => p.album === albumName);
    }
    return libraryPhotos;
  }, [activeCategory, favorites, recentPhotos, libraryPhotos]);

  const toolbarTitle = (() => {
    if (activeCategory === 'favorites') return t('photos.library.favorites');
    if (activeCategory === 'recent') return t('photos.library.recent');
    if (activeCategory.startsWith('album-')) return activeCategory.replace('album-', '');
    return t('photos.library.allPhotos');
  })();

  const showUserContext = activeUser !== desktopUser;

  const toolbar = (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-col">
        <h2 className="text-white/90 leading-tight">{toolbarTitle}</h2>
        {showUserContext && (
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{t('photos.library.userLibrary', { user: activeUser })}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={cn(
            "p-1.5 rounded transition-colors",
            viewMode === 'grid' ? "bg-white/10 text-white" : "hover:bg-white/10 text-white/70"
          )}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            "p-1.5 rounded transition-colors",
            viewMode === 'list' ? "bg-white/10 text-white" : "hover:bg-white/10 text-white/70"
          )}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const content = (
    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
      {displayPhotos.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          {(() => {
            if (activeCategory === 'recent') {
              return (
                <EmptyState
                  icon={Clock}
                  title={t('photos.empty.recent.title')}
                  description={t('photos.empty.recent.description')}
                />
              );
            } else if (activeCategory === 'favorites') {
              return (
                <EmptyState
                  icon={Heart}
                  title={t('photos.empty.favorites.title')}
                  description={t('photos.empty.favorites.description')}
                />
              );
            } else {
              const picturesPath = resolvePath("~/Pictures", activeUser);
              const picturesNode = getNodeAtPath(picturesPath, activeUser);

              if (!picturesNode) {
                return (
                  <EmptyState
                    icon={FolderOpen}
                    title={t('photos.empty.noFolder.title', { user: activeUser })}
                    description={t('photos.empty.noFolder.description', { path: picturesPath })}
                    action={
                      <Button
                        variant="outline"
                        onClick={() => {
                          const home = resolvePath("~", activeUser);
                          onOpenApp?.('finder', { path: home }, owner);
                        }}
                        className="gap-2 border-white/20 text-white hover:bg-white/10"
                      >
                        <FolderOpen className="w-4 h-4" />
                        {t('photos.empty.openHome')}
                      </Button>
                    }
                  />
                );
              }

              return (
                <EmptyState
                  icon={Image}
                  title={t('photos.empty.library.title')}
                  description={t('photos.empty.library.description')}
                  action={
                    <Button
                      variant="outline"
                      onClick={() => {
                        onOpenApp?.('finder', { path: picturesPath }, owner);
                      }}
                      className="gap-2 border-white/20 text-white hover:bg-white/10"
                    >
                      <FolderOpen className="w-4 h-4" />
                      {t('photos.empty.library.openFolder', { folder: activeCategory.startsWith('album-') ? activeCategory.replace('album-', '') : t('photos.folders.pictures') })}
                    </Button>
                  }
                />
              );
            }
          })()}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
          {displayPhotos.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid mb-4 group relative cursor-pointer"
              onClick={() => handlePhotoClick(photo)}
            >
              <img
                src={getSafeImageUrl(photo.url) || ''}
                alt={photo.name}
                className="w-full rounded-lg shadow-lg hover:ring-2 hover:ring-white/20 transition-all"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(photo.id);
                  }}
                  className="p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70"
                >
                  {photo.isFavorite ? <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" /> : <Heart className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {displayPhotos.map((photo) => (
            <div
              key={photo.id}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
              onClick={() => handlePhotoClick(photo)}
            >
              <img src={getSafeImageUrl(photo.url) || ''} className="w-12 h-12 rounded object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{photo.name}</div>
                <div className="text-xs text-white/50 truncate flex items-center gap-1.5">
                  <span>{photo.album}</span>
                  <span>•</span>
                  <span>{new Date(photo.modified).toLocaleDateString()}</span>
                </div>
                {activeCategory === 'recent' && (
                  <div className="text-[10px] text-white/30 truncate font-mono mt-0.5" title={photo.path}>
                    {photo.path}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(photo.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-white/50 hover:text-white"
              >
                {photo.isFavorite ? <Heart className="w-4 h-4 fill-red-500 text-red-500" /> : <Heart className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Overlay */}
      {activeSelectedPhoto && (
        <Lightbox
          photo={activeSelectedPhoto}
          onClose={() => setSelectedPhotoId(null)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div >
  );

  return (
    <AppTemplate
      sidebar={photosSidebar}
      toolbar={toolbar}
      content={content}
      activeItem={activeCategory}
      onItemClick={(id) => setActiveCategory(id as any)}
      contentClassName="flex flex-col h-full overflow-hidden"
      toolbarClassName="bg-transparent"
      style={{ background: getBackgroundColor(0.8), ...blurStyle }}
      minContentWidth={500}
    />
  );
}





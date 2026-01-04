import { Heart, Folder, Clock, MapPin, User, Image, Grid3x3, List } from 'lucide-react';
import { AppTemplate } from './AppTemplate';
import { ResponsiveGrid } from '../ui/ResponsiveGrid';
import { useAppStorage } from '../../hooks/useAppStorage';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { cn } from '../ui/utils';
import { useI18n } from '../../i18n';

const mockPhotos = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  color: ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-teal-500'][i % 6],
}));

export function Photos({ owner }: { owner?: string }) {
  const { t } = useI18n();

  // Persisted state
  const [activeCategory, setActiveCategory] = useSessionStorage('photos-active-category', 'all', owner);
  const [appState, setAppState] = useAppStorage('photos', {
    viewMode: 'grid',
  }, owner);

  const photosSidebar = {
    sections: [
      {
        title: t('photos.sidebar.libraryTitle'),
        items: [
          { id: 'all', label: t('photos.library.allPhotos'), icon: Image, badge: '1,234' },
          { id: 'favorites', label: t('photos.library.favorites'), icon: Heart, badge: '42' },
          { id: 'recent', label: t('photos.library.recent'), icon: Clock },
          { id: 'people', label: t('photos.library.people'), icon: User },
          { id: 'places', label: t('photos.library.places'), icon: MapPin },
        ],
      },
      {
        title: t('photos.sidebar.albumsTitle'),
        items: [
          { id: 'album1', label: t('photos.albums.vacation2024'), icon: Folder, badge: '156' },
          { id: 'album2', label: t('photos.albums.family'), icon: Folder, badge: '89' },
          { id: 'album3', label: t('photos.albums.nature'), icon: Folder, badge: '203' },
        ],
      },
    ],
  };

  const toolbarTitle = (() => {
    switch (activeCategory) {
      case 'favorites':
        return t('photos.library.favorites');
      case 'recent':
        return t('photos.library.recent');
      case 'people':
        return t('photos.library.people');
      case 'places':
        return t('photos.library.places');
      case 'album1':
        return t('photos.albums.vacation2024');
      case 'album2':
        return t('photos.albums.family');
      case 'album3':
        return t('photos.albums.nature');
      case 'all':
      default:
        return t('photos.library.allPhotos');
    }
  })();

  const toolbar = (
    <div className="flex items-center justify-between w-full">
      <h2 className="text-white/90">{toolbarTitle}</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setAppState(s => ({ ...s, viewMode: 'grid' }))}
          className={cn(
            "p-1.5 rounded transition-colors",
            appState.viewMode === 'grid' ? "bg-white/10 text-white" : "hover:bg-white/10 text-white/70"
          )}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAppState(s => ({ ...s, viewMode: 'list' }))}
          className={cn(
            "p-1.5 rounded transition-colors",
            appState.viewMode === 'list' ? "bg-white/10 text-white" : "hover:bg-white/10 text-white/70"
          )}
        >
          <List className="w-4 h-4 text-white/70" />
        </button>
      </div>
    </div>
  );

  const content = (
    <div className="p-4">
      <ResponsiveGrid minItemWidth={140} gap={3}>
        {mockPhotos.map((photo) => (
          <div
            key={photo.id}
            className={`aspect-square ${photo.color} rounded-lg hover:scale-105 transition-transform cursor-pointer`}
          />
        ))}
      </ResponsiveGrid>
    </div >
  );

  return (
    <AppTemplate
      sidebar={photosSidebar}
      toolbar={toolbar}
      content={content}
      activeItem={activeCategory}
      onItemClick={(id) => setActiveCategory(id)}
      contentClassName="overflow-y-auto"
      minContentWidth={500}
    />
  );
}

import { AppMenuConfig } from '../../types';

export const photosMenuConfig: AppMenuConfig = {
  menus: ['File', 'Edit', 'Image', 'View', 'Window', 'Help'],
  items: {
    'Image': [
      { label: 'Slideshow', labelKey: 'photos.menu.slideshow', action: 'slideshow' },
      { type: 'separator' },
      { label: 'Rotate Clockwise', labelKey: 'photos.menu.rotateClockwise', shortcut: '⌘R', action: 'rotate-cw' },
      { label: 'Rotate Counter Clockwise', labelKey: 'photos.menu.rotateCounterClockwise', shortcut: '⇧⌘R', action: 'rotate-ccw' }
    ]
  }
};

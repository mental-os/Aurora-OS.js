import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { Clock, PlayCircle, Music2, Play, Pause, SkipBack, SkipForward, Volume2, FolderOpen } from 'lucide-react';
import { AppTemplate } from './AppTemplate';
import { useAppContext } from '../AppContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useFileSystem } from '../FileSystemContext';
import { useMusic, type Song } from '../MusicContext';
import { useWindow } from '../WindowContext';
import { cn } from '../ui/utils';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { EmptyState } from '../ui/empty-state';
import { useI18n } from '../../i18n/index';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

// Helper to parse "Artist - Title.ext" or fallback to "Title"
const parseMetadata = (filename: string, t: TFn) => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const parts = nameWithoutExt.split(' - ');

  if (parts.length >= 2) {
    return {
      artist: parts[0].trim() || t('music.metadata.unknownArtist'),
      title: parts.slice(1).join(' - ').trim() || t('music.metadata.unknownTitle'),
      album: t('music.metadata.unknownAlbum'),
    };
  }

  return {
    artist: t('music.metadata.unknownArtist'),
    title: nameWithoutExt || t('music.metadata.unknownTitle'),
    album: t('music.metadata.unknownAlbum'),
  };
};

const musicSidebar = (songCount: number, onSelect: (id: string) => void, t: TFn) => ({
  sections: [
    {
      title: t('music.sidebar.library'),
      items: [
        {
          id: 'songs',
          label: t('music.sidebar.songs'),
          icon: Music2,
          badge: songCount.toString(),
          action: () => onSelect('songs')
        },
        //{ id: 'artists', label: 'Artists', icon: User },
        //{ id: 'albums', label: 'Albums', icon: Disc },
        //{ id: 'playlists', label: 'Playlists', icon: List },
      ],
    },
    {
      title: t('music.sidebar.favorites'),
      items: [
        //{ id: 'favorites', label: 'Liked Songs', icon: Heart },
        {
          id: 'recent',
          label: t('music.sidebar.recentlyPlayed'),
          icon: Clock,
          action: () => onSelect('recent')
        },
      ],
    },
  ],
});

interface MusicProps {
  owner?: string;
  initialPath?: string;
  onOpenApp?: (type: string, data?: any, owner?: string) => void;
}

export function Music({ owner, initialPath, onOpenApp }: MusicProps) {
  // const [appState, setAppState] = useAppStorage... (Moved to Context)

  const { fileSystem, resolvePath, listDirectory, getNodeAtPath, readFile } = useFileSystem();
  const { accentColor, activeUser: desktopUser } = useAppContext();
  const windowContext = useWindow();
  const activeUser = owner || desktopUser;
  const { getBackgroundColor, blurStyle } = useThemeColors();
  const { t } = useI18n();

  const {
    playlist: songs,
    currentSong,
    currentIndex,
    isPlaying,
    volume,
    setVolume,
    setPlaylist,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    soundRef,
    recent,
    pause,
    seekTo,
    currentTime,
    duration,
    setMusicOpen,
    activeCategory,
    setActiveCategory
  } = useMusic();



  // Pause music when the window (component) closes to save session state
  useEffect(() => {
    setMusicOpen(true);
    return () => {
      setMusicOpen(false);
      pause();
    };
  }, [pause, setMusicOpen]);

  // Track processed path to avoid re-triggering on state changes
  const processedPathRef = useRef<string | null>(null);
  const processedTimestampRef = useRef<number | null>(null);

  // Handle Initial Path updates (just for UI synchronization if needed, but not playback)
  // In "window-gated" mode, we watch for timestamps to trigger playback.This component just watches currentSong via useMusic.

  // Handle Initial Path and Dynamic Path updates from CLI/Finder
  useEffect(() => {
    const path = initialPath || windowContext?.data?.path;
    const timestamp = windowContext?.data?.timestamp;

    // Logic: Only play if we have a NEW timestamp (explicit user intent) 
    // OR if it's the very first mount with a path (fresh open) and we haven't processed this path yet.

    const isNewTimestamp = timestamp && timestamp !== processedTimestampRef.current;
    // For initial mount without timestamp (legacy/fresh open), we check path diff, 
    // but practically OS always sends timestamp now. We'll support both.
    const isNewPath = path && path !== processedPathRef.current;

    if (path && (isNewTimestamp || (isNewPath && !timestamp))) {
      processedPathRef.current = path;
      if (timestamp) processedTimestampRef.current = timestamp;

      const node = getNodeAtPath(path, activeUser);
      if (node && node.type === 'file') {
        const content = readFile(path, activeUser);
        const meta = parseMetadata(node.name, t);
        const song: Song = {
          id: node.id,
          path: path,
          url: content || '',
          title: meta.title || t('music.metadata.unknownTitle'),
          artist: meta.artist || t('music.metadata.unknownArtist'),
          album: meta.album || t('music.metadata.unknownAlbum'),
          duration: '--:--'
        };
        playSong(song);
        setActiveCategory('recent');
      }
    }
  }, [initialPath, windowContext?.data?.path, windowContext?.data?.timestamp, activeUser, getNodeAtPath, readFile, playSong, setActiveCategory, t]);

  // Local Library State (Decoupled from Global Playlist to prevent Multi-User Loops)
  const [items, setItems] = useState<Song[]>([]);

  // Derived state for view
  // We use local items for library view
  const librarySongs = items;

  const displaySongs = activeCategory === 'recent'
    ? recent
    : librarySongs;
  const displayTitle = activeCategory === 'recent'
    ? t('music.titles.recentlyPlayed')
    : t('music.titles.songs');

  // Visual Refs
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // 1. Scan ~/Music for songs and populate Library View (Local)
  useEffect(() => {
    let musicPath = resolvePath('~/Music', activeUser);
    let pathPrefix = '~/Music/';

    // Fallback to Home if Music folder doesn't exist
    if (!getNodeAtPath(musicPath, activeUser)) {
      musicPath = resolvePath('~', activeUser);
      pathPrefix = '~/';
    }

    const files = listDirectory(musicPath, activeUser);

    if (files) {
      const audioFiles = files.filter(f =>
        f.type === 'file' &&
        /\.(mp3|wav|ogg|flac|m4a)$/i.test(f.name)
      );

      const parsedSongs: Song[] = audioFiles.map(file => {
        const meta = parseMetadata(file.name, t);
        return {
          id: file.id,
          path: `${pathPrefix}${file.name}`,
          url: file.content || '',
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          duration: '--:--'
        };
      });
      
      // Update local library view
      // Defer to next tick to avoid synchronous setState warning and improve perceived performance
      setTimeout(() => {
        setItems(parsedSongs);
      }, 0);
    } else {
      setTimeout(() => {
        setItems([]);
      }, 0);
    }
  }, [fileSystem, resolvePath, listDirectory, activeUser, setItems, getNodeAtPath, t]);


  // Progressive Metadata Resolver
  // This effect runs to populate durations for songs that have '--:--'
  useEffect(() => {
    // Find first song with missing duration
    const missingIdx = songs.findIndex(s => s.duration === '--:--');

    if (missingIdx !== -1) {
      const song = songs[missingIdx];

      // Load it temporarily to get duration
      const tempSound = new Howl({
        src: [song.url],
        html5: false, // Use Web Audio for faster loading of header if possible, or just standard
        preload: true,
        volume: 0,
        onload: () => {
          const dur = tempSound.duration();
          const totalSecs = Math.round(dur);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

          tempSound.unload();

          // Update playlist
          setPlaylist(prev => prev.map(s =>
            s.id === song.id ? { ...s, duration: formatted } : s
          ));
        },
        onloaderror: () => {
          tempSound.unload();
          // Mark as unknown or just leave as is to avoid loop?
          // Let's mark as "0:00" or similar to stop retry loop
          setPlaylist(prev => prev.map(s =>
            s.id === song.id ? { ...s, duration: '0:00' } : s
          ));
        }
      });

      return () => {
        tempSound.unload();
      };
    }
  }, [songs, setPlaylist]);

  // Animation Loop Effect (Seek)
  useEffect(() => {
    const animate = () => {
      if (soundRef.current && soundRef.current.playing()) {
        const current = soundRef.current.seek();
        const duration = soundRef.current.duration();

        if (typeof current === 'number' && duration > 0 && progressBarRef.current) {
          const percent = (current / duration) * 100;
          progressBarRef.current.style.width = `${percent}%`;
        }
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, soundRef]);

  const toolbar = (
    <div className="flex items-center justify-between w-full">
      <h2 className="text-white/90">{displayTitle}</h2>
      <button
        onClick={() => {
          if (displaySongs.length > 0) {
            playSong(displaySongs[0]);
          }
        }}
        className="px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-90 shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        <PlayCircle className="w-4 h-4 inline mr-1.5" />
        {t('music.actions.playAll')}
      </button>
    </div>
  );

  const content = ({ contentWidth }: { contentWidth: number }) => {
    const showAlbum = contentWidth > 520;
    const showPlayerInfo = contentWidth > 320;
    const showVolume = contentWidth > 420;

    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {displaySongs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center -mt-10">
              {activeCategory === 'recent' ? (
                <EmptyState
                  icon={Clock}
                  title={t('music.empty.recent.title')}
                  description={t('music.empty.recent.description')}
                />
              ) : (
                <EmptyState
                  icon={Music2}
                  title={t('music.empty.library.title')}
                  description={t('music.empty.library.description')}
                  action={
                    <Button
                      variant="outline"
                      onClick={() => {
                        const musicPath = resolvePath('~/Music', activeUser);
                        const homePath = resolvePath('~', activeUser);
                        // Check if ~/Music exists, otherwise default to Home
                        const targetPath = getNodeAtPath(musicPath, activeUser) ? musicPath : homePath;
                        onOpenApp?.('finder', { path: targetPath }, owner);
                      }}
                      className="gap-2 border-white/20 text-white hover:bg-white/10"
                    >
                      <FolderOpen className="w-4 h-4" />
                      {(() => {
                        const hasMusicFolder = Boolean(getNodeAtPath(resolvePath('~/Music', activeUser), activeUser));
                        const folder = hasMusicFolder ? t('music.folders.music') : t('music.folders.home');
                        return t('music.empty.library.openFolder', { folder });
                      })()}
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {displaySongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => {
                    // When clicking a song, assume the user wants to play *this list*.
                    // We update the playlist to match the current view (displaySongs).
                    // But we must be careful not to reset if it's already the active context?
                    // Actually, enforcing "View = Queue" is the most robust way to ensure Next/Prev work as expected.

                    // Optimization: Only update playlist if it's different or if we are switching contexts.
                    // For simplicity and robustness given the "funny controls" report, we force sync.
                    // We also need to map to ensure we pass a clean array.

                    // NOTE: playSong checks index in *current* playlist state. 
                    // If we call setPlaylist, playSong won't see the new playlist immediately in the same render cycle
                    // because `songs` (playlist) is a dependency.
                    // SO we should setPlaylist FIRST, then pass the song? 
                    // OR we need a way to say "Play this song in this new playlist".

                    // Calling setPlaylist will trigger the `setPlaylist` wrapper we wrote, which syncs currentIndex.
                    // But we want to set the index to *this specific song*.

                    // Strategy:
                    // 1. Set Playlist to `displaySongs`.
                    // 2. Play the song.

                    // Check if current playlist is already this list to avoid reload ripple?
                    // Comparing arrays is expensive. Let's just do it.


                    setPlaylist(displaySongs);

                    // Since setPlaylist is async/batched, checking `playlist` inside `playSong` immediately will read OLD playlist.
                    // WE NEED A NEW METHOD in Context: `playSongInContext(song, contextList)`.
                    // Or we manually handle it here:
                    // 
                    // But we don't have access to the deep `playSoundImplementation` here.
                    // Reverting to simpler approach:
                    // If we change playlist, we can trust `setPlaylist` wrapper to sync index IF the song was already playing.
                    // But here we are *starting* a song.

                    // Let's use `playSong` but simply update playlist first? 
                    // No, `playSong` relies on `playlist` state.

                    // Let's update `playSong` in Context to support context switching? 
                    // Or simpler: Just update playlist, and we know the index.
                    // We can't easily access `playRef` from here.

                    // WORKAROUND:
                    // `setPlaylist` takes `displaySongs`.
                    // `playSong` accepts the song.
                    // Issue: `playSong` logic: `idx = playlist.findIndex...`. It uses stale `playlist`.

                    // If we just `playSong(song)`, it plays. BUT playlist is wrong.
                    // If we `setPlaylist(displaySongs)`, then `playSong(song)`... stale playlist used by `playSong`.

                    // CORRECT FIX: calling `playSong(song)` is NOT ENOUGH if we want to switch playlist context.
                    // We should probably rely on `playSong` to handle this if we pass the context.
                    // BUT changing Context interface is a bigger refactor.

                    // ALTERNATIVE:
                    // Use `useEffect`? No.
                    // 
                    // What if we just set the playlist and *then* rely on the fact that `playSong` will find it? 
                    // No, race condition.

                    // Use `setTimeout`? Dirty.

                    // Let's add a `playTrackInList` method to Context?
                    // Or just assume `playSong` is fine, but we force the playlist update *inside* `playSong` if we pass it? 
                    //
                    // Let's stick to the current scope.
                    // I will update `playSong` in `MusicContext` to accept an optional `newPlaylist` argument.

                    playSong(song, displaySongs);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group",
                    currentSong?.id === song.id && "bg-white/10"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden bg-white/5"
                    style={{
                      backgroundColor: currentSong?.id === song.id ? accentColor : undefined
                    }}>

                    {currentSong?.id === song.id && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-1 bg-white animate-[music-bar_0.5s_ease-in-out_infinite]" />
                        <div className="w-1 bg-white animate-[music-bar_0.7s_ease-in-out_infinite]" />
                        <div className="w-1 bg-white animate-[music-bar_0.4s_ease-in-out_infinite]" />
                      </div>
                    ) : (
                      <Music2
                        className={cn("w-5 h-5", currentSong?.id === song.id ? "text-white" : "")}
                        style={currentSong?.id === song.id ? undefined : { color: accentColor }}
                      />
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className={cn("text-sm truncate font-medium", currentSong?.id === song.id ? "text-white" : "text-white/90")}>
                      {song.title}
                    </div>
                    <div className="text-white/60 text-xs truncate">{song.artist}</div>
                    {activeCategory === 'recent' && (
                      <div className="text-white/40 text-[10px] truncate font-mono mt-0.5" title={song.path}>
                        {song.path}
                      </div>
                    )}
                  </div>
                  {showAlbum && <div className="text-white/60 text-xs truncate w-1/3 text-right">{song.album}</div>}
                  <div className="text-white/60 text-xs w-12 text-right tabular-nums">{song.duration}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Now Playing Bar */}
        <div
          className="h-20 border-t border-white/10 px-4 flex items-center gap-4 shrink-0 relative group"
          style={{ background: getBackgroundColor(0.9), ...blurStyle }}
        >
          {/* Progress Bar (Interactive) */}
          <div 
            className="absolute top-0 left-0 h-1 bg-white/10 w-full cursor-pointer group/progress hover:h-1.5 transition-all"
            onClick={(e) => {
              if (!soundRef.current || duration === 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = x / rect.width;
              const seekTime = percent * duration;
              seekTo(seekTime);
            }}
            onMouseDown={(e) => {
              if (!soundRef.current || duration === 0) return;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
                const percent = x / rect.width;
                const seekTime = percent * duration;
                seekTo(seekTime);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div
              ref={progressBarRef}
              className="h-full relative"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%', backgroundColor: accentColor }}
            >
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
                style={{ transform: 'translate(50%, -50%)' }}
              />
            </div>
          </div>

          {/* Track Info */}
          {showPlayerInfo && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded shrink-0 shadow-lg flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                {isPlaying ? (
                  <div className="flex items-end justify-center gap-0.5 h-4">
                    <div className="w-1 bg-white animate-[music-bar_0.5s_ease-in-out_infinite]" />
                    <div className="w-1 bg-white animate-[music-bar_0.7s_ease-in-out_infinite]" />
                    <div className="w-1 bg-white animate-[music-bar_0.4s_ease-in-out_infinite]" />
                  </div>
                ) : (
                  <Music2 className="w-6 h-6 text-white m-3" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm truncate font-medium">
                  {currentSong?.title || t('music.player.notPlaying')}
                </div>
                <div className="text-white/60 text-xs truncate">
                  {currentSong?.artist || t('music.player.selectSong')}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className={`flex items-center gap-2 sm:gap-4 shrink-0 ${!showPlayerInfo ? 'mx-auto' : ''}`}>
            <button
              onClick={() => currentIndex > 0 && playPrev()}
              disabled={currentIndex <= 0}
              className={`p-2 rounded-full transition-colors ${currentIndex <= 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={() => currentIndex < songs.length - 1 && playNext()}
              disabled={currentIndex >= songs.length - 1}
              className={`p-2 rounded-full transition-colors ${currentIndex >= songs.length - 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Time Display */}
          {showPlayerInfo && currentSong && (
            <div className="text-white/50 text-xs tabular-nums whitespace-nowrap">
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
            </div>
          )}

          {/* Volume */}
          {showVolume && (
            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
              <Volume2 className="w-4 h-4 text-white/70" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(vals) => setVolume(vals[0])}
                className="w-20 md:w-24 **:data-[slot=slider-track]:h-1 **:data-[slot=slider-track]:bg-white/20 **:data-[slot=slider-range]:bg-(--music-accent) **:data-[slot=slider-thumb]:bg-white **:data-[slot=slider-thumb]:border-0 **:data-[slot=slider-thumb]:shadow-sm"
                style={{ '--music-accent': accentColor } as React.CSSProperties}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppTemplate
      sidebar={musicSidebar(librarySongs.length, (id) => setActiveCategory(id as any), t)}
      toolbar={toolbar}
      content={content}
      activeItem={activeCategory}
      onItemClick={(id) => setActiveCategory(id as any)}
      minContentWidth={500}
    />
  );
}

import { AppMenuConfig } from '../../types';

export const musicMenuConfig: AppMenuConfig = {
  menus: ['File', 'Edit', 'Song', 'View', 'Controls', 'Window', 'Help'],
  items: {
    'File': [
      { labelKey: 'music.menu.newPlaylist', shortcut: '⌘N', action: 'new-playlist' },
      { labelKey: 'music.menu.import', shortcut: '⌘O', action: 'import' },
      { type: 'separator' },
      { labelKey: 'music.menu.closeWindow', shortcut: '⌘W', action: 'close-window' }
    ],
    'Song': [
      { labelKey: 'music.menu.showInFinder', shortcut: '⌘R', action: 'show-in-finder' },
      { labelKey: 'music.menu.addToPlaylist', action: 'add-to-playlist' }
    ],
    'Controls': [
      { labelKey: 'music.menu.play', shortcut: 'Space', action: 'play-pause' },
      { type: 'separator' },
      { labelKey: 'music.menu.previousSong', shortcut: '⌘←', action: 'prev' },
      { labelKey: 'music.menu.nextSong', shortcut: '⌘→', action: 'next' },
      { type: 'separator' },
      { labelKey: 'music.menu.volumeUp', shortcut: '⌘↑', action: 'volume-up' },
      { labelKey: 'music.menu.volumeDown', shortcut: '⌘↓', action: 'volume-down' },
    ]
  }
};

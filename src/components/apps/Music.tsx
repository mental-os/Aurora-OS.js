import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Howl } from "howler";
import {
  Clock,
  PlayCircle,
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  FolderOpen,
} from "lucide-react";
import { AppTemplate } from "@/components/apps/AppTemplate";
import { useAppContext } from "@/components/AppContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useFileSystem } from "@/components/FileSystemContext";
import { useMusic, type Song, MusicProvider } from "@/components/MusicContext";
import { useWindow } from "@/components/WindowContext";
import { cn } from "@/components/ui/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/i18n/index";

// Helper types
type TFn = (key: string, vars?: Record<string, string | number>) => string;

const musicSidebar = (
  songCount: number,
  onSelect: (id: string) => void,
  t: TFn
) => ({
  sections: [
    {
      title: t("music.sidebar.library"),
      items: [
        {
          id: "songs",
          label: t("music.sidebar.songs"),
          icon: Music2,
          badge: songCount.toString(),
          action: () => onSelect("songs"),
        },
        //{ id: 'artists', label: 'Artists', icon: User },
        //{ id: 'albums', label: 'Albums', icon: Disc },
        //{ id: 'playlists', label: 'Playlists', icon: List },
      ],
    },
    {
      title: t("music.sidebar.favorites"),
      items: [
        //{ id: 'favorites', label: 'Liked Songs', icon: Heart },
        {
          id: "recent",
          label: t("music.sidebar.recentlyPlayed"),
          icon: Clock,
          action: () => onSelect("recent"),
        },
      ],
    },
  ],
});

interface SongItemProps {
  song: Song;
  isActive: boolean;
  isPlaying: boolean;
  accentColor: string;
  showAlbum: boolean;
  showCategoryRecent: boolean;
  onClick: (song: Song) => void;
}

const SongItem = memo(({ song, isActive, isPlaying, accentColor, showAlbum, showCategoryRecent, onClick }: SongItemProps) => {
  return (
    <button
      onClick={() => onClick(song)}
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group",
        isActive && "bg-white/10"
      )}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden bg-white/5"
        style={{
          backgroundColor: isActive ? accentColor : undefined
        }}>

        {isActive && isPlaying ? (
          <div className="flex items-end gap-0.5 h-3">
            <div className="w-1 bg-white animate-[music-bar_0.5s_ease-in-out_infinite]" />
            <div className="w-1 bg-white animate-[music-bar_0.7s_ease-in-out_infinite]" />
            <div className="w-1 bg-white animate-[music-bar_0.4s_ease-in-out_infinite]" />
          </div>
        ) : (
          <Music2
            className={cn("w-5 h-5", isActive ? "text-white" : "")}
            style={isActive ? undefined : { color: accentColor }}
          />
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <div className={cn("text-sm truncate font-medium", isActive ? "text-white" : "text-white/90")}>
          {song.title}
        </div>
        <div className="text-white/60 text-xs truncate">{song.artist}</div>
        {showCategoryRecent && (
          <div className="text-white/40 text-[10px] truncate font-mono mt-0.5" title={song.path}>
            {song.path}
          </div>
        )}
      </div>
      {showAlbum && <div className="text-white/60 text-xs truncate w-1/3 text-right">{song.album}</div>}
      <div className="text-white/60 text-xs w-12 text-right tabular-nums">{song.duration}</div>
    </button>
  );
});

SongItem.displayName = 'SongItem';

interface SongListProps {
  songs: Song[];
  currentSongId?: string;
  isPlaying: boolean;
  accentColor: string;
  activeCategory: string;
  contentWidth: number;
  onSongClick: (song: Song, list: Song[]) => void;
  onOpenFolder: () => void;
  t: any;
}

const SongList = memo(({ 
  songs, 
  currentSongId, 
  isPlaying, 
  accentColor, 
  activeCategory, 
  contentWidth, 
  onSongClick, 
  onOpenFolder,
  t 
}: SongListProps) => {
  const showAlbum = contentWidth > 520;

  if (songs.length === 0) {
    return (
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
                onClick={onOpenFolder}
                className="gap-2 border-white/20 text-white hover:bg-white/10"
              >
                <FolderOpen className="w-4 h-4" />
                {t('music.empty.library.openFolder', { folder: activeCategory === 'songs' ? t('music.folders.music') : t('music.folders.home') })}
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          isActive={currentSongId === song.id}
          isPlaying={isPlaying}
          accentColor={accentColor}
          showAlbum={showAlbum}
          showCategoryRecent={activeCategory === 'recent'}
          onClick={(s) => onSongClick(s, songs)}
        />
      ))}
    </div>
  );
});

SongList.displayName = 'SongList';

interface NowPlayingBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  accentColor: string;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  contentWidth: number;
  t: any;
  getBackgroundColor: (opacity: number) => string;
  blurStyle: any;
  soundRef: React.MutableRefObject<Howl | null>;
  canPlayNext: boolean;
  canPlayPrev: boolean;
}

const NowPlayingBar = memo(({
  currentSong,
  isPlaying,
  volume,
  currentTime,
  duration,
  accentColor,
  onTogglePlay,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onVolumeChange,
  contentWidth,
  t,
  getBackgroundColor,
  blurStyle,
  soundRef,
  canPlayNext,
  canPlayPrev
}: NowPlayingBarProps) => {
  const showPlayerInfo = contentWidth > 320;
  const showVolume = contentWidth > 420;
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      if (soundRef.current && soundRef.current.playing()) {
        const current = soundRef.current.seek();
        const dur = soundRef.current.duration();

        if (typeof current === 'number' && dur > 0 && progressBarRef.current) {
          const percent = (current / dur) * 100;
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!soundRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div
      className="h-20 border-t border-white/10 px-4 flex items-center gap-4 shrink-0 relative group"
      style={{ background: getBackgroundColor(0.9), ...blurStyle }}
    >
      <div 
        className="absolute top-0 left-0 h-1 bg-white/10 w-full cursor-pointer group/progress hover:h-1.5 transition-all z-50"
        onMouseDown={(e) => {
          handleSeek(e);
          const handleMouseMove = (moveEvent: MouseEvent) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
            const percent = x / rect.width;
            onSeek(percent * duration);
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
          style={{ 
            width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%', 
            backgroundColor: accentColor 
          }}
        >
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
            style={{ transform: 'translate(50%, -50%)' }}
          />
        </div>
      </div>

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
            <div className="text-sm truncate font-medium text-white">
              {currentSong?.title || t('music.player.notPlaying')}
            </div>
            <div className="text-white/60 text-xs truncate">
              {currentSong?.artist || t('music.player.selectSong')}
            </div>
          </div>
        </div>
      )}

      <div className={`flex items-center gap-2 sm:gap-4 shrink-0 ${!showPlayerInfo ? 'mx-auto' : ''}`}>
        <button
          onClick={onPlayPrev}
          disabled={!canPlayPrev}
          className={cn(
            "p-2 rounded-full transition-colors",
            !canPlayPrev ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:text-white hover:bg-white/5"
          )}
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button
          onClick={onPlayNext}
          disabled={!canPlayNext}
          className={cn(
            "p-2 rounded-full transition-colors",
            !canPlayNext ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:text-white hover:bg-white/5"
          )}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {showPlayerInfo && currentSong && (
        <div className="text-white/50 text-xs tabular-nums whitespace-nowrap">
          {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
        </div>
      )}

      {showVolume && (
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <Volume2 className="w-4 h-4 text-white/70" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(vals) => onVolumeChange(vals[0])}
            className="w-20 md:w-24 **:data-[slot=slider-track]:h-1 **:data-[slot=slider-track]:bg-white/20 **:data-[slot=slider-range]:bg-(--music-accent) **:data-[slot=slider-thumb]:bg-white **:data-[slot=slider-thumb]:border-0 **:data-[slot=slider-thumb]:shadow-sm"
            style={{ '--music-accent': accentColor } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  );
});

NowPlayingBar.displayName = 'NowPlayingBar';

export interface MusicProps {
  id: string;
  onLaunchApp?: (appId: string, args: string[], owner?: string) => void;
  owner?: string;
  initialPath?: string;
  onOpenApp?: (type: string, data?: any, owner?: string) => void;
}

export function Music(props: MusicProps) {
  const { activeUser: desktopUser } = useAppContext();
  const isElevated = props.owner && props.owner !== desktopUser;

  if (isElevated) {
    return (
      <MusicProvider owner={props.owner}>
        <MusicInner {...props} />
      </MusicProvider>
    );
  }

  return <MusicInner {...props} />;
}

function MusicInner({ owner, initialPath, onOpenApp }: MusicProps) {
  const { resolvePath, getNodeAtPath, readFile } =
    useFileSystem();
  const { accentColor, activeUser: desktopUser } = useAppContext();
  const windowContext = useWindow();
  const { getBackgroundColor, blurStyle } = useThemeColors();
  const { t } = useI18n();
  const activeUser = owner || desktopUser;

  const {
    playlist: songs,
    currentSong,
    currentIndex,
    isPlaying,
    volume,
    setVolume,
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
    setActiveCategory,
    librarySongs,
    getSafeMeta
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
    const isFresh = timestamp && (Date.now() - timestamp < 2000);

    // Logic: Only play if we have a NEW and FRESH timestamp (explicit user intent)
    // For legacy/initial mount without any timestamp at all, we could fallback, 
    // but the system now guarantees it for new actions.

    const isNewTimestamp =
      timestamp && timestamp !== processedTimestampRef.current;

    if (path && isNewTimestamp && isFresh) {
      processedPathRef.current = path;
      if (timestamp) processedTimestampRef.current = timestamp;

      const node = getNodeAtPath(path, activeUser);
      if (node && node.type === "file") {
        const content = readFile(path, activeUser);
        const meta = getSafeMeta(node.name);
        const song: Song = {
          id: node.id,
          path: path,
          url: content || "",
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          duration: "--:--",
        };
        playSong(song);
        setActiveCategory("recent");
      }
    }
  }, [
    initialPath,
    windowContext?.data?.path,
    windowContext?.data?.timestamp,
    activeUser,
    getNodeAtPath,
    readFile,
    playSong,
    setActiveCategory,
    t,
    getSafeMeta,
  ]);

  // Derived state for view
  const displaySongs = activeCategory === "recent" ? recent : librarySongs;
  const displayTitle =
    activeCategory === "recent"
      ? t("music.titles.recentlyPlayed")
      : t("music.titles.songs");

  // --- Handlers ---
  const handleSongClick = useCallback((song: Song, list: Song[]) => {
    playSong(song, list);
  }, [playSong]);

  const handleOpenFolder = useCallback(() => {
    const musicPath = resolvePath('~/Music', activeUser);
    const homePath = resolvePath('~', activeUser);
    const targetPath = getNodeAtPath(musicPath, activeUser) ? musicPath : homePath;
    onOpenApp?.('finder', { path: targetPath }, owner);
  }, [resolvePath, activeUser, getNodeAtPath, onOpenApp, owner]);

  const handleSeek = useCallback((time: number) => {
    seekTo(time);
  }, [seekTo]);

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
  }, [setVolume]);

  const toolbar = useMemo(() => (
    <div className="flex items-center justify-between w-full">
      <h2 className="text-white/90">{displayTitle}</h2>
      <button
        onClick={() => {
          if (displaySongs.length > 0) {
            playSong(displaySongs[0], displaySongs);
          }
        }}
        className="px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-90 shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        <PlayCircle className="w-4 h-4 inline mr-1.5" />
        {t('music.actions.playAll')}
      </button>
    </div>
  ), [displayTitle, displaySongs, playSong, accentColor, t]);

  const content = useCallback(({ contentWidth }: { contentWidth: number }) => {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          <SongList
            songs={displaySongs}
            currentSongId={currentSong?.id}
            isPlaying={isPlaying}
            accentColor={accentColor}
            activeCategory={activeCategory}
            contentWidth={contentWidth}
            onSongClick={handleSongClick}
            onOpenFolder={handleOpenFolder}
            t={t}
          />
        </div>

        {/* Now Playing Bar */}
        <NowPlayingBar
          currentSong={currentSong}
          isPlaying={isPlaying}
          volume={volume}
          currentTime={currentTime}
          duration={duration}
          accentColor={accentColor}
          onTogglePlay={togglePlay}
          onPlayNext={playNext}
          onPlayPrev={playPrev}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          contentWidth={contentWidth}
          t={t}
          getBackgroundColor={getBackgroundColor}
          blurStyle={blurStyle}
          soundRef={soundRef}
          canPlayNext={currentIndex < songs.length - 1}
          canPlayPrev={currentIndex > 0}
        />
      </div>
    );
  }, [
    displaySongs, 
    currentSong, 
    isPlaying, 
    accentColor, 
    activeCategory, 
    handleSongClick, 
    handleOpenFolder, 
    t, 
    volume, 
    currentTime, 
    duration, 
    togglePlay, 
    playNext, 
    playPrev, 
    handleSeek, 
    handleVolumeChange, 
    getBackgroundColor, 
    blurStyle, 
    soundRef, 
    currentIndex, 
    songs.length
  ]);

  return (
    <AppTemplate
      sidebar={musicSidebar(
        librarySongs.length,
        (id) => setActiveCategory(id as any),
        t
      )}
      toolbar={toolbar}
      content={content}
      activeItem={activeCategory}
      onItemClick={(id) => setActiveCategory(id as any)}
      minContentWidth={500}
    />
  );
}





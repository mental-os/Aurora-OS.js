import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { soundManager } from '../services/sound';
import { useFileSystem } from './FileSystemContext';
import { useAppContext } from './AppContext';
import { useSessionStorage } from '../hooks/useSessionStorage';

export interface Song {
    id: string;
    path: string;
    url: string;
    title: string;
    artist: string;
    album: string;
    duration: string;
}

interface MusicContextType {
    playlist: Song[];
    currentSong: Song | null;
    currentIndex: number;
    isPlaying: boolean;
    volume: number;
    seek: number;
    currentTime: number;
    duration: number;
    soundRef: React.MutableRefObject<Howl | null>;
    recent: Song[];

    setPlaylist: React.Dispatch<React.SetStateAction<Song[]>>;
    playSong: (song: Song, newPlaylist?: Song[]) => void;
    playFile: (path: string) => void;
    togglePlay: () => void;
    playNext: () => void;
    playPrev: () => void;
    setVolume: (vol: number) => void; // 0-100
    seekTo: (seconds: number) => void;
    stop: () => void;
    pause: () => void;
    isMusicOpen: boolean;
    setMusicOpen: (isOpen: boolean) => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) throw new Error('useMusic must be used within MusicProvider');
    return context;
}

// Helper to clean metadata
const getSafeMeta = (filename: string) => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const parts = nameWithoutExt.split(' - ');
    if (parts.length >= 2) {
        return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim(), album: 'Unknown Album' };
    }
    return { artist: 'Unknown Artist', title: nameWithoutExt, album: 'Unknown Album' };
}

const STORAGE_QUEUE = 'aurora-os-app-music-queue';
const STORAGE_INDEX = 'aurora-os-app-music-index';
const STORAGE_SEEK = 'aurora-os-app-music-seek';
const STORAGE_RECENT = 'aurora-os-app-music-recent';

export function MusicProvider({ children, owner }: { children: React.ReactNode, owner?: string }) {
    const { readFile, getNodeAtPath } = useFileSystem();
    const { activeUser: desktopUser } = useAppContext();
    const activeUser = owner || desktopUser;

    const getKeys = (user: string) => ({
        QUEUE: `${STORAGE_QUEUE}-${user}`,
        INDEX: `${STORAGE_INDEX}-${user}`,
        SEEK: `${STORAGE_SEEK}-${user}`,
        RECENT: `${STORAGE_RECENT}-${user}`
    });

    const keys = getKeys(activeUser || 'guest');

    // 1. Storage & State
    const [playlist, setPlaylistInternal] = useState<Song[]>(() => {
        try {
            const saved = localStorage.getItem(getKeys(activeUser || 'guest').QUEUE);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });



    const [currentIndex, setCurrentIndex] = useState(() => {
        try {
            const saved = localStorage.getItem(getKeys(activeUser || 'guest').INDEX);
            return saved ? parseInt(saved, 10) : -1;
        } catch { return -1; }
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMusicOpen, setMusicOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [recent, setRecent] = useState<Song[]>(() => {
        try {
            const saved = localStorage.getItem(getKeys(activeUser || 'guest').RECENT);
            if (saved) {
                const parsed = JSON.parse(saved) as Song[];
                // Sanitize: 
                // 1. Remove files from ~/Music (Strict Mode Retroactive Fix)
                // 2. Deduplicate by ID
                const unique = new Map();
                parsed.forEach(s => {
                    if (!s.path.startsWith('~/Music/') && !unique.has(s.id)) {
                        unique.set(s.id, s);
                    }
                });
                return Array.from(unique.values());
            }
            return [];
        } catch { return []; }
    });

    const [activeCategory, setActiveCategory] = useSessionStorage<string>('music-active-category', 'songs', activeUser);

    const soundRef = useRef<Howl | null>(null);
    const [volume, setVolumeState] = useState(soundManager.getVolume('music') * 100);

    // 2. Persistence & Validation
    useEffect(() => {
        localStorage.setItem(keys.QUEUE, JSON.stringify(playlist));
    }, [playlist, keys.QUEUE]);

    useEffect(() => {
        localStorage.setItem(keys.INDEX, currentIndex.toString());
    }, [currentIndex, keys.INDEX]);

    useEffect(() => {
        localStorage.setItem(keys.RECENT, JSON.stringify(recent));
    }, [recent, keys.RECENT]);

    // Active Category is now handled by useSessionStorage, no manual effect needed for simple persistence.
    // However, if we wanted to sync to 'STORAGE_ACTIVE_CATEGORY' (the old key) we could, but we want session behavior.
    // useSessionStorage manages its own key: 'aurora-session-USER-music-active-category'.

    // 4. Wrap setPlaylist to sync currentIndex (Must be AFTER currentIndex/isPlaying definition)
    const setPlaylist: React.Dispatch<React.SetStateAction<Song[]>> = useCallback((value) => {
        setPlaylistInternal(prev => {
            const newPlaylist = typeof value === 'function' ? value(prev) : value;
            // Removed automatic index sync logic as it interferes with atomic updates from playSong
            // playSong handles index updates explicitly.
            return newPlaylist;
        });
    }, []);

    // Validation removed to preserve history of ad-hoc/offline files.
    // Handles invalid files gracefully at playback time.
    /*
    useEffect(() => {
        const validate = (list: Song[]) => list.filter( // ... );
    }, [...]);
    */

    // Volume Sync
    useEffect(() => {
        const unsubscribe = soundManager.subscribe(() => {
            const newVol = soundManager.getVolume('music') * 100;
            setVolumeState(newVol);
            if (soundRef.current) {
                const masterVol = soundManager.getVolume('master');
                const musicVol = soundManager.getVolume('music');
                soundRef.current.volume(masterVol * musicVol);
            }
        });
        return () => { unsubscribe(); };
    }, []);

    const currentSong = currentIndex >= 0 && playlist[currentIndex] ? playlist[currentIndex] : null;

    // Refs for Callbacks
    const stateRef = useRef({ playlist, currentIndex });
    useEffect(() => {
        stateRef.current = { playlist, currentIndex };
    }, [playlist, currentIndex]);

    const playRef = useRef<(song: Song, auto: boolean) => void | undefined>(undefined);

    // Callbacks
    const handleNext = useCallback(() => {
        const { playlist, currentIndex } = stateRef.current;
        if (playlist.length === 0 || currentIndex === -1) return;

        const nextIdx = (currentIndex + 1) % playlist.length;
        if (nextIdx === 0 && playlist.length > 0) { // Loop finished
            setIsPlaying(false);
            setCurrentIndex(-1);
            if (soundRef.current) soundRef.current.stop();
            return;
        }

        setCurrentIndex(nextIdx);
        if (playRef.current) playRef.current(playlist[nextIdx], true);
    }, []);

    const handlePrev = useCallback(() => {
        const { playlist, currentIndex } = stateRef.current;
        if (playlist.length === 0 || currentIndex === -1) return;
        const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
        setCurrentIndex(prevIdx);
        if (playRef.current) playRef.current(playlist[prevIdx], true);
    }, []);

    // Pause saves the seek position
    const pause = useCallback(() => {
        if (soundRef.current) {
            soundRef.current.pause();
            setIsPlaying(false);
            const seek = soundRef.current.seek();
            if (typeof seek === 'number') {
                localStorage.setItem(keys.SEEK, seek.toString());
            }
        }
    }, [keys.SEEK]);

    const playSoundImplementation = useCallback((song: Song, autoPlay: boolean, seekTo?: number) => {
        if (soundRef.current) soundRef.current.unload();

        const masterVol = soundManager.getVolume('master');
        const musicVol = soundManager.getVolume('music');

        const sound = new Howl({
            src: [song.url],
            html5: true,
            volume: masterVol * musicVol,
            onload: () => {
                const dur = sound.duration();
                const totalSecs = Math.round(dur);
                const mins = Math.floor(totalSecs / 60);
                const secs = totalSecs % 60;
                const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

                setPlaylist(prev => prev.map(s => {
                    if (s.id === song.id) {
                        return s.duration === formatted ? s : { ...s, duration: formatted };
                    }
                    return s;
                }));

                if (seekTo !== undefined && seekTo > 0) {
                    sound.seek(seekTo);
                }

                setRecent(prev => prev.map(s => {
                    if (s.id === song.id) {
                        return s.duration === formatted ? s : { ...s, duration: formatted };
                    }
                    return s;
                }));
            },
            onplay: () => setIsPlaying(true),
            onpause: () => setIsPlaying(false),
            onstop: () => setIsPlaying(false),
            onend: () => handleNext()
        });

        soundRef.current = sound;

        if (autoPlay) sound.play();
    }, [handleNext, setPlaylist, setRecent]);

    useEffect(() => {
        playRef.current = playSoundImplementation;
    }, [playSoundImplementation]);

    const playSong = useCallback((song: Song, newPlaylist?: Song[]) => {
        // ZOMBIE CHECK: Validate file existence for Ad-Hoc / Recent files
        if (!song.path.startsWith('~/Music/')) {
            const node = getNodeAtPath(song.path, activeUser);
            if (!node) {
                setRecent(prev => prev.filter(s => s.id !== song.id));
                console.warn(`Zombie track removed: ${song.path}`);
                return;
            }
        }

        // Strict Mode: Only add to Recent if it's an ad-hoc file
        if (!song.path.startsWith('~/Music/')) {
            setRecent(prev => {
                const filtered = prev.filter(s => s.id !== song.id);
                return [song, ...filtered].slice(0, 50);
            });
        }

        // Use Ref for playlist to keep function stable
        const currentPlaylist = stateRef.current.playlist;
        const targetPlaylist = newPlaylist || currentPlaylist;

        // Handle explicit playlist update
        if (newPlaylist) {
            setPlaylist(newPlaylist);
        }

        const idx = targetPlaylist.findIndex(s => s.id === song.id);
        if (idx === -1) {
            // Not in target playlist? Add it.
            if (newPlaylist) {
                // If we explicitly passed a playlist and the song isn't in it (weird?), add it.
                setPlaylist([...newPlaylist, song]);
                setCurrentIndex(newPlaylist.length);
                playSoundImplementation(song, true);
            } else {
                // Legacy fallback
                setPlaylist(prev => [...prev, song]);
                setCurrentIndex(playlist.length);
                playSoundImplementation(song, true);
            }
        } else {
            // Found in playlist
            setCurrentIndex(idx);
            if (targetPlaylist[idx].id === currentSong?.id && soundRef.current) {
                if (!isPlaying) soundRef.current.play();
            } else {
                playSoundImplementation(targetPlaylist[idx], true);
            }
        }
    }, [playlist, currentSong, isPlaying, setPlaylist, getNodeAtPath, playSoundImplementation, activeUser, setRecent]);

    const playFile = useCallback((path: string) => {
        const node = getNodeAtPath(path, activeUser);
        if (node && node.type === 'file') {
            const content = readFile(path, activeUser);
            const meta = getSafeMeta(node.name);
            const song: Song = {
                id: node.id,
                path: path,
                url: content || '',
                title: meta.title,
                artist: meta.artist,
                album: meta.album,
                duration: '--:--'
            };
            playSong(song);
            setActiveCategory('recent');
        }
    }, [getNodeAtPath, activeUser, readFile, playSong, setActiveCategory]); // playSong includes playSoundImplementation linkage


    const togglePlay = useCallback(() => {
        if (!currentSong && playlist.length > 0) {
            setCurrentIndex(0);
            playSoundImplementation(playlist[0], true);
        } else if (soundRef.current) {
            if (isPlaying) {
                pause();
            } else {
                soundRef.current.play();
            }
        }
    }, [currentSong, playlist, isPlaying, pause, soundRef, playSoundImplementation]);

    const playNext = () => handleNext();
    const playPrev = () => handlePrev();

    const stop = useCallback(() => {
        if (soundRef.current) {
            soundRef.current.stop();
            setIsPlaying(false);
            setCurrentIndex(-1);
        }
    }, []);

    const setVolume = (vol: number) => {
        soundManager.setVolume('music', vol / 100);
        setVolumeState(vol);
    };

    const seekTo = useCallback((seconds: number) => {
        if (soundRef.current) {
            soundRef.current.seek(seconds);
            setCurrentTime(seconds);
        }
    }, []);

    // Track current time and duration
    useEffect(() => {
        let rafId: number;
        
        const updateTime = () => {
            if (soundRef.current && isPlaying) {
                const current = soundRef.current.seek();
                const dur = soundRef.current.duration();
                if (typeof current === 'number') setCurrentTime(current);
                if (typeof dur === 'number') setDuration(dur);
                rafId = requestAnimationFrame(updateTime);
            }
        };
        
        if (isPlaying) {
            rafId = requestAnimationFrame(updateTime);
        } else if (soundRef.current) {
            const current = soundRef.current.seek();
            const dur = soundRef.current.duration();
            if (typeof current === 'number') setCurrentTime(current);
            if (typeof dur === 'number') setDuration(dur);
        }
        
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isPlaying]);

    // Restore Session Trigger (On Load)
    useEffect(() => {
        if (currentIndex !== -1 && playlist[currentIndex] && !soundRef.current) {
            const savedSeek = localStorage.getItem(keys.SEEK);
            const seekTo = savedSeek ? parseFloat(savedSeek) : 0;
            playSoundImplementation(playlist[currentIndex], false, seekTo);
        }
    }, [currentIndex, playlist, playSoundImplementation, keys.SEEK]);

    return (
        <MusicContext.Provider value={{
            playlist,
            currentSong,
            currentIndex,
            isPlaying,
            volume,
            seek: 0,
            currentTime,
            duration,
            soundRef,
            recent,
            setPlaylist,
            playSong,
            playFile,
            togglePlay,
            playNext,
            playPrev,
            setVolume,
            seekTo,
            stop,
            pause,
            isMusicOpen,
            setMusicOpen,
            activeCategory,
            setActiveCategory
        }}>
            {children}
        </MusicContext.Provider>
    );
}

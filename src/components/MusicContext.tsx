import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { soundManager } from '@/services/sound';
import { useFileSystem } from '@/components/FileSystemContext';
import { useAppContext } from '@/components/AppContext';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useI18n } from '@/i18n';


import { STORAGE_KEYS } from '@/utils/memory';
import { parseID3, base64ToUint8Array } from '@/utils/id3Parser';

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
    librarySongs: Song[];
    getSafeMeta: (filename: string) => { artist: string; title: string; album: string };
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) throw new Error('useMusic must be used within MusicProvider');
    return context;
}





export function MusicProvider({ children, owner }: { children: React.ReactNode, owner?: string }) {
    const { fileSystem, readFile, getNodeAtPath, resolvePath, listDirectory } = useFileSystem();
    const { activeUser: desktopUser } = useAppContext();
    const activeUser = owner || desktopUser;
    const { t } = useI18n();

    // Helper to clean metadata - Unified Logic
    const getSafeMeta = useCallback((filename: string) => {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        const parts = nameWithoutExt.split(' - ');

        if (parts.length >= 2) {
            return {
                artist: parts[0].trim() || t('music.metadata.unknownArtist'),
                title: parts.slice(1).join(' - ').trim() || t('music.metadata.unknownTitle'),
                album: t('music.metadata.unknownAlbum')
            };
        }
        return {
            artist: t('music.metadata.unknownArtist'),
            title: nameWithoutExt || t('music.metadata.unknownTitle'),
            album: t('music.metadata.unknownAlbum')
        };
    }, [t]);

    // Standardized Granular Keys (User Preference)
    // Uses standardized APP_PREFIX from memory.ts
    const getKeys = (user: string) => ({
        QUEUE: `${STORAGE_KEYS.APP_DATA_PREFIX}music-queue-${user}`,
        INDEX: `${STORAGE_KEYS.APP_DATA_PREFIX}music-index-${user}`,
        SEEK: `${STORAGE_KEYS.APP_DATA_PREFIX}music-seek-${user}`,
        RECENT: `${STORAGE_KEYS.APP_DATA_PREFIX}music-recent-${user}`
    });

    const keys = getKeys(activeUser || 'guest');

    // 1. Storage & State
    // 1. Storage & State
    const [playlist, setPlaylistInternal] = useState<Song[]>(() => {
        try {
            console.log('[MusicContext] Loading playlist from:', keys.QUEUE);
            const saved = localStorage.getItem(keys.QUEUE);
            if (saved) {
                const parsed = JSON.parse(saved) as Song[];
                console.log(`[MusicContext] Loaded ${parsed.length} songs`);

                // Hydrate immediately (Synchronous during init)
                return parsed.map(s => {
                    // Re-read file if URL is stale/blob
                    if (s.path && (s.url.startsWith('blob:') || !s.url)) {
                        try {
                            const content = readFile(s.path, activeUser);
                            if (content && content !== s.url) {
                                return { ...s, url: content };
                            }
                        } catch {
                            /* ignore hydration errors */
                        }
                    }
                    return s;
                });
            }
            return [];
        } catch (e) {
            console.warn('[MusicContext] Failed to load playlist', e);
            return [];
        }
    });

    const [currentIndex, setCurrentIndex] = useState(() => {
        try {
            const saved = localStorage.getItem(keys.INDEX);
            return saved ? parseInt(saved, 10) : -1;
        } catch { return -1; }
    });

    const [recent, setRecent] = useState<Song[]>(() => {
        try {
            const saved = localStorage.getItem(keys.RECENT);
            if (saved) {
                const parsed = JSON.parse(saved) as Song[];
                // Deduplicate and Sanitize
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

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMusicOpen, setMusicOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [activeCategory, setActiveCategory] = useSessionStorage<string>('music-active-category', 'songs', activeUser);
    const [librarySongs, setLibrarySongs] = useState<Song[]>([]);

    // Track playback state for effects
    const playbackStateRef = useRef({ isPlaying: false, currentTime: 0, duration: 0 });
    useEffect(() => {
        playbackStateRef.current = { isPlaying, currentTime, duration };
    }, [isPlaying, currentTime, duration]);

    // Wrap setPlaylist to allow callbacks to work expectedly
    const setPlaylist: React.Dispatch<React.SetStateAction<Song[]>> = useCallback((value) => {
        setPlaylistInternal(prev => {
            const result = typeof value === 'function' ? value(prev) : value;
            return result;
        });
    }, []);

    const soundRef = useRef<Howl | null>(null);
    const [volume, setVolumeState] = useState(soundManager.getVolume('music') * 100);

    // 2. Persistence (Smart - only save if data exists, ELSE gated by isMusicOpen)
    useEffect(() => {
        if (!isMusicOpen) return;

        if (playlist.length > 0) {
            localStorage.setItem(keys.QUEUE, JSON.stringify(playlist));
        } else {
            localStorage.removeItem(keys.QUEUE);
        }
    }, [playlist, keys.QUEUE, isMusicOpen]);

    useEffect(() => {
        if (!isMusicOpen) return;
        if (currentIndex !== -1) {
            localStorage.setItem(keys.INDEX, currentIndex.toString());
        } else {
            localStorage.removeItem(keys.INDEX);
        }
    }, [currentIndex, keys.INDEX, isMusicOpen]);

    useEffect(() => {
        if (!isMusicOpen) return;
        if (recent.length > 0) {
            localStorage.setItem(keys.RECENT, JSON.stringify(recent));
        } else {
            localStorage.removeItem(keys.RECENT);
        }
    }, [recent, keys.RECENT, isMusicOpen]);

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
            if (typeof seek === 'number' && seek > 0) {
                localStorage.setItem(keys.SEEK, seek.toString());
            } else {
                localStorage.removeItem(keys.SEEK);
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
                    setCurrentTime(seekTo);
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
    }, [getNodeAtPath, activeUser, readFile, playSong, setActiveCategory, getSafeMeta]); // playSong includes playSoundImplementation linkage


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
        if (!isMusicOpen) return;

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
    }, [isPlaying, isMusicOpen]);

    // Persistence of Seek Position (Periodic + Unload)
    useEffect(() => {
        if (!isMusicOpen) return;

        const saveState = () => {
            // Snapshot Playlist & Index (Safety for Resume System)
            if (playlist.length > 0) {
                localStorage.setItem(keys.QUEUE, JSON.stringify(playlist));
            }
            if (currentIndex !== -1) {
                localStorage.setItem(keys.INDEX, currentIndex.toString());
            }

            // Save current seek if playing
            if (soundRef.current && soundRef.current.playing()) {
                const seek = soundRef.current.seek();
                if (typeof seek === 'number') {
                    localStorage.setItem(keys.SEEK, seek.toString());
                }
            }
            // Also save if paused but we have a position
            else if (soundRef.current) {
                const seek = soundRef.current.seek();
                if (typeof seek === 'number' && seek > 0) {
                    localStorage.setItem(keys.SEEK, seek.toString());
                }
            }
        };

        // Save every 2 seconds to ensure crash recovery isn't too far off
        const interval = setInterval(saveState, 2000);

        // Save on unload/hidden (refresh/close tab)
        const handleUnload = () => saveState();
        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('pagehide', handleUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('pagehide', handleUnload);
            saveState(); // Cleanup save
        };
    }, [keys.SEEK, keys.QUEUE, keys.INDEX, playlist, currentIndex, isMusicOpen]);

    // REALITY CHECK: Stop services & playback on close
    useEffect(() => {
        if (!isMusicOpen) {
            // App closed: stop everything immediately
            if (playbackStateRef.current.isPlaying) {
                // Defer to avoid synchronous setState error
                setTimeout(() => stop(), 0);
            }
        }
    }, [isMusicOpen, stop]);

    // 4. Background Scanner (Moved from Music.tsx)
    useEffect(() => {
        if (!isMusicOpen) return;

        let musicPath = resolvePath("~/Music", activeUser);
        let pathPrefix = "~/Music/";

        // Fallback to Home if Music folder doesn't exist
        if (!getNodeAtPath(musicPath, activeUser)) {
            musicPath = resolvePath("~", activeUser);
            pathPrefix = "~/";
        }

        const files = listDirectory(musicPath, activeUser);

        if (files) {
            const audioFiles = files.filter(
                (f: any) => f.type === "file" && /\.(mp3|wav|ogg|flac|m4a)$/i.test(f.name)
            );

            const parsedSongs: Song[] = audioFiles.map((file: any) => {
                const meta = getSafeMeta(file.name);
                return {
                    id: file.id,
                    path: `${pathPrefix}${file.name}`,
                    url: file.content || "",
                    title: meta.title,
                    artist: meta.artist,
                    album: meta.album,
                    duration: "--:--",
                };
            });

            // Defer to avoid synchronous setState error
            setTimeout(() => setLibrarySongs(parsedSongs), 0);
        } else {
            setTimeout(() => setLibrarySongs([]), 0);
        }
    }, [
        isMusicOpen,
        activeUser,
        fileSystem,
        resolvePath,
        listDirectory,
        getNodeAtPath,
        getSafeMeta
    ]);

    // Progressive Metadata Resolver
    useEffect(() => {
        if (!isMusicOpen) return;

        // Find first song with missing duration in CURRENT playlist or Library
        // To simplify, we'll scan the active category's list
        const songsToScan = activeCategory === 'recent' ? recent : librarySongs;
        const missingIdx = songsToScan.findIndex((s) => s.duration === "--:--");

        if (missingIdx !== -1) {
            const song = songsToScan[missingIdx];

            const tempSound = new Howl({
                src: [song.url],
                html5: false,
                preload: true,
                volume: 0,
                onload: async () => {
                    const dur = tempSound.duration();
                    const totalSecs = Math.round(dur);
                    const mins = Math.floor(totalSecs / 60);
                    const secs = totalSecs % 60;
                    const formatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

                    // Binary Metadata Extraction
                    const extractMetadata = async () => {
                        let enriched = {};
                        try {
                            let buffer: ArrayBuffer | Uint8Array;
                            if (song.url.startsWith('data:')) {
                                buffer = base64ToUint8Array(song.url);
                            } else if (song.url.startsWith('http') || song.url.startsWith('/') || song.url.startsWith('./')) {
                                console.log(`[MusicMetadata] Fetching tags for: ${song.title} (${song.url})`);
                                // For URLs, fetch the binary content
                                // Try range request first
                                try {
                                    const response = await fetch(song.url, {
                                        headers: { 'Range': 'bytes=0-524287' } // 512KB is plenty
                                    });
                                    if (response.status === 206 || response.status === 200) {
                                        buffer = await response.arrayBuffer();
                                    } else {
                                        throw new Error(`HTTP ${response.status}`);
                                    }
                                } catch (e) {
                                    console.debug('[MusicMetadata] Range request failed, falling back to full fetch', e);
                                    const response = await fetch(song.url);
                                    buffer = await response.arrayBuffer();
                                }
                            } else {
                                return {};
                            }

                            const tags = parseID3(buffer);
                            if (tags.title || tags.artist || tags.album) {
                                console.log(`[MusicMetadata] Found tags for ${song.title}:`, tags);
                                enriched = {
                                    title: tags.title || song.title,
                                    artist: tags.artist || song.artist,
                                    album: tags.album || song.album
                                };
                            } else {
                                console.log(`[MusicMetadata] No ID3 tags found in binary for: ${song.title}`);
                            }
                        } catch (e) {
                            console.warn('[MusicContext] Failed to extract metadata:', e);
                        }
                        return enriched;
                    };

                    const enrichedMeta = await extractMetadata();
                    tempSound.unload();

                    // Update BOTH states if needed, but primarily the one we are scanning
                    const updateSong = (s: Song) => s.id === song.id ? { ...s, duration: formatted, ...enrichedMeta } : s;

                    setPlaylist(prev => prev.map(updateSong));
                    setLibrarySongs(prev => prev.map(updateSong));
                    setRecent(prev => prev.map(updateSong));
                },
                onloaderror: () => {
                    tempSound.unload();
                    const updateSong = (s: Song) => s.id === song.id ? { ...s, duration: "0:00" } : s;
                    setPlaylist(prev => prev.map(updateSong));
                    setLibrarySongs(prev => prev.map(updateSong));
                    setRecent(prev => prev.map(updateSong));
                },
            });

            return () => {
                tempSound.unload();
            };
        }
    }, [isMusicOpen, activeCategory, recent, librarySongs, setPlaylist]);

    // Restore Session Trigger (On Load)
    useEffect(() => {
        if (currentIndex !== -1 && playlist[currentIndex] && !soundRef.current) {
            const savedSeek = localStorage.getItem(keys.SEEK);
            const seekTo = savedSeek ? parseFloat(savedSeek) : 0;
            // Seek to > 0 requires playSoundImplementation to handle it
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
            setActiveCategory,
            librarySongs,
            getSafeMeta
        }}>
            {children}
        </MusicContext.Provider>
    );
}

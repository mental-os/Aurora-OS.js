import { Howl, Howler } from 'howler';
import { STORAGE_KEYS } from '@/utils/memory';

// Sound constants
import successSound from '@/assets/sounds/success.mp3';
import warningSound from '@/assets/sounds/warning.mp3';
import errorSound from '@/assets/sounds/error.mp3';
import folderSound from '@/assets/sounds/folder.wav';
import windowOpenSound from '@/assets/sounds/window-open.wav';
import windowCloseSound from '@/assets/sounds/window-close.wav';
import clickSound from '@/assets/sounds/click.wav';
import hoverSound from '@/assets/sounds/hover.wav';
import ambianceSound from '@/assets/sounds/ambience.mp3';
import computerStartSound from '@/assets/sounds/computerStart.mp3';
import biosStartSound from '@/assets/sounds/biosStart.mp3';

const SOUNDS = {

    // Startup Sounds (Global / Game)
    computerStart: computerStartSound,
    biosStart: biosStartSound,

    // System Sounds (Notifications)
    success: successSound,
    warning: warningSound,
    error: errorSound,

    // UI Sounds (Interactions)
    folder: folderSound,
    'window-open': windowOpenSound,
    'window-close': windowCloseSound,

    // Feedback Sounds (User Interactions)
    click: clickSound, //for testing
    hover: hoverSound,

    // Ambiance (Atmospheric)
    ambiance: ambianceSound,
};

type SoundType = keyof typeof SOUNDS;

// Define sound categories
export type SoundCategory = 'master' | 'system' | 'ui' | 'feedback' | 'music' | 'ambiance';

const SOUND_CATEGORIES: Record<SoundType, Exclude<SoundCategory, 'music'>> = {
    success: 'system',
    warning: 'system',
    error: 'system',
    computerStart: 'master',
    biosStart: 'master',
    folder: 'ui',
    'window-open': 'ui',
    'window-close': 'ui',
    click: 'feedback',
    hover: 'feedback',
    ambiance: 'ambiance',
};

interface VolumeState {
    master: number;
    system: number;
    ui: number;
    feedback: number;
    music: number;
    ambiance: number;
}

const DEFAULT_VOLUMES: VolumeState = {
    master: 0.9,
    system: 0.75,
    ui: 0.6,
    feedback: 0.5,
    music: 0.9,
    ambiance: 0.25,
};

const STORAGE_KEY = STORAGE_KEYS.SOUND;



class SoundManager {
    private static instance: SoundManager;
    private sounds: Partial<Record<SoundType, Howl>> = {};
    private volumes: VolumeState;
    private listeners: Set<() => void> = new Set();
    private isMuted: boolean = false;



    private constructor() {
        this.volumes = this.loadSettings();
        this.initializeSounds();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private loadSettings(): VolumeState {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_VOLUMES, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load sound settings:', e);
        }
        return { ...DEFAULT_VOLUMES };
    }

    private saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.volumes));
        } catch (e) {
            console.warn('Failed to save sound settings:', e);
        }
    }

    private initializeSounds() {
        // Initialize sounds with base config
        // Note: Real volume is calculated at play time to allow real-time adjustment
        Object.entries(SOUNDS).forEach(([key, src]) => {
            this.sounds[key as SoundType] = new Howl({
                src: [src],
                preload: true,
                loop: key === 'ambiance', // Auto-loop ambiance
                html5: key === 'ambiance', // Use HTML5 audio for long tracks to stream
                volume: key === 'ambiance' ? 0 : 1, // Start silent, volume managed by loop logic
            });
        });


    }

    public play(type: SoundType) {
        if (this.isMuted || this.volumes.master === 0) return;

        const sound = this.sounds[type];
        if (sound) {
            const category = SOUND_CATEGORIES[type];
            const categoryVolume = category === 'master' ? 1 : this.volumes[category];

            if (categoryVolume > 0) {
                // Howler volume is 0.0 - 1.0
                // Calculate final volume: Master * Category
                const finalVolume = this.volumes.master * categoryVolume;
                sound.volume(finalVolume);
                sound.play();
            }
        }
    }

    public setVolume(category: SoundCategory, value: number) {
        this.volumes[category] = Math.max(0, Math.min(1, value));

        // Special handling for ambiance loop
        if (category === 'ambiance') {
            if (value > 0 && !this.isMuted && this.volumes.master > 0) {
                this.startAmbiance();
            } else {
                this.stopAmbiance();
            }
        }
        // If master changed, update ambiance state
        if (category === 'master') {
             if (this.volumes.ambiance > 0 && !this.isMuted && value > 0) {
                this.startAmbiance();
            } else {
                this.stopAmbiance();
            }
        }

        // Update active sounds (like ambiance) volume in real-time
        if (category === 'ambiance' || category === 'master') {
             const amb = this.sounds['ambiance'];
             const totalAmbVol = this.volumes.ambiance * this.volumes.master;

             // Standard Ambiance Volume
             if (amb && amb.playing()) {
                 amb.volume(totalAmbVol);
             }
        }
        this.saveSettings();
        this.notifyListeners();
    }

    public getVolume(category: SoundCategory): number {
        return this.volumes[category];
    }

    public setMute(muted: boolean) {
        this.isMuted = muted;
        Howler.mute(muted);
        
        // Handle ambiance pause/play on mute
        if (muted) {
            this.stopAmbiance(); 
        } else {
            if (this.volumes.ambiance > 0 && this.volumes.master > 0) {
                this.startAmbiance();
            }
        }
        this.notifyListeners();
    }

    public getMuted(): boolean {
        return this.isMuted;
    }

    public subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
    // Helper for ambiance
    public startAmbiance() {
        if (this.volumes.ambiance <= 0 || this.volumes.master <= 0 || this.isMuted) return;

        const amb = this.sounds['ambiance'];
        const totalAmbVol = this.volumes.ambiance * this.volumes.master;

        if (amb && !amb.playing()) {
             amb.volume(totalAmbVol); // Full volume
             amb.play();
        } else if (amb && amb.playing()) {
             // efficient volume update if already playing
             amb.volume(totalAmbVol);
        }


    }

    private stopAmbiance() {
         const amb = this.sounds['ambiance'];
         if (amb && amb.playing()) {
             amb.stop();
         }


    }
}

export const soundManager = SoundManager.getInstance();

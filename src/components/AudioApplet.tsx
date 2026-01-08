import { useState, useEffect } from 'react';
import { Volume2, VolumeX, MousePointer2, Bell, AppWindow, Play, Pause, SkipBack, SkipForward, Music2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { soundManager, type SoundCategory } from '../services/sound';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAppContext } from './AppContext';
import { useMusic } from './MusicContext';

function useAudioMixer() {
    const [state, setState] = useState({
        master: soundManager.getVolume('master'),
        system: soundManager.getVolume('system'),
        ui: soundManager.getVolume('ui'),
        feedback: soundManager.getVolume('feedback'),
        music: soundManager.getVolume('music'), // Add music
        isMuted: soundManager.getMuted(),
    });

    useEffect(() => {
        const unsubscribe = soundManager.subscribe(() => {
            setState({
                master: soundManager.getVolume('master'),
                system: soundManager.getVolume('system'),
                ui: soundManager.getVolume('ui'),
                feedback: soundManager.getVolume('feedback'),
                music: soundManager.getVolume('music'),
                isMuted: soundManager.getMuted(),
            });
        });
        return () => { unsubscribe(); };
    }, []);

    return state;
}

export function AudioApplet() {
    const { master, system, ui, feedback, music, isMuted } = useAudioMixer(); // consume music
    const { blurStyle, getBackgroundColor } = useThemeColors();
    const { disableShadows, accentColor, reduceMotion } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    // Music Context
    const { currentSong, isPlaying, togglePlay, playNext, playPrev, isMusicOpen, seekTo, currentTime, duration, soundRef } = useMusic();

    const handleVolumeChange = (category: SoundCategory, value: number[]) => {
        soundManager.setVolume(category, value[0]);
    };

    const toggleMute = () => {
        soundManager.setMute(!isMuted);
    };

    const sliderClass = "w-full [&_[data-slot=slider-range]]:!bg-[var(--accent-user-override)] [&_[data-slot=slider-thumb]]:!border-[var(--accent-user-override)] [&_[data-slot=slider-track]]:!bg-white/20";


    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={`transition-colors ${isOpen ? 'text-white' : 'text-white/70 hover:text-white'}`}
                >
                    {isMuted || master === 0 ? (
                        <VolumeX className="w-4 h-4" />
                    ) : (
                        <Volume2 className="w-4 h-4" />
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                className={`w-80 p-0 overflow-hidden border-white/20 rounded-2xl ${!disableShadows ? 'shadow-2xl' : 'shadow-none'} ${reduceMotion ? '!animate-none !duration-0' : ''}`}
                style={{
                    background: getBackgroundColor(0.8),
                    ...blurStyle,
                    '--accent-user-override': accentColor
                } as React.CSSProperties}
                align="end"
                sideOffset={12}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-white/70" />
                        <h2 className="text-white/90">Sound</h2>
                    </div>
                    <button
                        onClick={toggleMute}
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${isMuted
                            ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                    >
                        {isMuted ? 'Unmute' : 'Mute All'}
                    </button>
                </div>

                {/* Now Playing Section */}
                {isMusicOpen && currentSong && (
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-4 mb-3">
                            {/* Artwork/Icon */}
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                                style={{ backgroundColor: accentColor }}
                            >
                                <Music2 className="w-6 h-6 text-white" />
                            </div>

                            {/* Text Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate leading-tight">
                                    {currentSong.title}
                                </div>
                                <div className="text-white/60 text-xs truncate mt-0.5">
                                    {currentSong.artist}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2">
                                <button onClick={playPrev} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                    <SkipBack className="w-4 h-4 fill-current" />
                                </button>
                                <button onClick={togglePlay} className="p-2 bg-white text-black hover:scale-105 active:scale-95 rounded-full transition-all shadow-md">
                                    {isPlaying ? (
                                        <Pause className="w-4 h-4 fill-current" />
                                    ) : (
                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                    )}
                                </button>
                                <button onClick={() => playNext()} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                    <SkipForward className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                        </div>
                        
                        {/*progress bar */}
                        <div 
                            className="h-1 bg-white/10 rounded-full cursor-pointer group/seekbar hover:h-1.5 transition-all"
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
                                className="h-full rounded-full relative"
                                style={{ 
                                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                                    backgroundColor: accentColor 
                                }}
                            >
                                <div 
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover/seekbar:opacity-100 transition-opacity shadow-lg"
                                    style={{ transform: 'translate(50%, -50%)' }}
                                />
                            </div>
                        </div>
                        
                        {/* the time display */}
                        <div className="flex items-center justify-between text-white/40 text-[10px] tabular-nums mt-1.5">
                            <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
                            <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
                        </div>
                    </div>
                )}

                {/* Sliders */}
                <div className="p-4 space-y-6">
                    {/* Master */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/90 flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-white/50" />
                                Master Volume
                            </span>
                            <span className="text-white/50">{Math.round(master * 100)}%</span>
                        </div>
                        <Slider
                            value={[master]}
                            max={1}
                            step={0.01}
                            onValueChange={(val) => handleVolumeChange('master', val)}
                            className={sliderClass}
                        />
                    </div>

                    <Accordion type="single" collapsible className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                        <AccordionItem value="sound-mixer" className="border-none">
                            <AccordionTrigger className="w-full !px-6 py-4 text-white/70">
                                <h2 className="text-white/90">Mixer</h2>
                            </AccordionTrigger>
                            <AccordionContent className="!px-6 pb-6 pt-3">
                                <div className="space-y-6">
                                    {/* Music Stream */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/90 flex items-center gap-2">
                                                <Music2 className="w-4 h-4 text-white/50" />
                                                Music
                                            </span>
                                            <span className="text-white/50">{Math.round(music * 100)}%</span>
                                        </div>
                                        <Slider
                                            value={[music]}
                                            max={1}
                                            step={0.01}
                                            // Tie music slider to soundManager using 'music' category
                                            onValueChange={(val) => handleVolumeChange('music', val)}
                                            className={sliderClass}
                                        />
                                    </div>

                                    {/* System */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/90 flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-white/50" />
                                                System Alerts
                                            </span>
                                            <span className="text-white/50">{Math.round(system * 100)}%</span>
                                        </div>
                                        <Slider
                                            value={[system]}
                                            max={1}
                                            step={0.01}
                                            onValueChange={(val) => handleVolumeChange('system', val)}
                                            className={sliderClass}
                                        />
                                    </div>

                                    {/* UI Sounds */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/90 flex items-center gap-2">
                                                <AppWindow className="w-4 h-4 text-white/50" />
                                                Interface
                                            </span>
                                            <span className="text-white/50">{Math.round(ui * 100)}%</span>
                                        </div>
                                        <Slider
                                            value={[ui]}
                                            max={1}
                                            step={0.01}
                                            onValueChange={(val) => handleVolumeChange('ui', val)}
                                            className={sliderClass}
                                        />
                                    </div>

                                    {/* Feedback */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/90 flex items-center gap-2">
                                                <MousePointer2 className="w-4 h-4 text-white/50" />
                                                Input Feedback
                                            </span>
                                            <span className="text-white/50">{Math.round(feedback * 100)}%</span>
                                        </div>
                                        <Slider
                                            value={[feedback]}
                                            max={1}
                                            step={0.01}
                                            onValueChange={(val) => handleVolumeChange('feedback', val)}
                                            className={sliderClass}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </PopoverContent>
        </Popover>
    );
}

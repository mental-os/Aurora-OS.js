import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Monitor, RefreshCw, Trash2, X, Speaker, Laptop, Settings, Check, Waves } from 'lucide-react';
import pkg from '@/../package.json';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';
import { soundManager } from '@/services/sound';
import { useI18n } from '@/i18n/index';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useAppContext } from '@/components/AppContext';
import { SUPPORTED_LOCALES } from '@/i18n/translations';
import { factoryReset } from '@/utils/memory';

interface SettingsModalProps {
    onClose: () => void;
}

type Tab = 'display' | 'audio' | 'system';

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<Tab>('display');

    const tabs = useMemo(() => [
        { id: 'display', icon: Monitor, label: t('game.bios.tabs.display') },
        { id: 'audio', icon: Speaker, label: t('game.bios.tabs.audio') },
        { id: 'system', icon: Laptop, label: t('game.bios.tabs.system') },
    ] as const, [t]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveTab(prev => {
                    const currentIndex = tabs.findIndex(t => t.id === prev);
                    let nextIndex;
                    if (e.key === 'ArrowUp') {
                        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    } else {
                        nextIndex = (currentIndex + 1) % tabs.length;
                    }
                    feedback.hover();
                    return tabs[nextIndex].id as Tab;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, tabs]);

    // Core state from AppContext
    const {
        reduceMotion, setReduceMotion,
        disableGradients, setDisableGradients,
        blurEnabled, setBlurEnabled,
        disableShadows, setDisableShadows,
        gpuEnabled, setGpuEnabled,
        locale, setLocale
    } = useAppContext();

    // Volume state
    const [volumes, setVolumes] = useState({
        master: soundManager.getVolume('master') * 100,
        music: soundManager.getVolume('music') * 100,
        sfx: soundManager.getVolume('ui') * 100, // Use UI as proxy for SFX group
        ambiance: soundManager.getVolume('ambiance') * 100,
    });

    // Fullscreen / Display settings
    const { isFullscreen, isElectron, displaySettings, setDisplaySettings } = useFullscreen();

    const RESOLUTIONS = useMemo(() => {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        const allResolutions = [
            { label: '5120x1440', width: 5120, height: 1440 },
            { label: '3840x2160', width: 3840, height: 2160 },
            { label: '3440x1440', width: 3440, height: 1440 },
            { label: '2880x1800', width: 2880, height: 1800 },
            { label: '2560x1600', width: 2560, height: 1600 },
            { label: '2560x1440', width: 2560, height: 1440 },
            { label: '2560x1080', width: 2560, height: 1080 },
            { label: '1920x1200', width: 1920, height: 1200 },
            { label: '1920x1080', width: 1920, height: 1080 },
            { label: '1680x1050', width: 1680, height: 1050 },
            { label: '1600x900', width: 1600, height: 900 },
            { label: '1512x982', width: 1512, height: 982 },
            { label: '1470x956', width: 1470, height: 956 },
            { label: '1440x900', width: 1440, height: 900 },
            { label: '1366x768', width: 1366, height: 768 },
        ];

        return allResolutions.filter(res => res.width <= screenWidth && res.height <= screenHeight);
    }, []);

    const handleModeChange = (mode: 'fullscreen' | 'borderless' | 'windowed') => {
        feedback.click();

        // Direct check for electron API to be ultra-responsive
        const electron = (window as any).electron;
        const actualIsElectron = isElectron || !!electron;

        if (actualIsElectron) {
            setDisplaySettings({
                mode,
                // Fallback to defaults if settings haven't loaded yet
                width: displaySettings?.width || 1366,
                height: displaySettings?.height || 768,
                frame: displaySettings?.frame ?? false,
            });
        } else {
            // Standard browser fallback
            if (mode === 'fullscreen' && !document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (mode === 'windowed' && document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    };

    const handleResolutionChange = (width: number, height: number) => {
        feedback.click();
        setDisplaySettings({
            mode: displaySettings?.mode || 'windowed',
            width,
            height,
            frame: displaySettings?.frame ?? false,
        });
    };

    const handleFrameToggle = () => {
        feedback.click();
        setDisplaySettings({
            mode: displaySettings?.mode || 'windowed',
            width: displaySettings?.width || 1920,
            height: displaySettings?.height || 1080,
            frame: displaySettings ? !displaySettings.frame : true,
        });
    };

    // Determine current graphics preset
    const getPreset = () => {
        if (gpuEnabled && blurEnabled && !disableShadows && !disableGradients && !reduceMotion) return 'ultra';
        if (!gpuEnabled && !blurEnabled && disableShadows && disableGradients && reduceMotion) return 'performance';
        return 'custom';
    };

    const applyPreset = (preset: 'ultra' | 'performance') => {
        feedback.click();
        if (preset === 'ultra') {
            setGpuEnabled(true);
            setBlurEnabled(true);
            setDisableShadows(false);
            setDisableGradients(false);
            setReduceMotion(false);
        } else {
            setGpuEnabled(false);
            setBlurEnabled(false);
            setDisableShadows(true);
            setDisableGradients(true);
            setReduceMotion(true);
        }
    };

    const updateVolume = (category: 'master' | 'music' | 'sfx' | 'ambiance', val: number) => {
        setVolumes(prev => ({ ...prev, [category]: val }));
        if (category === 'master') soundManager.setVolume('master', val / 100);
        else if (category === 'music') soundManager.setVolume('music', val / 100);
        else if (category === 'ambiance') soundManager.setVolume('ambiance', val / 100);
        else {
            // Group SFX
            soundManager.setVolume('ui', val / 100);
            soundManager.setVolume('system', val / 100);
            soundManager.setVolume('feedback', val / 100);
        }
    };

    const handleSoftReset = () => {
        if (confirm(t('game.bios.softResetConfirm'))) {
            window.location.reload();
        }
    };

    const handleFactoryReset = () => {
        if (confirm(t('game.bios.factoryResetConfirm'))) {
            feedback.click();
            // True Factory Reset: Wipe everything (incl. BIOS)
            factoryReset();
            setTimeout(() => window.location.reload(), 500);
        }
    };

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="terminal-card max-w-2xl w-full shadow-2xl relative flex flex-col overflow-hidden max-h-[85vh] font-mono text-white"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white bg-black">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white text-black border border-white">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-widest uppercase">{t('game.bios.title')}</h2>
                            <p className="text-xs text-white/50 uppercase tracking-widest font-mono mt-0.5">{t('game.bios.configurationUtility')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { feedback.click(); onClose(); }}
                        className="p-2 hover:bg-white hover:text-black transition-colors border border-transparent hover:border-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-48 bg-black border-r border-white p-4 space-y-2 shrink-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { feedback.click(); setActiveTab(tab.id as Tab); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-100 border-2",
                                    activeTab === tab.id
                                        ? "bg-white text-black border-white shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]"
                                        : "bg-black text-white/50 border-transparent hover:border-white/50 hover:text-white"
                                )}
                            >
                                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-black" : "text-white/50")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto bg-black bg-size-[16px_16px] bg-[radial-gradient(#ffffff1a_1px,transparent_1px)]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.1 }}
                                className="space-y-8"
                            >
                                {activeTab === 'display' && (
                                    <div className="space-y-8">
                                        {/* Display Mode Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/20 pb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white/40" /> {t('game.bios.displayMode')}
                                            </h3>

                                            <div className="grid grid-cols-3 gap-3">
                                                {(['fullscreen', 'borderless', 'windowed'] as const).map((mode) => {
                                                    // Determine logical active mode
                                                    const electronAPI = (window as any).electron;
                                                    const actualIsElectron = isElectron || !!electronAPI;

                                                    let activeMode: string = isFullscreen ? 'fullscreen' : 'windowed';
                                                    if (actualIsElectron && displaySettings) {
                                                        activeMode = displaySettings.mode;
                                                    }

                                                    const isActive = activeMode === mode;

                                                    return (
                                                        <button
                                                            key={mode}
                                                            onClick={() => handleModeChange(mode)}
                                                            className={cn(
                                                                "p-4 border-2 text-center transition-all relative overflow-hidden group",
                                                                isActive
                                                                    ? "bg-white/10 border-white text-white"
                                                                    : "bg-black border-zinc-800 hover:border-white/50 text-zinc-500"
                                                            )}
                                                        >
                                                            <div className="font-bold uppercase text-[10px] tracking-widest">{t(`game.bios.${mode}`)}</div>
                                                            {isActive && (
                                                                <motion.div layoutId="mode-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-white" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Resolution & Settings (Only in Windowed Mode in Electron, or if state is ambiguous but clearly in Electron) */}
                                        {(isElectron || !!(window as any).electron) && (displaySettings?.mode === 'windowed' || (!displaySettings && !isFullscreen)) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid grid-cols-2 gap-8"
                                            >
                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/20 pb-2 flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-white/40" /> {t('game.bios.resolution')}
                                                    </h3>
                                                    <div className="grid grid-cols-1 gap-1">
                                                        {RESOLUTIONS.map((res) => (
                                                            <button
                                                                key={res.label}
                                                                onClick={() => handleResolutionChange(res.width, res.height)}
                                                                className={cn(
                                                                    "p-2 border transition-all text-left text-[10px] font-bold uppercase tracking-wider",
                                                                    displaySettings?.width === res.width && displaySettings?.height === res.height
                                                                        ? "bg-white text-black border-white"
                                                                        : "bg-black text-white/40 border-zinc-800 hover:border-white/50"
                                                                )}
                                                            >
                                                                {res.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/20 pb-2 flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-white/40" /> {t('game.bios.windowSettings')}
                                                    </h3>
                                                    <button
                                                        onClick={handleFrameToggle}
                                                        className={cn(
                                                            "w-full p-4 border-2 text-left transition-all flex justify-between items-center group",
                                                            displaySettings?.frame
                                                                ? "bg-white/5 border-white text-white"
                                                                : "bg-black border-zinc-800 text-zinc-500 hover:border-white/50"
                                                        )}
                                                    >
                                                        <div>
                                                            <div className="font-bold uppercase text-xs tracking-widest">{t('game.bios.windowFrame')}</div>
                                                            <div className="text-[9px] opacity-40 mt-1">{t('game.bios.windowFrameHint')}</div>
                                                        </div>
                                                        <div className={cn("w-4 h-4 border-2 flex items-center justify-center", displaySettings?.frame ? "border-white bg-white" : "border-zinc-700")}>
                                                            {displaySettings?.frame && <Check className="w-3 h-3 text-black" />}
                                                        </div>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/20 pb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white/40" /> {t('game.bios.graphicsQuality')}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => applyPreset('ultra')}
                                                    className={cn(
                                                        "p-4 border-2 text-left transition-all relative overflow-hidden group",
                                                        getPreset() === 'ultra'
                                                            ? "bg-white/10 border-white text-white"
                                                            : "bg-black border-zinc-800 hover:border-white/50 text-zinc-500"
                                                    )}
                                                >
                                                    <div className="relative z-10">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="font-bold uppercase text-sm">{t('game.bios.presets.highFidelity.label')}</div>
                                                            {getPreset() === 'ultra' && <div className={cn("w-2 h-2 bg-white", !reduceMotion && "animate-pulse")} />}
                                                        </div>
                                                        <div className="text-[10px] opacity-60">{t('game.bios.presets.highFidelity.desc')}</div>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => applyPreset('performance')}
                                                    className={cn(
                                                        "p-4 border-2 text-left transition-all relative overflow-hidden group",
                                                        getPreset() === 'performance'
                                                            ? "bg-white/10 border-white text-white"
                                                            : "bg-black border-zinc-800 hover:border-white/50 text-zinc-500"
                                                    )}
                                                >
                                                    <div className="relative z-10">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="font-bold uppercase text-sm">{t('game.bios.presets.performance.label')}</div>
                                                            {getPreset() === 'performance' && <div className={cn("w-2 h-2 bg-white", !reduceMotion && "animate-pulse")} />}
                                                        </div>
                                                        <div className="text-[10px] opacity-60">{t('game.bios.presets.performance.desc')}</div>
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Advanced Toggles */}
                                            <div className="pt-2 grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newState = !gpuEnabled;
                                                        setGpuEnabled(newState);
                                                        if (!newState) {
                                                            setBlurEnabled(false);
                                                            setDisableShadows(true);
                                                            setReduceMotion(true);
                                                        }
                                                    }}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5 col-span-2", gpuEnabled ? "border-white text-white" : "border-zinc-800 text-zinc-600")}
                                                >
                                                    [ {gpuEnabled ? 'X' : ' '} ] {t('game.bios.hardwareAcceleration')}
                                                </button>
                                                <button
                                                    onClick={() => setReduceMotion(!reduceMotion)}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5", reduceMotion ? "border-white text-white" : "border-zinc-800 text-zinc-600")}
                                                >
                                                    [ {reduceMotion ? 'X' : ' '} ] {t('game.bios.reduceMotion')}
                                                </button>
                                                <button
                                                    onClick={() => setDisableGradients(!disableGradients)}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5", disableGradients ? "border-white text-white" : "border-zinc-800 text-zinc-600")}
                                                >
                                                    [ {disableGradients ? 'X' : ' '} ] {t('game.bios.simpleColors')}
                                                </button>
                                                <button
                                                    onClick={() => setBlurEnabled(!blurEnabled)}
                                                    disabled={!gpuEnabled}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5",
                                                        !gpuEnabled && "opacity-50 cursor-not-allowed",
                                                        !blurEnabled ? "border-white text-white" : "border-zinc-800 text-zinc-600"
                                                    )}
                                                >
                                                    [ {!blurEnabled ? 'X' : ' '} ] {t('game.bios.solidBackgrounds')}
                                                </button>
                                                <button
                                                    onClick={() => setDisableShadows(!disableShadows)}
                                                    disabled={!gpuEnabled}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5",
                                                        !gpuEnabled && "opacity-50 cursor-not-allowed",
                                                        disableShadows ? "border-white text-white" : "border-zinc-800 text-zinc-600"
                                                    )}
                                                >
                                                    [ {disableShadows ? 'X' : ' '} ] {t('game.bios.noShadows')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'audio' && (
                                    <div className="space-y-8">
                                        <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-8">
                                            {/* Master */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-white border-b border-zinc-800 pb-2">
                                                    <span className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                                                        <Volume2 className="w-4 h-4" /> {t('audio.mixerLabels.masterOutput')}
                                                    </span>
                                                    <span className="font-mono text-sm text-white">{volumes.master.toString().padStart(3, '0')}%</span>
                                                </div>
                                                <div className="relative h-4 bg-zinc-900 border border-zinc-700 w-full">
                                                    <div
                                                        className="absolute top-0 left-0 h-full bg-white transition-all duration-75"
                                                        style={{ width: `${volumes.master}%` }}
                                                    />
                                                    <input
                                                        type="range"
                                                        min="0" max="100"
                                                        value={volumes.master}
                                                        onChange={(e) => updateVolume('master', parseInt(e.target.value))}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            {/* Sub Mixes */}
                                            <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-zinc-400">
                                                        <span className="font-bold text-xs uppercase tracking-wider">{t('audio.mixerLabels.musicAppLevel')}</span>
                                                        <span className="font-mono text-xs">{volumes.music.toString().padStart(3, '0')}%</span>
                                                    </div>
                                                    <div className="relative h-2 bg-zinc-900 border border-zinc-800 w-full group hover:border-white/50 transition-colors">
                                                        <div
                                                            className="absolute top-0 left-0 h-full bg-zinc-400 group-hover:bg-white transition-colors"
                                                            style={{ width: `${volumes.music}%` }}
                                                        />
                                                        <input
                                                            type="range"
                                                            min="0" max="100"
                                                            value={volumes.music}
                                                            onChange={(e) => updateVolume('music', parseInt(e.target.value))}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-zinc-400">
                                                        <span className="font-bold text-xs uppercase tracking-wider">{t('audio.mixerLabels.sfxInterface')}</span>
                                                        <span className="font-mono text-xs">{volumes.sfx.toString().padStart(3, '0')}%</span>
                                                    </div>
                                                    <div className="relative h-2 bg-zinc-900 border border-zinc-800 w-full group hover:border-white/50 transition-colors">
                                                        <div
                                                            className="absolute top-0 left-0 h-full bg-zinc-400 group-hover:bg-white transition-colors"
                                                            style={{ width: `${volumes.sfx}%` }}
                                                        />
                                                        <input
                                                            type="range"
                                                            min="0" max="100"
                                                            value={volumes.sfx}
                                                            onChange={(e) => updateVolume('sfx', parseInt(e.target.value))}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ambiance */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/20 pb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white/40" /> {t('audio.categories.ambiance')}
                                            </h3>
                                            <div className="flex items-center gap-4 bg-zinc-950/50 p-4 border border-zinc-800">
                                                <button
                                                    onClick={() => updateVolume('ambiance', volumes.ambiance === 0 ? 50 : 0)}
                                                    className="p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <Waves className="w-5 h-5" />
                                                </button>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between text-xs uppercase font-bold tracking-wider">
                                                        <span>{t('audio.mixerLabels.backgroundLoop')}</span>
                                                        <span>{Math.round(volumes.ambiance).toString().padStart(3, '0')}%</span>
                                                    </div>
                                                    <div className="relative h-2 bg-zinc-900 border border-zinc-800 w-full group hover:border-white/50 transition-colors">
                                                        <div
                                                            className="absolute top-0 left-0 h-full bg-zinc-400 group-hover:bg-white transition-colors"
                                                            style={{ width: `${volumes.ambiance}%` }}
                                                        />
                                                        <input
                                                            type="range"
                                                            min="0" max="100"
                                                            value={volumes.ambiance}
                                                            onChange={(e) => updateVolume('ambiance', parseInt(e.target.value))}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'system' && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/20 pb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white/40" /> {t('settings.appearance.languageTitle')}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {SUPPORTED_LOCALES.map((l) => (
                                                    <button
                                                        key={l.locale}
                                                        onClick={() => { feedback.click(); setLocale(l.locale); }}
                                                        className={cn(
                                                            "flex justify-between items-center p-3 border-2 transition-all hover:bg-white/5",
                                                            locale === l.locale
                                                                ? "border-white bg-white/10 text-white"
                                                                : "border-zinc-800 text-zinc-500 hover:text-white hover:border-white/50"
                                                        )}
                                                    >
                                                        <span className="text-xs font-bold uppercase tracking-wider">{l.label}</span>
                                                        {locale === l.locale && <Check className="w-3 h-3 text-white" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-8 space-y-4">
                                            <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider border-b border-red-900/50 pb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-red-500" /> {t('game.bios.dangerZone')}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={handleSoftReset}
                                                    className="flex flex-col items-center justify-center gap-2 p-4 border border-blue-900/30 hover:bg-blue-900/10 hover:border-blue-500 transition-all group"
                                                >
                                                    <RefreshCw className="w-6 h-6 text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
                                                    <span className="text-sm font-bold uppercase text-blue-400">{t('game.bios.softReset')}</span>
                                                    <span className="text-[10px] text-white/30 text-center">{t('game.bios.softResetHint')}</span>
                                                </button>

                                                <button
                                                    onClick={handleFactoryReset}
                                                    className="flex flex-col items-center justify-center gap-2 p-4 border border-red-900/30 hover:bg-red-900/10 hover:border-red-500 transition-all group"
                                                >
                                                    <Trash2 className="w-6 h-6 text-red-500 group-hover:shake" />
                                                    <span className="text-sm font-bold uppercase text-red-500">{t('game.bios.factoryReset')}</span>
                                                    <span className="text-[10px] text-white/30 text-center">{t('game.bios.factoryResetHint')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white bg-black text-center text-[10px] text-white/40 font-mono uppercase tracking-widest flex justify-between px-4">
                    <span>{pkg.build.productName} v{pkg.version}</span>
                    <span>{activeTab.toUpperCase()} {t('game.bios.configFooter')}</span>
                </div>
            </motion.div>
        </div>
    );
}

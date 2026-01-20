import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Monitor, RefreshCw, Trash2, X, Speaker, Laptop, Settings, Check, Waves } from 'lucide-react';
import pkg from '@/../package.json';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';
import { soundManager } from '@/services/sound';
import { useFileSystem } from '@/components/FileSystemContext';
import { useI18n } from '@/i18n/index';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useAppContext } from '@/components/AppContext';
import { SUPPORTED_LOCALES } from '@/i18n/translations';

interface SettingsModalProps {
    onClose: () => void;
}

type Tab = 'display' | 'audio' | 'system';

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<Tab>('display');
    const { resetFileSystem } = useFileSystem();

    const tabs = useMemo(() => [
        { id: 'display', icon: Monitor, label: 'Display' },
        { id: 'audio', icon: Speaker, label: 'Audio' },
        { id: 'system', icon: Laptop, label: 'System' },
    ] as const, []);

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
        blurEnabled, setBlurEnabled,
        disableShadows, setDisableShadows,
        disableGradients, setDisableGradients,
        reduceMotion, setReduceMotion,
        locale, setLocale
    } = useAppContext();

    // Volume state
    const [volumes, setVolumes] = useState({
        master: soundManager.getVolume('master') * 100,
        music: soundManager.getVolume('music') * 100,
        sfx: soundManager.getVolume('ui') * 100, // Use UI as proxy for SFX group
        ambiance: soundManager.getVolume('ambiance') * 100,
    });

    // Fullscreen
    const { isFullscreen, toggleFullscreen: toggleFullscreenBase } = useFullscreen();
    const toggleFullscreen = () => {
        feedback.click();
        toggleFullscreenBase();
    };

    // Determine current graphics preset
    const getPreset = () => {
        if (blurEnabled && !disableShadows && !disableGradients && !reduceMotion) return 'ultra';
        if (!blurEnabled && disableShadows && disableGradients && reduceMotion) return 'performance';
        return 'custom';
    };

    const applyPreset = (preset: 'ultra' | 'performance') => {
        feedback.click();
        if (preset === 'ultra') {
            setBlurEnabled(true);
            setDisableShadows(false);
            setDisableGradients(false);
            setReduceMotion(false);
        } else {
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
            resetFileSystem();
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
                            <p className="text-xs text-white/50 uppercase tracking-widest font-mono mt-0.5">Configuration Utility</p>
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
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/20 pb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white/40" /> {t('game.bios.fullScreen')}
                                            </h3>
                                            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 hover:border-white/50 transition-colors">
                                                <div className="flex items-center gap-3 text-white/80">
                                                    <Monitor className="w-5 h-5" />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm uppercase">{t('game.bios.fullScreen')}</span>
                                                        <span className="text-[10px] text-white/40">{t('game.bios.immersiveMode')}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={toggleFullscreen}
                                                    className={cn(
                                                        "px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-all",
                                                        isFullscreen
                                                            ? "bg-white text-black border-white"
                                                            : "bg-transparent text-white border-white/40 hover:border-white"
                                                    )}
                                                >
                                                    {isFullscreen ? t('game.bios.fullScreenExit') : t('game.bios.fullScreenEnter')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/20 pb-2 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white/40" /> Graphics Quality
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
                                                            <div className="font-bold uppercase text-sm">High Fidelity</div>
                                                            {getPreset() === 'ultra' && <div className={cn("w-2 h-2 bg-white", !reduceMotion && "animate-pulse")} />}
                                                        </div>
                                                        <div className="text-[10px] opacity-60">Blur, Shadows, Vibrancy enabled. visual++</div>
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
                                                            <div className="font-bold uppercase text-sm">Performance</div>
                                                            {getPreset() === 'performance' && <div className={cn("w-2 h-2 bg-white", !reduceMotion && "animate-pulse")} />}
                                                        </div>
                                                        <div className="text-[10px] opacity-60">Max FPS. Minimal effects. speed++</div>
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Advanced Toggles */}
                                            <div className="pt-2 grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setReduceMotion(!reduceMotion)}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5", reduceMotion ? "border-white text-white" : "border-zinc-800 text-zinc-600")}
                                                >
                                                    [ {reduceMotion ? 'X' : ' '} ] Reduce Motion
                                                </button>
                                                <button
                                                    onClick={() => setDisableGradients(!disableGradients)}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5", disableGradients ? "border-white text-white" : "border-zinc-800 text-zinc-600")}
                                                >
                                                    [ {disableGradients ? 'X' : ' '} ] Simple Colors
                                                </button>
                                                <button
                                                    onClick={() => setBlurEnabled(!blurEnabled)}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5", !blurEnabled ? "border-white text-white" : "border-zinc-800 text-zinc-600")}
                                                >
                                                    [ {!blurEnabled ? 'X' : ' '} ] Solid Backgrounds
                                                </button>
                                                <button
                                                    onClick={() => setDisableShadows(!disableShadows)}
                                                    className={cn("text-[10px] uppercase font-bold p-2 border transition-all hover:bg-white/5", disableShadows ? "border-white text-white" : "border-zinc-800 text-zinc-600")}
                                                >
                                                    [ {disableShadows ? 'X' : ' '} ] No Shadows
                                                </button>
                                            </div>
                                        </div>
                                    </>
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
                                                <span className="w-2 h-2 bg-red-500" /> Danger Zone
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
                    <span>{activeTab.toUpperCase()} CONFIG</span>
                </div>
            </motion.div>
        </div>
    );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Monitor, RefreshCw, Trash2, X, VolumeX } from 'lucide-react';
import pkg from '@/../package.json';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';
import { soundManager } from '@/services/sound';
import { useFileSystem } from '@/components/FileSystemContext';
import { useI18n } from '@/i18n/index';
import { useFullscreen } from '@/hooks/useFullscreen';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { t } = useI18n();
    const [volume, setVolume] = useState(soundManager.getVolume('master') * 100);
    const { resetFileSystem } = useFileSystem();

    // Fullscreen management
    const { isFullscreen, toggleFullscreen: toggleFullscreenBase } = useFullscreen();
    const toggleFullscreen = () => {
        feedback.click();
        toggleFullscreenBase();
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseInt(e.target.value);
        setVolume(newVol);
        soundManager.setVolume('master', newVol / 100);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-zinc-900/90 border border-white/10 p-8 max-w-lg w-full rounded-2xl shadow-2xl relative"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-wide">{t('game.bios.title')}</h2>
                    <button
                        onClick={() => { feedback.click(); onClose(); }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Volume Control */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-white/80">
                            <span className="flex items-center gap-2 font-medium">
                                <Volume2 className="w-4 h-4" /> {t('game.bios.masterVolume')}
                            </span>
                            <span className="font-mono text-sm">{volume}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <VolumeX className="w-4 h-4 text-white/30" />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                            />
                            <Volume2 className="w-4 h-4 text-white/30" />
                        </div>
                    </div>

                    {/* Display Control */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 text-white/80">
                            <Monitor className="w-5 h-5" />
                            <div className="flex flex-col">
                                <span className="font-medium">{t('game.bios.fullScreen')}</span>
                                <span className="text-xs text-white/40">{t('game.bios.immersiveMode')}</span>
                            </div>
                        </div>
                        <button
                            onClick={toggleFullscreen}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                                isFullscreen
                                    ? "bg-white text-black border-white hover:bg-white/90"
                                    : "bg-transparent text-white border-white/20 hover:bg-white/10"
                            )}
                        >
                            {isFullscreen ? t('game.bios.fullScreenExit') : t('game.bios.fullScreenEnter')}
                        </button>
                    </div>

                    <div className="h-px bg-white/10 my-6" />

                    {/* Reset Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleSoftReset}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 transition-all group"
                        >
                            <RefreshCw className="w-6 h-6 text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
                            <span className="text-sm font-medium text-blue-100">{t('game.bios.softReset')}</span>
                            <span className="text-[10px] text-white/30">{t('game.bios.softResetHint')}</span>
                        </button>

                        <button
                            onClick={handleFactoryReset}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-all group"
                        >
                            <Trash2 className="w-6 h-6 text-red-400 group-hover:shake" />
                            <span className="text-sm font-medium text-red-100">{t('game.bios.factoryReset')}</span>
                            <span className="text-[10px] text-white/30">{t('game.bios.factoryResetHint')}</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-white/20 font-mono">
                    {pkg.build.productName} v{pkg.version} • {t('game.bios.footer.biosConfiguration')}<br></br>{t('game.bios.footer.moreSettings')}
                </div>
            </motion.div>
        </div>
    );
}

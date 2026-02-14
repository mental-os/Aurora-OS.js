import { useMemo } from 'react';
import { Smartphone } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useI18n } from '@/i18n';
import { cn } from '@/components/ui/utils';
import { motion } from 'motion/react';
import { feedback } from '@/services/soundFeedback';

export function DisplaySettings() {
    const { t } = useI18n();
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

    const handleFrameToggle = (checked: boolean) => {
        feedback.click();
        setDisplaySettings({
            mode: displaySettings?.mode || 'windowed',
            width: displaySettings?.width || 1920,
            height: displaySettings?.height || 1080,
            frame: checked,
        });
    };

    return (
        <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.displays')}</h2>

            {/* Monitor Visualization */}
            <div className="bg-black/20 rounded-xl p-8 mb-6 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative z-10 w-48 aspect-video bg-black rounded-lg border-4 border-zinc-800 shadow-2xl flex items-center justify-center mb-4">
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-white/0" />
                    <div className="text-center">
                        <div className="text-white font-bold text-lg">
                            {displaySettings ? `${displaySettings.width}x${displaySettings.height}` : `${window.screen.width}x${window.screen.height}`}
                        </div>
                        <div className="text-white/40 text-xs mt-1">
                            {isFullscreen ? 'Fullscreen' : 'Windowed'}
                        </div>
                    </div>
                </div>
                <div className="h-2 w-16 bg-zinc-800 rounded-full mb-1" />
                <div className="h-6 w-2 bg-zinc-800" />
                <div className="h-1 w-24 bg-zinc-800 rounded-full" />
            </div>

            <div className="space-y-6">
                {/* Display Mode */}
                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg text-white mb-4">{t('game.bios.displayMode')}</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {(['fullscreen', 'borderless', 'windowed'] as const).map((mode) => {
                            const electronAPI = (window as any).electron;
                            const actualIsElectron = isElectron || !!electronAPI;

                            let activeMode: string = isFullscreen ? 'fullscreen' : 'windowed';
                            if (actualIsElectron && displaySettings) {
                                activeMode = displaySettings.mode;
                            }

                            // Create a simpler Browser-friendly view if not in Electron
                            if (!actualIsElectron && mode === 'borderless') return null;

                            const isActive = activeMode === mode;

                            return (
                                <button
                                    key={mode}
                                    onClick={() => handleModeChange(mode)}
                                    className={cn(
                                        "p-4 rounded-lg border-2 text-center transition-all relative overflow-hidden group",
                                        isActive
                                            ? "bg-white/10 border-white text-white"
                                            : "bg-black/20 border-white/5 hover:border-white/20 text-white/60"
                                    )}
                                    style={!actualIsElectron ? { gridColumn: mode === 'windowed' ? 'span 1' : 'span 2' } : {}}
                                >
                                    <div className="font-medium text-sm">{t(`game.bios.${mode}`)}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Resolution & Window Settings (Electron Only) */}
                {(isElectron || !!(window as any).electron) && (displaySettings?.mode === 'windowed' || (!displaySettings && !isFullscreen)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Resolution */}
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <h3 className="text-lg text-white mb-4">{t('game.bios.resolution')}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {RESOLUTIONS.map((res) => (
                                    <button
                                        key={res.label}
                                        onClick={() => handleResolutionChange(res.width, res.height)}
                                        className={cn(
                                            "p-2 rounded border transition-all text-center text-xs font-medium",
                                            displaySettings?.width === res.width && displaySettings?.height === res.height
                                                ? "bg-white text-black border-white"
                                                : "bg-black/20 text-white/60 border-white/5 hover:border-white/20"
                                        )}
                                    >
                                        {res.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Window Frame */}
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg text-white mb-1">{t('game.bios.windowFrame')}</h3>
                                <p className="text-sm text-white/60">{t('game.bios.windowFrameHint')}</p>
                            </div>
                            <button
                                onClick={() => handleFrameToggle(!displaySettings?.frame)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    displaySettings?.frame ? "bg-white" : "bg-white/20"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform",
                                    displaySettings?.frame ? "translate-x-6" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Mobile / Tablet Warning (Browser Only) */}
                {!isElectron && (
                    <div className="bg-black/20 rounded-xl p-6 border border-white/5 flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-lg">
                            <Smartphone className="w-5 h-5 text-white/40" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Device Display</h3>
                            <p className="text-xs text-white/50 mt-1">
                                Browser-based display settings are limited by your physical device screen.
                                For accurate resolution simulation, use the desktop application.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

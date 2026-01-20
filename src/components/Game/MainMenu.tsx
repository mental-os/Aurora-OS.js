import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Power, Play, Disc } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';
import { GameScreenLayout } from '@/components/Game/GameScreenLayout';
import { SettingsModal } from '@/components/Game/SettingsModal';
import { CreditsModal } from '@/components/Game/CreditsModal';
import { useI18n } from '@/i18n/index';
import { useFileSystem } from '@/components/FileSystemContext';
import { DevStatusWindow } from '@/components/Game/DevStatusWindow';
import { soundManager } from '@/services/sound';

interface MainMenuProps {
    onNewGame: () => void;
    onContinue: () => void;
    canContinue: boolean;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    disabled: boolean;
    action: () => void;
    desc: string;
}

export function MainMenu({ onNewGame, onContinue, canContinue }: MainMenuProps) {
    const { t } = useI18n();
    // Default select index: if can continue 0, else 1 (New Game)
    const [selected, setSelected] = useState(canContinue ? 0 : 1);
    const [showSettings, setShowSettings] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [exitSelection, setExitSelection] = useState(0); // 0: Cancel, 1: Confirm
    const [showCredits, setShowCredits] = useState(false);
    const { saveFileSystem } = useFileSystem();

    const menuItems = useMemo<MenuItem[]>(() => [
        {
            id: 'continue',
            label: t('game.mainMenu.continue.label'),
            icon: Disc,
            disabled: !canContinue,
            action: onContinue,
            desc: canContinue
                ? t('game.mainMenu.continue.desc.canContinue')
                : t('game.mainMenu.continue.desc.noData')
        },
        {
            id: 'new-game',
            label: t('game.mainMenu.newGame.label'),
            icon: Play,
            disabled: false,
            action: onNewGame,
            desc: t('game.mainMenu.newGame.desc')
        },
        {
            id: 'settings',
            label: t('game.mainMenu.settings.label'),
            icon: Settings,
            disabled: false,
            action: () => setShowSettings(true),
            desc: t('game.mainMenu.settings.desc')
        },
        {
            id: 'exit',
            label: t('game.mainMenu.exit.label'),
            icon: Power,
            disabled: false,
            action: () => {
                setShowExitConfirm(true);
                setExitSelection(0); // Reset to Cancel by default
            },
            desc: t('game.mainMenu.exit.desc')
        }
    ], [canContinue, onContinue, onNewGame, t]);

    useEffect(() => {
        // Start ambiance when entering Main Menu
        soundManager.startAmbiance();
    }, []);

    // Keyboard Navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (showSettings || showCredits) return;

        if (showExitConfirm) {
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowExitConfirm(false);
                setExitSelection(0); // Reset
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                setExitSelection(prev => prev === 0 ? 1 : 0);
                feedback.hover();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                feedback.click();
                if (exitSelection === 1) {
                    saveFileSystem();
                    window.close();
                } else {
                    setShowExitConfirm(false);
                    setExitSelection(0);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                setSelected(prev => {
                    const next = (prev - 1 + menuItems.length) % menuItems.length;
                    // Skip disabled items going up
                    if (menuItems[next].disabled) {
                        return (next - 1 + menuItems.length) % menuItems.length;
                    }
                    feedback.hover();
                    return next;
                });
                break;
            case 'ArrowDown':
                e.preventDefault();
                setSelected(prev => {
                    const next = (prev + 1) % menuItems.length;
                    // Skip disabled items going down
                    if (menuItems[next].disabled) {
                        return (next + 1) % menuItems.length;
                    }
                    feedback.hover();
                    return next;
                });
                break;
            case 'Enter':
            case ' ': {
                e.preventDefault();
                const item = menuItems[selected];
                if (item && !item.disabled) {
                    feedback.click();
                    item.action();
                }
                break;
            }
        }
    }, [menuItems, selected, showSettings, showExitConfirm, showCredits, exitSelection, saveFileSystem]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <GameScreenLayout zIndex={40000}>
            <DevStatusWindow />
            {/* Menu Options Container - Fluid Sizing */}
            <div className="flex flex-col justify-center w-full max-w-[clamp(16rem,40vh,32rem)] shrink min-h-0 mx-auto">
                <div
                    className="flex flex-col justify-center min-h-0 ease-out"
                    style={{ gap: 'clamp(0.5rem, 1.5vh, 2.25rem)' }} // More conservative gap
                >
                    {menuItems.map((item, index) => (
                        <motion.button
                            key={item.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            disabled={item.disabled}
                            onClick={() => {
                                if (item.disabled) return;
                                feedback.click();
                                item.action();
                            }}
                            onMouseEnter={() => {
                                if (item.disabled || selected === index) return;
                                setSelected(index);
                                feedback.hover();
                            }}
                            className={cn(
                                "group relative w-full outline-none text-left font-mono shrink",
                                "border-[clamp(1px,0.2vh,2px)]", // Fluid Border

                                // Interactive States (Only if NOT disabled)
                                !item.disabled
                                    ? (selected === index
                                        ? "bg-white text-black border-white shadow-[0.5vh_0.5vh_0_0_rgba(0,0,0,0.5)]"
                                        : "bg-black/80 text-white border-white/40 hover:border-white cursor-pointer hover:bg-white hover:text-black hover:shadow-[0.5vh_0.5vh_0_0_rgba(0,0,0,0.5)]")
                                    : "opacity-50 grayscale cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-600"
                            )}
                            style={{
                                padding: 'clamp(0.75rem, 2.2vh, 2.5rem)', // More conservative Padding
                                boxShadow: selected === index && !item.disabled
                                    ? '0.4vh 0.4vh 0 0 rgba(0,0,0,0.5)'
                                    : '0 0 0 1px black'
                            }}
                        >
                            <div className="flex items-center relative z-10" style={{ gap: 'clamp(0.75rem, 2vh, 1.25rem)' }}>
                                {/* Icon Box - Fluid Size */}
                                <div className={cn(
                                    "flex items-center justify-center transition-colors shrink-0",
                                    item.disabled ? "border-zinc-800" : (selected === index ? "border-black" : "border-white/40 group-hover:border-black")
                                )}
                                    style={{
                                        width: 'clamp(2rem, 3.5vh, 3.5rem)', // Slightly smaller Icon Box
                                        height: 'clamp(2rem, 3.5vh, 3.5rem)',
                                        borderWidth: 'clamp(1px, 0.2vh, 2px)'
                                    }}
                                >
                                    <item.icon className={cn(
                                        "transition-colors",
                                        item.disabled ? "text-zinc-600" : (selected === index ? "text-black" : "text-white group-hover:text-black")
                                    )}
                                        style={{ width: '50%', height: '50%' }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className={cn(
                                        "font-bold tracking-wider uppercase mb-0.5 truncate leading-none",
                                        item.disabled ? "text-zinc-600" : (selected === index ? "text-black" : "text-white group-hover:text-black")
                                    )}
                                        style={{ fontSize: 'clamp(1rem, 2vh, 1.5rem)' }} // Moderated Label
                                    >
                                        {item.label}
                                    </div>
                                    <div className={cn(
                                        "tracking-widest opacity-80 truncate hidden sm:block",
                                        item.disabled ? "text-zinc-700" : (selected === index ? "text-black/70" : "text-white/50 group-hover:text-black/70")
                                    )}
                                        style={{ fontSize: 'clamp(0.6rem, 1.1vh, 0.85rem)' }} // Fluid Desc
                                    >
                                        {item.desc}
                                    </div>
                                </div>

                                {/* Chevron / Indicator */}
                                {selected === index && !item.disabled && (
                                    <motion.div
                                        layoutId="cursor"
                                        className="hidden sm:block font-bold animate-pulse"
                                        style={{ fontSize: 'clamp(1.1rem, 2.2vh, 1.75rem)' }}
                                    >
                                        &lt;
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Footer / Credits - FIXED BOTTOM RIGHT */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="fixed bottom-6 right-6 z-50 hidden sm:block" // Hidden on mobile, valid for desktop design
                >
                    <button
                        onClick={() => { feedback.click(); setShowCredits(true); }}
                        className="group flex items-center gap-2 bg-black border border-white/20 hover:border-white font-mono text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                        style={{
                            padding: '10px 24px',
                            fontSize: '12px'
                        }}
                    >
                        <span>[</span>
                        <span>Credits</span>
                        <span>]</span>
                    </button>
                </motion.div>

                {/* Mobile Fallback for Credits (Keep it inline on tiny screens) */}
                <div className="sm:hidden flex justify-center mt-4 opacity-50">
                    <button onClick={() => setShowCredits(true)} className="text-[10px] uppercase border border-white/20 px-2 py-1">[Credits]</button>
                </div>
            </div >

            {/* Settings Modal */}
            <AnimatePresence>
                {
                    showSettings && (
                        <SettingsModal onClose={() => setShowSettings(false)} />
                    )
                }
            </AnimatePresence >

            {/* Credits Modal */}
            <AnimatePresence>
                {
                    showCredits && (
                        <CreditsModal onClose={() => setShowCredits(false)} />
                    )
                }
            </AnimatePresence >

            {/* Exit Confirmation Modal (Terminal Style) */}
            <AnimatePresence>
                {
                    showExitConfirm && (
                        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="terminal-card max-w-md w-full relative text-center font-mono p-8"
                            >
                                <div className="flex flex-col items-center gap-6">
                                    <div className="p-4 bg-white text-black border-2 border-white">
                                        <Power className="w-10 h-10" />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{t('game.mainMenu.exit.confirm.title')}</h3>
                                        <p className="text-white/60 text-sm leading-relaxed border-t border-b border-white/10 py-4">
                                            {t('game.mainMenu.exit.confirm.message')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full mt-2">
                                        <button
                                            onClick={() => {
                                                feedback.click();
                                                setShowExitConfirm(false);
                                                setExitSelection(0);
                                            }}
                                            className={cn(
                                                "px-6 py-4 border-2 transition-all font-bold uppercase tracking-wide text-sm",
                                                exitSelection === 0
                                                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                                    : "border-white/20 text-white hover:border-white hover:bg-white hover:text-black"
                                            )}
                                        >
                                            {t('game.mainMenu.exit.confirm.cancel')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                feedback.click();
                                                saveFileSystem();
                                                window.close();
                                            }}
                                            className={cn(
                                                "px-6 py-4 border-2 transition-all font-bold uppercase tracking-wide text-sm shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]",
                                                exitSelection === 1
                                                    ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                                                    : "bg-red-600 text-white border-red-600 hover:bg-red-500"
                                            )}
                                        >
                                            {t('game.mainMenu.exit.confirm.confirm')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </GameScreenLayout >
    );
}
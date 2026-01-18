import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Power, Play, Disc } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';
import { GameScreenLayout } from '@/components/Game/GameScreenLayout';
import { SettingsModal } from '@/components/Game/SettingsModal';
import { useI18n } from '@/i18n/index';
import { useFileSystem } from '@/components/FileSystemContext';

interface MainMenuProps {
    onNewGame: () => void;
    onContinue: () => void;
    canContinue: boolean;
}

export function MainMenu({ onNewGame, onContinue, canContinue }: MainMenuProps) {
    const { t } = useI18n();
    const [selected, setSelected] = useState(canContinue ? 0 : 1);
    const [showSettings, setShowSettings] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const { saveFileSystem } = useFileSystem();

    // Keyboard navigation could be added here for true "game" feel

    const menuItems = [
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
            action: () => setShowExitConfirm(true), // Changed to show confirmation
            desc: t('game.mainMenu.exit.desc')
        }
    ];

    return (
        <GameScreenLayout zIndex={40000}>
            {/* Menu Options */}
            <div className="flex flex-col gap-4 w-[90%] md:w-full max-w-md">
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
                            if (item.disabled) return;
                            setSelected(index);
                            feedback.hover();
                        }}
                        className={cn(
                            "group relative w-full p-4 rounded-xl transition-all duration-200 border border-transparent",
                            !item.disabled && "hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-lg cursor-pointer",
                            item.disabled && "opacity-50 grayscale cursor-not-allowed",
                            selected === index && !item.disabled && "bg-white/10 border-white/20 shadow-lg"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <item.icon className={cn(
                                "w-6 h-6 transition-colors",
                                item.disabled ? "text-zinc-500" : (selected === index ? "text-white" : "text-white/70")
                            )} />
                            <div className="flex-1 text-left">
                                <div className={cn(
                                    "text-lg font-bold tracking-wide transition-colors",
                                    item.disabled ? "text-zinc-500" : (selected === index ? "text-white" : "text-white/80")
                                )}>
                                    {item.label}
                                </div>
                                <div className={cn(
                                    "text-xs uppercase tracking-wider",
                                    item.disabled ? "text-zinc-600" : "text-white/40"
                                )}>
                                    {item.desc}
                                </div>
                            </div>
                            {selected === index && !item.disabled && (
                                <motion.div layoutId="cursor" className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}

            {/* Exit Confirmation Modal */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-zinc-900/90 border border-red-500/30 p-6 max-w-sm w-full rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)] relative text-center"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shadow-inner">
                                <Power className="w-8 h-8" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white tracking-wide">{t('game.mainMenu.exit.confirm.title')}</h3>
                                <p className="text-sm text-white/50">
                                    {t('game.mainMenu.exit.confirm.message')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                <button
                                    onClick={() => {
                                        feedback.click();
                                        setShowExitConfirm(false);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors text-sm"
                                >
                                    {t('game.mainMenu.exit.confirm.cancel')}
                                </button>
                                <button
                                    onClick={() => {
                                        feedback.click();
                                        saveFileSystem();
                                        window.close();
                                    }}
                                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 hover:text-white font-medium transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] text-sm"
                                >
                                    {t('game.mainMenu.exit.confirm.confirm')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </GameScreenLayout>
    );
}
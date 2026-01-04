import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Power, Play, Disc } from 'lucide-react';
import { cn } from '../ui/utils';
import { feedback } from '../../services/soundFeedback';
import { GameScreenLayout } from './GameScreenLayout';
import { SettingsModal } from './SettingsModal';
import { useI18n } from '../../i18n';

interface MainMenuProps {
    onNewGame: () => void;
    onContinue: () => void;
    canContinue: boolean;
}

export function MainMenu({ onNewGame, onContinue, canContinue }: MainMenuProps) {
    const { t } = useI18n();
    const [selected, setSelected] = useState(canContinue ? 0 : 1);
    const [showSettings, setShowSettings] = useState(false);

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
            action: () => window.close(), // Attempt to close tab
            desc: t('game.mainMenu.exit.desc')
        }
    ];

    return (
        <GameScreenLayout zIndex={40000}>
            {/* Menu Options */}
            <div className="flex flex-col gap-4 w-full max-w-md">
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
        </GameScreenLayout>
    );
}

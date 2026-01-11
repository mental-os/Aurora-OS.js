import { useState, useMemo } from 'react';
import { IntroSequence } from '@/components/Game/IntroSequence';
import { MainMenu } from '@/components/Game/MainMenu';
import { BootSequence } from '@/components/Game/BootSequence';
import { useFileSystem } from '@/components/FileSystemContext';
import { useAppContext } from '@/components/AppContext';

import { STORAGE_KEYS, hardReset } from '@/utils/memory';
import {Onboarding} from "@/components/Game/Onboarding.tsx";

// The "Actual Game" being played is passed as children (The OS Desktop)
interface GameRootProps {
    children: React.ReactNode;
}

type GameState = 'INTRO' | 'MENU' | 'FIRST_BOOT' | 'BOOT' | 'ONBOARDING' | 'GAMEPLAY';

export function GameRoot({ children }: GameRootProps) {
    const [gameState, setGameState] = useState<GameState>('INTRO'); // Default to INTRO
    const { resetFileSystem } = useFileSystem();
    const { setIsLocked } = useAppContext();

    // Check for save data
    const hasSave = useMemo(() => {
        return !!localStorage.getItem(STORAGE_KEYS.VERSION);
    }, []);

    const handleNewGame = () => {
        hardReset(); // Fully wipe (Filesystem + App Memory)
        // resetFileSystem is redundant as hardReset wipes the key, but we can call it if needed for in-memory state reset?
        // Actually hardReset wipes storage but doesn't necessarily reload the page immediately here?
        // The previous logic relied on setGameState('BOOT') without reload.
        // If we don't reload, the in-memory state of apps (like MusicContext) might persist if they don't re-read storage.
        // BUT, GameRoot unmounts children during transition?
        // When setGameState('BOOT') happens, 'GAMEPLAY' (and thus AppContent) is unmounted. 
        // This force-unmounts all apps. When 'GAMEPLAY' returns, apps remount and read empty storage.
        // So we just need hardReset().

        // However, we must ensure memory state (like useFileSystem in-memory cache) is also cleared.
        resetFileSystem(); // Keep this for in-game memory sync if needed

        setIsLocked(false);
        setGameState('FIRST_BOOT');
    };

    const handleContinue = () => {
        // Force lock so that even if a user is remembered, we show the Login Screen
        setIsLocked(true);
        setGameState('BOOT');
    };

    const handleOnboardingComplete = () => {
        setIsLocked(true);
        setGameState('GAMEPLAY');
    };

    // Override: If user refreshes page during gameplay, should we go back to menu?
    // User requested "Video Game Flow". Usually games go to intro/menu on refresh.
    // So default behavior is correct.

    switch (gameState) {
        case 'INTRO':
            return <IntroSequence onComplete={() => setGameState('MENU')} />;

        case 'MENU':
            return (
                <MainMenu
                    onNewGame={handleNewGame}
                    onContinue={handleContinue}
                    canContinue={hasSave}
                />
            );

        case 'BOOT':
            return <BootSequence onComplete={() => setGameState('GAMEPLAY')} />;

        case 'FIRST_BOOT':
            return <BootSequence onComplete={() => setGameState('ONBOARDING')} />;

        case 'ONBOARDING':
            return <Onboarding
                onContinue={handleOnboardingComplete}
            />

        case 'GAMEPLAY':
            return (
                <div className="fixed inset-0 w-full h-full bg-black">
                    {/* Add an "ESC" menu listener here if we want a pause menu? */}
                    {children}
                </div>
            );

        default:
            return null;
    }
}

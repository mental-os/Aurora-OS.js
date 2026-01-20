import { useState, useMemo } from 'react';
import { IntroSequence } from '@/components/Game/IntroSequence';
import { MainMenu } from '@/components/Game/MainMenu';
import { BootSequence } from '@/components/Game/BootSequence';
import { useFileSystem } from '@/components/FileSystemContext';
import { useAppContext } from '@/components/AppContext';

import { STORAGE_KEYS } from '@/utils/memory';
import { Onboarding } from "@/components/Game/Onboarding.tsx";

import { StorageIndicator } from '@/components/ui/StorageIndicator';
import { feedback } from '@/services/soundFeedback';
import { useEffect } from 'react';

// The "Actual Game" being played is passed as children (The OS Desktop)
interface GameRootProps {
    children: React.ReactNode;
}

type GameState = 'INTRO' | 'MENU' | 'FIRST_BOOT' | 'BOOT' | 'ONBOARDING' | 'GAMEPLAY';

export function GameRoot({ children }: GameRootProps) {
    const [gameState, setGameState] = useState<GameState>('INTRO'); // Default to INTRO
    const { resetFileSystem } = useFileSystem();
    const { setIsLocked } = useAppContext();

    // Global click sound (Persistent across all game states: Menu, Intro, Desktop, etc.)
    useEffect(() => {
        const handleGlobalClick = () => {
            feedback.click();
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    // Check for save data
    const hasSave = useMemo(() => {
        return !!localStorage.getItem(STORAGE_KEYS.VERSION);
    }, []);

    const handleNewGame = () => {
        // hardReset() is now handled internally by resetFileSystem()
        // which resets both localStorage and in-memory React state
        resetFileSystem(true);

        setIsLocked(false);
        setGameState('FIRST_BOOT');
    };

    const handleContinue = () => {
        // Force lock so that even if a user is remembered, we show the Login Screen
        setIsLocked(true);
        setGameState('BOOT');
    };

    const handleOnboardingAbort = () => {
        setGameState('MENU');
    };

    const handleOnboardingComplete = () => {
        setIsLocked(true);
        setGameState('GAMEPLAY');
    };

    // Override: If user refreshes page during gameplay, should we go back to menu?
    // User requested "Video Game Flow". Usually games go to intro/menu on refresh.
    // So default behavior is correct.

    return (
        <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden">
            <StorageIndicator />
            {(() => {
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
                            onBack={handleOnboardingAbort}
                        />

                    case 'GAMEPLAY':
                        return (
                            <div className="relative w-full h-full">
                                {children}
                            </div>
                        );

                    default:
                        return null;
                }
            })()}
        </div>
    );
}

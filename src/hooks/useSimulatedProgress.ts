import { useState, useRef, useEffect, useCallback } from 'react';

interface UseSimulatedProgressOptions {
    targetSizeMB?: number; // Size in MB to determine speed
    onComplete?: () => void;
}

/**
 * A hook that simulates a realistic installation progress bar.
 * It uses a variable speed loop to mimic network/disk variability.
 */
export function useSimulatedProgress({ targetSizeMB = 50, onComplete }: UseSimulatedProgressOptions = {}) {
    const [progress, setProgress] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const progressRef = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startSimulation = useCallback(() => {
        if (isSimulating) return;
        
        setIsSimulating(true);
        setProgress(0);
        progressRef.current = 0;

        // Base duration: 20ms per MB, min 1s, max 10s
        // Small app (5MB) -> ~0.1s base -> clamped to 1s
        // Large app (350MB) -> ~7s base
        const speedFactor = Math.max(1, Math.min(10, targetSizeMB / 20)); 

        const loop = () => {
            // Check if done
            if (progressRef.current >= 100) {
                // Final pause before completion
                timeoutRef.current = setTimeout(() => {
                    setIsSimulating(false);
                    onComplete?.();
                }, 500); 
                return;
            }

            // Variable increment: 1% to 5%
            // Larger apps increment in smaller chunks? 
            // Actually, let's keep increment random but adjust delay based on size.
            const increment = Math.random() * 3 + 1; 
            const newProgress = Math.min(100, progressRef.current + increment);
            
            progressRef.current = newProgress;
            setProgress(Math.floor(newProgress));

            // Variable delay: Random + Size Factor
            // Base delay 50ms * speedFactor.
            // Random jitter factor: 0.5 to 1.5
            const jitter = Math.random() + 0.5;
            let delay = 30 * speedFactor * jitter;

            // "Stalls" at certain percentages for realism
            if (newProgress > 80 && newProgress < 90 && Math.random() > 0.7) {
                delay += 800; // Random stall near end
            }

            timeoutRef.current = setTimeout(loop, delay);
        };

        loop();
    }, [isSimulating, targetSizeMB, onComplete]);

    const stopSimulation = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsSimulating(false);
        setProgress(0);
        progressRef.current = 0;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return { progress, isSimulating, startSimulation, stopSimulation };
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Command, Power } from 'lucide-react';
import { Howler } from 'howler';

interface IntroSequenceProps {
    onComplete: () => void;
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);

    const handleStart = () => {
        // Unlock AudioContext on first user interaction
        if (Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
        setStarted(true);

        // Start sequence
        setStep(1);
    };

    useEffect(() => {
        if (!started) return;

        const timer1 = setTimeout(() => setStep(2), 3000); // Fade out "Mental OS"
        const timer3 = setTimeout(() => onComplete(), 5000); // End

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer3);
        };
    }, [started, onComplete]);

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-[50000]">
            <AnimatePresence mode="wait">
                {!started && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        onClick={handleStart}
                        className="group flex flex-col items-center gap-4 cursor-pointer outline-none"
                    >
                        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/5 transition-all duration-500">
                            <Power className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-white/70 text-sm tracking-[0.2em] uppercase font-medium group-hover:text-white transition-colors">
                                Initialize System
                            </span>
                            <span className="text-white/30 text-[10px] tracking-widest animate-pulse">
                                CLICK TO START
                            </span>
                        </div>
                    </motion.button>
                )}

                {step === 1 && (
                    <motion.div
                        key="logo"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                        transition={{ duration: 3.5, ease: "anticipate" }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="relative">
                            <Command className="w-24 h-24 text-white" strokeWidth={1} />
                            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-[0.5em] uppercase">
                            Nova Republika
                        </h1>
                        <p className="text-white/30 text-xs tracking-widest font-mono">
                            INFORMATION SYSTEMS
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

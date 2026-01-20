import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Power } from 'lucide-react';
import { Howler } from 'howler';
import { useI18n } from '@/i18n/index';
import { soundManager } from '@/services/sound';

interface IntroSequenceProps {
  onComplete: () => void;
}

// Named constants for better code clarity
enum IntroStep {
  INIT = 'INIT',           // Initial "Click to Start" screen
  LOGO = 'LOGO',           // Company logo display
  FADE_OUT = 'FADE_OUT',   // Fade out transition
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<IntroStep>(IntroStep.INIT);
  const [canSkip, setCanSkip] = useState(false);

  // Handle skip functionality (ESC, Space, or Click during logo)
  const handleSkip = useCallback(() => {
    if (!canSkip) return;
    onComplete();
  }, [canSkip, onComplete]);

  // Handle initial start button click
  const handleStart = () => {
    // Unlock AudioContext on first user interaction (required for browsers)
    if (Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }

    // Play startup sound effect
    soundManager.play('computerStart');

    // Start logo sequence
    setStep(IntroStep.LOGO);

    // Enable skip after a brief moment (prevents accidental skips)
    setTimeout(() => setCanSkip(true), 1000);
  };

  // Keyboard skip handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        handleSkip();
      }
    };

    if (canSkip) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [canSkip, handleSkip]);

  // Automatic sequence progression
  useEffect(() => {
    if (step === IntroStep.LOGO) {
      // Hold logo for 4 seconds total (allows for 2s fade in + 2s hold)
      const fadeTimer = setTimeout(() => setStep(IntroStep.FADE_OUT), 4500);
      return () => clearTimeout(fadeTimer);
    }

    if (step === IntroStep.FADE_OUT) {
      // Wait for exit animation to complete before finishing
      const completeTimer = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(completeTimer);
    }
  }, [step, onComplete]);

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-50000"
      onClick={canSkip ? handleSkip : undefined}
      style={{ cursor: canSkip ? 'pointer' : 'default' }}
    >
      <AnimatePresence mode="wait">
        {/* Initial Screen: Click to Start */}
        {step === IntroStep.INIT && (
          <motion.button
            key="init"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            onClick={handleStart}
            className="group flex flex-col items-center gap-4 cursor-pointer outline-none focus:outline-none"
            aria-label={t('game.intro.initialize')}
          >
            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/5 transition-all duration-500 group-hover:scale-110">
              <Power className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/70 text-sm tracking-[0.2em] uppercase font-medium group-hover:text-white transition-colors">
                {t('game.intro.initialize')}
              </span>
              <motion.span 
                className="text-white/30 text-[10px] tracking-widest"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {t('game.intro.clickToStart')}
              </motion.span>
            </div>
          </motion.button>
        )}

        {/* Logo Screen: Company Branding */}
        {step === IntroStep.LOGO && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ 
              duration: 2, 
              ease: "anticipate"
            }}
            className="flex flex-col items-center gap-6 relative"
          >
            {/* Company Logo with Glow Effect */}
            <div className="relative">
              <Command className="w-24 h-24 text-white relative z-10" strokeWidth={1} />
              <motion.div 
                className="absolute inset-0 bg-white/20 blur-xl rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Company Name */}
            <motion.h1 
              className="text-3xl font-bold text-white tracking-[0.5em] uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Nova Republika
            </motion.h1>

            {/* Tagline */}
            <motion.p 
              className="text-white/30 text-xs tracking-widest font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              INFORMATION SYSTEMS
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Hint overlay - Static position, independent of animation */}
      <AnimatePresence>
        {canSkip && step !== IntroStep.FADE_OUT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-[10px] tracking-wider font-mono mix-blend-screen"
          >
            {t('game.intro.skipHint')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

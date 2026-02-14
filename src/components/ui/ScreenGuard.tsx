import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MonitorX } from 'lucide-react';

const MIN_WIDTH = 1366;
const MIN_HEIGHT = 700; // slightly lower than 768 to allow for browser chrome/toolbars

export const ScreenGuard = ({ children }: { children: React.ReactNode }) => {
  const [isInvalid, setIsInvalid] = useState(false);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const checkScreen = () => {
      const { innerWidth, innerHeight } = window;
      const isPortrait = innerHeight > innerWidth;

      if (isPortrait) {
        setIsInvalid(true);
        setReason('PORTRAIT_MODE_DETECTED');
        return;
      }

      if (innerWidth < MIN_WIDTH) {
        setIsInvalid(true);
        setReason(`RESOLUTION_WIDTH_LOW (${innerWidth} < ${MIN_WIDTH})`);
        return;
      }

      if (innerHeight < MIN_HEIGHT) {
        setIsInvalid(true);
        setReason(`RESOLUTION_HEIGHT_LOW (${innerHeight} < ${MIN_HEIGHT})`);
        return;
      }

      setIsInvalid(false);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isInvalid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-9999 bg-black text-red-500 font-mono flex flex-col items-center justify-center p-8 select-none"
          >
            <div className="max-w-2xl w-full border-2 border-red-500/50 p-8 rounded-lg bg-red-950/10 backdrop-blur-sm shadow-[0_0_50px_rgba(220,38,38,0.2)]">
              <div className="flex items-center gap-4 mb-8">
                <MonitorX className="w-16 h-16 animate-pulse" />
                <div>
                  <h1 className="text-4xl font-bold tracking-tighter">SYSTEM HALT</h1>
                  <p className="text-xl opacity-75">DISPLAY_OUTPUT_INVALID</p>
                </div>
              </div>

              <div className="space-y-4 text-lg border-t border-red-500/30 pt-6">
                <p>
                  <span className="opacity-50 mr-4">ERROR_CODE:</span>
                  <span className="font-bold">{reason}</span>
                </p>
                <p>
                  <span className="opacity-50 mr-4">REQUIRED:</span>
                  <span>{MIN_WIDTH}x{MIN_HEIGHT} (LANDSCAPE)</span>
                </p>
                <p>
                  <span className="opacity-50 mr-4">CURRENT:</span>
                  <span>{window.innerWidth}x{window.innerHeight}</span>
                </p>
              </div>

              <div className="mt-12 text-sm opacity-50 text-center animate-pulse">
                PLEASE ROTATE DEVICE OR RESIZE WINDOW TO CONTINUE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={isInvalid ? 'blur-sm grayscale opacity-20 pointer-events-none' : ''}>
        {children}
      </div>
    </>
  );
};

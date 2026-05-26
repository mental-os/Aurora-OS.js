import { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PHYSICAL_IO_EVENT, PhysicalIOOp } from '@/utils/memory';

interface PhysicalIOEventDetail {
    detail: {
        op: PhysicalIOOp;
        active: boolean;
    };
}

export function StorageIndicator() {
    const [active, setActive] = useState<PhysicalIOOp | null>(null);

    useEffect(() => {
        const handleIO = (e: Event) => {
            const customEvent = e as unknown as PhysicalIOEventDetail;
            const { op, active: isIoActive } = customEvent.detail;

            if (isIoActive) {
                setActive(op);
            } else {
                // Short delay before hiding to prevent fast flickering on small writes
                setTimeout(() => setActive(null), 300);
            }
        };

        window.addEventListener(PHYSICAL_IO_EVENT, handleIO);

        return () => {
            window.removeEventListener(PHYSICAL_IO_EVENT, handleIO);
        };
    }, []);

    return (
        <AnimatePresence>
            {active && (
                <div className="fixed bottom-4 left-4 z-99999 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-white/10 backdrop-blur-md shadow-lg"
                    >
                        <HardDrive
                            className={`w-3 h-3 ${active === 'save' ? 'text-red-400' : 'text-emerald-400'}`}
                        />
                        <span className={`text-[10px] font-mono font-medium uppercase ${active === 'save' ? 'text-red-400/80' : 'text-emerald-400/80'}`}>
                            {active === 'save' ? 'SAVE' : 'LOAD'}
                        </span>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

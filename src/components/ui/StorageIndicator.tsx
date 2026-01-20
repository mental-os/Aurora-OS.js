import { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORAGE_EVENT, StorageOperation } from '@/utils/memory';

interface StorageEventDetail {
    detail: {
        op: StorageOperation;
    };
}

export function StorageIndicator() {
    const [active, setActive] = useState<StorageOperation | null>(null);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleStorage = (e: Event) => {
            const customEvent = e as unknown as StorageEventDetail;
            const op = customEvent.detail.op;
            
            // Don't show indicator for 'clear' as it's rare/instant
            if (op === 'clear') return;

            setActive(op);

            // Reset after delay
            clearTimeout(timeout);
            timeout = setTimeout(() => setActive(null), 500);
        };

        window.addEventListener(STORAGE_EVENT, handleStorage);

        return () => {
            window.removeEventListener(STORAGE_EVENT, handleStorage);
            clearTimeout(timeout);
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
                            className={`w-3 h-3 ${active === 'write' ? 'text-red-400' : 'text-emerald-400'}`} 
                        />
                        <span className={`text-[10px] font-mono font-medium uppercase ${active === 'write' ? 'text-red-400/80' : 'text-emerald-400/80'}`}>
                            {active === 'write' ? 'SAVE' : 'LOAD'}
                        </span>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

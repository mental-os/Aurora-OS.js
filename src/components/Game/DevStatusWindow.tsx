import { motion } from 'framer-motion';
import { Bug, Github, MessageSquare, AlertTriangle } from 'lucide-react';
import { feedback } from '@/services/soundFeedback';
import { cn } from '@/components/ui/utils';
import pkg from '@/../package.json';

interface DevStatusWindowProps {
    className?: string;
}

export function DevStatusWindow({ className }: DevStatusWindowProps) {
    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: 40, y: 40, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            className={cn(
                "fixed top-12 left-12 z-60 w-72 pointer-events-auto",
                "bg-black font-mono text-white overflow-hidden",
                // Double stroke style: white (main) -> black (outer) + shadow
                // We removed the innermost 1px black shadow so the white title bar stays clean
                "shadow-[0_0_0_2px_white,0_0_0_3px_black,8px_8px_0_0_rgba(0,0,0,0.5)]",
                className
            )}
        >
            {/* Header / Drag Handle */}
            <div className="flex items-center justify-between p-3 bg-white text-black cursor-grab active:cursor-grabbing select-none">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">BUILD_STATUS: EXPERIMENTAL</span>
                </div>
            </div>

            {/* Content Area with inner black stroke */}
            <div className="border-t border-black bg-black p-4 space-y-4">
                <div className="flex justify-center">
                    <div className="p-3 border-2 border-white bg-white/5 text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
                        <Bug className="w-8 h-8" />
                    </div>
                </div>

                <div className="space-y-2 text-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white decoration-white/30">Developer Build</h3>
                    <p className="text-[10px] text-white/60 leading-relaxed">
                        This is an experimental version, still work in progress. Bugs, incomplete systems, and visual inconsistencies are expected.
                    </p>
                </div>

                {/* CTAs */}
                <div className="grid gap-2">
                    <a
                        href="https://discord.gg/AtAVfRDYhG"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => feedback.click()}
                        className="flex items-center justify-center gap-2 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:border-white hover:text-white transition-all border-2 border-transparent"
                    >
                        <MessageSquare className="w-3 h-3" />
                        Join Discord
                    </a>
                    <a
                        href={pkg.homepage}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => feedback.click()}
                        className="flex items-center justify-center gap-2 py-2 border-2 border-white/20 text-white text-[10px] font-bold uppercase tracking-widest hover:border-white hover:bg-white/5 transition-all"
                    >
                        <Github className="w-3 h-3" />
                        Contribute
                    </a>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 px-4 border-t border-white/20 bg-zinc-950 text-[8px] text-white/40 uppercase tracking-[0.2em] flex justify-between">
                <span>v{pkg.version}</span>
                <span>SYSTEM_READY</span>
            </div>
        </motion.div>
    );
}

import { ReactNode } from 'react';
import { ShieldCheck, AlertTriangle, Orbit } from 'lucide-react';
import { motion } from 'framer-motion';
import pkg from '../../../package.json';
import { validateIntegrity } from '../../utils/integrity';
import { useAppContext } from '../AppContext';
import { ConnectivityBadge } from '../ui/ConnectivityBadge';
import background from '../../assets/images/background.png';
import { useI18n } from '../../i18n';

interface GameScreenLayoutProps {
    children: ReactNode;
    footerActions?: ReactNode;
    className?: string;
    zIndex?: number;
}

export function GameScreenLayout({ children, footerActions, className = "", zIndex = 40 }: GameScreenLayoutProps) {
    const { accentColor } = useAppContext();
    const { t } = useI18n();

    return (
        <div
            className={`fixed inset-0 bg-cover bg-center font-mono flex flex-col ${className}`}
            style={{
                zIndex,
                backgroundImage: `url(${background})`
            }}
        >
            {/* Backdrop Blur Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

            {/* Content Area */}
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-12">

                {/* Unified Header */}
                <div className="flex flex-col items-center mb-16 animate-in fade-in zoom-in-95 duration-1000">
                    <motion.div
                        whileHover="hover"
                        initial="initial"
                        className="relative w-40 h-40 flex items-center justify-center mx-auto mb-2 group cursor-pointer"
                    >
                        {/* Deep Atmospheric Halo (Breathing) */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.15, 0.3, 0.15]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full blur-[80px]"
                            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                        />

                        {/* Interactive Large Aura (Hover Only) */}
                        <motion.div
                            variants={{
                                hover: { scale: 1.4, opacity: 0.4 }
                            }}
                            className="absolute inset-0 rounded-full blur-3xl opacity-0 transition-opacity duration-700"
                            style={{ backgroundColor: accentColor }}
                        />

                        {/* Glass Orb Shell */}
                        <motion.div
                            variants={{
                                hover: {
                                    scale: 1.1,
                                    borderColor: "rgba(255,255,255,0.3)",
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                    boxShadow: `0 0 50px ${accentColor}33`
                                }
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="absolute inset-6 rounded-full border border-white/10 backdrop-blur-3xl bg-white/5 shadow-2xl flex items-center justify-center overflow-hidden"
                        />

                        {/* The Orbit Icon (Hero) */}
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.15, 1, 1.2, 1]
                            }}
                            transition={{
                                rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                                scale: {
                                    duration: 3,
                                    repeat: Infinity,
                                    times: [0, 0.05, 0.12, 0.2, 1],
                                    ease: "easeInOut"
                                }
                            }}
                            variants={{
                                hover: {
                                    scale: 1.3,
                                    filter: "drop-shadow(0 0 30px rgba(255,255,255,0.7))"
                                }
                            }}
                            className="absolute inset-0 z-10 flex items-center justify-center"
                        >
                            <Orbit
                                size={48}
                                strokeWidth={1.5}
                                className="text-white"
                            />
                        </motion.div>

                        {/* Inner Core Light - Center Indexed */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-4 h-4 rounded-full blur-md"
                                style={{ backgroundColor: accentColor }}
                            />
                        </div>
                    </motion.div>

                    <h1 className="text-6xl font-bold tracking-tighter mb-2 text-white drop-shadow-lg">
                        AURORA <span className="font-light opacity-70">OS</span>
                    </h1>
                    <div className="flex items-center gap-4 text-white/50 text-sm tracking-[0.2em] uppercase">
                        <span>Nova Republika</span>
                        <span>•</span>
                        <span>per aspera ad astra</span>
                    </div>
                </div>

                {/* Main Content */}
                {children}
            </div>

            {/* Unified Footer */}
            <div className="relative z-20 pb-6 text-center flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-white/10">•</span>
                    {validateIntegrity() ? (
                        <span className="text-emerald-500/50 flex items-center gap-1.5 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                            <ShieldCheck className="w-3 h-3" /> {t('game.footer.originalDistribution')}
                        </span>
                    ) : (
                        <span className="text-red-500 flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> {t('game.footer.temperedDistribution')}
                        </span>
                    )}
                    <span className="text-white/10">•</span>
                    <ConnectivityBadge />
                </div>

                <div className="flex gap-4 text-xs font-mono text-white/10">
                    {footerActions || (
                        <>
                            <span>{pkg.build.productName}</span>
                            <span>•</span>
                            <a
                                href="https://github.com/mental-os/Aurora-OS.js"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/20 hover:text-white/50 transition-colors"
                            >
                                v{pkg.version}
                            </a>
                            <span>•</span>
                            <span>Nova Republika IS</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

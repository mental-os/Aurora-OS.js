import { ReactNode } from "react";
import { ShieldCheck, AlertTriangle, Orbit } from "lucide-react";
import { motion } from "motion/react";
import pkg from "../../../package.json";
import { validateIntegrity } from "../../utils/integrity";
import { ConnectivityBadge } from "../ui/ConnectivityBadge";
import { useI18n } from "../../i18n/index";
import { useAppContext } from "../AppContext";
import background from "../../assets/images/background.png"; // Restored legacy background

interface GameScreenLayoutProps {
    children: ReactNode;
    footerActions?: ReactNode;
    className?: string;
    zIndex?: number;
    mode?: 'terminal' | 'glass'; // New prop
}

export function GameScreenLayout({
    children,
    footerActions,
    className = "",
    zIndex = 40,
    mode = 'terminal', // Default to terminal
}: GameScreenLayoutProps) {
    const { t } = useI18n();
    const { accentColor } = useAppContext();

    // Terminal Styles (Current)
    const terminalStyle = {
        // Creative Background: Vignette + clearer Dots + subtle bottom glow
        backgroundImage: `
          radial-gradient(circle at center, transparent 30%, #000 100%),
          radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
          radial-gradient(circle at 50% 100%, rgba(30,30,50,0.4) 0%, transparent 60%)
        `,
        backgroundSize: '100% 100%, 20px 20px, 100% 100%',
        backgroundPosition: 'center, 0 0, center'
    };

    // Glass Styles (Restored)
    const glassStyle = {
        backgroundImage: `url(${background})`,
    };

    return (
        <div
            className={`fixed inset-0 flex flex-col ${mode === 'glass' ? 'bg-cover bg-center font-sans overflow-y-auto overflow-x-hidden' : 'bg-black font-mono overflow-hidden'} ${className}`}
            style={{
                zIndex,
                ...(mode === 'terminal' ? terminalStyle : glassStyle)
            }}
        >
            {/* Glass Mode: Backdrop Overlay */}
            {mode === 'glass' && <div className="fixed inset-0 bg-black/40 backdrop-blur-md pointer-events-none" />}
            {/* Unified Flex Column - Distributed Vertical Space */}
            <div className={`relative z-20 flex flex-col items-center justify-start h-full w-full max-h-screen p-6 sm:p-12 pb-8 overflow-hidden`}>


                {/* Spacer Top -> Logo */}
                <div className="flex-1" />

                {/* Unified Header */}
                <div className={`flex flex-col items-center select-none shrink-0 relative z-0 ${mode === 'glass' ? 'mb-4 md:mb-8 animate-in fade-in zoom-in-95 duration-1000' : 'justify-start animate-in fade-in zoom-in-95 duration-1000'}`}>

                    {/* MODE: TERMINAL (ASCII Logo with Retro Stripes) */}
                    {mode === 'terminal' && (
                        <div className="flex items-center max-w-full justify-center relative">
                            {/* Demo-Scene ASCII Orb - High Fidelity Diagonal Slices */}


                            <div className="flex flex-col items-center shrink min-w-0">
                                <div className="flex items-start justify-center">
                                    <pre
                                        className="font-bold text-white whitespace-pre font-mono leading-none"
                                        style={{
                                            fontSize: 'clamp(14px, 1.22vw, 32px)',
                                            marginBottom: 'min(1.2vh, 10px)'
                                        }}
                                    >
                                        {`
 █████╗ ██╗   ██╗██████╗  ██████╗ ██████╗  █████╗      
██╔══██╗██║   ██║██╔══██╗██╔═══██╗██╔══██╗ ╚════╝     
███████║██║   ██║██████╔╝██║   ██║██████╔╝███████║    
██╔══██║██║   ██║██╔══██╗██║   ██║██╔══██╗███████║    
██║  ██║╚██████╔╝██║  ██║╚██████╔╝██║  ██║███ ███║    
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝    `}
                                    </pre>
                                    <pre
                                        className="font-bold whitespace-pre font-mono leading-none"
                                        style={{
                                            fontSize: 'clamp(14px, 1.22vw, 32px)',
                                            marginBottom: 'min(1.2vh, 10px)',
                                            background: 'linear-gradient(135deg, #00ffff 0% 33%, #00ffff 33%, #8a2be2 33% 66%, #8a2be2 66%, #ff00ff 66% 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        {`
██████╗ ███████╗
██╔═══██╗██╔════╝
██║   ██║███████╗
██║   ██║╚════██║
╚██████╔╝███████╗
 ╚═════╝ ╚══════╝`}
                                    </pre>
                                </div>

                                <div className="flex flex-col items-center text-white/40 uppercase text-center font-bold"
                                    style={{ gap: 'min(1vh, 8px)', fontSize: 'clamp(12px, 1vw, 24px)', letterSpacing: '0.2em' }}>
                                    <div className="flex items-center" style={{ gap: 'min(1vh, 8px)' }}>
                                        <span className="bg-white/40 rounded-full" style={{ width: 'clamp(3px, 0.25vw, 5px)', height: 'clamp(3px, 0.25vw, 5px)' }} />
                                        <span>NOVA REPUBLIKA</span>
                                        <span className="bg-white/40 rounded-full" style={{ width: 'clamp(3px, 0.25vw, 5px)', height: 'clamp(3px, 0.25vw, 5px)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE: GLASS (Restored Animated Orb) */}
                    {mode === 'glass' && (
                        <>
                            <motion.div
                                whileHover="hover"
                                initial="initial"
                                className="relative w-24 h-24 md:w-40 md:h-40 flex items-center justify-center mx-auto mb-6 group cursor-pointer"
                            >
                                {/* Deep Atmospheric Halo (Breathing) */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.15, 0.3, 0.15],
                                    }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 rounded-full blur-2xl md:blur-[80px]"
                                    style={{
                                        background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                                    }}
                                />

                                {/* Interactive Large Aura (Hover Only) */}
                                <motion.div
                                    variants={{
                                        hover: { scale: 1.4, opacity: 0.4 },
                                    }}
                                    className="absolute inset-0 rounded-full blur-2xl md:blur-3xl opacity-0 transition-opacity duration-700"
                                    style={{ backgroundColor: accentColor }}
                                />

                                {/* Glass Orb Shell */}
                                <motion.div
                                    variants={{
                                        hover: {
                                            scale: 1.1,
                                            borderColor: "rgba(255,255,255,0.3)",
                                            backgroundColor: "rgba(255,255,255,0.08)",
                                            boxShadow: `0 0 50px ${accentColor}33`,
                                        },
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="absolute inset-4 md:inset-6 rounded-full border border-white/10 backdrop-blur-3xl bg-white/5 shadow-2xl flex items-center justify-center overflow-hidden"
                                />

                                {/* The Orbit Icon (Hero) */}
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                        scale: [1, 1.15, 1, 1.2, 1],
                                    }}
                                    transition={{
                                        rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                                        scale: {
                                            duration: 3,
                                            repeat: Infinity,
                                            times: [0, 0.05, 0.12, 0.2, 1],
                                            ease: "easeInOut",
                                        },
                                    }}
                                    variants={{
                                        hover: {
                                            scale: 1.3,
                                            filter: "drop-shadow(0 0 30px rgba(255,255,255,0.7))",
                                        },
                                    }}
                                    className="absolute inset-0 z-10 flex items-center justify-center"
                                >
                                    <Orbit
                                        size={32}
                                        strokeWidth={1.5}
                                        className="text-white md:w-16 md:h-16 w-10 h-10"
                                    />
                                </motion.div>

                                {/* Inner Core Light - Center Indexed */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <motion.div
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="w-3 h-3 md:w-4 md:h-4 rounded-full blur-md"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                </div>
                            </motion.div>

                            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2 text-white drop-shadow-lg text-center">
                                AURORA <span className="font-light opacity-70">OS</span>
                            </h1>
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-white/50 text-xs md:text-sm tracking-[0.2em] uppercase text-center">
                                <span>Nova Republika</span>
                                <span className="hidden md:inline">•</span>
                                <span>per aspera ad astra</span>
                            </div>
                        </>
                    )}

                </div>


                {/* Spacer Logo -> Content */}
                <div className="flex-1" />

                {/* Main Content */}
                <div className={`w-full flex justify-center items-center shrink min-h-0 relative z-100`}>
                    {children}
                </div>


                {/* Spacer Content -> Footer */}
                <div className="flex-1" />

                {/* Unified Footer */}
                <div className={`shrink-0 text-center flex flex-col gap-2 items-center w-full max-w-lg relative z-10`}>
                    <div className={`flex flex-col justify-center items-center gap-2 ${mode === 'glass' ? 'text-xs font-mono' : 'w-full text-[10px] uppercase font-mono text-white/30 tracking-widest'}`}>

                        {/* Row 1: Integrity & Connectivity (ALWAYS VISIBLE) */}
                        <div className={`flex items-center ${mode === 'glass' ? 'gap-2' : 'gap-4'}`}>
                            {mode === 'terminal' ? (
                                /* TERMINAL STYLE BADGES */
                                <>
                                    {validateIntegrity() ? (
                                        <span className="text-emerald-500/50 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span className="hidden sm:inline">{t("game.footer.originalDistribution")}</span>
                                            <span className="sm:hidden">VALID</span>
                                        </span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1.5">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>INVALID</span>
                                        </span>
                                    )}
                                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                                    <ConnectivityBadge />
                                </>
                            ) : (
                                /* GLASS STYLE BADGES (Pill Design) */
                                <>
                                    <span className="text-white/10 hidden md:inline">•</span>
                                    {validateIntegrity() ? (
                                        <span className="text-emerald-500/50 flex items-center gap-1.5 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span className="hidden sm:inline">{t("game.footer.originalDistribution")}</span>
                                            <span className="sm:hidden">Valid</span>
                                        </span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span className="hidden sm:inline">{t("game.footer.temperedDistribution")}</span>
                                            <span className="sm:hidden">Invalid</span>
                                        </span>
                                    )}
                                    <span className="text-white/10">•</span>
                                    <ConnectivityBadge />
                                </>
                            )}
                        </div>

                        {/* Row 2: Actions OR Default Infos */}
                        <div className={`flex items-center justify-center ${mode === 'glass' ? 'gap-2 md:gap-4 text-[10px] md:text-xs font-mono text-white/50' : 'gap-2 text-white/20'}`}>
                            {footerActions || (
                                <>
                                    <span>©2025 <a href={pkg.homepage} target="_blank" rel="noreferrer" className="hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">{pkg.build.productName} {pkg.version}</a> // <a href="https://instagram.com/mental.os" target="_blank" rel="noreferrer" className="hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">mental.os()</a> // <a href="https://facebook.com/dopepxls" target="_blank" rel="noreferrer" className="hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Dope Pixels</a><br/>
                                    Open-source (<a href="https://github.com/mental-os/Aurora-OS.js/blob/main/LICENSE" target="_blank" rel="noreferrer" className="hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">{pkg.license}</a>) · All rights reserved beyond license terms</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

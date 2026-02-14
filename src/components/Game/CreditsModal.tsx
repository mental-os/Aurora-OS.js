import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Wrench, Palette, Book, FlaskConical, Sprout, Sparkles, Bug, Github, Globe } from 'lucide-react';
import pkg from '@/../package.json';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';

interface CreditsModalProps {
    onClose: () => void;
}

interface Contributor {
    name: string;
    role?: string;
    github?: string;
    website?: string;
    description?: string;
    socials?: { label: string; url: string }[];
}

interface ContributorCategory {
    id: string; // Added for tab mapping
    title: string;
    icon: React.ElementType;
    type?: 'people' | 'text' | 'special' | 'mixed';
    contributors?: Contributor[];
    content?: React.ReactNode;
}

const CREDITS_DATA: ContributorCategory[] = [
    {
        id: 'core',
        title: "Core Team",
        icon: Brain,
        type: 'people',
        contributors: [
            {
                name: "Cătălin-Robert Drăgoiu // mental.os()",
                role: "Creator & Maintainer",
                github: "https://github.com/mental-os",
                description: "Concept, architecture, design, narrative direction",
                socials: [
                    { label: "IG/mental.os", url: "https://www.instagram.com/mental.os" },
                    { label: "LI/dragoiurobert", url: "https://www.linkedin.com/in/dragoiurobert" },
                ]
            }
        ]
    },
    {
        id: 'design',
        title: "Design & UX",
        icon: Palette,
        type: 'text',
        content: "(Visual systems, interaction concepts, UI explorations)"
    },
    {
        id: 'docs',
        title: "Docs",
        icon: Book,
        type: 'text',
        content: "(Guides, explanations, onboarding, clarifications)"
    },
    {
        id: 'testing',
        title: "Testing",
        icon: FlaskConical,
        type: 'text',
        content: "(Bug reports, edge cases, usability insights)"
    },
    {
        id: 'legacy',
        title: "Early Builders",
        icon: Sprout,
        type: 'text',
        content: "People who helped shape Aurora-OS.js in its early experimental phase — through feedback, discussion, or belief."
    },
    {
        id: 'community',
        title: "Community",
        icon: Wrench,
        type: 'people',
        contributors: [
            { name: "Oklyne", role: "Code, Translation, Testing", github: "https://github.com/oklyne" },
            { name: "dannie203", role: "Code, Translation, Testing", github: "https://github.com/dannie203" },
            {
                name: "nirgranthi",
                role: "Code",
                github: "https://github.com/nirgranthi",
                socials: [{ label: "IG/s.a.u.r.a.b_", url: "https://www.instagram.com/s.a.u.r.a.b_" }]
            },
            { name: "masterofmagic999", role: "Code, Testing", github: "https://github.com/masterofmagic999" },
            { name: "Marcx5", role: "Code", github: "https://github.com/Marcx5" },
            {
                name: "0xGP // gaupoit",
                role: "Code",
                github: "https://github.com/gaupoit",
                socials: [{ label: "Website", url: "https://www.instagram.com/0xgp" }]
            },
            { name: "मृत्यु // mriityu", role: "Code, Testing", github: "https://github.com/mriityu" },
            {
                name: "Swarit Garewal // GDEV SGBHAI",
                role: "Code, Security",
                github: "https://github.com/SGBHAI",
                socials: [{ label: "IG/garewal.swarit", url: "https://www.instagram.com/garewal.swarit" }]
            },
        ]
    },
    {
        id: 'special',
        title: "Special Thanks",
        icon: Sparkles,
        type: 'special',
        content: (
            <div className="text-white/70 leading-relaxed text-sm">
                To BigD, <a href="https://github.com/hydroflame" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Hydroflame</a>,
                and the active contributors of <a href="https://github.com/hydroflame/bitburner-src" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Bitburner</a>,{" "}
                <a href="https://github.com/viccano" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Victor Cano</a> and players like{" "}
                <a href="https://www.reddit.com/user/reditO" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Michael Ray / reditO</a> of{" "}
                <a href="https://store.steampowered.com/app/605230/Grey_Hack/" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Grey Hack</a>,{" "}
                <a href="https://github.com/andersevenrud" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Anders Evenrud</a> of{" "}
                <a href="https://github.com/os-js/OS.js" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">OS.js</a>,{" "}
                Sean Mann // Drizzly Bear of <a href="https://store.steampowered.com/app/469920/hackmud/" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Hackmud</a>,{" "}
                <a href="https://github.com/eriksvedang" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Erik Svedäng</a> of{" "}
                <a href="https://store.steampowered.com/app/400110/Else_HeartBreak/" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Else Heart.Break()</a>,
                and many others for inspiring me to create {pkg.build.productName}, and for keeping the genre alive with inspiring work and innovation.
                <br />
                <br />
                MOONHOUND Studio for incubation, sponsorship and guidance.
            </div>
        )
    },
    {
        id: 'opensource',
        title: "Opensource",
        icon: Globe,
        type: 'mixed',
        contributors: [
            { name: "Eric Matyas", role: "Sound Effects", website: "https://soundimage.org/" }
        ],
        content: (
            <div className="space-y-8">
                <div className="text-white/70 leading-relaxed text-sm">
                    Thinking about building a similar project? <br />
                    <a href={pkg.homepage} target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">{pkg.build.productName}</a> is
                    a commercial product, but it is built for educational purposes and is fully open-source. We believe in the power of shared knowledge
                    and collaborative innovation.
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Core Framework</h4>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://react.dev/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">React 19</a>
                            <a href="https://vitejs.dev/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">Vite</a>
                            <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">TypeScript</a>
                            <a href="https://www.electronjs.org/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">Electron</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">UI & Design System</h4>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">Tailwind v4</a>
                            <a href="https://ui.shadcn.com/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">shadcn/ui</a>
                            <a href="https://www.radix-ui.com/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">Radix UI</a>
                            <a href="https://lucide.dev/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">Lucide</a>
                            <a href="https://motion.dev/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">Motion</a>
                            <a href="https://sonner.emilkowal.ski/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">Sonner</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Audio & Utilities</h4>
                        <div className="flex flex-wrap gap-2">
                            <a href="https://howlerjs.com/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">Howler.js</a>
                            <a href="https://date-fns.org/" target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/5 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-wider border border-white/10">date-fns</a>
                        </div>
                    </div>
                </div>

                <div className="text-[10px] font-mono text-white/30 border-t border-white/10 pt-4">
                    Full dependency list available in <a href="https://github.com/mental-os/Aurora-OS.js/blob/main/OPEN-SOURCE.md" target="_blank" rel="noreferrer" className="text-white/50 hover:text-white decoration-white/30">OPEN-SOURCE.md</a>
                </div>
            </div>
        )
    }
];

export function CreditsModal({ onClose }: CreditsModalProps) {
    const [activeTab, setActiveTab] = useState<string>('core');

    // Add 'Contribute' as a virtual tab for the UI
    const tabs = useMemo(() => [
        ...CREDITS_DATA.map(c => ({ id: c.id, label: c.title, icon: c.icon })),
        { id: 'contribute', label: 'Contribute', icon: Bug }
    ], []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveTab(prev => {
                    const currentIndex = tabs.findIndex(t => t.id === prev);
                    let nextIndex;
                    if (e.key === 'ArrowUp') {
                        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    } else {
                        nextIndex = (currentIndex + 1) % tabs.length;
                    }
                    feedback.hover();
                    return tabs[nextIndex].id;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, tabs]);

    const activeCategory = CREDITS_DATA.find(c => c.id === activeTab);
    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="terminal-card max-w-4xl w-full shadow-2xl relative flex flex-col overflow-hidden max-h-[85vh] font-mono text-white"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white bg-black">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white text-black border border-white">
                            <Sparkles className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-widest uppercase">Credits</h2>
                            <p className="text-xs text-white/50 uppercase tracking-widest font-mono mt-0.5">{pkg.build.productName} v{pkg.version}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { feedback.click(); onClose(); }}
                        className="p-2 hover:bg-white hover:text-black transition-colors border border-transparent hover:border-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-black border-r border-white p-4 space-y-1.5 overflow-y-auto custom-scrollbar shrink-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { feedback.click(); setActiveTab(tab.id); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-100 border-2",
                                    activeTab === tab.id
                                        ? "bg-white text-black border-white shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]"
                                        : "bg-black text-white/50 border-transparent hover:border-white/50 hover:text-white"
                                )}
                            >
                                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-black" : "text-white/50")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto bg-black bg-size-[16px_16px] bg-[radial-gradient(#ffffff1a_1px,transparent_1px)]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.1 }}
                                className={cn("outline-none", activeTab === 'contribute' ? "h-full" : "min-h-full")}
                            >
                                {activeTab === 'contribute' ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                                        <div className="p-6 border-2 border-white bg-white/5 text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
                                            <Bug className="w-12 h-12" />
                                        </div>
                                        <div className="space-y-4 max-w-md">
                                            <h3 className="text-2xl font-bold uppercase tracking-widest text-white">Contribute</h3>
                                            <p className="text-white/60 leading-relaxed text-sm">
                                                <a href={pkg.homepage} target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">{pkg.build.productName}</a> is shared with {pkg.license} license.<br />
                                                Help us squash bugs, improve performance, or design the next big feature.
                                            </p>
                                        </div>
                                        <a
                                            href="https://github.com/mental-os/Aurora-OS.js/issues"
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => feedback.click()}
                                            className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-transparent transition-all border-2 border-transparent hover:border-white hover:text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]"
                                        >
                                            Report Issue on GitHub
                                        </a>
                                    </div>
                                ) : activeCategory ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-white/20">
                                            <activeCategory.icon className="w-6 h-6 text-white/40" />
                                            <h3 className="text-2xl font-bold uppercase tracking-widest text-white">{activeCategory.title}</h3>
                                        </div>

                                        {/* Variant: People (Grid) */}
                                        {activeCategory.contributors && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {activeCategory.contributors.map((contributor) => (
                                                    <div
                                                        key={contributor.name}
                                                        className="group relative p-5 bg-black border border-white/20 hover:border-white transition-all flex flex-col gap-3 shadow-none hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-bold text-lg text-white group-hover:text-black group-hover:bg-white inline-block px-1 transition-colors uppercase">
                                                                    {contributor.name}
                                                                </div>
                                                                {contributor.role && (
                                                                    <div className="text-xs font-mono text-white/50 uppercase tracking-wider mt-1 border-l-2 border-white/20 pl-2">
                                                                        {contributor.role}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {contributor.github && (
                                                                <a
                                                                    href={contributor.github}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="p-1 hover:bg-white hover:text-black text-white/40 transition-colors border border-transparent hover:border-white"
                                                                    title="GitHub Profile"
                                                                >
                                                                    <Github className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                            {contributor.website && (
                                                                <a
                                                                    href={contributor.website}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="p-1 hover:bg-white hover:text-black text-white/40 transition-colors border border-transparent hover:border-white"
                                                                    title="Website"
                                                                >
                                                                    <Globe className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                        </div>

                                                        {contributor.description && (
                                                            <p className="text-[10px] text-white/60 leading-relaxed border-t border-white/10 pt-2 mt-1">
                                                                {contributor.description}
                                                            </p>
                                                        )}

                                                        {contributor.socials && contributor.socials.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-auto pt-2">
                                                                {contributor.socials.map((social) => (
                                                                    <a
                                                                        key={social.url}
                                                                        href={social.url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-[10px] px-2 py-1 bg-zinc-900 hover:bg-white hover:text-black text-zinc-500 border border-zinc-800 hover:border-white transition-all uppercase tracking-wider"
                                                                    >
                                                                        {social.label}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Variant: Special / Content (Boxed) */}
                                        {(activeCategory.type === 'special' || activeCategory.type === 'mixed') && activeCategory.content && (
                                            <div className={cn(
                                                "bg-zinc-950 border border-zinc-800 p-8 leading-loose text-white/80 font-mono text-sm shadow-inner",
                                                activeCategory.type === 'mixed' && "mt-8"
                                            )}>
                                                {activeCategory.content}
                                            </div>
                                        )}

                                        {/* Variant: Text (Simple Centered) */}
                                        {activeCategory.type === 'text' && activeCategory.content && (
                                            <div className="px-1 py-8">
                                                <p className="text-white/60 italic leading-relaxed text-lg font-serif opacity-80 text-center border-l-2 border-white/20 pl-6">
                                                    {activeCategory.content}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white bg-black text-[10px] text-white/40 font-mono tracking-widest flex justify-between items-start px-4">
                    <span className="text-left text-[10px] leading-tight">
                        <span className="uppercase">©2025 <a href={pkg.homepage} target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">{pkg.build.productName}</a> // <a href="https://instagram.com/mental.os" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">mental.os()</a> // <a href="https://facebook.com/dopepxls" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">Dope Pixels</a> // MOONHOUND Studio</span><br />
                        {pkg.build.productName} and its original concepts, architecture, and visual identity are protected by copyright.<br />
                        Source code is licensed under {pkg.license}. See <a href="https://github.com/mental-os/Aurora-OS.js/blob/main/LICENSE" target="_blank" rel="noreferrer" className="text-white hover:text-(--accent-user) decoration-white/30 hover:decoration-(--accent-user)">LICENSE</a> for details.
                    </span>
                    <span>{activeTab.toUpperCase()}</span>
                </div>
            </motion.div>
        </div>
    );
}

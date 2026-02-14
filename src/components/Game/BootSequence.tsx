import { useEffect, useState, useRef } from 'react';
import pkg from '../../../package.json';
import { validateIntegrity } from '../../utils/integrity';
import { getHardwareInfo } from '../../utils/hardware';
import { soundManager } from '../../services/sound';
import { APP_REGISTRY } from '../../config/appRegistry';

interface BootSequenceProps {
    onComplete: () => void;
}

interface LogEntry {
    time: string;
    source: string;
    message: string;
    highlight?: boolean;
    color?: string;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [progress, setProgress] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Format utility
    const fmt = (n: number) => n.toFixed(6);

    useEffect(() => {
        // Preload the OS chunk
        const loadOS = async () => {
            try {
                // Play BIOS start sound
                soundManager.play('biosStart');

                await import('../OS'); // Trigger the dynamic import
                setIsLoaded(true);
            } catch (e) {
                console.error("Failed to load OS chunk", e);
                // Proceed anyway, Suspense will catch it or error out
                setIsLoaded(true);
            }
        };
        loadOS();

        // --- Dynamic Log Generation ---
        const generateLogs = async (): Promise<LogEntry[]> => {
            const logs: LogEntry[] = [];
            let currentTime = 0.0;

            const add = (source: string, message: string, color?: string, highlight?: boolean, increment = 0.0) => {
                // Randomize time increment slightly for realism
                const timeStep = increment > 0 ? increment : Math.random() * 0.05 + 0.01;
                currentTime += timeStep;
                logs.push({
                    time: fmt(currentTime),
                    source,
                    message,
                    color,
                    highlight
                });
            };

            // BIOS / Hardware
            // 1. Fetch Real Hardware Info (Async)
            const hw = await getHardwareInfo();

            add('kernel', `${pkg.build.productName} version ${pkg.version}-generic (build@${pkg.name})`);
            add('kernel', `Command line: BOOT_IMAGE=/boot/vmlinuz-${pkg.version} root=UUID=7427-42A9 ro quiet splash`);
            add('kernel', `Detected CPU: ${hw.cpuModel} (${hw.cpuCores} Cores)`);
            add('kernel', `Memory: ${hw.memory} GiB System RAM`);
            add('gpu', `Graphics: ${hw.gpuRenderer}`, 'text-zinc-400');
            add('console', `Display: ${hw.screenResolution} (32-bit color)`, 'text-zinc-500');
            add('systemd[1]', `Detected architecture ${hw.platform}.`);
            add('systemd[1]', `Set hostname to <aurora-workstation>.`);

            // System Probes
            add('kernel', `Probing Hardware Capabilities...`, 'text-zinc-500');
            add('kernel', `Synchronizing System Clock (date-fns)...`, 'text-zinc-500');

            // Author/License Info
            const author = typeof pkg.author === 'string' ? pkg.author : (pkg.author as any)?.name;
            const nickname = (pkg as any).nickname;
            const distributor = nickname ? nickname : author;
            const isSecure = validateIntegrity();

            add('audit', `Facilitator: ${distributor}`, 'text-zinc-400');
            add('audit', `System Integrity: ${isSecure ? 'SECURE' : 'NON-SECURE (IDENTITY MISMATCH)'}`, isSecure ? 'text-cyan-400' : 'text-pink-500');
            add('audit', `CARAVANE ping: SUCCESS (HTTP Latency: ${Math.floor(Math.random() * 50 + 10)}ms)`, 'text-cyan-400');

            // Dependencies = System Modules
            const deps = pkg.dependencies as Record<string, string>;
            const devDeps = pkg.devDependencies as Record<string, string>;

            add('systemd[1]', 'Mounting Virtual File System...', undefined, true, 0.2);
            add('systemd[1]', 'Starting Packet Manager...', undefined, true, 0.2);

            // Mock "apt-get update" style logs
            Object.keys(deps).forEach((dep, index) => {
                if (Math.random() > 0.7) { // Only show some as "Hits"
                    add('apt[123]', `Hit:${index + 1} https://registry.mental.os/${dep} ${deps[dep]}`, 'text-cyan-600/50');
                }
            });

            add('systemd[1]', 'Reached target Local File Systems.', undefined, true, 0.4);

            // Map specific packages to "drivers"
            if (deps['react']) add('kernel', `Initializing React Fiber v${deps['react'].replace('^', '')}`, 'text-pink-400');
            if (deps['motion']) add('physics', `Calibrating Motion Engine (framer-motion)`, 'text-slate-300');
            if (deps['howler']) add('sound', `Loading Audio Driver (Howler.js)`, 'text-slate-300');
            if (deps['lucide-react']) add('gpu', `Hydrating Vector Icon Set (Lucide)`, 'text-slate-300');
            if (deps['@radix-ui/react-dialog']) add('ui', `Loading Accessible Primitives (Radix UI)`, 'text-slate-300');
            if (deps['tailwindcss']) add('style', `Initializing Oxide Engine (Tailwind v4)`, 'text-cyan-300');
            if (deps['sonner']) add('daemon', `Starting Notification Service (Sonner)`, 'text-slate-300');
            if (devDeps['typescript']) add('compiler', `Runtime Type Checks Enabled (TypeScript)`, 'text-cyan-300');
            if (devDeps['vite']) add('boot', `Vite Hot Module Replacement: Ready`, 'text-pink-400');

            // App Registry
            add('systemd[1]', `Hydrating React Context...`, undefined, true, 0.3);
            Object.keys(APP_REGISTRY).forEach((appId) => {
                const app = APP_REGISTRY[appId];
                add('registry', `Registered Application: ${app.name} (${app.id})`, 'text-zinc-600', false, 0.05);
            });

            // Final stages
            add('systemd[1]', 'Started Session c2 of user active-user.', undefined, true, 0.3);
            add('systemd[1]', 'Reached target Graphical Interface.', 'text-pink-400', true);
            add('kernel', `Startup finished in ${fmt(currentTime)}s.`);

            return logs;
        };

        // --- Execute Async Start ---
        let isCancelled = false;

        const startSequence = async () => {
            const fullSequence = await generateLogs();
            if (isCancelled) return;

            // --- Variable Speed Loop ---
            let currentIndex = 0;

            const processNextLine = () => {
                if (isCancelled || currentIndex >= fullSequence.length) return;

                const nextLog = fullSequence[currentIndex];
                setLogs(prev => [...prev, nextLog]);

                // Calculate progress based on index
                setProgress(Math.min(100, Math.floor(((currentIndex + 1) / fullSequence.length) * 100)));
                currentIndex++;

                if (currentIndex < fullSequence.length) {
                    // Determine delay for NEXT line
                    let delay = Math.random() * 50 + 20; // Default fast-ish
                    const msg = nextLog.message.toLowerCase();

                    if (msg.includes('hit:')) delay = 15; // Very fast scrolling (if any remains)
                    else if (msg.includes('initializing') || msg.includes('calibrating')) delay = 300; // Slow processing
                    else if (msg.includes('reached target')) delay = 200; // Pause for effect
                    else if (msg.includes('startup finished')) delay = 800; // Final pause

                    setTimeout(processNextLine, delay);
                }
            };

            // Start
            setTimeout(processNextLine, 100);
        };

        startSequence();

        return () => { isCancelled = true; };
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Check completion
    useEffect(() => {
        if (progress >= 100 && isLoaded) {
            const timer = setTimeout(onComplete, 1200); // Slightly longer pause at end
            return () => clearTimeout(timer);
        }
    }, [progress, isLoaded, onComplete]);

    return (
        <div className="fixed inset-0 bg-black text-slate-300 font-mono p-10 text-sm cursor-none z-45000 flex flex-col justify-between selection:bg-white selection:text-black">
            <div className="overflow-hidden flex-1 font-medium">
                {logs.map((log, i) => {
                    if (!log) return null; // Defensive check
                    return (
                        <div key={i} className="mb-[2px] wrap-break-words flex gap-3 opacity-90 hover:opacity-100 transition-opacity">
                            <span className="text-zinc-500 min-w-[100px] shrink-0">[{log.time}]</span>
                            <div className="flex gap-2">
                                <span className="text-pink-400 shrink-0">{log.source}:</span>
                                <span className={`${log.highlight ? 'text-white font-bold' : ''} ${log.color || 'text-slate-300'}`}>
                                    {log.message}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} className="h-4" />
            </div>

            <div className="w-full max-w-3xl mx-auto mb-12 opacity-80">
                <div className="h-1 w-full bg-zinc-900 border border-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-300 ease-out shadow-[0_0_10px_2px_rgba(255,255,255,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

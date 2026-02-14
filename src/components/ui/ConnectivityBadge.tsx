import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { checkLatency, isOnline } from '../../utils/network';

export function ConnectivityBadge() {
    const [online, setOnline] = useState(isOnline());
    const [ping, setPing] = useState<{ system: number | null, caravane: number | null } | null>(null);

    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial ping and periodic updates
        const updatePing = async () => {
            if (navigator.onLine) {
                const latency = await checkLatency();
                setPing(latency);
            } else {
                setPing(null);
            }
        };

        updatePing();
        const interval = setInterval(updatePing, 10000); // Check every 10 seconds

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    if (!online) {
        return (
            <span className="text-red-500 flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                <WifiOff className="w-3 h-3" /> CRVN Offline
            </span>
        );
    }

    const getPingColor = (sys: number | null, crvn: number | null) => {
        // Prefer system ping for color if available, else caravane
        const p = sys ?? crvn;
        if (p === null) return 'text-white/20 bg-white/5 border-white/10';
        if (p < 100) return 'text-emerald-500/50 bg-emerald-500/5 border-emerald-500/10';
        if (p < 250) return 'text-yellow-500/50 bg-yellow-500/5 border-yellow-500/10';
        return 'text-red-500/50 bg-red-500/5 border-red-500/10';
    };

    const colorClass = getPingColor(ping?.system ?? null, ping?.caravane ?? null);

    return (
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all duration-500 ${colorClass}`}>
            <Wifi className="w-3 h-3" />
            <div className="flex items-center text-[10px] font-mono leading-none">
                {/* System Ping */}
                {ping?.system !== null && ping?.system !== undefined && (
                    <span>SYS {ping.system}ms</span>
                )}

                {/* Separator */}
                {ping?.system !== null && ping?.system !== undefined && ping?.caravane !== null && ping?.caravane !== undefined && (
                    <span className="opacity-20 mx-2">|</span>
                )}

                {/* Caravane Ping - Full Opacity */}
                {ping?.caravane !== null && ping?.caravane !== undefined && (
                    <span>CRVN {ping.caravane}ms</span>
                )}

                {/* Connecting State */}
                {ping === null && (
                    <span>Connecting...</span>
                )}
            </div>
        </span>
    );
}

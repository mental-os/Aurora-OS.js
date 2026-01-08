import { useState, useEffect, useMemo } from 'react';
import { Cpu, Activity, Database } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';
import { useAppContext } from './AppContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useFileSystem } from './FileSystemContext';
import { calculateTotalRamUsage, RamUsageReport } from '../utils/resourceMonitor';
import { useI18n } from '../i18n';

interface ProcessItem {
    id: string;
    name: string;
    memoryMB: number;
    type: 'wired' | 'dormant' | 'active';
    description?: string;
    owner?: string;
    count?: number;
}

const TOTAL_MEMORY_GB = 2;
const TOTAL_MEMORY_MB = TOTAL_MEMORY_GB * 1024;

export function MemoryApplet() {
    const { disableShadows, reduceMotion, accentColor } = useAppContext();

    const { blurStyle, getBackgroundColor } = useThemeColors();
    const { currentUser } = useFileSystem();
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    
    // Polling State
    const [report, setReport] = useState<RamUsageReport | null>(null);

    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const updateReport = () => {
             setReport(calculateTotalRamUsage(currentUser));
        };

        // Initial fetch
        updateReport();

        const interval = setInterval(updateReport, 2000);

        return () => clearInterval(interval);
    }, [isOpen, currentUser]);

    // Process Data
    const { processes, stats, wiredMB, appMB } = useMemo(() => {
        if (!report || !currentUser) return { 
            processes: [], 
            stats: { usedMB: 0, percentage: 0 }, 
            wiredMB: 0, 
            appMB: 0 
        };

        const processList: ProcessItem[] = [];
        let totalWired = 0;
        let totalApp = 0;

        // 1. Process Breakdown
        report.breakdown.forEach(userSession => {
            const isCurrentUser = userSession.user === currentUser;

            // Session Base RAM -> Wired vs Dormant
            if (isCurrentUser) {
                processList.push({
                    id: `session-${userSession.user}`,
                    name: t('memory.systemWired'),
                    memoryMB: userSession.sessionRam,
                    type: 'wired',
                    description: t('memory.activeSession')
                });
                totalWired += userSession.sessionRam;
            } else {
                processList.push({
                    id: `session-${userSession.user}`,
                    name: t('memory.userSession', { user: userSession.user }),
                    memoryMB: userSession.sessionRam,
                    type: 'dormant',
                    description: t('memory.backgroundSession'),
                    owner: userSession.user
                });
            }

            // Apps RAM
            userSession.details.forEach((detail, idx) => {
                // Format: "[AppName] Type: SizeMB"
                const match = detail.match(/\[(.*?)\] (.*?): (\d+(\.\d+)?)MB/);
                if (match) {
                    const [, appName, typeDesc, sizeStr] = match;
                    const size = parseFloat(sizeStr);
                    
                    let description = typeDesc;
                    if (typeDesc === 'Main Window') {
                        description = t('memory.type.mainWindow');
                    } else if (typeDesc === 'Extra Window') {
                        description = t('memory.type.extraWindow');
                    } else {
                        const tabMatch = typeDesc.match(/(\d+) Extra Tabs/);
                        if (tabMatch) {
                             description = t('memory.type.extraTabs', { count: parseInt(tabMatch[1]) });
                        }
                    }

                    processList.push({
                        id: `app-${userSession.user}-${idx}`,
                        name: appName,
                        memoryMB: size,
                        type: isCurrentUser ? 'active' : 'dormant',
                        description,
                        owner: userSession.user
                    });

                    if (isCurrentUser) {
                        totalApp += size;
                    }
                }
            });
        });

        // 2. Sort: Wired > Dormant > Active, then Size Desc
        const typePriority = { wired: 3, dormant: 2, active: 1 };
        
        processList.sort((a, b) => {
            const typeDiff = typePriority[b.type] - typePriority[a.type];
            if (typeDiff !== 0) return typeDiff;
            return b.memoryMB - a.memoryMB;
        });

        const usedMB = report.totalMB;
        const percentage = (usedMB / TOTAL_MEMORY_MB) * 100;

        return {
            processes: processList,
            stats: { usedMB, percentage },
            wiredMB: totalWired, 
            appMB: totalApp
        };
    }, [report, currentUser, t]);
    // ... helper functions ... (omitted for brevity in replacement if possible, but replace block needs context)
    // Visual Helpers
    const getPressureColor = (p: number) => {
        // HSL Transition from Green (140) to Red (0)
        // 0% usage -> 140 hue
        // 100% usage -> 0 hue
        const hue = Math.max(0, 140 - (p * 1.4));
        return `hsl(${hue}, 100%, 50%)`;
    };

    // Split processes for rendering
    // We want Wired/Active visible, Dormant collapsible at the bottom
    const visibleProcesses = processes.filter(p => p.type !== 'dormant');
    
    // Group dormant processes by Name + Owner
    const dormantProcesses = useMemo(() => {
        const rawDormant = processes.filter(p => p.type === 'dormant');
        const groups = new Map<string, ProcessItem & { count: number }>();

        rawDormant.forEach(p => {
            const key = `${p.name}-${p.owner || 'system'}`;
            if (!groups.has(key)) {
                groups.set(key, { ...p, count: 1, id: `grouped-${key}` });
            } else {
                const existing = groups.get(key)!;
                existing.memoryMB += p.memoryMB;
                existing.count += 1;
            }
        });

        return Array.from(groups.values()).sort((a, b) => b.memoryMB - a.memoryMB);
    }, [processes]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button 
                    className={cn(
                        "transition-colors flex items-center justify-center p-1 rounded-md",
                        isOpen ? 'text-white' : 'text-white/70 hover:text-white'
                    )}
                >
                    <Cpu className="w-4 h-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent 
                 className={cn(
                    "w-80 p-0 overflow-hidden border-white/10 rounded-xl text-white",
                    !disableShadows ? 'shadow-2xl' : 'shadow-none',
                    reduceMotion ? 'animate-none! duration-0!' : ''
                )}
                style={{
                    background: getBackgroundColor(0.9),
                    ...blurStyle,
                }}
                align="end"
                sideOffset={12}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-white/90 flex items-center gap-2">
                            <Database className="w-4 h-4 text-white/70" />
                            {t('memory.title')}
                        </span>
                        <span className="text-xs text-white/50">{TOTAL_MEMORY_GB} GB DDR5</span>
                    </div>

                    {/* Hero Stats */}
                    <div className="space-y-3">
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-3xl font-light tracking-tight">
                                    {(stats.usedMB / 1024).toFixed(2)} 
                                    <span className="text-sm text-white/50 ml-1">GB</span>
                                </span>
                                <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                                    {t('memory.used')}
                                </span>
                            </div>
                            <div 
                                className="text-xs font-medium mb-1 transition-colors duration-500"
                                style={{ color: getPressureColor(stats.percentage) }}
                            >
                                {stats.percentage.toFixed(1)}% {t('memory.pressure')}
                            </div>
                        </div>

                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full transition-all duration-500"
                                style={{ 
                                    width: `${Math.max(stats.percentage, 2)}%`,
                                    backgroundColor: getPressureColor(stats.percentage)
                                }}
                            />
                        </div>
                    </div>



                    {/* Grid Stats (Active User Focus) */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/5 p-2 rounded-lg flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                            <span className="text-white/50 mb-1">{t('memory.appMemory')}</span>
                            <span className="font-mono text-white text-lg">{(appMB / 1024).toFixed(2)} <span className="text-xs text-white/50">GB</span></span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                            <span className="text-white/50 mb-1">{t('memory.wiredMemory')}</span>
                            <span className="font-mono text-white text-lg">{(wiredMB / 1024).toFixed(2)} <span className="text-xs text-white/50">GB</span></span>
                        </div>
                    </div>
                </div>

                {/* Process List */}
                <div className="p-2">
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] uppercase font-bold text-white/30 tracking-wider">
                        <span>{t('memory.processName')}</span>
                        <span>{t('memory.memory')}</span>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-0.5">
                        {/* Visible Processes (Wired & Active) */}
                        {visibleProcesses.map((process, idx) => (
                            <div key={`${process.id}-${idx}`} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 group transition-colors">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div 
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ 
                                            backgroundColor: process.type === 'active' ? accentColor : (process.type === 'wired' ? 'white' : undefined) 
                                        }}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm text-white/90 group-hover:text-white truncate transition-colors">
                                            {process.name}
                                        </span>
                                        {process.description && (
                                            <span className="text-[10px] text-white/30 truncate">
                                                {process.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={cn("text-xs font-mono ml-2 shrink-0", process.memoryMB > 500 ? "text-white/90" : "text-white/50")}>
                                    {process.memoryMB.toFixed(1)} MB
                                </span>
                            </div>
                        ))}

                        {/* Collapsible Dormant Section */}
                        {dormantProcesses.length > 0 && (
                            <div className="mt-1 pt-1 border-t border-white/5">
                                <details className="group/details">
                                    <summary className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-white/5 rounded select-none list-none text-xs text-white/40 hover:text-white/60 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                                        <span>{t('memory.backgroundProcesses', { count: dormantProcesses.length })}</span>
                                    </summary>
                                    <div className="pl-0 mt-0.5 space-y-0.5">
                                        {dormantProcesses.map((process, idx) => (
                                            <div key={`${process.id}-${idx}-dormant`} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 group transition-colors">
                                                <div className="flex items-center gap-2 overflow-hidden ml-2">
                                                    {/* Gray dot for dormant */}
                                                    <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-white/50 group-hover:text-white/70 truncate transition-colors">
                                                                {process.name}
                                                            </span>
                                                            {process.owner && (
                                                                <span className="text-[9px] px-1 py-px rounded bg-white/10 text-white/40 group-hover:bg-white/20 group-hover:text-white/60 transition-colors">
                                                                    {process.owner}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-white/20 group-hover:text-white/30 truncate transition-colors">
                                                            {process.count && process.count > 1 
                                                                ? t('memory.instances', { count: process.count })
                                                                : process.description}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-mono ml-2 shrink-0 text-white/30">
                                                    {process.memoryMB.toFixed(1)} MB
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}

                <div className="p-2 border-t border-white/10 bg-black/20 text-center">
                    <div className="text-[10px] text-white/30 flex items-center justify-center gap-1.5">
                        <Activity className="w-3 h-3" />
                        <span>{t('memory.swapUsed')}: 0 bytes</span>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

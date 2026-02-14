import { Battery, BatteryCharging, BatteryFull, BatteryMedium, BatteryLow, Zap, Thermometer, Activity, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { useBattery } from '@/hooks/useBattery';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppContext } from '@/components/AppContext';
import { CustomSwitch } from '@/components/ui/custom-switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';
import { useI18n } from '@/i18n';

import { STORAGE_KEYS } from '@/utils/memory';

import { useFileSystem } from '@/components/FileSystemContext';

// Component to select the correct Lucide icon based on state
const BatteryStatusIcon = ({ level, charging, className, style }: { level: number, charging: boolean, className?: string, style?: React.CSSProperties }) => {
    if (charging) return <BatteryCharging className={className} style={style} />;
    
    // Lucide doesn't have granular 10% steps, so we map to the 3 main states
    if (level > 0.66) return <BatteryFull className={className} style={style} />;
    if (level > 0.33) return <BatteryMedium className={className} style={style} />;
    if (level > 0.10) return <BatteryLow className={className} style={style} />;
    return <Battery className={className} style={style} />;
};

export function BatteryApplet() {
    const batteryInfo = useBattery();
    const { disableShadows, reduceMotion, accentColor } = useAppContext();
    const { blurStyle, getBackgroundColor } = useThemeColors();
    const { currentUser } = useFileSystem();
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useI18n();
    
    // Dynamic storage key scoped to user
    const storageKey = currentUser ? `${STORAGE_KEYS.BATTERY}-${currentUser}` : STORAGE_KEYS.BATTERY;

    // Local State for settings - default to false
    const [showPercentage, setShowPercentage] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                return data.showPercentage ?? false;
            }
        } catch (e) {
            console.warn('Failed to load battery settings:', e);
        }
        return false;
    });

    const handleTogglePercentage = (checked: boolean) => {
        setShowPercentage(checked);
        try {
            localStorage.setItem(storageKey, JSON.stringify({ showPercentage: checked }));
        } catch (e) {
            console.warn('Failed to save battery settings:', e);
        }
    };

    // Hide component if no battery (desktop PC)
    if (batteryInfo === null) {
        return null;
    }

    const { level, charging, health, cycleCount, temperature, voltage } = batteryInfo;
    const percentage = Math.round(level * 100);

    // Helper for health color
    const getHealthColor = (h?: number) => {
        if (!h) return 'text-white/90';
        if (h >= 90) return 'text-green-400';
        if (h >= 80) return 'text-yellow-400';
        return 'text-red-400';
    };

    // Helper for battery status color
    // We use styles for accent color when charging
    const getStatusColorStyle = () => {
        if (charging) return { color: accentColor };
        if (level <= 0.2) return { color: '#f87171' }; // red-400
        if (level <= 0.5) return { color: '#facc15' }; // yellow-400
        return undefined; // default white
    };

    // Only show condition grid if we have at least one metric
    const hasMetrics = health !== undefined || cycleCount !== undefined || temperature !== undefined || voltage !== undefined;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "transition-colors flex items-center gap-1.5",
                        isOpen ? 'text-white' : 'text-white/70 hover:text-white'
                    )}
                >
                    <BatteryStatusIcon 
                        level={level}
                        charging={charging}
                        className={cn(
                            "w-5 h-5",
                            !charging && (isOpen ? 'text-white' : 'text-white/70')
                        )}
                        style={charging ? { color: accentColor } : getStatusColorStyle()}
                    />
                    {showPercentage && (
                        <span className="text-xs text-white/90">{percentage}%</span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                className={cn(
                    "w-80 p-0 overflow-hidden border-white/10 rounded-xl text-white",
                    !disableShadows ? 'shadow-2xl' : 'shadow-none',
                    reduceMotion ? 'animate-none! duration-0!' : ''
                )}
                style={{
                    background: getBackgroundColor(0.9), // Slightly more opaque
                    ...blurStyle,
                }}
                align="end"
                sideOffset={12}
            >
                {/* Header Section */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BatteryStatusIcon 
                            level={level} 
                            charging={charging} 
                            className="w-5 h-5 text-white/70" 
                        />
                        <h2 className="font-semibold text-white/90">{t('battery.title')}</h2>
                    </div>
                    <span className="text-xs text-white/50">
                        {charging 
                            ? (percentage === 100 ? t('battery.fullyCharged') : t('battery.charging')) 
                            : (percentage === 100 ? t('battery.fullyCharged') : t('battery.remaining', { percentage }))
                        }
                    </span>
                </div>

                <div className={cn("p-4", hasMetrics && "border-b border-white/10")}>
                    {/* Main Status */}
                    <div className="flex items-center gap-4 mb-3">
                        <div className="text-4xl font-light tracking-tight" style={getStatusColorStyle()}>{percentage}%</div>
                        <div className="flex-1 flex flex-col justify-center gap-1">
                             <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full transition-all duration-500" 
                                    style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: charging ? accentColor : (getStatusColorStyle()?.color || '#ffffff')
                                    }}
                                  />
                             </div>
                        </div>
                         <Zap 
                            className={cn("w-5 h-5", !charging && "text-white/20")} 
                            style={charging ? { color: accentColor, fill: accentColor } : {}}
                         />
                    </div>

                    {/* Power Source */}
                     <div className="text-xs text-white/50 flex gap-2">
                        <span>{t('battery.powerSource')}</span>
                        <span className="text-white font-medium">
                            {charging ? t('battery.powerSources.adapter') : t('battery.powerSources.battery')}
                        </span>
                     </div>
                </div>

                {/* Condition Grid - Only show if metrics available */}
                {hasMetrics && (
                <div className="p-3">
                   <div className="px-2 py-1 mb-2 text-[10px] uppercase font-bold text-white/30 tracking-wider">
                     {t('battery.condition')}
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 px-1">
                      {/* Health */}
                      <div className="bg-white/5 rounded-lg p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                         <div className="flex items-center gap-1.5 text-white/50 text-xs font-medium">
                            <Activity className="w-3.5 h-3.5" /> {t('battery.metrics.health')}
                         </div>
                         <div className={cn("text-xl font-mono", getHealthColor(health))}>
                            {health ? `${health}%` : '--'}
                         </div>
                      </div>

                      {/* Cycles */}
                      <div className="bg-white/5 rounded-lg p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                         <div className="flex items-center gap-1.5 text-white/50 text-xs font-medium">
                            <RefreshCw className="w-3.5 h-3.5" /> {t('battery.metrics.cycles')}
                         </div>
                         <div className="text-xl font-mono text-white/90">
                            {cycleCount ?? '--'}
                         </div>
                      </div>

                      {/* Temp */}
                      <div className="bg-white/5 rounded-lg p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                         <div className="flex items-center gap-1.5 text-white/50 text-xs font-medium">
                            <Thermometer className="w-3.5 h-3.5" /> {t('battery.metrics.temp')}
                         </div>
                         <div className="text-xl font-mono text-white/90">
                            {temperature ? `${temperature.toFixed(1)}°C` : '--'}
                         </div>
                      </div>

                      {/* Voltage */}
                      <div className="bg-white/5 rounded-lg p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                         <div className="flex items-center gap-1.5 text-white/50 text-xs font-medium">
                            <Zap className="w-3.5 h-3.5" /> {t('battery.metrics.voltage')}
                         </div>
                         <div className="text-xl font-mono text-white/90">
                            {voltage ? `${voltage.toFixed(2)}V` : '--'}
                         </div>
                      </div>
                   </div>
                </div>
                )}

                {/* Footer / Disclaimer */}
                <div className="p-4 border-t border-white/10 bg-black/20 text-[10px] text-white/30 leading-relaxed text-center">
                    {t('battery.disclaimer')}
                </div>

                 {/* Settings / Percentage Toggle */}
                 <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                     <span className="text-white/70 text-xs">{t('battery.showPercentage')}</span>
                     <CustomSwitch
                         checked={showPercentage}
                         onCheckedChange={handleTogglePercentage}
                         accentColor={accentColor}
                     />
                 </div>
            </PopoverContent>
        </Popover>
    );
}


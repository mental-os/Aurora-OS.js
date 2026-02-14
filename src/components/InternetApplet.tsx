import { useState } from 'react';
import { Wifi, WifiOff, Lock, RefreshCw, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomSwitch } from '@/components/ui/custom-switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { useAppContext } from '@/components/AppContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useI18n } from '@/i18n';
import { useNetworkSimulation, Network } from '@/hooks/useNetworkSimulation';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';

interface InternetAppletProps {
  onOpenApp?: (type: string, data?: any, owner?: string) => void;
}

export function InternetApplet({ onOpenApp }: InternetAppletProps) {
  const { disableShadows, reduceMotion, accentColor } = useAppContext();
  const { blurStyle, getBackgroundColor } = useThemeColors();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNetworkId, setExpandedNetworkId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const {
    wifiEnabled,
    setWifiEnabled,
    availableNetworks,
    isScanning,
    scanNetworks,
    connectToNetwork
  } = useNetworkSimulation();

  const getSignalIcon = (strength: number) => {
    // 4 bars logic similar to reference
    if (strength > 75) return <Wifi className="w-4 h-4" />;
    if (strength > 50) return <Wifi className="w-4 h-4 opacity-70" />;
    if (strength > 25) return <Wifi className="w-4 h-4 opacity-50" />;
    return <Wifi className="w-4 h-4 opacity-30" />;
  };

  const getSecurityBadgeColor = (security: Network['security']) => {
    switch (security) {
      case 'OPEN': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'WEP': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'WPA': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'; // New WPA color
      case 'WPA2': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'WPA3': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-white/10 border-white/10';
    }
  };

  const handleNetworkClick = (network: Network) => {
    if (network.connected) return;

    if (network.security === 'OPEN') {
      connectToNetwork(network.ssid);
      setExpandedNetworkId(null);
    } else {
      if (expandedNetworkId === network.id) {
        setExpandedNetworkId(null);
        setPasswordInput('');
      } else {
        setExpandedNetworkId(network.id);
        setPasswordInput('');
      }
    }
  };

  const handlePasswordSubmit = (networkSsid: string) => {
    if (passwordInput) {
      connectToNetwork(networkSsid);
      setExpandedNetworkId(null);
      setPasswordInput('');
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "transition-colors flex items-center justify-center p-1 rounded-md",
              isOpen ? 'text-white' : 'text-white/70 hover:text-white'
            )}
          >
            {wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
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
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                wifiEnabled ? "bg-white/10" : "bg-white/5"
              )}>
                {wifiEnabled
                  ? <Wifi className="w-5 h-5 text-blue-400" style={{ color: accentColor }} />
                  : <WifiOff className="w-5 h-5 text-white/50" />
                }
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{t('settings.network.wifiTitle')}</span>
                <span className="text-xs text-white/50">
                  {wifiEnabled
                    ? (isScanning ? t('settings.network.scanning') : "On")
                    : t('settings.network.wifiDisabled')
                  }
                </span>
              </div>
            </div>
            <CustomSwitch
              checked={wifiEnabled}
              onCheckedChange={(checked: boolean) => {
                setWifiEnabled(checked);
                if (checked) scanNetworks();
              }}
              accentColor={accentColor}
            />
          </div>

          {/* Network List */}
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1">
            {wifiEnabled ? (
              <>
                {availableNetworks.map((network) => (
                  <div key={network.id} className="rounded-lg overflow-hidden transition-all">
                    <button
                      onClick={() => handleNetworkClick(network)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 transition-all border group text-left",
                        network.connected
                          ? "bg-white/10 border-white/10"
                          : "border-transparent hover:bg-white/5 hover:border-white/5",
                        expandedNetworkId === network.id ? "bg-white/5" : ""
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("transition-colors", network.connected ? "text-white" : "text-white/50 group-hover:text-white/70")}>
                          {getSignalIcon(network.strength)}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={cn(
                            "text-sm font-medium leading-none mb-1.5 truncate",
                            network.connected ? "text-white" : "text-white/90"
                          )}>
                            {network.ssid}
                          </span>
                          {/* Technical Details Line - Always Visible */}
                          <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono transition-all">
                            <span>{Math.round(network.strength)}%</span>
                            <span className="w-px h-2 bg-white/20" />
                            <span>CH {network.channel}</span>
                            <span className="w-px h-2 bg-white/20" />
                            <span className="truncate">{network.bssid.split(':').map((part, i) => i > 2 ? part : part).join(':')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2">
                        <div className={cn(
                          "text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border opacity-70",
                          getSecurityBadgeColor(network.security)
                        )}>
                          {network.security}
                        </div>
                        {network.security !== 'OPEN' && (
                          <Lock className="w-3 h-3 text-white/20 ml-0.5" />
                        )}
                      </div>
                    </button>

                    {expandedNetworkId === network.id && (
                      <div className="p-3 bg-white/5 border-t border-white/5 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <GlassInput
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder={t('settings.network.passwordPlaceholder')}
                            className="h-8 text-xs bg-black/20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handlePasswordSubmit(network.ssid);
                              if (e.key === 'Escape') setExpandedNetworkId(null);
                            }}
                            autoFocus
                          />
                          <GlassButton
                            onClick={() => handlePasswordSubmit(network.ssid)}
                            disabled={!passwordInput}
                            style={{ backgroundColor: accentColor }}
                            className="h-8 px-3"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </GlassButton>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {availableNetworks.length === 0 && !isScanning && (
                  <div className="py-8 text-center text-white/30 text-xs">
                    {t('settings.network.wifiNetworks')}
                  </div>
                )}

                {isScanning && availableNetworks.length === 0 && (
                  <div className="py-8 flex items-center justify-center gap-2 text-white/40 text-xs">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {t('settings.network.scanning')}
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center text-white/30 text-sm">
                {t('settings.network.wifiDisabled')}
              </div>
            )}
          </div>

          {/* Footer */}
          {wifiEnabled && (
            <div className="p-2 border-t border-white/10 bg-black/20 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-white/50 transition-colors gap-2"
                onClick={scanNetworks}
                disabled={isScanning}
                style={{
                  backgroundColor: hoveredButton === 'scan' ? accentColor : undefined,
                  color: hoveredButton === 'scan' ? '#fff' : undefined
                }}
                onMouseEnter={() => setHoveredButton('scan')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <RefreshCw className={cn("w-3 h-3", isScanning && "animate-spin")} />
                Scan
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-white/50 transition-colors gap-1"
                onClick={() => {
                  setIsOpen(false);

                  // 1. Handle "Already Open" case
                  window.dispatchEvent(new CustomEvent('aurora-open-settings-section', { detail: 'network' }));

                  // 2. Handle "Not Open Yet" case (Cold Start)
                  // Settings.tsx checks this key on mount
                  sessionStorage.setItem('settings-pending-section', 'network');

                  onOpenApp?.('settings');
                }}
                style={{
                  backgroundColor: hoveredButton === 'settings' ? accentColor : undefined,
                  color: hoveredButton === 'settings' ? '#fff' : undefined
                }}
                onMouseEnter={() => setHoveredButton('settings')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span>{t('settings.sections.network')}</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}

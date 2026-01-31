import { useState, useEffect } from 'react';
import { Wifi, ChevronRight, RefreshCw, Lock } from 'lucide-react';
import { CustomSwitch } from '@/components/ui/custom-switch';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { Label } from '@/components/ui/label';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from '@/i18n';
import { validateNetworkConfig } from '@/utils/networkValidation';
import { useNetworkSimulation, Network } from '@/hooks/useNetworkSimulation';

interface NetworkSettingsProps {
  accentColor: string;
  wifiEnabled: boolean;
  setWifiEnabled: (enabled: boolean) => void;
  wifiNetwork: string;
  // setWifiNetwork: (network: string) => void; // Unused in this component refactor as we use hook
  networkConfigMode: 'auto' | 'manual';
  setNetworkConfigMode: (mode: 'auto' | 'manual') => void;
  networkIP: string;
  setNetworkIP: (ip: string) => void;
  networkGateway: string;
  setNetworkGateway: (gateway: string) => void;
  networkSubnetMask: string;
  setNetworkSubnetMask: (mask: string) => void;
  networkDNS: string;
  setNetworkDNS: (dns: string) => void;
}

export function NetworkSettings({
  accentColor,
  wifiEnabled,
  setWifiEnabled,
  wifiNetwork,
  networkConfigMode,
  setNetworkConfigMode,
  networkIP,
  setNetworkIP,
  networkGateway,
  setNetworkGateway,
  networkSubnetMask,
  setNetworkSubnetMask,
  networkDNS,
  setNetworkDNS,
}: NetworkSettingsProps) {
  const { t } = useI18n();
  
  // Local UI state
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);
  const [showWifiList, setShowWifiList] = useState(false);
  const [expandedNetworkId, setExpandedNetworkId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  // Manual Config State
  const [tempIP, setTempIP] = useState(networkIP);
  const [tempGateway, setTempGateway] = useState(networkGateway);
  const [tempSubnetMask, setTempSubnetMask] = useState(networkSubnetMask);
  const [tempDNS, setTempDNS] = useState(networkDNS);
  const [networkConfigurationLoading, setNetworkConfigurationLoading] = useState(false);

  const {
      availableNetworks,
      isScanning,
      scanNetworks,
      connectToNetwork,
      disconnect
  } = useNetworkSimulation();

  // Sync temp state when props change
  useEffect(() => {
    // Avoid synchronous setState warning by wrapping in setTimeout or checking if values actually changed
    // Here we just want to reset form when the source of truth changes
    if (tempIP !== networkIP) setTempIP(networkIP);
    if (tempGateway !== networkGateway) setTempGateway(networkGateway);
    if (tempSubnetMask !== networkSubnetMask) setTempSubnetMask(networkSubnetMask);
    if (tempDNS !== networkDNS) setTempDNS(networkDNS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkIP, networkGateway, networkSubnetMask, networkDNS]);

  const handleDHCPAttribution = () => {
    setNetworkConfigurationLoading(true);
    generateAutoIP();
    setTimeout(() => setNetworkConfigurationLoading(false), 2000);
  }

  const generateAutoIP = () => {
    const randomOctet = Math.floor(Math.random() * 150) + 100;
    const newIP = `192.168.1.${randomOctet}`;
    const newGateway = '192.168.1.1';
    const newSubnetMask = '255.255.255.0';
    const newDNS = '8.8.8.8';

    setNetworkIP(newIP);
    setNetworkGateway(newGateway);
    setNetworkSubnetMask(newSubnetMask);
    setNetworkDNS(newDNS);
  };

  const handleSaveManualConfig = () => {
    const validation = validateNetworkConfig({
      ip: tempIP,
      gateway: tempGateway,
      subnetMask: tempSubnetMask,
      dns: tempDNS
    });

    if (!validation.valid) {
      toast.error(t('settings.notifications.subtitles.validation')); 
      return;
    }

    setNetworkIP(tempIP);
    setNetworkGateway(tempGateway);
    setNetworkSubnetMask(tempSubnetMask);
    setNetworkDNS(tempDNS);
    toast.success(t('settings.network.configSaved'));
  };

  const handleWifiBlockClick = () => {
    if (wifiEnabled && wifiNetwork) {
      setShowNetworkDetails(true);
      if (networkConfigMode === 'auto') {
        generateAutoIP();
      }
    } else {
      setShowWifiList(true);
      if (wifiEnabled) scanNetworks();
    }
  };

  const handleBackToMain = () => {
    setShowWifiList(false);
    setShowNetworkDetails(false);
    setExpandedNetworkId(null);
  };

  const handleDisconnectWifi = () => {
    disconnect();
    handleBackToMain();
  };

  const handleNetworkClick = (network: Network) => {
    if (network.security === 'OPEN') {
      connectToNetwork(network.ssid);
      handleBackToMain();
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
      handleBackToMain();
    }
  };

  const getSignalIcon = (strength: number) => {
    if (strength > 75) return <Wifi className="w-5 h-5" />;
    if (strength > 50) return <Wifi className="w-5 h-5 opacity-70" />;
    if (strength > 25) return <Wifi className="w-5 h-5 opacity-50" />;
    return <Wifi className="w-5 h-5 opacity-30" />;
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

  return (
    <div>
      <h2 className="text-2xl text-white mb-6">{t('settings.sections.network')}</h2>

      {!showWifiList && !showNetworkDetails ? (
        <>
          <button
            onClick={handleWifiBlockClick}
            className="w-full bg-black/20 rounded-xl p-4 mb-1 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                  <Wifi className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-white">{t('settings.network.wifiTitle')}</h3>
                  <p className="text-xs text-white/50">
                    {wifiEnabled
                      ? t('settings.network.wifiConnected', { network: wifiNetwork })
                      : t('settings.network.wifiDisabled')
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening block
                    }}
                 >
                    <CustomSwitch 
                        checked={wifiEnabled}
                        onCheckedChange={(checked) => {
                            setWifiEnabled(checked);
                            if (checked) scanNetworks();
                        }}
                        accentColor={accentColor}
                    />
                 </div>
                 <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
          </button>
        </>
      ) : showNetworkDetails ? (
        <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToMain}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white rotate-180" />
                </button>
                <h3 className="text-sm font-medium text-white">{wifiNetwork}</h3>
              </div>
              <GlassButton
                onClick={handleDisconnectWifi}
                variant="danger"
                className="text-xs px-3 py-1.5 h-auto"
              >
                {t('settings.network.disconnect')}
              </GlassButton>
          </div>

          <div className="p-4 space-y-4">
             {/* Configuration Mode */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">{t('settings.network.configurationMode')}</h4>
                <Select
                  value={networkConfigMode}
                  onValueChange={(value: 'auto' | 'manual') => {
                    setNetworkConfigMode(value);
                    if (value === 'auto') handleDHCPAttribution();
                  }}
                >
                   <SelectTrigger className="bg-black/20 border-white/10 text-white">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-gray-900 border-white/10 text-white">
                      <SelectItem value="auto">{t('settings.network.automatic')}</SelectItem>
                      <SelectItem value="manual">{t('settings.network.manual')}</SelectItem>
                   </SelectContent>
                </Select>
              </div>

              {networkConfigurationLoading ? (
                 <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-white/40 animate-spin" />
                    <p className="text-sm text-white/60">{t('settings.network.dhcpAttributionProgress')}</p>
                 </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <h4 className="text-white font-medium mb-2">
                         {networkConfigMode === 'auto' ? t('settings.network.autoConfigTitle') : t('settings.network.manualConfigTitle')}
                    </h4>
                    <div>
                        <Label className="text-xs text-white/60 block mb-1">{t('settings.network.ipAddress')}</Label>
                        {networkConfigMode === 'auto' ? <div className="text-white text-sm">{networkIP}</div> : 
                           <GlassInput value={tempIP} onChange={(e) => setTempIP(e.target.value)} />
                        }
                    </div>
                     <div>
                        <Label className="text-xs text-white/60 block mb-1">{t('settings.network.subnetMask')}</Label>
                        {networkConfigMode === 'auto' ? <div className="text-white text-sm">{networkSubnetMask}</div> : 
                           <GlassInput value={tempSubnetMask} onChange={(e) => setTempSubnetMask(e.target.value)} />
                        }
                    </div>
                     <div>
                        <Label className="text-xs text-white/60 block mb-1">{t('settings.network.gateway')}</Label>
                        {networkConfigMode === 'auto' ? <div className="text-white text-sm">{networkGateway}</div> : 
                           <GlassInput value={tempGateway} onChange={(e) => setTempGateway(e.target.value)} />
                        }
                    </div>
                     <div>
                        <Label className="text-xs text-white/60 block mb-1">{t('settings.network.dns')}</Label>
                        {networkConfigMode === 'auto' ? <div className="text-white text-sm">{networkDNS}</div> : 
                           <GlassInput value={tempDNS} onChange={(e) => setTempDNS(e.target.value)} />
                        }
                    </div>
                    {networkConfigMode === 'manual' && (
                        <GlassButton onClick={handleSaveManualConfig} style={{ backgroundColor: accentColor }} className="w-full mt-2">
                             {t('settings.network.validateConfig')}
                        </GlassButton>
                    )}
                </div>
              )}
          </div>
        </div>
      ) : (
        <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
             {/* List Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToMain}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white rotate-180" />
                </button>
                <h3 className="text-sm font-medium text-white">{t('settings.network.wifiNetworks')}</h3>
              </div>
              <button
                onClick={scanNetworks}
                disabled={isScanning}
                className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                style={{ color: accentColor }}
              >
                <RefreshCw className={cn("w-4 h-4", isScanning && "animate-spin")} />
              </button>
            </div>
            
             {/* List Content */}
            <div className="p-2 space-y-1">
                 {isScanning && availableNetworks.length === 0 && (
                     <div className="flex items-center gap-3 py-4 px-3">
                        <RefreshCw className="w-5 h-5 text-white/40 animate-spin" />
                        <p className="text-sm text-white/60">{t('settings.network.scanning')}</p>
                     </div>
                 )}
                 
                 {availableNetworks.map((network) => (
                    <div key={network.id} className="transition-all">
                        <button
                            onClick={() => handleNetworkClick(network)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group text-left",
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
                                     <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono transition-all">
                                        <span>{Math.round(network.strength)}%</span>
                                        <span className="w-px h-2 bg-white/20" />
                                        <span>CH {network.channel}</span>
                                        <span className="w-px h-2 bg-white/20" />
                                        <span className="truncate">{network.bssid.split(':').map((part, i) => i > 2 ? part : part).join(':')}</span>
                                     </div>
                                 </div>
                             </div>

                             <div className="flex items-center gap-3">
                                {wifiNetwork === network.ssid && wifiEnabled && (
                                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: accentColor }} />
                                )}
                                
                                <div className="flex items-center gap-2">
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
                             </div>
                        </button>

                        {expandedNetworkId === network.id && (
                           <div className="mx-2 mb-2 p-3 bg-white/5 rounded-lg border-t border-white/5 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
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
                 
                 {!isScanning && availableNetworks.length === 0 && (
                     <div className="p-4 text-center text-white/40 text-sm">No networks found</div>
                 )}
            </div>
        </div>
      )}
    </div>
  );
}

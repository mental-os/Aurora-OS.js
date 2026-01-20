import { Wifi, Bluetooth, ChevronRight, RefreshCw, Lock } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { useI18n } from '../i18n/index';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validateNetworkConfig } from '@/utils/networkValidation';

interface NetworkSettingsProps {
  accentColor: string;
  wifiEnabled: boolean;
  setWifiEnabled: (enabled: boolean) => void;
  bluetoothEnabled: boolean;
  setBluetoothEnabled: (enabled: boolean) => void;
  wifiNetwork: string;
  setWifiNetwork: (network: string) => void;
  bluetoothDevice: string;
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
  bluetoothEnabled,
  setBluetoothEnabled,
  wifiNetwork,
  setWifiNetwork,
  bluetoothDevice,
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

  // Wi-Fi Network List State
  const [showWifiList, setShowWifiList] = useState(false);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState<Array<{name: string, signal: number, secured: boolean}>>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [networkPassword, setNetworkPassword] = useState('');

  // Network Management Page State
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);

  // Manual Configuration Temporary State
  const [tempIP, setTempIP] = useState(networkIP);
  const [tempGateway, setTempGateway] = useState(networkGateway);
  const [tempSubnetMask, setTempSubnetMask] = useState(networkSubnetMask);
  const [tempDNS, setTempDNS] = useState(networkDNS);
  const [networkConfigurationLoading, setNetworkConfigurationLoading] = useState(false);

  const handleDHCPAttribution = () => {
    setNetworkConfigurationLoading(true);
    generateAutoIP();
    setTimeout(() => setNetworkConfigurationLoading(false), 2000);
  }

  // Generate automatic IP configuration (DHCP simulation)
  const generateAutoIP = () => {
    const randomOctet = Math.floor(Math.random() * 150) + 100; // 100-249
    const newIP = `192.168.1.${randomOctet}`;
    const newGateway = '192.168.1.1';
    const newSubnetMask = '255.255.255.0';
    const newDNS = '8.8.8.8';

    setNetworkIP(newIP);
    setNetworkGateway(newGateway);
    setNetworkSubnetMask(newSubnetMask);
    setNetworkDNS(newDNS);

    setTempIP(newIP);
    setTempGateway(newGateway);
    setTempSubnetMask(newSubnetMask);
    setTempDNS(newDNS);
  };

  // Handle manual configuration save
  const handleSaveManualConfig = () => {
    const validation = validateNetworkConfig({
      ip: tempIP,
      gateway: tempGateway,
      subnetMask: tempSubnetMask,
      dns: tempDNS
    });

    if (!validation.valid) {
      toast.error(t(`settings.network.${validation.error}`));
      return;
    }

    setNetworkIP(tempIP);
    setNetworkGateway(tempGateway);
    setNetworkSubnetMask(tempSubnetMask);
    setNetworkDNS(tempDNS);
    toast.success(t('settings.network.configSaved'));
  };

  // Generate random Wi-Fi networks
  const generateWifiNetworks = () => {
    const networkNames = [
      'FreeWifi-Secure', 'HomeNetwork_5G', 'CoffeeShop_Guest', 'Office_Network',
      'Linksys-2.4GHz', 'NETGEAR42', 'TP-Link_Wireless', 'MyHomeWiFi',
      'Apartment_204', 'Xfinity_Public', 'ATT-WiFi-9876', 'Verizon_XY23'
    ];

    const count = Math.floor(Math.random() * 2) + 4; // 4 or 5
    const shuffled = [...networkNames].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const networks = selected.map(name => ({
      name,
      signal: Math.floor(Math.random() * 4) + 1,
      secured: Math.random() > 0.3
    }));

    networks.sort((a, b) => b.signal - a.signal);

    return networks;
  };

  const loadWifiNetworks = () => {
    setIsLoadingNetworks(true);
    setWifiNetworks([]);

    const allNetworks = generateWifiNetworks();

    const networksWithDelay = allNetworks.map(network => {
      const signalDelayBase = {
        4: 300,
        3: 500,
        2: 800,
        1: 1200
      }[network.signal] || 500;

      const randomVariation = Math.random() * 400;
      const detectionTime = signalDelayBase + randomVariation;

      return { ...network, detectionTime };
    });

    networksWithDelay.sort((a, b) => a.detectionTime - b.detectionTime);

    let maxDelay = 0;
    networksWithDelay.forEach((networkData) => {
      setTimeout(() => {
        setWifiNetworks(prev => {
          if (prev.find(n => n.name === networkData.name)) return prev;
          return [...prev, { name: networkData.name, signal: networkData.signal, secured: networkData.secured }];
        });
      }, networkData.detectionTime);

      maxDelay = Math.max(maxDelay, networkData.detectionTime);
    });

    setTimeout(() => setIsLoadingNetworks(false), maxDelay + 200);
  };

  const handleWifiBlockClick = () => {
    if (wifiEnabled && wifiNetwork) {
      // Si connecté, aller vers la page de détails du réseau
      setShowNetworkDetails(true);
      // Generate new auto IP when entering network details if in auto mode
      if (networkConfigMode === 'auto') {
        generateAutoIP();
      }
    } else {
      // Sinon, aller vers la liste des réseaux
      setShowWifiList(true);
      loadWifiNetworks();
    }
  };

  const handleBackToMain = () => {
    setShowWifiList(false);
    setShowNetworkDetails(false);
    setWifiNetworks([]);
  };

  const handleDisconnectWifi = () => {
    setWifiEnabled(false);
    setWifiNetwork('');
    handleBackToMain();
  };

  const handleNetworkClick = (network: {name: string, signal: number, secured: boolean}) => {
    if (network.secured) {
      setSelectedNetwork(network.name);
      setShowPasswordDialog(true);
    } else {
      setWifiNetwork(network.name);
      setWifiEnabled(true);
      handleBackToMain();
    }
  };

  const handlePasswordSubmit = () => {
    if (networkPassword) {
      setWifiNetwork(selectedNetwork);
      setWifiEnabled(true);
      setShowPasswordDialog(false);
      setNetworkPassword('');
      setSelectedNetwork('');
      handleBackToMain();
    }
  };

  const getWifiSignalIcon = (signal: number) => {
    const opacity = signal / 4;
    return <Wifi className="w-5 h-5" style={{ opacity: 0.3 + (opacity * 0.7) }} />;
  };

  return (
    <div>
      <h2 className="text-2xl text-white mb-6">{t('settings.sections.network')}</h2>

      {!showWifiList && !showNetworkDetails ? (
        <>
          {/* Wi-Fi Section */}
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
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </button>

          {/* Bluetooth Section */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                  <Bluetooth className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{t('settings.network.bluetoothTitle')}</h3>
                  <p className="text-xs text-white/50">
                    {bluetoothEnabled
                      ? t('settings.network.bluetoothConnected', { device: bluetoothDevice })
                      : t('settings.network.bluetoothDisabled')
                    }
                  </p>
                </div>
              </div>
              <Checkbox
                checked={bluetoothEnabled}
                onCheckedChange={(checked) => setBluetoothEnabled(checked === true)}
              />
            </div>
          </div>
        </>
      ) : showNetworkDetails ? (
        <>
          {/* Network Management Page */}
          <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
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
              {/* Configuration Mode Selector */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">{t('settings.network.configurationMode')}</h4>
                <Select
                  value={networkConfigMode}
                  onValueChange={(value: 'auto' | 'manual') => {
                    setNetworkConfigMode(value);
                    if (value === 'auto') {
                      handleDHCPAttribution();
                    }
                  }}
                >
                  <SelectTrigger
                    className="bg-black/20 border-white/10 text-white hover:bg-white/5 transition-colors"
                    style={{
                      '--ring': accentColor
                    } as React.CSSProperties}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="backdrop-blur-xl border-white/10 text-white"
                    style={{
                      backgroundColor: 'rgba(28, 28, 30, 0.95)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <SelectItem
                      value="auto"
                      className="focus:bg-white/10 focus:text-white data-[state=checked]:bg-(--active-bg)! data-[state=checked]:text-(--active-text)! cursor-pointer transition-colors"
                      style={{
                        '--active-bg': `${accentColor}15`,
                        '--active-text': accentColor
                      } as React.CSSProperties}
                    >
                      {t('settings.network.automatic')}
                    </SelectItem>
                    <SelectItem
                      value="manual"
                      className="focus:bg-white/10 focus:text-white data-[state=checked]:bg-(--active-bg)! data-[state=checked]:text-(--active-text)! cursor-pointer transition-colors"
                      style={{
                        '--active-bg': `${accentColor}15`,
                        '--active-text': accentColor
                      } as React.CSSProperties}
                    >
                      {t('settings.network.manual')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {networkConfigurationLoading && (
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3 py-4 px-3">
                  <RefreshCw className="w-5 h-5 text-white/40 animate-spin" />
                  <p className="text-sm text-white/60">{t('settings.network.dhcpAttributionProgress')}</p>
                </div>
              </div>
              )}


              {!networkConfigurationLoading && (
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <h4 className="text-white font-medium mb-2">
                  {networkConfigMode === 'auto'
                      ? t('settings.network.autoConfigTitle')
                      : t('settings.network.manualConfigTitle')
                  }
                </h4>

                {/* IP Address */}
                <div>
                  <label className="text-xs text-white/60 block mb-1">{t('settings.network.ipAddress')}</label>
                  {networkConfigMode === 'auto' ? (
                      <div className="text-white text-sm">{networkIP}</div>
                  ) : (
                      <GlassInput
                          value={tempIP}
                          onChange={(e) => setTempIP(e.target.value)}
                          placeholder="192.168.1.100"
                      />
                  )}
                </div>

                {/* Subnet Mask */}
                <div>
                  <label className="text-xs text-white/60 block mb-1">{t('settings.network.subnetMask')}</label>
                  {networkConfigMode === 'auto' ? (
                      <div className="text-white text-sm">{networkSubnetMask}</div>
                  ) : (
                      <GlassInput
                          value={tempSubnetMask}
                          onChange={(e) => setTempSubnetMask(e.target.value)}
                          placeholder="255.255.255.0"
                      />
                  )}
                </div>

                {/* Gateway */}
                <div>
                  <label className="text-xs text-white/60 block mb-1">{t('settings.network.gateway')}</label>
                  {networkConfigMode === 'auto' ? (
                      <div className="text-white text-sm">{networkGateway}</div>
                  ) : (
                      <GlassInput
                          value={tempGateway}
                          onChange={(e) => setTempGateway(e.target.value)}
                          placeholder="192.168.1.1"
                      />
                  )}
                </div>

                {/* DNS */}
                <div>
                  <label className="text-xs text-white/60 block mb-1">{t('settings.network.dns')}</label>
                  {networkConfigMode === 'auto' ? (
                      <div className="text-white text-sm">{networkDNS}</div>
                  ) : (
                      <GlassInput
                          value={tempDNS}
                          onChange={(e) => setTempDNS(e.target.value)}
                          placeholder="8.8.8.8"
                      />
                  )}
                </div>

                {/* Save Button for Manual Mode */}
                {networkConfigMode === 'manual' && (
                    <div className="pt-2">
                      <GlassButton
                          onClick={handleSaveManualConfig}
                          style={{ backgroundColor: accentColor }}
                          className="w-full"
                      >
                        {t('settings.network.validateConfig')}
                      </GlassButton>
                    </div>
                )}
              </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Wi-Fi Networks List */}
          <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
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
                onClick={loadWifiNetworks}
                disabled={isLoadingNetworks}
                className="p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                style={{ color: accentColor }}
              >
                <RefreshCw className={cn("w-4 h-4", isLoadingNetworks && "animate-spin")} />
              </button>
            </div>

            {/* Network List with Loader */}
            <div className="p-2">
              {/* Loader - shown while scanning */}
              {isLoadingNetworks && (
                <div className="flex items-center gap-3 py-4 px-3">
                  <RefreshCw className="w-5 h-5 text-white/40 animate-spin" />
                  <p className="text-sm text-white/60">{t('settings.network.scanning')}</p>
                </div>
              )}

              {/* Network List - appears progressively */}
              <div className="space-y-1">
                {wifiNetworks.map((network, index) => (
                  <button
                    key={`${network.name}-${index}`}
                    onClick={() => handleNetworkClick(network)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-white/60">
                        {getWifiSignalIcon(network.signal)}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{network.name}</span>
                          {network.secured && (
                            <Lock className="w-3 h-3 text-white/40" />
                          )}
                        </div>
                      </div>
                    </div>
                    {wifiNetwork === network.name && wifiEnabled && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Password Dialog */}
          {showPasswordDialog && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-96 shadow-2xl">
                <h3 className="text-lg font-medium text-white mb-4">
                  {t('settings.network.enterPassword')}
                </h3>
                <p className="text-sm text-white/60 mb-4">{selectedNetwork}</p>
                <GlassInput
                  type="password"
                  value={networkPassword}
                  onChange={(e) => setNetworkPassword(e.target.value)}
                  placeholder={t('settings.network.passwordPlaceholder')}
                  className="mb-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && networkPassword) {
                      handlePasswordSubmit();
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <GlassButton
                    onClick={() => {
                      setShowPasswordDialog(false);
                      setNetworkPassword('');
                      setSelectedNetwork('');
                    }}
                    variant="ghost"
                  >
                    {t('settings.users.cancel')}
                  </GlassButton>
                  <GlassButton
                    onClick={handlePasswordSubmit}
                    disabled={!networkPassword}
                    style={{ backgroundColor: accentColor }}
                  >
                    {t('settings.network.connect')}
                  </GlassButton>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAppContext } from '@/components/AppContext';

export interface Network {
  id: string;
  ssid: string;
  strength: number;
  security: 'OPEN' | 'WEP' | 'WPA' | 'WPA2' | 'WPA3';
  channel: number;
  bssid: string;
  maxSpeed: number; // in Mbps
  speed: number;    // realized speed in Mbps
  connected?: boolean;
}

const NETWORK_NAMES = [
  'Skynet_Global', 'FBI_Surveillance_Van', 'Free_Wifi_Insecure', 
  'Corp_Internal_Legacy', 'Hidden_Network', 'Linksys-2.4GHz', 
  'NETGEAR42', 'TP-Link_Wireless', 'MyHomeWiFi', 'Apartment_204', 
  'Xfinity_Public', 'ATT-WiFi-9876', 'Verizon_XY23'
];

interface NetworkCapabilities {
    security: Network['security'];
    maxSpeed: number;
}

function getNetworkCapabilities(ssid: string): NetworkCapabilities {
    // 1. Determine Security Type
    let security: Network['security'] = 'WPA2'; // Default
    
    if (ssid.includes('Insecure') || ssid.includes('Public')) {
        security = 'OPEN';
    } else if (ssid.includes('Legacy')) {
        security = 'WEP';
    } else if (ssid.includes('Home')) {
        security = Math.random() > 0.5 ? 'WPA2' : 'WPA3';
    } else {
        // Random distribution for others
        const rand = Math.random();
        if (rand < 0.1) security = 'WEP';
        else if (rand < 0.3) security = 'WPA';
        else if (rand < 0.7) security = 'WPA2';
        else security = 'WPA3';
    }

    // 2. Determine Max Speed based on Security (Historical Tiers)
    // OPEN: < 1 Mbps (Public/Congested)
    // WEP: 1 - 5 Mbps (802.11b - 1999)
    // WPA: 5 - 15 Mbps (802.11g - 2003)
    // WPA2: 20 - 150 Mbps (802.11n/ac - 2009/2013)
    // WPA3: 150 - 600+ Mbps (802.11ax - 2019)
    
    let maxSpeed = 0;
    switch (security) {
        case 'OPEN':
            // Bumped min to 1.0 to ensure >0.1 MB/s even at lower signal
            maxSpeed = Math.random() * 1.5 + 1.0; // 1.0 - 2.5 Mbps
            break;
        case 'WEP':
            maxSpeed = Math.random() * 4 + 1; // 1 - 5 Mbps
            break;
        case 'WPA':
            maxSpeed = Math.random() * 10 + 5; // 5 - 15 Mbps
            break;
        case 'WPA2':
            maxSpeed = Math.floor(Math.random() * 130) + 20; // 20 - 150 Mbps
            break;
        case 'WPA3':
            maxSpeed = Math.floor(Math.random() * 450) + 150; // 150 - 600 Mbps
            break;
    }

    // Round to 1 decimal
    maxSpeed = Math.round(maxSpeed * 10) / 10;

    return { security, maxSpeed };
}

export interface NetworkContextType {
  wifiEnabled: boolean;
  setWifiEnabled: (enabled: boolean) => void;
  currentNetwork: string;
  availableNetworks: Network[];
  isScanning: boolean;
  scanNetworks: () => void;
  connectToNetwork: (ssid: string) => void;
  disconnect: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const { wifiEnabled, wifiNetwork, setWifiNetwork, setWifiEnabled } = useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);

  // Generate initial mock networks
  const generateNetworks = useCallback(() => {
    // Always include the currently connected network if wifi is enabled and we have one
    const connectedSsid = wifiEnabled ? wifiNetwork : null;
    
    // Select random networks
    const count = Math.floor(Math.random() * 3) + 4; // 4-6 networks
    const shuffled = [...NETWORK_NAMES].sort(() => Math.random() - 0.5);
    const selectedNames = shuffled.slice(0, count);

    // If connected network is not in random selection, add it
    if (connectedSsid && !selectedNames.includes(connectedSsid)) {
      selectedNames.unshift(connectedSsid);
    }

    return selectedNames.map((ssid, index) => {
      const caps = getNetworkCapabilities(ssid);
      const strength = Math.floor(Math.random() * 40) + 60; // 60-100 initial strength
      
      return {
          id: `net-${index}`,
          ssid,
          strength,
          security: caps.security,
          channel: Math.floor(Math.random() * 11) + 1,
          bssid: `00:11:22:33:44:${index.toString(16).padStart(2, '0')}`,
          maxSpeed: caps.maxSpeed,
          speed: Math.round((caps.maxSpeed * (strength / 100)) * 10) / 10,
          connected: ssid === connectedSsid
      };
    }) as Network[];
  }, [wifiEnabled, wifiNetwork]);

  // Sync connected status when wifiNetwork changes externally
  useEffect(() => {
    setAvailableNetworks(prev => prev.map(n => ({
      ...n,
      connected: wifiEnabled && n.ssid === wifiNetwork
    })));
  }, [wifiNetwork, wifiEnabled]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (wifiEnabled) {
        if (availableNetworks.length === 0) {
            const nets = generateNetworks();
            if (mounted) setAvailableNetworks(nets);
        }
      } else {
        if (mounted) setAvailableNetworks([]);
      }
    }, 0);
    return () => { 
      mounted = false; 
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wifiEnabled]); 

  // Simulate signal fluctuation and Speed updates
  useEffect(() => {
    if (!wifiEnabled) return;

    const interval = setInterval(() => {
      setAvailableNetworks(prev => prev.map(n => {
        const newStrength = Math.min(100, Math.max(30, n.strength + (Math.random() * 10 - 5)));
        const newSpeed = Math.round((n.maxSpeed * (newStrength / 100)) * 10) / 10;
        return {
           ...n,
           strength: newStrength,
           speed: newSpeed
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [wifiEnabled]);

  const scanNetworks = useCallback(() => {
    setIsScanning(true);
    // Simulate scan delay
    setTimeout(() => {
      setAvailableNetworks(generateNetworks());
      setIsScanning(false);
    }, 1500);
  }, [generateNetworks]);

  const connectToNetwork = useCallback((ssid: string) => {
    setWifiEnabled(true);
    setWifiNetwork(ssid);
  }, [setWifiEnabled, setWifiNetwork]);

  const disconnect = useCallback(() => {
    setWifiNetwork('');
  }, [setWifiNetwork]);

  return (
    <NetworkContext.Provider value={{
      wifiEnabled,
      setWifiEnabled,
      currentNetwork: wifiNetwork,
      availableNetworks,
      isScanning,
      scanNetworks,
      connectToNetwork,
      disconnect
    }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetworkContext() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }
  return context;
}

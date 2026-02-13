import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAppContext } from '@/components/AppContext';
import { resetSessionDataUsage, STORAGE_KEYS } from '@/utils/memory';

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

// Removed unused NETWORK_NAMES

interface NetworkCapabilities {
  security: Network['security'];
  maxSpeed: number;
}

const SSID_PREFIXES = ['SkyNet', 'Linksys', 'NETGEAR', 'Xfinity', 'ATT', 'Verizon', 'Free_Wifi', 'Office', 'Apt', 'Guest', 'Cafe', 'Hotel'];
const SSID_SUFFIXES = ['_5G', '_2.4G', '_Guest', '_Secure', '_Public', '-Ext', '-Pro', '_Plus', '_Ultra'];

// Deterministic pseudo-random number generator based on string seed (djb2 hash)
function pseudoRandom(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  const reset = hash >>> 0; // Ensure unsigned 32-bit integer
  return (reset % 1000) / 1000; // Normalizing to 0-1 range
}

function getNetworkCapabilities(ssid: string, knownNetworks: Record<string, NetworkCapabilities> = {}): NetworkCapabilities {
  // 1. Check if Known Network (Persistence)
  if (knownNetworks[ssid]) {
    return knownNetworks[ssid];
  }

  // 2. Determine Security Type (Deterministic)
  let security: Network['security']; // Default

  // Use deterministic random value for this SSID
  const rng = pseudoRandom(ssid);

  if (ssid.toLowerCase().includes('insecure') || ssid.toLowerCase().includes('public') || ssid.toLowerCase().includes('free')) {
    security = 'OPEN';
  } else if (ssid.toLowerCase().includes('legacy')) {
    security = 'WEP';
  } else if (ssid.toLowerCase().includes('home')) {
    security = rng > 0.5 ? 'WPA2' : 'WPA3';
  } else if (ssid.includes('Verizon') || ssid.includes('ATT') || ssid.includes('Xfinity') || ssid.includes('T-Mobile')) {
    // Carrier networks should be modern (WPA2/3)
    security = rng > 0.3 ? 'WPA3' : 'WPA2';
  } else {
    // Random distribution for others (Deterministic per SSID)
    if (rng < 0.1) security = 'WEP';
    else if (rng < 0.3) security = 'WPA';
    else if (rng < 0.7) security = 'WPA2';
    else security = 'WPA3';
  }

  // 3. Determine Max Speed based on Security (Historical Tiers)
  const speedRng = pseudoRandom(ssid + '_speed');

  let maxSpeed: number;
  switch (security) {
    case 'OPEN':
      maxSpeed = speedRng * 1.5 + 1.0; // 1.0 - 2.5 Mbps
      break;
    case 'WEP':
      maxSpeed = speedRng * 4 + 1; // 1 - 5 Mbps
      break;
    case 'WPA':
      maxSpeed = speedRng * 10 + 5; // 5 - 15 Mbps
      break;
    case 'WPA2':
      maxSpeed = Math.floor(speedRng * 130) + 20; // 20 - 150 Mbps
      break;
    case 'WPA3':
      maxSpeed = Math.floor(speedRng * 450) + 150; // 150 - 600 Mbps
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

  const [knownNetworks, setKnownNetworks] = useState<Record<string, NetworkCapabilities>>({});

  // Load known networks from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.KNOWN_NETWORKS);
      if (stored) {
        setKnownNetworks(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load known networks', e);
    }
  }, []);

  const generateRandomSSID = useCallback(() => {
    const prefix = SSID_PREFIXES[Math.floor(Math.random() * SSID_PREFIXES.length)];
    const suffix = SSID_SUFFIXES[Math.floor(Math.random() * SSID_SUFFIXES.length)];
    const num = Math.floor(Math.random() * 999);
    // 30% chance of no suffix, 30% chance of suffix, 40% chance of number
    const rand = Math.random();
    if (rand < 0.3) return `${prefix}-${num}`;
    if (rand < 0.6) return `${prefix}${suffix}`;
    return `${prefix}-${num}${suffix}`;
  }, []);

  // Generate initial mock networks
  const generateNetworks = useCallback(() => {
    // Always include the currently connected network if wifi is enabled and we have one
    const connectedSsid = wifiEnabled ? wifiNetwork : null;
    const currentKnown = { ...knownNetworks }; // Local copy for this generation cycle

    // Select random networks
    const count = Math.floor(Math.random() * 3) + 4; // 4-6 networks

    const selectedNames: string[] = [];

    // 1. Add connected network
    if (connectedSsid) {
      selectedNames.push(connectedSsid);
    }

    // 2. Add some known networks (if in range)
    const knownKeys = Object.keys(currentKnown).filter(k => k !== connectedSsid);
    // Shuffle known keys
    knownKeys.sort(() => Math.random() - 0.5);
    // Add 0-2 known networks
    const knownToAdd = knownKeys.slice(0, Math.floor(Math.random() * 2));
    selectedNames.push(...knownToAdd);

    // 3. Fill the rest with dynamic random networks
    while (selectedNames.length < count) {
      const newSsid = generateRandomSSID();
      if (!selectedNames.includes(newSsid)) {
        selectedNames.push(newSsid);
      }
    }

    return selectedNames.map((ssid, index) => {
      // Pass knownNetworks so we use stored caps if available
      const caps = getNetworkCapabilities(ssid, currentKnown);
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
  }, [wifiEnabled, wifiNetwork, knownNetworks, generateRandomSSID]);

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

    // Persist Network Attributes
    const net = availableNetworks.find(n => n.ssid === ssid);
    if (net) {
      setKnownNetworks(prev => {
        const next = {
          ...prev,
          [ssid]: {
            security: net.security,
            maxSpeed: net.maxSpeed
          }
        };
        localStorage.setItem(STORAGE_KEYS.KNOWN_NETWORKS, JSON.stringify(next));
        return next;
      });
    }
  }, [setWifiEnabled, setWifiNetwork, availableNetworks]);

  const disconnect = useCallback(() => {
    setWifiNetwork('');
    resetSessionDataUsage();
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

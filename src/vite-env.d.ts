/// <reference types="vite/client" />

interface Window {
  electron?: {
    getLocale: () => Promise<string>;
    getBattery: () => Promise<any>;
    getSystemInfo: () => Promise<any>;
    checkConnection: () => Promise<{ system: number | null, caravane: number | null } | null>;
    getDisplaySettings: () => Promise<any>;
    setDisplaySettings: (settings: any) => Promise<boolean>;
    onDisplayChange: (callback: (settings: any) => void) => () => void;
    signalReady: () => Promise<boolean>;
    savedata: {
      save: (data: string) => Promise<boolean>;
      load: () => Promise<string | null>;
      exists: () => Promise<boolean>;
      delete: () => Promise<boolean>;
    };
  };
  aurora?: {
    checkRamUsage: () => void;
  };
}

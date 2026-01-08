/// <reference types="vite/client" />

interface Window {
  electron?: {
    getLocale: () => Promise<string>;
    getBattery: () => Promise<any>; // Using any for now, can refine with Systeminformation types
  };
  aurora?: {
    checkRamUsage: () => void;
  };
}

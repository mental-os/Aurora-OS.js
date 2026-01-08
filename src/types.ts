export type MenuItem =
    | { type: 'separator' }
    | {
        type?: 'item' | 'checkbox';
        label?: string;
        labelKey?: string;
        shortcut?: string; // "⌘N", "Ctrl+C", etc.
        action?: string;   // Action ID to dispatch event
        checked?: boolean;
        disabled?: boolean;
        submenu?: MenuItem[];
    };

export interface AppMenuConfig {
    menus: string[]; // Order of top-level menus
    items?: Record<string, MenuItem[]>; // Content for each menu
}

export interface BatteryInfo {
    level: number; // 0-1
    charging: boolean;
    chargingTime: number | null;
    dischargingTime: number | null;
    // Extended info (Electron / Advanced)
    health?: number;
    cycleCount?: number;
    temperature?: number;
    voltage?: number;
}

export interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener(type: 'chargingchange' | 'chargingtimechange' | 'dischargingtimechange' | 'levelchange', listener: () => void): void;
    removeEventListener(type: 'chargingchange' | 'chargingtimechange' | 'dischargingtimechange' | 'levelchange', listener: () => void): void;
}
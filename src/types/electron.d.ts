export interface DisplaySettings {
    mode: 'fullscreen' | 'borderless' | 'windowed';
    width: number;
    height: number;
    frame: boolean;
}

export interface SystemInfo {
    cpu: {
        cores: number;
        model: string;
    };
    memory: {
        total: number;
    };
    os: {
        platform: string;
    };
    gpu: {
        model: string;
        vram: number;
    };
}

export interface IElectronAPI {
    getLocale: () => Promise<string>;
    getBattery: () => Promise<any>;
    getSystemInfo: () => Promise<SystemInfo | null>;
    checkConnection: () => Promise<{ system: number | null, caravane: number | null } | null>;
    getDisplaySettings: () => Promise<DisplaySettings>;
    setDisplaySettings: (settings: DisplaySettings) => Promise<boolean>;
    onDisplayChange: (callback: (settings: DisplaySettings) => void) => () => void;
}

declare global {
    interface Window {
        electron?: IElectronAPI;
    }
}

declare module 'electron-squirrel-startup' {
    const squirrelStartup: boolean;
    export default squirrelStartup;
}

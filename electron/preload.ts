import { contextBridge, ipcRenderer } from 'electron';

// Expose protected APIs to renderer
contextBridge.exposeInMainWorld('electron', {
    getLocale: () => ipcRenderer.invoke('get-locale'),
    getBattery: () => ipcRenderer.invoke('get-battery'),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    checkConnection: () => ipcRenderer.invoke('check-connection'),
    getDisplaySettings: () => ipcRenderer.invoke('get-display-settings'),
    setDisplaySettings: (settings: any) => ipcRenderer.invoke('set-display-settings', settings),
    onDisplayChange: (callback: (settings: any) => void) => {
        const subscription = (_event: any, value: any) => callback(value);
        ipcRenderer.on('display-change', subscription);
        return () => ipcRenderer.removeListener('display-change', subscription);
    },
    // Splash Screen: Signal that the React app is ready
    signalReady: () => ipcRenderer.invoke('app-ready'),

    // Save System
    savedata: {
        save: (data: string) => ipcRenderer.invoke('savedata-save', data),
        load: () => ipcRenderer.invoke('savedata-load'),
        exists: () => ipcRenderer.invoke('savedata-exists'),
        delete: () => ipcRenderer.invoke('savedata-delete'),
    }
});

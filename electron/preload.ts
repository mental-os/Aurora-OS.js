import { contextBridge, ipcRenderer } from 'electron';

// Expose protected APIs to renderer
contextBridge.exposeInMainWorld('electron', {
    getLocale: () => ipcRenderer.invoke('get-locale'),
    getBattery: () => ipcRenderer.invoke('get-battery'),
});

console.log('Electron preload script loaded');

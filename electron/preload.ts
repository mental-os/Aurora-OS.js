import { contextBridge, ipcRenderer } from 'electron';

// Expose protected APIs to renderer
contextBridge.exposeInMainWorld('electron', {
    getLocale: () => ipcRenderer.invoke('get-locale'),
});

console.log('Electron preload script loaded');

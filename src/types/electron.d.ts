export interface IElectronAPI {
    getLocale: () => Promise<string>;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}

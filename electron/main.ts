import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import squirrelStartup from 'electron-squirrel-startup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
    app.quit();
}

// IPC Handlers
ipcMain.handle('get-locale', () => {
    return app.getLocale();
});

function createWindow() {
    // Check for frame option in env var or command line args
    const frameEnabled = process.env.WINDOW_FRAME === 'true' || process.argv.includes('--frame');

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false, // Start hidden for smoother transition
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        // Disable transparency if we have a frame (standard window behavior)
        transparent: !frameEnabled,
        backgroundColor: frameEnabled ? '#ffffff' : '#00000000',
        frame: frameEnabled,
        titleBarStyle: frameEnabled ? 'default' : 'hidden',
    });

    // Windowed Fullscreen: Maximize before showing
    mainWindow.maximize();
    mainWindow.show();

    // Development or Production
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Open links in external browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
}

// OS specific behaviors
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

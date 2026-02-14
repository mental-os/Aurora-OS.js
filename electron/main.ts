import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore - types are defined in electron-env.d.ts but often missed by IDE
import squirrelStartup from 'electron-squirrel-startup';
import si from 'systeminformation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Settings Persistence
const SETTINGS_PATH = path.join(app.getPath('userData'), 'display-settings.json');

interface DisplaySettings {
    mode: 'fullscreen' | 'borderless' | 'windowed';
    width: number;
    height: number;
    frame: boolean;
}

const DEFAULT_SETTINGS: DisplaySettings = {
    mode: 'fullscreen',
    width: 1920,
    height: 1080,
    frame: false
};

function loadSettings(): DisplaySettings {
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
        }
    } catch (e) {
        console.error('Failed to load display settings:', e);
    }
    return DEFAULT_SETTINGS;
}

function saveSettings(settings: DisplaySettings) {
    try {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error('Failed to save display settings:', e);
    }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
    app.quit();
}

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception in Main Process:', error);
});


// Flag to prevent app quit when recreating window
let isRecreatingWindow = false;

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let currentSettings = loadSettings();

// --- Splash Screen Dual-Condition Close Logic ---
let splashTimerDone = false;
let appReady = false;

const SPLASH_MIN_DURATION_MS = 10000;

/**
 * Send a real progress update to the splash window.
 * @param percent  Current progress (0-100)
 * @param status   Human-readable status text
 * @param idleTarget  The progress % to slowly crawl towards while waiting for next milestone
 */
function splashProgress(percent: number, status: string, idleTarget?: number) {
    if (!splashWindow || splashWindow.isDestroyed()) return;
    const payload = JSON.stringify({ type: 'progress', percent, status, idleTarget: idleTarget ?? null });
    splashWindow.webContents.executeJavaScript(
        `window.postMessage(${payload}, '*');`
    ).catch(() => { });
}

function tryCloseSplash() {
    // Only close when BOTH conditions are met
    if (!splashTimerDone || !appReady) return;
    if (!splashWindow || splashWindow.isDestroyed()) return;

    // Signal the splash HTML to play its fade-out animation
    splashWindow.webContents.executeJavaScript(`
        window.postMessage({ type: 'close' }, '*');
    `).catch(() => { });

    // Wait for the CSS fade-out animation (300ms) then destroy
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.destroy();
            splashWindow = null;
        }

        // Show the main window
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
        }
    }, 450);
}

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 480,
        height: 350,
        frame: false,
        transparent: true,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        center: true,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Load the static splash HTML
    const splashPath = path.join(__dirname, 'splash.html');

    if (fs.existsSync(splashPath)) {
        splashWindow.loadFile(splashPath);
    } else {
        const devSplashPath = path.join(__dirname, '../electron/splash.html');
        splashWindow.loadFile(devSplashPath);
    }

    // Send version once the splash HTML is loaded
    splashWindow.webContents.on('did-finish-load', () => {
        // Version
        try {
            const pkgPath = path.join(__dirname, '../package.json');
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            splashWindow?.webContents.executeJavaScript(`
                window.postMessage({ type: 'version', version: '${pkg.version}' }, '*');
            `).catch(() => { });
        } catch {
            // Ignore
        }

        // --- Stage 1: Electron is ready, splash is visible ---
        splashProgress(5, 'Electron ready', 14);
    });

    // Start the minimum duration timer
    splashTimerDone = false;
    appReady = false;

    setTimeout(() => {
        splashTimerDone = true;
        tryCloseSplash();
    }, SPLASH_MIN_DURATION_MS);
}

function createWindow() {
    // --- Stage 2: Creating main window ---
    splashProgress(15, 'Creating main window...', 24);

    mainWindow = new BrowserWindow({
        width: currentSettings.width,
        height: currentSettings.height,
        minWidth: 1024,
        minHeight: 768,
        show: false, // Hidden until splash is done
        frame: currentSettings.mode === 'windowed' ? currentSettings.frame : false,
        transparent: currentSettings.mode !== 'windowed' || !currentSettings.frame,
        useContentSize: currentSettings.mode === 'windowed',
        backgroundColor: '#000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    applyDisplaySettings(currentSettings);

    // If there's no splash (e.g. window recreation), show immediately on ready
    if (!splashWindow || splashWindow.isDestroyed()) {
        mainWindow.once('ready-to-show', () => {
            mainWindow?.show();
        });
    }

    // --- Stage 3: Loading application URL ---
    splashProgress(25, 'Loading application...', 44);

    if (process.env.VITE_DEV_SERVER_URL) {
        process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // --- Stage 4: DOM parsed ---
    mainWindow.webContents.on('dom-ready', () => {
        splashProgress(45, 'Parsing DOM...', 64);
    });

    // --- Stage 5: All resources loaded ---
    mainWindow.webContents.on('did-finish-load', () => {
        splashProgress(65, 'Resources loaded', 84);
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    // --- SECURITY HARDENING ---
    if (!process.env.VITE_DEV_SERVER_URL) {
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow?.webContents.closeDevTools();
        });

        mainWindow.webContents.on('before-input-event', (event, input) => {
            if (input.control && input.shift && input.key.toLowerCase() === 'i') event.preventDefault();
            if (input.key === 'F12') event.preventDefault();
        });
    }

    // --- FULLSCREEN EVENTS ---
    mainWindow.on('enter-full-screen', () => {
        mainWindow?.webContents.send('display-change', { ...currentSettings, mode: 'fullscreen' });
    });

    mainWindow.on('leave-full-screen', () => {
        setTimeout(() => {
            if (mainWindow && currentSettings.mode === 'fullscreen') {
                const isMax = mainWindow.isMaximized();
                currentSettings.mode = isMax ? 'borderless' : 'windowed';
                mainWindow.webContents.send('display-change', currentSettings);
                saveSettings(currentSettings);
            }
        }, 100);
    });
}

function applyDisplaySettings(settings: DisplaySettings) {
    if (!mainWindow) return;

    currentSettings = settings;
    saveSettings(settings);

    mainWindow.setMovable(true);
    mainWindow.setResizable(true);

    if (settings.mode === 'fullscreen') {
        if (process.platform === 'darwin') {
            mainWindow.setSimpleFullScreen(true);
        } else {
            mainWindow.setFullScreen(true);
        }
    } else if (settings.mode === 'borderless') {
        if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false);
        mainWindow.setMenuBarVisibility(false);
        mainWindow.maximize();
    } else if (settings.mode === 'windowed') {
        if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false);
        if (mainWindow.isMaximized()) mainWindow.unmaximize();

        if (settings.frame) {
            mainWindow.setContentSize(settings.width, settings.height);
            mainWindow.center();
        } else {
            const display = screen.getDisplayMatching(mainWindow.getBounds());
            const x = display.bounds.x + Math.round((display.bounds.width - settings.width) / 2);
            const y = display.bounds.y + Math.round((display.bounds.height - settings.height) / 2);
            mainWindow.setBounds({ x, y, width: settings.width, height: settings.height });
        }
    }

    mainWindow.webContents.send('display-change', currentSettings);
}

// IPC Handlers
ipcMain.handle('get-locale', () => app.getLocale());

ipcMain.handle('get-battery', async () => {
    try {
        return await si.battery();
    } catch (error) {
        console.error('[Electron] Battery fetch failed:', error);
        return null;
    }
});

ipcMain.handle('check-connection', async () => {
    try {
        // 1. Primary Check: System Information (Ping Google DNS 8.8.8.8)
        const systemLatency = await si.inetLatency('8.8.8.8');

        // 2. Secondary Check / Traffic Generation: Caravane Digital
        let caravaneLatency: number | null = null;
        try {
            const start = Date.now();
            const response = await fetch('https://caravane.digital/favicon.ico', { signal: AbortSignal.timeout(2000) });
            if (response.ok) {
                caravaneLatency = Date.now() - start;
            }
        } catch (e) {
            // Ignore secondary failure
        }

        return {
            system: systemLatency,
            caravane: caravaneLatency
        };
    } catch (error) {
        console.error('[Electron] Connection check failed:', error);
        return null;
    }
});

ipcMain.handle('get-system-info', async () => {
    try {
        const [mem, cpu, osInfo, graphics] = await Promise.all([
            si.mem(),
            si.cpu(),
            si.osInfo(),
            si.graphics()
        ]);

        return {
            cpu: {
                cores: cpu.cores,
                model: cpu.brand,
            },
            memory: {
                total: mem.total,
            },
            os: {
                platform: osInfo.arch,
            },
            gpu: {
                model: graphics.controllers[0]?.model || 'Generic Display Adapter',
                vram: graphics.controllers[0]?.vram || 0,
            }
        };
    } catch (error) {
        console.error('[Electron] System info fetch failed:', error);
        return null;
    }
});

ipcMain.handle('get-display-settings', () => currentSettings);

ipcMain.handle('set-display-settings', (event, settings: DisplaySettings) => {
    if (mainWindow) {
        const willBeFrame = settings.mode === 'windowed' ? settings.frame : false;
        const wasFrame = currentSettings.mode === 'windowed' ? currentSettings.frame : false;

        const needsRebuild = willBeFrame !== wasFrame;

        if (needsRebuild) {
            currentSettings = settings;
            saveSettings(settings);

            isRecreatingWindow = true;

            if (mainWindow) {
                mainWindow.removeAllListeners();
                mainWindow.destroy();
                mainWindow = null;
            }
            createWindow();
            isRecreatingWindow = false;
        } else {
            applyDisplaySettings(settings);
        }
    }
    return true;
});

// --- Splash Screen IPC ---
ipcMain.handle('app-ready', () => {
    // --- Stage 6: React app mounted and ready ---
    splashProgress(85, 'Game engine initialized', 99);
    appReady = true;
    tryCloseSplash();
    return true;
});

// OS specific behaviors
app.whenReady().then(() => {
    createSplashWindow();
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (!isRecreatingWindow && process.platform !== 'darwin') {
        app.quit();
    }
});

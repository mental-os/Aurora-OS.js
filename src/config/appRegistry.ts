import { ComponentType, LazyExoticComponent, lazy } from 'react';
import { LucideIcon, FolderOpen, Settings, Mail, Calendar, Image, Music, Terminal, Globe, MessageSquare, FileText, Code, ShoppingBag } from 'lucide-react';
import { AppMenuConfig, ContextMenuConfig } from '../types';

// Menu Configurations
import {
  finderMenuConfig, finderContextMenuConfig,
  settingsMenuConfig,
  photosMenuConfig,
  musicMenuConfig,
  messagesMenuConfig,
  browserMenuConfig,
  terminalMenuConfig, terminalContextMenuConfig,
  devCenterMenuConfig,
  notepadMenuConfig,
  calendarMenuConfig,
  appStoreMenuConfig,
  mailMenuConfig
} from './app-menus';

// Lazy Load Components
const FileManager = lazy(() => import('@/components/FileManager').then(module => ({ default: module.FileManager })));
const SettingsApp = lazy(() => import('@/components/Settings').then(module => ({ default: module.Settings })));
const Photos = lazy(() => import('@/components/apps/Photos').then(module => ({ default: module.Photos })));
const MusicApp = lazy(() => import('@/components/apps/Music').then(module => ({ default: module.Music })));
const Messages = lazy(() => import('@/components/apps/Messages').then(module => ({ default: module.Messages })));
const Browser = lazy(() => import('@/components/apps/Browser').then(module => ({ default: module.Browser })));
const TerminalApp = lazy(() => import('@/components/apps/Terminal').then(module => ({ default: module.Terminal })));
const DevCenter = lazy(() => import('@/components/apps/DevCenter').then(module => ({ default: module.DevCenter })));
const Notepad = lazy(() => import('@/components/apps/Notepad').then(module => ({ default: module.Notepad })));
const CalendarApp = lazy(() => import('@/components/apps/Calendar').then(module => ({ default: module.Calendar })));
const AppStoreComponent = lazy(() => import('@/components/apps/AppStore').then(module => ({ default: module.AppStore })));
const MailApp = lazy(() => import('@/components/apps/Mail').then(module => ({ default: module.Mail })));

export interface AppMetadata {
    id: string;
    name: string;
    nameKey?: string;
    description: string;
    descriptionKey?: string;
    icon: LucideIcon;
    iconColor: string;           // Gradient class for dock
    iconSolid: string;           // Solid color fallback
    category: 'productivity' | 'media' | 'utilities' | 'development' | 'system';
    isCore: boolean;             // Cannot be uninstalled
    component: ComponentType<any> | LazyExoticComponent<any>;
    dockOrder?: number;          // Order in dock (lower = earlier)
    menu?: AppMenuConfig;        // App-specific menu configuration
    contextMenu?: ContextMenuConfig; // Context menu configuration
    size?: number;               // Size in MB (approximate/simulated)
    ramUsage?: number;           // Base RAM usage in MB (gamified)
}

// Centralized App Registry
export const APP_REGISTRY: Record<string, AppMetadata> = {
    // Core Apps (cannot be uninstalled)
    finder: {
        id: 'finder',
        name: 'Finder',
        description: 'File Manager',
        descriptionKey: 'appDescriptions.finder',
        icon: FolderOpen,
        iconColor: 'from-blue-500 to-blue-600',
        iconSolid: '#3b82f6',
        category: 'system',
        isCore: true,
        component: FileManager,
        dockOrder: 1,
        menu: finderMenuConfig,
        contextMenu: finderContextMenuConfig,
        size: 50,
        ramUsage: 300,
    },
    browser: {
        id: 'browser',
        name: 'Browser',
        description: 'Access the web',
        descriptionKey: 'appDescriptions.browser',
        icon: Globe,
        iconColor: 'from-blue-400 to-indigo-500',
        iconSolid: '#6366f1',
        category: 'utilities',
        isCore: true,
        component: Browser,
        dockOrder: 2,
        menu: browserMenuConfig,
        size: 280,
        ramUsage: 450,
    },
    mail: {
        id: 'mail',
        name: 'Mail',
        description: 'Read and write emails',
        descriptionKey: 'appDescriptions.mail',
        icon: Mail,
        iconColor: 'from-blue-400 to-sky-400',
        iconSolid: '#38bdf8',
        category: 'productivity',
        isCore: true,
        component: MailApp,
        dockOrder: 3,
        menu: mailMenuConfig,
        size: 120,
        ramUsage: 250,
    },
    appstore: {
        id: 'appstore',
        name: 'App Store',
        description: 'Download and manage apps',
        descriptionKey: 'appDescriptions.appStore',
        icon: ShoppingBag,
        iconColor: 'from-sky-500 to-blue-500',
        iconSolid: '#0ea5e9',
        category: 'system',
        isCore: true,
        component: AppStoreComponent,
        dockOrder: 4,
        menu: appStoreMenuConfig,
        size: 90,
        ramUsage: 200,
    },
    terminal: {
        id: 'terminal',
        name: 'Terminal',
        description: 'Command line interface',
        descriptionKey: 'appDescriptions.terminal',
        icon: Terminal,
        iconColor: 'from-gray-700 to-gray-800',
        iconSolid: '#374151',
        category: 'development',
        isCore: true,
        component: TerminalApp,
        dockOrder: 9,
        menu: terminalMenuConfig,
        contextMenu: terminalContextMenuConfig,
        size: 15,
        ramUsage: 100,
    },
    settings: {
        id: 'settings',
        name: 'System Settings',
        description: 'Configure your system',
        descriptionKey: 'appDescriptions.systemSettings',
        icon: Settings,
        iconColor: 'from-slate-500 to-zinc-600',
        iconSolid: '#71717a',
        category: 'system',
        isCore: true,
        component: SettingsApp,
        dockOrder: 10,
        menu: settingsMenuConfig,
        size: 85,
        ramUsage: 150,
    },

    // Optional Apps (can be installed/uninstalled)
    notepad: {
        id: 'notepad',
        name: 'Notepad',
        description: 'Edit text files',
        descriptionKey: 'appDescriptions.notepad',
        icon: FileText,
        iconColor: 'from-yellow-400 to-amber-500',
        iconSolid: '#f59e0b',
        category: 'productivity',
        isCore: false,
        component: Notepad,
        dockOrder: 4,
        menu: notepadMenuConfig,
        size: 35,
        ramUsage: 150,
    },
    messages: {
        id: 'messages',
        name: 'Messages',
        description: 'Chat with friends',
        descriptionKey: 'appDescriptions.messages',
        icon: MessageSquare,
        iconColor: 'from-green-500 to-emerald-600',
        iconSolid: '#10b981',
        category: 'productivity',
        isCore: false,
        component: Messages,
        dockOrder: 5,
        menu: messagesMenuConfig,
        size: 140,
        ramUsage: 250,
    },
    calendar: {
        id: 'calendar',
        name: 'Calendar',
        description: 'Manage your schedule',
        descriptionKey: 'appDescriptions.calendar',
        icon: Calendar,
        iconColor: 'from-red-500 to-red-600',
        iconSolid: '#ef4444',
        category: 'productivity',
        isCore: false,
        component: CalendarApp,
        dockOrder: 6,
        menu: calendarMenuConfig,
        size: 50,
        ramUsage: 250,
    },
    photos: {
        id: 'photos',
        name: 'Photos',
        description: 'View and manage photos',
        descriptionKey: 'appDescriptions.photos',
        icon: Image,
        iconColor: 'from-pink-500 to-rose-600',
        iconSolid: '#e11d48',
        category: 'media',
        isCore: false,
        component: Photos,
        dockOrder: 7,
        menu: photosMenuConfig,
        size: 180,
        ramUsage: 350,
    },
    music: {
        id: 'music',
        name: 'Music',
        description: 'Play your favorite music',
        descriptionKey: 'appDescriptions.music',
        icon: Music,
        iconColor: 'from-purple-500 to-purple-600',
        iconSolid: '#a855f7',
        category: 'media',
        isCore: false,
        component: MusicApp,
        dockOrder: 8,
        menu: musicMenuConfig,
        size: 210,
        ramUsage: 300,
    },

    'dev-center': {
        id: 'dev-center',
        name: 'DevCenter',
        description: 'Developer Tools',
        descriptionKey: 'appDescriptions.devCenter',
        icon: Code,
        iconColor: 'from-indigo-500 to-purple-600',
        iconSolid: '#6366f1',
        category: 'development',
        isCore: false,
        component: DevCenter,
        dockOrder: 12,
        menu: devCenterMenuConfig,
        size: 550,
        ramUsage: 1000,
    },
};

// Helper functions
export function getApp(appId: string): AppMetadata | undefined {
    return APP_REGISTRY[appId];
}

export function getAllApps(): AppMetadata[] {
    return Object.values(APP_REGISTRY);
}

export function getCoreApps(): AppMetadata[] {
    return getAllApps().filter(app => app.isCore);
}

export function getOptionalApps(): AppMetadata[] {
    return getAllApps().filter(app => !app.isCore);
}

export function getDockApps(installedAppIds: Set<string>): AppMetadata[] {
    return getAllApps()
        .filter(app => app.isCore || installedAppIds.has(app.id))
        .filter(app => app.dockOrder !== undefined)
        .sort((a, b) => (a.dockOrder || 999) - (b.dockOrder || 999));
}

export function getAppsByCategory(category: AppMetadata['category']): AppMetadata[] {
    return getAllApps().filter(app => app.category === category);
}


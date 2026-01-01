import { ComponentType } from 'react';
import { LucideIcon, FolderOpen, Settings, Mail, Calendar, Image, Music, Video, Terminal, Globe, MessageSquare, FileText, Code, ShoppingBag } from 'lucide-react';
import { FileManager, finderMenuConfig } from '../components/FileManager';
import { Settings as SettingsApp, settingsMenuConfig } from '../components/Settings';
import { Photos, photosMenuConfig } from '../components/apps/Photos';
import { Music as MusicApp, musicMenuConfig } from '../components/apps/Music';
import { Messages, messagesMenuConfig } from '../components/apps/Messages';
import { Browser, browserMenuConfig } from '../components/apps/Browser';
import { Terminal as TerminalApp, terminalMenuConfig } from '../components/apps/Terminal';
import { DevCenter, devCenterMenuConfig } from '../components/apps/DevCenter';
import { Notepad, notepadMenuConfig } from '../components/apps/Notepad';
import { PlaceholderApp } from '../components/apps/PlaceholderApp';
import { AppStore as AppStoreComponent, appStoreMenuConfig } from '../components/apps/AppStore';
import { mailMenuConfig, calendarMenuConfig, videosMenuConfig } from './appMenuConfigs';

import { AppMenuConfig } from '../types';

export interface AppMetadata {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    iconColor: string;           // Gradient class for dock
    iconSolid: string;           // Solid color fallback
    category: 'productivity' | 'media' | 'utilities' | 'development' | 'system';
    isCore: boolean;             // Cannot be uninstalled
    component: ComponentType<any>;
    dockOrder?: number;          // Order in dock (lower = earlier)
    menu?: AppMenuConfig;        // App-specific menu configuration
}

// Centralized App Registry
export const APP_REGISTRY: Record<string, AppMetadata> = {
    // Core Apps (cannot be uninstalled)
    finder: {
        id: 'finder',
        name: 'Finder',
        description: 'File Manager',
        icon: FolderOpen,
        iconColor: 'from-blue-500 to-blue-600',
        iconSolid: '#3b82f6',
        category: 'system',
        isCore: true,
        component: FileManager,
        dockOrder: 1,
        menu: finderMenuConfig,
    },
    browser: {
        id: 'browser',
        name: 'Browser',
        description: 'Access the web',
        icon: Globe,
        iconColor: 'from-blue-400 to-indigo-500',
        iconSolid: '#6366f1',
        category: 'utilities',
        isCore: true,
        component: Browser,
        dockOrder: 2,
        menu: browserMenuConfig,
    },
    mail: {
        id: 'mail',
        name: 'Mail',
        description: 'Read and write emails',
        icon: Mail,
        iconColor: 'from-blue-400 to-sky-400',
        iconSolid: '#38bdf8',
        category: 'productivity',
        isCore: true,
        component: PlaceholderApp,
        dockOrder: 3,
        menu: mailMenuConfig,
    },
    appstore: {
        id: 'appstore',
        name: 'App Store',
        description: 'Download and manage apps',
        icon: ShoppingBag,
        iconColor: 'from-sky-500 to-blue-500',
        iconSolid: '#0ea5e9',
        category: 'system',
        isCore: true,
        component: AppStoreComponent,
        dockOrder: 4,
        menu: appStoreMenuConfig,
    },
    terminal: {
        id: 'terminal',
        name: 'Terminal',
        description: 'Command line interface',
        icon: Terminal,
        iconColor: 'from-gray-700 to-gray-800',
        iconSolid: '#374151',
        category: 'development',
        isCore: true,
        component: TerminalApp,
        dockOrder: 9,
        menu: terminalMenuConfig,
    },
    settings: {
        id: 'settings',
        name: 'System Settings',
        description: 'Configure your system',
        icon: Settings,
        iconColor: 'from-slate-500 to-zinc-600',
        iconSolid: '#71717a',
        category: 'system',
        isCore: true,
        component: SettingsApp,
        dockOrder: 10,
        menu: settingsMenuConfig,
    },

    // Optional Apps (can be installed/uninstalled)
    notepad: {
        id: 'notepad',
        name: 'Notepad',
        description: 'Edit text files',
        icon: FileText,
        iconColor: 'from-yellow-400 to-amber-500',
        iconSolid: '#f59e0b',
        category: 'productivity',
        isCore: false,
        component: Notepad,
        dockOrder: 4,
        menu: notepadMenuConfig,
    },
    messages: {
        id: 'messages',
        name: 'Messages',
        description: 'Chat with friends',
        icon: MessageSquare,
        iconColor: 'from-green-500 to-emerald-600',
        iconSolid: '#10b981',
        category: 'productivity',
        isCore: false,
        component: Messages,
        dockOrder: 5,
        menu: messagesMenuConfig,
    },
    calendar: {
        id: 'calendar',
        name: 'Calendar',
        description: 'Manage your schedule',
        icon: Calendar,
        iconColor: 'from-red-500 to-red-600',
        iconSolid: '#ef4444',
        category: 'productivity',
        isCore: false,
        component: PlaceholderApp,
        dockOrder: 6,
        menu: calendarMenuConfig,
    },
    photos: {
        id: 'photos',
        name: 'Photos',
        description: 'View and manage photos',
        icon: Image,
        iconColor: 'from-pink-500 to-rose-600',
        iconSolid: '#e11d48',
        category: 'media',
        isCore: false,
        component: Photos,
        dockOrder: 7,
        menu: photosMenuConfig,
    },
    music: {
        id: 'music',
        name: 'Music',
        description: 'Play your favorite music',
        icon: Music,
        iconColor: 'from-purple-500 to-purple-600',
        iconSolid: '#a855f7',
        category: 'media',
        isCore: false,
        component: MusicApp,
        dockOrder: 8,
        menu: musicMenuConfig,
    },
    videos: {
        id: 'videos',
        name: 'Videos',
        description: 'Watch movies and clips',
        icon: Video,
        iconColor: 'from-orange-400 to-orange-500',
        iconSolid: '#f97316',
        category: 'media',
        isCore: false,
        component: PlaceholderApp,
        dockOrder: 9,
        menu: videosMenuConfig,
    },
    'dev-center': {
        id: 'dev-center',
        name: 'DevCenter',
        description: 'Developer Tools',
        icon: Code,
        iconColor: 'from-indigo-500 to-purple-600',
        iconSolid: '#6366f1',
        category: 'development',
        isCore: false,
        component: DevCenter,
        dockOrder: 12,
        menu: devCenterMenuConfig,
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

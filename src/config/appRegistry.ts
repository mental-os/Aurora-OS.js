import { ComponentType } from 'react';
import { LucideIcon, FolderOpen, Settings, Mail, Calendar, Image, Music, Video, Terminal, Globe, MessageSquare, FileText, Code, ShoppingBag } from 'lucide-react';
import { FileManager } from '../components/FileManager';
import { Settings as SettingsApp } from '../components/Settings';
import { Photos } from '../components/apps/Photos';
import { Music as MusicApp } from '../components/apps/Music';
import { Messages } from '../components/apps/Messages';
import { Browser } from '../components/apps/Browser';
import { Terminal as TerminalApp } from '../components/apps/Terminal';
import { DevCenter } from '../components/apps/DevCenter';
import { Notepad } from '../components/apps/Notepad';
import { PlaceholderApp } from '../components/apps/PlaceholderApp';
import { AppStore as AppStoreComponent } from '../components/apps/AppStore';

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
}

// Centralized App Registry
export const APP_REGISTRY: Record<string, AppMetadata> = {
    // Core Apps (cannot be uninstalled)
    finder: {
        id: 'finder',
        name: 'Finder',
        description: 'Browse and manage your files',
        icon: FolderOpen,
        iconColor: 'from-blue-500 to-blue-600',
        iconSolid: '#3b82f6',
        category: 'system',
        isCore: true,
        component: FileManager,
        dockOrder: 1,
    },
    browser: {
        id: 'browser',
        name: 'Browser',
        description: 'Surf the web',
        icon: Globe,
        iconColor: 'from-cyan-500 to-blue-600',
        iconSolid: '#06b6d4',
        category: 'utilities',
        isCore: true,
        component: Browser,
        dockOrder: 3,
    },
    mail: {
        id: 'mail',
        name: 'Mail',
        description: 'Send and receive emails',
        icon: Mail,
        iconColor: 'from-blue-400 to-blue-500',
        iconSolid: '#60a5fa',
        category: 'productivity',
        isCore: true,
        component: PlaceholderApp,
        dockOrder: 2,
    },
    appstore: {
        id: 'appstore',
        name: 'App Store',
        description: 'Install and manage applications',
        icon: ShoppingBag,
        iconColor: 'from-blue-500 to-indigo-600',
        iconSolid: '#3b82f6',
        category: 'system',
        isCore: true,
        component: AppStoreComponent,
        dockOrder: 14,
    },
    terminal: {
        id: 'terminal',
        name: 'Terminal',
        description: 'Command line interface',
        icon: Terminal,
        iconColor: 'from-gray-700 to-gray-900',
        iconSolid: '#374151',
        category: 'development',
        isCore: true,
        component: TerminalApp,
        dockOrder: 10,
    },
    settings: {
        id: 'settings',
        name: 'Settings',
        description: 'Customize your system',
        icon: Settings,
        iconColor: 'from-gray-500 to-gray-600',
        iconSolid: '#6b7280',
        category: 'system',
        isCore: true,
        component: SettingsApp,
        dockOrder: 11,
    },

    // Optional Apps (can be installed/uninstalled)
    notepad: {
        id: 'notepad',
        name: 'Notepad',
        description: 'Text and code editor with syntax highlighting',
        icon: FileText,
        iconColor: 'from-yellow-400 to-yellow-500',
        iconSolid: '#eab308',
        category: 'productivity',
        isCore: false,
        component: Notepad,
        dockOrder: 4,
    },
    messages: {
        id: 'messages',
        name: 'Messages',
        description: 'Chat with friends and family',
        icon: MessageSquare,
        iconColor: 'from-green-500 to-green-600',
        iconSolid: '#22c55e',
        category: 'utilities',
        isCore: false,
        component: Messages,
        dockOrder: 5,
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
    },
    photos: {
        id: 'photos',
        name: 'Photos',
        description: 'View and organize your photos',
        icon: Image,
        iconColor: 'from-pink-500 to-rose-600',
        iconSolid: '#ec4899',
        category: 'media',
        isCore: false,
        component: Photos,
        dockOrder: 7,
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
    },
    videos: {
        id: 'videos',
        name: 'Videos',
        description: 'Watch and manage videos',
        icon: Video,
        iconColor: 'from-orange-500 to-orange-600',
        iconSolid: '#f97316',
        category: 'media',
        isCore: false,
        component: PlaceholderApp,
        dockOrder: 9,
    },
    'dev-center': {
        id: 'dev-center',
        name: 'DevCenter',
        description: 'Developer tools and utilities',
        icon: Code,
        iconColor: 'from-purple-500 to-purple-600',
        iconSolid: '#9333ea',
        category: 'development',
        isCore: false,
        component: DevCenter,
        dockOrder: 12,
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

import { getApp } from '../config/appRegistry';
import { STORAGE_KEYS, getAppStateKey, getWindowKey } from './memory';
import { safeParseLocal } from './safeStorage';

/**
 * Constants for Gamified RAM Calculation
 */
const ACTIVE_SESSION_BASE_RAM = 512; // Base RAM for the computer running the GUI
const INACTIVE_SESSION_BASE_RAM = 128; // RAM for suspended user sessions

/**
 * Interface for stored window session
 */
interface WindowSessionStub {
    id: string;
    type: string; // appId
    owner: string;
}

/**
 * Interface for Notepad State
 */
interface NotepadStateStub {
    tabs: any[];
}

export interface RamUsageReport {
    totalMB: number;
    breakdown: {
        user: string;
        sessionType: 'Active' | 'Inactive';
        sessionRam: number;
        appsRam: number;
        totalUserRam: number;
        details: string[];
    }[];
}

/**
 * Calculates global RAM usage based on open sessions, windows, and tabs.
 * Formula:
 * - Session Base: 512MB (Active) / 128MB (Inactive)
 * - Main Window: BaseRAM * Weight
 * - Additional Windows: (BaseRAM / 2) * Weight
 * - Tabs (Notepad): (BaseRAM / 4) * Weight
 * 
 * Weight: 1.0 (Active User) / 0.5 (Inactive User)
 */
export function calculateTotalRamUsage(activeUser: string): RamUsageReport {
    const report: RamUsageReport = {
        totalMB: 0,
        breakdown: []
    };

    // 1. Identify all User Sessions with open windows
    // Key format: aurora-os-windows-{username}
    const sessionUsers = new Set<string>();

    // Also check for users who might define session but have no windows? 
    // Ideally we scan for any user-specific keys, but windows are the best proxy for a "session".
    // Alternatively, `aurora-os-settings-{username}` implies existence, but not necessarily "running session".
    // We'll stick to windows key as "active GUI session".

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.WINDOWS_PREFIX)) {
            const username = key.replace(STORAGE_KEYS.WINDOWS_PREFIX, '');
            if (username) sessionUsers.add(username);
        }
    }

    // Ensure active user is counted even if no windows open (desktop environment itself)
    sessionUsers.add(activeUser);

    // 2. Iterate Users and Calculate
    sessionUsers.forEach(user => {
        const isSelf = user === activeUser;
        const weight = isSelf ? 1.0 : 0.5;
        const sessionBase = isSelf ? ACTIVE_SESSION_BASE_RAM : INACTIVE_SESSION_BASE_RAM;

        let appsRam = 0;
        const details: string[] = [];

        // --- Process Windows ---
        const windowsKey = getWindowKey(user);
        const windowsParsed = safeParseLocal<WindowSessionStub[]>(windowsKey);
        const windows: WindowSessionStub[] = Array.isArray(windowsParsed)
            ? windowsParsed.filter(w => w && typeof w.id === 'string' && typeof w.type === 'string' && typeof w.owner === 'string')
            : [];

        // Track seen apps to distinguish Main vs Additional windows per user
        const openAppIds = new Set<string>();

        // Sort to ensure deterministic calculation? (doesn't matter for sum, but good for "which is main")
        // Just iterating is fine. First encountered = Main.

        windows.forEach(win => {
            const app = getApp(win.type);
            if (!app || !app.ramUsage) return;

            const baseRam = app.ramUsage;
            let winCost: number;
            let typeLabel: string;

            if (!openAppIds.has(win.type)) {
                // First Window (Main)
                winCost = baseRam * weight;
                openAppIds.add(win.type);
                typeLabel = 'Main Window';
            } else {
                // Additional Window
                winCost = (baseRam / 2) * weight;
                typeLabel = 'Extra Window';
            }

            appsRam += winCost;
            details.push(`[${app.name}] ${typeLabel}: ${winCost}MB`);
        });

        // --- Process Notepad Tabs ---
        const notepadKey = getAppStateKey('notepad', user);

        try {
            const state = safeParseLocal<NotepadStateStub>(notepadKey);
            // We only count tabs if there is at least one Notepad window open?
            // Logic: If app is closed, tabs are saved on disk but not "in RAM".
            // BUT, if the session is "background", maybe they are? 
            // Let's assume tabs strictly add to RAM if the app is running.
            const hasNotepadWindow = windows.some(w => w.type === 'notepad');

            if (state && hasNotepadWindow && Array.isArray(state.tabs) && state.tabs.length > 1) {
                const app = getApp('notepad');
                const baseRam = app?.ramUsage || 30;

                // First tab is covered by Window Base RAM (part of main UI)
                // Additional tabs: Base/4
                const extraTabs = state.tabs.length - 1;
                const tabCostPer = (baseRam / 4) * weight;
                const totalTabCost = extraTabs * tabCostPer;

                if (totalTabCost > 0) {
                    appsRam += totalTabCost;
                    details.push(`[Notepad] ${extraTabs} Extra Tabs: ${totalTabCost}MB`);
                }
            }
        } catch (e) {
            console.warn(`Failed to parse notepad state for ${user}`, e);
        }

        const totalUserRam = sessionBase + appsRam;
        report.totalMB += totalUserRam;

        report.breakdown.push({
            user,
            sessionType: isSelf ? 'Active' : 'Inactive',
            sessionRam: sessionBase,
            appsRam,
            totalUserRam,
            details
        });
    });

    // Round total for cleanliness
    report.totalMB = Math.round(report.totalMB);

    return report;
}

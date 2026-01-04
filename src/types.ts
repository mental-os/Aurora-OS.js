export type MenuItem =
    | { type: 'separator' }
    | {
        type?: 'item' | 'checkbox';
        label?: string;
        labelKey?: string;
        shortcut?: string; // "⌘N", "Ctrl+C", etc.
        action?: string;   // Action ID to dispatch event
        checked?: boolean;
        disabled?: boolean;
        submenu?: MenuItem[];
    };

export interface AppMenuConfig {
    menus: string[]; // Order of top-level menus
    items?: Record<string, MenuItem[]>; // Content for each menu
}

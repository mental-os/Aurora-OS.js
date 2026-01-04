import { AppMenuConfig } from '../types';

export const mailMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'View', 'Mailbox', 'Message', 'Window', 'Help'],
    items: {
        'Mailbox': [
            { label: 'New Mailbox', labelKey: 'mail.menu.newMailbox', action: 'new-mailbox' },
            { type: 'separator' },
            { label: 'Online Status', labelKey: 'mail.menu.onlineStatus', action: 'toggle-online' }
        ],
        'Message': [
            { label: 'New Message', labelKey: 'mail.menu.newMessage', shortcut: '⌘N', action: 'new-message' },
            { type: 'separator' },
            { label: 'Reply', labelKey: 'mail.menu.reply', shortcut: '⌘R', action: 'reply' },
            { label: 'Reply All', labelKey: 'mail.menu.replyAll', shortcut: '⇧⌘R', action: 'reply-all' },
            { label: 'Forward', labelKey: 'mail.menu.forward', shortcut: '⇧⌘F', action: 'forward' }
        ]
    }
};

export const calendarMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'View', 'Window', 'Help'],
    items: {
        'View': [
            { label: 'Day', labelKey: 'calendar.menu.day', shortcut: '⌘1', action: 'view-day' },
            { label: 'Week', labelKey: 'calendar.menu.week', shortcut: '⌘2', action: 'view-week' },
            { label: 'Month', labelKey: 'calendar.menu.month', shortcut: '⌘3', action: 'view-month' },
            { label: 'Year', labelKey: 'calendar.menu.year', shortcut: '⌘4', action: 'view-year' }
        ]
    }
};



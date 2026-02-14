import { AppMenuConfig, ContextMenuConfig } from '../types';
import { FolderOpen, Clipboard, Info } from 'lucide-react';

// Finder
export const finderMenuConfig: AppMenuConfig = {
  menus: ['File', 'Edit', 'View', 'Go', 'Window', 'Help'],
  items: {
    'File': [
      { labelKey: 'menubar.items.newWindow', shortcut: '⌘N', action: 'new-window' },
      { labelKey: 'menubar.items.newFolder', shortcut: '⇧⌘N', action: 'new-folder' },
      { type: 'separator' },
      { labelKey: 'menubar.items.closeWindow', shortcut: '⌘W', action: 'close-window' }
    ],
    'Edit': [
      { labelKey: 'menubar.items.undo', shortcut: '⌘Z', action: 'undo' },
      { labelKey: 'menubar.items.redo', shortcut: '⇧⌘Z', action: 'redo' },
      { type: 'separator' },
      { labelKey: 'menubar.items.cut', shortcut: '⌘X', action: 'cut' },
      { labelKey: 'menubar.items.copy', shortcut: '⌘C', action: 'copy' },
      { labelKey: 'menubar.items.paste', shortcut: '⌘V', action: 'paste' },
      { labelKey: 'menubar.items.selectAll', shortcut: '⌘A', action: 'select-all' }
    ],
    'Go': [
      { labelKey: 'menubar.items.back', shortcut: '⌘[', action: 'go-back' },
      { labelKey: 'menubar.items.forward', shortcut: '⌘]', action: 'go-forward' },
      { labelKey: 'menubar.items.enclosingFolder', shortcut: '⌘↑', action: 'go-up' },
      { type: 'separator' },
      { labelKey: 'fileManager.places.home', shortcut: '⇧⌘H', action: 'go-home' },
      { labelKey: 'fileManager.places.desktop', shortcut: '⇧⌘D', action: 'go-desktop' },
      { labelKey: 'fileManager.places.downloads', shortcut: '⌥⌘L', action: 'go-downloads' }
    ]
  }
};

export const finderContextMenuConfig: ContextMenuConfig = {
  items: [
    { type: 'item', labelKey: 'menubar.items.newFolder', label: 'New Folder', action: 'new-folder', icon: FolderOpen },
    { type: 'item', labelKey: 'menubar.items.paste', label: 'Paste', action: 'paste', disabled: true, icon: Clipboard },
    { type: 'separator' },
    { type: 'item', labelKey: 'menubar.items.getInfo', label: 'Get Info', action: 'get-info', icon: Info }
  ]
};

// Browser
export const browserMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'View', 'History', 'Window', 'Help'],
    items: {
        'File': [
            { label: 'New Tab', labelKey: 'browser.menu.newTab', shortcut: '⌘T', action: 'new-tab' },
            { label: 'New Window', labelKey: 'menubar.items.newWindow', shortcut: '⌘N', action: 'new-window' },
            { type: 'separator' },
            { label: 'Close Tab', labelKey: 'browser.menu.closeTab', shortcut: '⌘W', action: 'close-tab' }
        ],
        'View': [
            { label: 'Reload', labelKey: 'browser.menu.reload', shortcut: '⌘R', action: 'reload' },
            { type: 'separator' },
            { label: 'Actual Size', labelKey: 'browser.menu.actualSize', shortcut: '⌘0', action: 'zoom-reset' },
            { label: 'Zoom In', labelKey: 'browser.menu.zoomIn', shortcut: '⌘+', action: 'zoom-in' },
            { label: 'Zoom Out', labelKey: 'browser.menu.zoomOut', shortcut: '⌘-', action: 'zoom-out' }
        ],
        'History': [
            { label: 'Back', labelKey: 'browser.menu.back', shortcut: '⌘[', action: 'back' },
            { label: 'Forward', labelKey: 'browser.menu.forward', shortcut: '⌘]', action: 'forward' }
        ]
    }
};

// Mail
export const mailMenuConfig: AppMenuConfig = {
  menus: ["File", "Edit", "View", "Mailbox", "Message", "Window", "Help"],
  items: {
    Mailbox: [
      {
        label: "New Mailbox",
        labelKey: "mail.menu.newMailbox",
        action: "new-mailbox",
      },
      { type: "separator" },
      {
        label: "Online Status",
        labelKey: "mail.menu.onlineStatus",
        action: "toggle-online",
      },
    ],
    Message: [
      {
        label: "New Message",
        labelKey: "mail.menu.newMessage",
        action: "new-message",
        shortcut: "Ctrl+N",
      },
      { type: "separator" },
      {
        label: "Reply",
        labelKey: "mail.menu.reply",
        action: "reply",
        shortcut: "Ctrl+R",
      },
      {
        label: "Reply All",
        labelKey: "mail.menu.replyAll",
        action: "reply-all",
        shortcut: "Ctrl+Shift+R",
      },
      {
        label: "Forward",
        labelKey: "mail.menu.forward",
        action: "forward",
        shortcut: "Ctrl+F",
      },
    ],
  },
};

// App Store
export const appStoreMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'Store', 'Window', 'Help'],
    items: {
        'Store': [
            { label: 'Reload', labelKey: 'menubar.items.reload', shortcut: '⌘R', action: 'reload' },
            { type: 'separator' },
            { label: 'Check for Updates...', labelKey: 'appStore.menu.checkForUpdates', action: 'check-updates' },
            { label: 'View My Account', labelKey: 'appStore.menu.viewMyAccount', action: 'view-account' }
        ]
    }
};

// Terminal
export const terminalMenuConfig: AppMenuConfig = {
    menus: ['Shell', 'Edit', 'View', 'Window', 'Help'],
    items: {
        'Shell': [
            { label: 'New Tab', labelKey: 'terminal.menu.newTab', shortcut: '⌘T', action: 'new-tab' },
            { label: 'New Window', labelKey: 'menubar.items.newWindow', shortcut: '⌘N', action: 'new-window' },
            { type: 'separator' },
            { label: 'Clear Scrollback', labelKey: 'terminal.menu.clearScrollback', shortcut: '⌘K', action: 'clear' },
            { type: 'separator' },
            { label: 'Close Window', labelKey: 'menubar.items.closeWindow', shortcut: '⌘W', action: 'close-window' }
        ],
        'Edit': [
            { label: 'Copy', labelKey: 'menubar.items.copy', shortcut: '⌘C', action: 'copy' },
            { label: 'Paste', labelKey: 'menubar.items.paste', shortcut: '⌘V', action: 'paste' },
            { label: 'Select All', labelKey: 'menubar.items.selectAll', shortcut: '⌘A', action: 'select-all' }
        ]
    }
};

export const terminalContextMenuConfig: ContextMenuConfig = {
    items: [
        { type: 'item', labelKey: 'terminal.menu.clearScrollback', label: 'Clear Scrollback', action: 'clear' },
        { type: 'separator' },
        { type: 'item', labelKey: 'terminal.menu.killProcess', label: 'Kill Process', action: 'kill', destructive: true } // destructive = red
    ]
};

// Settings
export const settingsMenuConfig: AppMenuConfig = {
  menus: ['File', 'Edit', 'View', 'Window', 'Help'],
  items: {
    'File': [
      { label: 'Close Window', labelKey: 'menubar.items.closeWindow', shortcut: '⌘W', action: 'close-window' }
    ],
    'View': [
      { label: 'General', labelKey: 'settings.sidebar.general', action: 'view-general' },
      { label: 'Appearance', labelKey: 'settings.sidebar.appearance', action: 'view-appearance' },
      { label: 'Display', labelKey: 'settings.sidebar.display', action: 'view-display' }
    ]
  }
};


// Notepad
export const notepadMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'Format', 'View', 'Window', 'Help'],
    items: {
        'File': [
            { labelKey: "notepad.menu.new", shortcut: "⌘N", action: "new" },
            { labelKey: "notepad.menu.open", shortcut: "⌘O", action: "open" },
            { labelKey: "notepad.menu.save", shortcut: "⌘S", action: "save" },
            { type: "separator" },
            {
                labelKey: "notepad.menu.closeTab",
                shortcut: "⌘W",
                action: "close-tab",
            },
        ],
        'Edit': [
            { label: 'Undo', labelKey: 'menubar.items.undo', shortcut: '⌘Z', action: 'undo' },
            { label: 'Redo', labelKey: 'menubar.items.redo', shortcut: '⇧⌘Z', action: 'redo' },
            { type: 'separator' },
            { label: 'Cut', labelKey: 'menubar.items.cut', shortcut: '⌘X', action: 'cut' },
            { label: 'Copy', labelKey: 'menubar.items.copy', shortcut: '⌘C', action: 'copy' },
            { label: 'Paste', labelKey: 'menubar.items.paste', shortcut: '⌘V', action: 'paste' },
            { label: 'Select All', labelKey: 'menubar.items.selectAll', shortcut: '⌘A', action: 'select-all' },
            { type: 'separator' },
            { label: 'Find', labelKey: 'menubar.items.find', shortcut: '⌘F', action: 'find' }
        ],
        'Format': [
            { labelKey: "notepad.menu.bold", shortcut: "⌘B", action: "format-bold" },
            {
                labelKey: "notepad.menu.italic",
                shortcut: "⌘I",
                action: "format-italic",
            },
            { labelKey: "notepad.menu.list", shortcut: "⌘L", action: "format-list" },
            { type: "separator" },
            { labelKey: "notepad.menu.heading1", action: "format-h1" },
            { labelKey: "notepad.menu.heading2", action: "format-h2" },
        ],
        'View': [
            {
                labelKey: "notepad.menu.togglePreview",
                shortcut: "⌘P",
                action: "toggle-preview",
            },
            { type: "separator" },
            { labelKey: "notepad.menu.zoomIn", shortcut: "⌘+", action: "zoom-in" },
            { labelKey: "notepad.menu.zoomOut", shortcut: "⌘-", action: "zoom-out" },
        ],
    }
};

// Messages
export const messagesMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'View', 'Conversations', 'Window', 'Help'],
    items: {
        'Conversations': [
            { label: 'New Message', labelKey: 'messages.menu.newMessage', shortcut: '⌘N', action: 'new-message' },
            { type: 'separator' },
            { label: 'Close Conversation', labelKey: 'messages.menu.closeConversation', shortcut: '⌘W', action: 'close-conversation' }
        ]
    }
};

// Calendar
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

// Photos
export const photosMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'Image', 'View', 'Window', 'Help'],
    items: {
        'Image': [
            { label: 'Slideshow', labelKey: 'photos.menu.slideshow', action: 'slideshow' },
            { type: 'separator' },
            { label: 'Rotate Clockwise', labelKey: 'photos.menu.rotateClockwise', shortcut: '⌘R', action: 'rotate-cw' },
            { label: 'Rotate Counter Clockwise', labelKey: 'photos.menu.rotateCounterClockwise', shortcut: '⇧⌘R', action: 'rotate-ccw' }
        ]
    }
};

// Music
export const musicMenuConfig: AppMenuConfig = {
    menus: ["File", "Edit", "Song", "View", "Controls", "Window", "Help"],
    items: {
        File: [
            {
                labelKey: "music.menu.newPlaylist",
                shortcut: "⌘N",
                action: "new-playlist",
            },
            { labelKey: "music.menu.import", shortcut: "⌘O", action: "import" },
            { type: "separator" },
            {
                labelKey: "music.menu.closeWindow",
                shortcut: "⌘W",
                action: "close-window",
            },
        ],
        Song: [
            {
                labelKey: "music.menu.showInFinder",
                shortcut: "⌘R",
                action: "show-in-finder",
            },
            { labelKey: "music.menu.addToPlaylist", action: "add-to-playlist" },
        ],
        Controls: [
            { labelKey: "music.menu.play", shortcut: "Space", action: "play-pause" },
            { type: "separator" },
            { labelKey: "music.menu.previousSong", shortcut: "⌘←", action: "prev" },
            { labelKey: "music.menu.nextSong", shortcut: "⌘→", action: "next" },
            { type: "separator" },
            { labelKey: "music.menu.volumeUp", shortcut: "⌘↑", action: "volume-up" },
            {
                labelKey: "music.menu.volumeDown",
                shortcut: "⌘↓",
                action: "volume-down",
            },
        ],
    },
};


// DevCenter
export const devCenterMenuConfig: AppMenuConfig = {
    menus: ['File', 'Edit', 'View', 'Tools', 'Window', 'Help'],
    items: {
        'Tools': [
            { labelKey: 'devCenter.menu.resetFilesystem', action: 'reset-fs' },
            { type: 'separator' },
            { labelKey: 'devCenter.menu.runDiagnostics', action: 'run-diagnostics' }
        ]
    }
};

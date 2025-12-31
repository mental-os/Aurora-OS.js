# Aurora OS.js [![Version](https://img.shields.io/badge/Version-v0.7.5-blue)](https://github.com/mental-os/Aurora-OS.js) [![GitHub Pages](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml) [![Dependabot](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependabot/dependabot-updates) [![Build](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml)

A modern, web-based desktop operating system interface built with React, Tailwind CSS, and Radix UI.

## Features

- **Project Integrity**: Built-in identity validation ("Safe Mode" degradation on tampering) and hidden attribution ("Insurance Policy").
- **Desktop Environment**: Windows 11-inspired grid layout, multi-select drag-and-drop, and fluid window management with snap-like behavior.
- **Window Management**: Minimize, maximize, close, and focus management with preserved state and independent navigation.
- **Virtual Filesystem**: Complete in-memory Linux-style filesystem (`/bin`, `/etc`, `/home`, etc.) with permissions (Owner/Group/Others, Sticky Bit) and persistent storage.
- **User Management**: Multi-user support with bidirectional `/etc/passwd` syncing and dedicated Settings panel.
- **App Ecosystem**:
  - **Finder**: Full-featured file manager with breadcrumbs navigation, drag-and-drop file moving, and list/grid views.
  - **Terminal**: Zsh-like experience with autocomplete, command history, pipe support, stealth commands, and ability to launch GUI apps (`Finder /home`).
  - **Settings**: System control panel for Appearance (Accent Colors, Themes), Performance (Motion/Shadows), and Data Management (Soft/Hard Reset).
  - **Browser**: Functional web browser simulation with bookmarks, history, and tab management.
  - **Media**: Interactive Music, Messages, and Photos apps demonstrating UI patterns.
- **Security & Performance**:
  - **Content Security Policy**: Strict CSP preventing XSS and `eval` execution in production.
  - **Debounced Persistence**: Efficiently saves state to localStorage without UI freezing.
  - **Native Integration**: Electron support with native window frame options and shell integration.
- **Customization**:
  - **Theming**: "2025" Color Palette with dynamic Neutral, Shades, and Contrast modes.
  - **Accessibility**: Reduce Motion and Disable Shadows options for lower-end devices.

## Tech Stack

- **Framework**: React 19 (Vite 7)
- **Styling**: Tailwind CSS v4
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Animation**: Motion (Framer Motion)
- **Audio**: Howler.js
- **Charts**: Recharts
- **Components**: Sonner (Toasts), Vaul (Drawers), CMDK, React Day Picker
- **Testing**: Vitest

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

### Testing
This project uses **Vitest** for unit & integration testing.
```bash
npm test
```

## Release Notes
 
### v0.7.5

#### App Store Infrastructure & Binary Simulation
- **Virtual Binary System**: Apps are now treated as "installed binaries" located in `/usr/bin` (e.g., `/usr/bin/music`, `/usr/bin/notepad`).
- **Launch Guards**: The OS and Finder now verify the existence of the app binary before attempting to launch it, simulating a real file system dependency.
- **App Store Foundation**: Laid the groundwork for a future App Store by decoupling app logic from system availability—apps can now be "uninstalled" (binary removed) or "installed" dynamically.

#### Music App Restoration & Fixes
- **Restored "Real-Life" App Behavior**: Music playback is now strictly gated by the application window. Double-clicking a file opens the app, which then initiates playback. This prevents "headless" background audio and resolves infinite restart loops.
- **Context Switching Fixed**: Resolved an issue where switching between songs with the same index (e.g., in different playlists) would fail to update the audio. The engine now uses unique Song IDs for reliable tracking.

#### Notepad & Shell Integration
- **Shell Script Support**: Added native support for `.sh` files.
- **Bash Syntax Highlighting**: Integrated `prism-bash` for accurate syntax coloring of shell scripts.
- **File Association**: `.sh` files now automatically open in Notepad from Desktop and Finder.

#### System Improvements
- **Window Management Logic**: Fixed a bug where opening a file in an already-open app would update the data but not refresh the window content. Existing windows now correctly re-mount with new file data.


[View to-do list](TO-DO.md)

[View full version history](HISTORY.md)

# License & Others

- **Licensed as**: [AGPL-3.0e](LICENSE)
- **Open-source code**: [OPEN-SOURCE.md](OPEN-SOURCE.md)
- **AI Disclosure**: This project, "Aurora OS," is human-written, with AI tools assisting in documentation, GitHub integrations, bug testing, and roadmap tracking. As soon as this project is ready for release, all the AI tools will be removed and the generated content (audio, images, etc.) will be human-created.

# Community
Soon

# Aurora OS.js [![Version](https://img.shields.io/badge/Version-v0.7.2_patch3-blue)](https://github.com/mental-os/Aurora-OS.js) [![GitHub Pages](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml) [![Dependabot](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependabot/dependabot-updates) [![Build](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml)

A modern, web-based desktop operating system interface built with React, Tailwind CSS, and Radix UI.

## Features

- **Desktop Environment**: Windows 11-inspired grid layout, multi-select drag-and-drop, and fluid window management with snap-like behavior.
- **Window Management**: Minimize, maximize, close, and focus management with preserved state and independent navigation.
- **Virtual Filesystem**: Complete in-memory Linux-style filesystem (`/bin`, `/etc`, `/home`, etc.) with permissions (Owner/Group/Others, Sticky Bit) and persistent storage.
- **User Management**: Multi-user support with bidirectional `/etc/passwd` syncing and dedicated Settings panel.
- **App Ecosystem**:
  - **Finder**: Full-featured file manager with breadcrumbs navigation, drag-and-drop file moving, and list/grid views.
  - **Terminal**: Zsh-like experience with autocomplete, command history, pipe support, and ability to launch GUI apps (`Finder /home`).
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
- **Styling**: Tailwind CSS
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Animation**: Motion (Framer Motion)
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

### v0.7.2-patch3
- **User Experience**:
    - **Seamless Session Switching**: "Switch User" now suspends the session (preserving open windows/apps) instead of logging out, allowing users to resume exactly where they left off.
    - **Visual Indicators**: Added "active" (Amber pulsing dot) and "resume" (Blue text) badges on the Login Screen to clearly indicate running or saved sessions.
    - **Explicit Controls**: Added a dedicated "Log Out" button on the password entry screen for forcefully clearing a suspended session.
    - **Menu Bar**: Added "Switch User" to the Apple menu and modernized the "Log Out" action.
    - **Tooltips**: Added high-performance tooltips to Menu Bar items (e.g., "About This Computer") with corrected z-indexing and positioning.
- **Codebase Refactoring**:
    - **Window Management Hook**: Extracted complex window logic (open, close, minimize, persistence) from `App.tsx` into a reusable `src/hooks/useWindowManager.ts`, reducing main component size by ~20%.
    - **Session Architecture**: Centralized all session storage logic in `src/utils/memory.ts`, eliminating redundant keys and scattered `localStorage` calls across the app.
- **Bug Fixes**:
    - **Switch Flow**: Fixed a regression where switching users would incorrectly return to the desktop due to a missing state clearing call.
    - **Tooltip Rendering**: Fixed tooltips appearing behind the menu bar or off-screen.
- **Migration System**:
    - **Smart Merge Algorithm**: Implemented a non-destructive migration strategy for version updates.
    - **Persistence**: New features are added to users' filesystems while strictly preserving existing modifications, preventing "hard resets" and respecting user customization.
- **Terminal & Security**:
    - **Session Isolation**: `sudo` and `su` commands now spawn isolated sessions within the terminal tab, changing the effective user only for that specific shell context without affecting the global desktop session.
    - **Dynamic UI**: Terminal prompt and input colors now dynamically reflect the active user (Red for root, System Accent for User, Purple for others).
    - **History Persistence**: Command history is now consistently saved per-session and accurately preserved even after `clear`, behaving like ZSH.
    - **Isolation Logic**: File operations (touch, rm, etc.) strictly respect the effective terminal user's permissions, allowing true multi-user simulation (e.g., standard users cannot delete root-owned files in `/var`).

[View full version history](HISTORY.md)

# License & Others

- **Licensed as**: [AGPL-3.0e](LICENSE)
- **AI Disclosure**: This project, "Aurora OS," is human-written, with AI tools assisting in documentation, GitHub integrations, bug testing, and roadmap tracking.

# Community
Soon

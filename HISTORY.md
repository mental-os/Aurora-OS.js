## 0.8.5

### Added

- **GPU Capabilities**: Added hardware acceleration toggle in BIOS and Settings (High Fidelity vs Performance presets).
- **Network Simulation**: with functional connection applet and password input. OS is responsive to the network state and react to the connection specifications (speed, signal, etc.): open/WEP/WPA/WPA2/WPA3 security that reflects the max. download speed of the network, signal strength that sets the percentage of the max. download speed, and more to come.
- **Localization**: Full native translations for 12 languages (EN, DE, ES, FR, PT, RO, RU, JA, PL, KO, TR, ZH) and added Hindi language WIP.
- **Persistence**: Graphics settings (BioS) now strictly survive "New Game" resets.
- **Browser**: is now aware of the `/etc/hosts` file and can resolve domain names to IP addresses.
- **Display settings**: for the System Settings APP in a simmilar way as the Main Menu > BIOS.
- **Splash screen**: for the native build, that preloads the game in the background.

### Improved

- **Bundle Size Optimization**: Reduced build size by ~65% through conversion of all wallpapers to AVIF format (4.5MB → 1.6MB), lazy loading of all applications (code-split into 12 separate chunks), and Electron-specific compression strategy (ASAR maximum compression, removed redundant web-only optimizations).
- **Audio Optimization**: Converted all system and UI sounds to Opus format, reducing audio asset size by ~50% (4MB → 2MB) while maintaining high quality (UI sounds reduced by 97%).
- **Battery Applet**: Enhanced with color-coded status indicators (red ≤20%, yellow ≤50%, white >50%) for percentage text and progress bar. Verified real hardware data integration on macOS (voltage, cycle count, battery health).
- **Window Performance**: Implemented "Safe" closing animations and optimized z-index handling to reduce layout thrashing.
- **Browser UI**: to match the OS theme and dynamic colors.
- **Browser's websites**: Improved layout and responsiveness for all the available websites.
- **Context Awareness**: Updated AI agent documentation (`context.md`) to reflect the latest architecture mechanics.
- **App Center**: Improved with network connection check and progress the install of apps based on the effective speed of the network (first 50% of the progress bar is network, second 50% is based on system performance - random for now, not yet implemented).
- **Native full-screen**: Implemented native full-screen mode for host-OS (Windows, Linux, macOS) and added a the necesarry code to enable it in BIOS (Settings menu).
- **Debouncing & Sanitization**: for localStorage to prevent prototype pollution and other security issues across various APPs and systems.
- **Memory**: Optimized to use standardized keys and a tiered priority related to various system functions (user logout, new game, close > continue game, etc.).
- **Browser**: Improved the pages loading speed mechanism by using the same logic of the App Store (WPA3 is instant, downgrading speed based on the security type of the network, signal strength, etc.).
- **Network**: Improved statistics and network details display in System Settings > Network.

### Fixed

- **Translation Gaps**: Resolved missing keys and placeholders in non-English locales.
- **Settings Sync**: Fixed issues where BIOS settings weren't correctly applying to the `SystemConfig`.
- **Security**: Resolved high-severity vulnerabilities (GHSA-8qq5-rm4j-mr97) in the `node-tar` package by implementing a global dependency override to `tar@^7.5.6`.
- **DEV Center**: is now available only with "Developer mode" enabled in System Settings > About.

## 0.8.4

### Added

- **Photos App**: Full-featured gallery with albums, favorites, lightbox, and background library scanning.
- **Mock Content**: Initial set of high-quality mock images seeded to `~/Pictures`.
- **Simulated Cloud Services**: Added initial support for simulated cloud services (e.g., TrustMail accounts DB, messages DB).
- **TrustMail**: Added Account Recovery system with secret key generation and storage.
- **Fully functional Messages App**: with support for multiple accounts, bidirectional chat, and more.
- **Notifications Applet**: Added initial support for app notifications and HeadsUp notifications (implemented in the Messages app).
- **App Store**: Uninstall confirmation and window closing block event if an app is still installing.
- **DevCenter - Messages Debugger**: New debugging interface for Messages app with account creation, registry management, and message sending tools.
- **Memory Management**: New configurable System Memory (default 2GB) with dynamic App Launch Gates that prevent opening apps when RAM is insufficient.

### Removed

- **TrustMail and Mail**: Dependency on local inbox and outbox.
- **TrustMail**: Removed single-account limitation (multi-account support).
- **DevCenter**: Removed legacy System Logs tab in favor of more focused debugging tools.

### Improved

- **Architecture**: Standardized internal imports to use absolute `@/` alias.
- **Configuration**: Centralized all brand identity (colors, wallpapers, name) into `systemConfig.ts` for easier white-labeling and theming.
- **Multi-User**: Enhanced app isolation (local providers) for `sudo`/`su` sessions.
- **Localization**: Achieved 100% translation parity across all 12 supported languages (EN, DE, ES, FR, PT, RO, ZH, RU, JA, PL, KO, TR).
- **Audio**: Added dedicated Ambiance channel with independent volume control and hierarchical settings persistence.
- **Boot Sequence**: Improved startup sounds with high-quality assets for Intro (`computerStart`) and BIOS (`biosStart`).
- **DevCenter**: Complete UI overhaul with new Apps debugging section, enhanced File System explorer with detailed file properties, and unified glassmorphism aesthetic with system accent colors.
- **Internationalization**: All DevCenter UI strings are now fully localized with synchronized translations across all supported languages.
- **Calendar**: Added drag & drop support.
- **Calendar**: Added dynamic categories support `(.config/calendar.json)`.
- **Calendar first event**: aka. "Loop Started" event is now set to follow the onboarding completion time.
- **Time source**: now influences Calendar app (local time vs. server time).
- **Modals**: such as "Open File" or "Create/Edit Event" blurs the background.
- **Main Services & Mail**: Trash functionality and permanent deletion.
- **Mail App**: Improved UI and responsive design to match Messages App.
- **Terminal performance**: by switching to memos, the terminal is now much faster and more responsive.
- **Notifications**: Clear distinction between system notifications (debug notifications in bottom right) and app notifications (app events notifications in top right and the Notifications applet).
- **App Store**: Improved UI and responsive design to match other Apps.
- **Main Menu**: Added "Contribute" tab and "Developer disclaimer" floating window.
- **Modals**: Added `Escape` key close support and Arrow key navigation for tabs in `Settings` and `Credits` modals.
- **Onboarding**: Improved user flow with `Escape` to cancel/go back and `Enter` to advance steps.
- **BIOS Settings**: Complete overhaul with tabbed interface, graphics presets (Ultra/Performance), and granular audio controls.
- **Pre-boot flow**: Improved support for keyboard navigation and user experience.

### Fixed

- **System Stability**: Resolved "System Critical Error" caused by React Context duplication.
- **Audio**: Fixed unwarranted "warning" sound during New Game initialization by silencing user-less system reset notifications.
- **Login Screen**: Fixed password hint display bug where it would incorrectly default to "guest" for users with empty hints.
- **Drag & Drop**: Fixed drag-and-drop support system-wide (Finder, Calendar, etc.) avoiding double-click triggers (browsers limitation).
- **Finder**: Fixed double-click launch reliability and "Open Folder" case-sensitivity issues.
- **Mail App**: Fixed remembering opened tabs after app close, or relogin.
- **Terminal text selection**: Fixed text selection in Terminal app created by the "no text selection" settings across the app (input boxes should be fine).
- **DevCenter**: Updated to include all current features in a unified testing environment with proper storage key usage and Messages DB integration.
- **Session**: Prevented apps from auto-playing/opening content when restoring old sessions.

## 0.8.3

### Added

- **Context menu**: Each APP feeds context menu information the same way they feed Menu Bar items. Some apps may not have/require context menu items.
- **Finder**: Recursive search functionality aware of the current location.
- **Music**: Added support for scanning real metadata for files in `/src/assets/sounds` (was relying on filename before).

### Improved

- **Standardized System Notifications**: All feedback notifications (errors, warnings, etc.) now use the same system notification component `notification.tsx`. These are different than App notifications that will go into the notification center (applet).
- **Finder**: Show item count in the sidebar for Favorites and for Locations sections.
  debar is aware of the existing folders in user's home directory.
- **Finder/Desktop**: Context menu copy/paste functionality.
- **Finder/Desktop**: Improved "Get Info" diagnostic display with rich, internationalized details (Permissions, Owner, Modified, Size).
- **All APPs**: Benefit from optimizations, especially in terms of React drawing and memory usage.
- **Notepad**: Opens with an empty state that propts user to open a file, instead of the clasic "first tab already open" - this gives the posibility to close all tabs.
- **Translation System**: Added `.scripts/check-identical-translations.js` to identify potentially untranslated strings by comparing locales against the English baseline.
- **I18n Coverage**: Fully localized missing strings in `de.ts`, `es.ts`, `fr.ts`, and `pt.ts`, and refined `ro.ts` for natural phrasing.
- **Translation System**: `.scripts/check-i18n.js` script find automatically missing or extra keys in translations as well as all the files in `/src/i18n/locales`. Aditional workflow for translations is added in [TRANSLATION.md](TRANSLATION.md).

### Fixed

- **Finder**: Drag-to-move to same location bug.
- **Finder**: Drag-to-move from one window to another now corectly checks for permissions (applies to Desktop too).
- **Finder**: Drop highlight issue when it stayed active in some cases.
- **Finder**: Terminal not passing the correct home path to Finder (eg. `su guest` > `finder ~` should open Finder as guest in `/home/guest`, but it opened in `/home/[user]`).
- **Notepad**: Tabs now remain active when closing and opening Notepad. Unsaved files prevent the app from closing.
- **Notepad**: Tabs now remember the mode of each tab (edit / preview) to prevent unwanted preview mode where it is not supported.
- **Music**: Ghost keys issue that appeared even if the app was not installed is now fixed.
- **Music**: The subsystem of scanning metadata, handleling Sound applet, etc. is tied to the actual launch of the Music app, avoiding issues like not having the Music app installed but still producing effects.

## 0.8.2

### Added

- **Gamified Resource Monitor**: Implemented a global RAM monitoring system that simulates resource usage based on active/inactive user sessions, open windows, and background throttling.
- **Memory Applet**: Added a new applet that displays memory usage and provides a way to see memory usage in real-time.
- **Debugging Tools**: Exposed `window.aurora.checkRamUsage()` for real-time resource analysis in the console.
- **Internationalization (i18n)**: Complete translation support for **Battery Applet** and **Audio Applet** across 6 languages (en, es, fr, de, pt, ro).
- **Battery Metrics**: Added detailed battery health, cycle count, temperature, and voltage metrics (visible on supported hardware).
- **Browser**: Added support for multiple tabs (add, close, switch), and implemented bookmark storage, a toggleable star icon, and a bookmark bar that appears when items are saved.
- **Terminal**: Added the `history` command to show command history and clear it.
- **Support for Chinese (simplified) language**

### Improved

- **Realistic App Resources**: Recalibrated all applications with "heavy" modern resource footprints (e.g., Browser ~450MB, DevCenter ~800MB) for better simulation accuracy.
- **Desktop Detection**: Battery applet now intelligently hides sensor data on desktop environments while preserving basic status.
- **Audio Applet**: Refactored to support dynamic localization keys.
- **Browser**: Added a simulated progress bar (loads to 80% -> pauses -> finishes) for better UX.
- **Menu Bar time**: Clicking the time switches from server time to local time.
- **Support for small screens**: Improved support for 1366x768 resolution, adapting the apps spawning position and size relative to the screen size.
- **Music App and applet**: Added seek bar control.
- **Docker**: is now responsive with an "show all apps" features for over 3 apps in the first section.
- **Code Quality**: Enhanced linting rules, resolved React hook dependency warnings, and standardized storage key management in `memory.ts`.

### Fixed

- **Tooltip Alignment**: Fixed tooltip alignment for Docker (vertically centered).
- **Calendar**: Fixed date navigation alignment.

## 0.8.1

### Added

- **Mail App**: Added mail app with basic functionality, to be further enhanced by gameplay logic and features in 0.9.x (just like Messages app should be enhanced by gameplay logic and features in 0.9.x).
- **Browser App**: Vanilla core-websites that can be opened from the browser app. For now only TrustMail produces a result (eg. interoperability with Mail and filsystem).
- **Translation**: ro-RO (Romanian), de-DE (German), and pt-BR (Portuguese) standard language added.

### Improved

- **Apps Main Menu**: Standardized to be included in [app].tsx files.
- **System States**: Improved the restart/log-out/shutdown logic.
- **Apps**: Added user context to apps, so they can access user-specific data (eg. user specific home directory, user specific downloads directory, etc.)
- **Main Menu**: Added confirmation exit at "shutdown" and a force-save function, but also translation supporrt (because Main Menu will be visible after language selection, too).
- **Environment**: Improved the synconization between dev. and build modules (TS > Vite > Electron) and added environment variables for development and production (language sync, etc.).
- **Main Menu**: Responsiveness on really small screens.
- **Onboarding**: Improved the flow of the memory saving, waiting until the last step to write choices to the memory. This prevents incomplete unboarding by pressing "back" button.
- **Onboarding**: Added input sanitization and validation.

### Fixed

- **Terminal App**: Fixed issue with terminal app retaining history even after a hard wipe - it should persist only in case of a crash.
- **Onboarding**: Long language selection list was not scrollable - fixed by adding search too.
- **Onboarding**: Weird behaviour when typing the name of the user. Now the account name is not autocompleted by default.

## v0.8.0

### Added

- **Onboarding Wizard**: A new "First Run Experience" (OOBE) that guides users through Language selection, Admin Account creation, and personalization.
- **User Management**: "Users & Groups" settings now support creating, deleting, and editing users (including Admin role toggle).
- **Admin Privileges**: Strict permission model where only `root` or `admin` group members can manage users.
- **Localization (i18n)**: Added foundational support for multi-language interfaces (i18next), starting with English, Spanish, and French.
- **App Store**: Added install feedback with progress bar dependant of app size and (future) installed hardware.

### Improved

- **Storage Architecture**: Standardized system language persistence using `STORAGE_KEYS.LANGUAGE` (survives soft resets).
- **Build Optimization**: Configured Electron to only bundle necessary locales (`en`) to reduce package size.
- **Boot Sequence**: Fixed duplicate boot glitch and cleaned up the initial boot flow.
- **Ghost Directories**: Resolved the issue where `/home/user` was incorrectly created even when that user didn't exist.
- **Security**: `addUserToGroup` now correctly syncs between user objects and group lists.
- **Terminal**: Command history and visible output are now preserved while the user is still logged in (saves in case of crash).
- **Apps**: Apps now show size.

## v0.7.9

### Added

- **Calendar App**: Core functionality (add, remove, modify events). File-dependent (`~/.config/calendar.json`) to enhance gameplay and hackability.
- **Documentation**: Added `CONTRIBUTORS.md` and `CONTRIBUTORS.md` references.

### Improved

- **UI Immersion**: Text is now not selectable by default, except in input areas (text areas, fields).
- **App Responsive Design**: Sidebar now intelligently switches between condensed and relaxed modes based on window width.
- **Notifications**: Replaced debugging "toasts" with stylized notifications (success, warning, error).
- **Text Highlight**: Global text selection now follows the system accent color (including input fields).
- **Agentic IDE**: Updated `.gitignore` to include `.agent/rules/codeQuality.md` for better context awareness.

### Removed

- **Videos App (placeholder)**: Removed to avoid false impressions; video files are not currently a game world element.
- **Videos Home Directory**: Cleaned up `~/Videos`.

### Known Issues

- **react-day-picker**: Regressed to 8.10.1 as 9.13.0 caused conflicts with `shadcn` dependencies.

## v0.7.8

### Desktop & Filesystem Experience

- **Multi-Selection**: Added drag-selection and key-down selection support in both Finder and Desktop.
- **Enhanced Drag & Drop**: Fixed dragging multiple files between Finder and Desktop, ensuring seamless file management.
- **Grid Fluency**: Improved Desktop grid logic for smoother icon snapping and collision handling.
- **Smart User Provisioning**: New users (and Guest) now start with clean, empty home directories, while the default user retains sample content.

### System Stability & Core

- **App Store**: Fixed permission issues when launching newly installed apps via Terminal.
- **Music App**: Fixed infinite scanning loops and improved directory targeting (`~/Music` or `~/`).
- **Login Screen**: Polished user avatars to eliminate visual artifacts and improved UI consistency.
- **Modern Standards**: Improved default support for ES2022 across the development environment.

## v0.7.7

### Security & Architecture Hardening

- **Verified Integrity**: Implemented strict GitHub commit signing (SSH) and branch protection rules.
- **Code Security**: Fixed CodeQL alerts (Regex Injection, XSS) and sanitized filesystem operations.
- **Modern Core**: Upgraded to **ESNext / Node 25** standards with fully strict TypeScript configuration.

### Window Management

- **Maximize**: Fixed a bug where maximizing a window would not cover the entire screen.

### Modular Menu System

- **Per-App Menu Configurations**: Fully modularized the menu bar architecture. Applications now define their own specific menus (File, Edit, View, etc.) and actions, replaced the monolithic hardcoded system with a flexible `AppMenuConfig` registry.
- **Dynamic Action Dispatching**: Menu items now dispatch standardized `app-menu-action` events, allowing individual apps to handle commands like "Save", "Rotate", or "Play" without tightly coupling to the system shell.

### Polished Empty States

- **Enhanced Placeholder UI**: Replaced generic "Coming Soon" text with polished `EmptyState` components featuring app-specific iconography and descriptive messaging.
- **Coverage**: Applied to placeholder apps (Mail, Calendar, Videos) and "Work in Progress" sections within Settings (Network, Security, Storage) and DevCenter.

#### Documentation

- **Roadmap**: Added a new `ROADMAP.md` file that outlines the project's roadmap and future plans.

## v0.7.5

### App Store Infrastructure & Binary Simulation

- **Virtual Binary System**: Apps are now treated as "installed binaries" located in `/usr/bin` (e.g., `/usr/bin/music`, `/usr/bin/notepad`).
- **Launch Guards**: The OS and Finder now verify the existence of the app binary before attempting to launch it, simulating a real file system dependency.
- **App Store Foundation**: Laid the groundwork for a future App Store by decoupling app logic from system availability—apps can now be "uninstalled" (binary removed) or "installed" dynamically.

### Music App Restoration & Fixes

- **Restored "Real-Life" App Behavior**: Music playback is now strictly gated by the application window. Double-clicking a file opens the app, which then initiates playback. This prevents "headless" background audio and resolves infinite restart loops.
- **Context Switching Fixed**: Resolved an issue where switching between songs with the same index (e.g., in different playlists) would fail to update the audio. The engine now uses unique Song IDs for reliable tracking.

### Notepad & Shell Integration

- **Shell Script Support**: Added native support for `.sh` files.
- **Bash Syntax Highlighting**: Integrated `prism-bash` for accurate syntax coloring of shell scripts.
- **File Association**: `.sh` files now automatically open in Notepad from Desktop and Finder.

### System Improvements

- **Window Management Logic**: Fixed a bug where opening a file in an already-open app would update the data but not refresh the window content. Existing windows now correctly re-mount with new file data.

## v0.7.4

### UI/UX Enhancements

- **Root User Visual Indicator**: Windows owned by `root` now display a distinctive accent-colored border (full opacity when focused, 80% when unfocused)

### Notepad Major Improvements

- **Expanded File Format Support**: Added support for 8 file types (`txt`, `md`, `json`, `js`, `ts`, `tsx`, `css`, `html`) with automatic syntax highlighting using Prism.js
- **Smart Language Selector**: Replaced simple toggle with searchable combobox featuring glassmorphism effects, accent colors, and smooth transitions
- **HTML Preview Mode**: Added live HTML preview for `.html` files with sandboxed iframe rendering

### Music App Enhancements

- **Extended Audio Format Support**: Verified compatibility with `mp3`, `wav`, `flac`, `ogg`, `m4a` and updated FileIcon component for visual consistency

### Terminal Command Updates

- **Permission Handling**: Updated `cd` to use `terminalUser` parameter; enhanced `rm` with explicit parent directory permission checks
- **Code Audit**: Systematically reviewed all 26 terminal commands for consistency and best practices

### Technical Improvements

- Enhanced owner-aware permission handling across applications
- Improved terminal user context propagation
- Better error handling in file system operations

## v0.7.3-textPatch

- **The New Notepad Pro**:
  - **Multi-Tab Interface**: Productive tabbed layout with per-user session persistence.
  - **Dual-Mode Editing**: Support for `.txt` and `.md` with live Preview mode.
  - **Premium UI**: Accent-themed syntax highlighting, glassmorphism toolbar, and custom Markdown rendering.
  - **Deep OS Integration**: Associated with Finder/Desktop, custom `FilePicker` integration, and `beforeClose` interception for unsaved changes.
  - **Performance**: Debounced auto-save and zero-delay context switching.
- **Dependabot Integration**:
  - **Security & Stability**: Merged updates for `jsdom`, `lucide-react`, `react-hook-form`, `@types/node`, and `typescript-eslint`.
  - **Strict Lint Compliance**: Refactored codebase to resolve `cascading renders` and `impure functions` warnings.
- **Maintenance**:
  - **Cascading Render Fix**: Implemented `useRef` + `setTimeout` for effect-driven state updates in `Notepad.tsx`.
  - **Logic Restoration**: Recovered `Notepad.tsx` from corruption and optimized imports/destructuring.
  - **Cleanup**: Achieved 0 lint errors/warnings across all modified files.

## v0.7.3-audioPatch

- **Boot Generation Engine**:
  - **Dynamic Parsing**: The boot sequence now analyzes `package.json` in real-time to generate authentic log entries based on your actual dependencies (`react`, `framer-motion`, etc.).
  - **Hardware Probing**: Integrated `hardware.ts` to safe-probe the host machine, displaying real CPU core counts, RAM, and specific GPU models (e.g., "Apple M1", "NVIDIA RTX") in the logs.
  - **Variable Speed**: Implemented non-linear log scrolling logic to simulate realistic processing delays and network bursts.
- **System Integrity**:
  - **Secure Boot**: Integrated `integrity.ts` into the startup flow to verify the "Distributor" identity against the signed codebase.
  - **Visual Feedback**: Boot logs now strictly adhere to the "Mental OS" palette (Cyan `SECURE` / Pink `WARNING`) instead of generic rainbow colors.
  - **Identity**: Added support for a custom `"nickname"` field in `package.json` to display hacker aliases in the boot logs.
- **Documentation**:
  - **Definitive Reference**: Completely rewrote `CODEBASE_DOCUMENTATION.md` into a file-by-file technical manual.
  - **Restoration**: Restored detailed TypeScript interfaces and function signatures for all utilities, hooks, and services.
- **Architecture**:
  - **Lazy Loading**: The core `OS` component is now lazily loaded to prioritize the Boot Sequence performance.
  - **Robustness**: Implemented defensive error boundaries and type-safety fixes for the hardware probing logic.

## v0.7.2-patch4

- **Project Integrity System**:
  - **Identity Validation**: Implemented strict runtime checks that verify the project's identity (`package.json`) against hardcoded cryptographic constants.
  - **Safe Mode**: Modifying the project's core identity (name, author, license) triggers a degraded "Safe Mode" (Read-Only Filesystem, disabled `sudo`).
  - **Developer Override**: Added a hidden `dev-unlock` mechanism (Stealth Mode) allowing developers to bypass integrity checks with a secure token.
  - **Insurance Policy**: Added a hidden "Credits & License" drawer (triggered by 6 rapid clicks on the Apple logo) that displays the immutable project origin.
  - **Visual Feedback**: Login screen and Credits drawer now dynamically display a "Secure System" (Green) or "System Compromised" (Red) status.
- **Licensing & Metadata**:
  - **AGPL-3.0**: Officially transitioned the project license to AGPL-3.0 to ensure open-source integrity.
  - **Metadata Enrichment**: Populated `package.json` with comprehensive metadata (contributors, keywords, engine requirements) aligned with the GitHub repository.
- **Maintenance**:
  - **Dependency Bumps**: Updated `vite`, `recharts`, `typescript-eslint`, `autoprefixer`, and `@types/node` to latest stable versions.

## v0.7.2-patch3

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

## v0.7.2-patch2

- **Terminal Implementation**:
  - **Advanced Architecture**: Implemented `su` and `sudo` for user switching and privilege escalation simulation.
  - **Output Redirection**: Added support for standard shell redirection, allowing file creation and appending (e.g., `echo "data" > file.txt`).
  - **Permissions**: Fully implemented `chmod` (permissions) and `chown` (ownership) commands integrated with the virtual filesystem security model.
- **Login Screen**:
  - **Recovery Options**: Added "Soft Reset" (Reload) and "Hard Reset" (Factory Wipe) links to the login screen footer for emergency system recovery.
- **System Logic**:
  - **Authentication**: Verified and hardened `/etc/passwd` and `/etc/group` synchronization logic, ensuring rigorous "Dual-State" consistency between memory and file content.
- **Infrastructure & Quality**:
  - **CI/CD Optimization**: Consolidated deployment pipelines (`deploy.yml`) to include verification steps (Test, Lint) and eliminated redundant builds on `main`.
  - **Code Quality**: Resolved all ESLint warnings and expanded test suite coverage to include FileSystem permissions and ownership logic.

## v0.7.2-patch

- **True Lock Screen**:
  - **Overlay Architecture**: Lock Screen now overlays the running desktop instead of unmounting it, keeping apps (e.g., Music) active in the background.
  - **UX Refinements**: "Switch Account" action with confirmation dialog prevents accidental session loss.
  - **Differentiation**: Clear distinction between "Lock" (suspend access, keep session) and "Log Out" (end session).
- **Session Persistence**:
  - **Window State**: Open windows are now saved per-user and restored upon login.
  - **Desktop Icons**: Icon positions are persisted per-user.
- **Menu Bar**:
  - **Refined Apple Menu**: Split "Lock Screen" and "Log Out" into distinct actions.
  - **Logic Fixes**: Corrected "Lock Screen" to trigger overlay mode instead of logout.

## v0.7.2

- **User Management**:
  - **Multi-User Structure**: Implemented robust `User` and `Group` system with `/etc/passwd` and `/etc/group` bidirectional syncing.
  - **Persistent State**: User database is synced between `localStorage` and the virtual filesystem.
  - **UI**: Added "Users & Groups" Settings panel for adding/removing users.
- **Advanced Filesystem Permissions**:
  - **Linux Compliance**: Full `rwxrwxrwx` enforcement checking Owner, Group, and Others.
  - **Sticky Bit (`t`)**: Implemented secure deletion policies for shared directories like `/tmp`.
  - **Directory Execute (`x`)**: Traversal now correctly requires execute permissions on parent directories.
- **Terminal Enhancements**:
  - **Redirection**: Added support for standard shell redirection operators `>` (overwrite) and `>>` (append).
  - **Improved `rm`**: Now correctly distinguishes between "No such file" and "Permission denied".

## v0.7.1

- **UI Standardization**:
  - **Glassmorphism**: Created standardized `GlassButton` and `GlassInput` components.
  - **Adoption**: Integrated new glass UI into **DevCenter**, **Messages**, and **Settings** (Danger Zone, Custom Color).
- **Architecture**:
  - **Service Separation**: Extracted `SoundManager`, `SoundFeedback`, and `NotificationSystem` from `src/lib` to `src/services` to clearly distinguish stateful services from stateless utilities.
  - **Cleanup**: Deleted legacy `src/lib` directory.
- **Bug Fixes**:
  - **Responsive Layouts**: Fixed sidebar cropping in Messages and grid overflow in Settings/DevCenter at narrow widths (<400px).
  - **Linting**: resolved unused variables in MenuBar and DevCenter.

## v0.7.0

- **DEV Center**: New specialized application for developers.
  - **Dashboard**: Central hub for developer tools.
  - **UI & Sounds**: Manual triggers for system notifications and sound events (click, hover, etc.).
  - **Storage Inspector**: View and manage Soft (Preferences) vs Hard (Filesystem) memory, with key deletion.
  - **File System Debugger**: View raw filesystem JSON and reset functionality.
  - **Integration**: "Developer Mode" toggle in System Settings > About.
- **Audio Architecture**:
  - **SoundManager**: Refactored core audio engine with volume grouping (Master, System, UI, Feedback).
  - **Audio Applet**: New native-style popup in MenuBar for granular volume control.
  - **Persistence**: Audio settings are now saved to localStorage.
- **Dock & Trash**:
  - **Trash App**: Fully functional Trash with dynamic icon (empty/full) in Dock and Finder.
  - **Dock Enhancements**: Added horizontal separator before utility apps (Terminal, Trash).
  - **Animations**: Snappier hover effects for Dock items.
- **System**:
  - **Refactoring**: Unified "Applet" architecture (Notification Center & Audio) using `shadcn/ui` Popover.
  - **Testing**: Enhanced test suite to cover new components and logic.

## v0.6.2-patch5

- **Messages Redesign**: Completely revamped the Messages app with a sleek, borderless list view, adaptive layout (Finder-style), and colored chat bubbles.
- **Auto-scroll**: Implemented smart auto-scroll for Messages that targets only the chat container, preventing app-wide layout shifts.
- **Code Standardization**: Refactored core apps (`Music`, `Photos`, `Browser`, `Finder`) and UI components (`Window`, `Dock`, `MenuBar`) to use consistent `cn` utility for styling and standardized imports.
- **Responsiveness**: Fixed overflow and cropping issues in Messages and Music apps, ensuring perfect scaling down to compact mobile sizes.

## v0.6.2-patch4

- **Terminal**: Improved ZSH-like experience with autocomplete, command history, pipe support, wildcard support, and more.
- **Finder**: Improved item selecting/deselecting and added the Trash functionality.
- **Dock**: Improved app icon behavior and added the Trash functionality.
- **App bar**: Removed the search icon as it is not planned to be implemented in the near future.

## v0.6.2-patch3

- **Desktop**: Added dragging constrains to prevent Windows going off-screen.
- **Filesystem**: Improved special folders consistency (.Trash and .Config).
- **Finder**: Fixed visibility of hidden files. Terminal will show hidden files.
- **Dock**: Fixed active Window dot indicator to respect the accent color.
- **Terminal**: Fixed path display in prompt.
- **Finder**: Added full-path breadcrumbs to navigate through directories, with drag-to-move functionality.
- **Finder**: Fixed breadcrumbs to show correct path if opened from Terminal.
- **Environment**: Added Content Security Policy (CSP) to prevent XSS attacks, and other various web-standard security measures.

## v0.6.2-patch2

- **Unified Desktop Aesthetics**: Removed unselected "pill" backgrounds from Desktop icons and aligned text truncation with Finder (single-line).
- **Window Focus UX**: Enabled "Click to Focus" on window content while restricting drag operations to the title bar.
- **Scroll Regressions**: Fixed scrolling issues in Settings, Photos, and Browser apps caused by template refactors.
- **Performance**: Refactored File System logic into utilities and implemented debounced persistence to prevent UI stuttering.

## v0.6.2-patch

- **Build System Fix**: Restored CSS functionality by migrating to a standard Tailwind CSS v4 build pipeline with `@tailwindcss/postcss`.
- **Desktop**: Now uses a grid system inspired by Windows 11. Icons are now cosistend across Desktop and Finder. Drag-and-move functionality.
- **UI Restoration**: Fixed missing scrollbar styling and terminal colors.
- **File System**: Now uses UID for every file and directory instead of name.
- **Terminal**: Improved path resolution to handle absolute paths for user directories (e.g., `/Desktop` -> `~/Desktop`). Consistency with the icons in Finder.
- **Finder**: Fixed issues with dropping files onto sidebar shortcuts. Items organized by name.
- **System Settings**: Performance toggle for gradients across icons and other subtle places.
- **Other**: Repository badges are now simplified.

## v0.6.2

- **Settings Grid Layouts**: Standardized grids in Appearance, Theme Mode, and Theme sections with fixed aspect ratios (1:1 and 16:9) for consistent responsive design.
- **Theme Enhancements**: Implemented dynamic gradients for Theme Mode cards (Neutral/Contrast) and introduced a diverse "2025" Color Palette.
- **Dynamic Versioning**: "About" tab now displays the live application version from package.json.
- **Default Preferences**: Updated default accent color to Indigo (#5755e4) and fixed compatibility with HTML color inputs.

## v0.6.1

- **Desktop Mirroring**: Live synchronization between `~/Desktop` directory and the Desktop UI.
- **Terminal App Launch**: Launch apps (Finder, Browser, etc.) via Terminal with argument support (`Finder /home`).
- **Terminal Enhancements**: Fixed path resolution (`mkdir`, `touch`), added Tab autocomplete, and PATH scanning.
- **Settings**: Added "Danger Zone" with Soft Reset and Hard Reset options.

## v0.6.0

- **Virtual Filesystem**: Linux-inspired filesystem with `/bin`, `/etc`, `/home`, `/var`, and more.
- **Terminal Integration**: Full command-line interface (`ls`, `cd`, `cat`, `mkdir`, `rm`, `whoami`, `hostname`) connected to virtual filesystem.
- **Persistence Layer**: Settings, desktop icons, filesystem, and app states saved to localStorage.
- **App Storage Hook**: New `useAppStorage` hook enabling all apps to persist their state.
- **Window Improvements**: State preservation on minimize/restore, smooth dock-directed animations, auto-focus on next window.
- **Independent Windows**: Multiple Finder/Terminal windows now have independent navigation state.

## v0.5.2

- **Tech Stack Overhaul**: Upgraded to React 19, Vite 7, and Recharts 3.
- **CI/CD**: Added GitHub Actions workflow for automated testing.
- **Code Quality**: Implemented ESLint and fixed code consistency issues.

## v0.5.1

- **Native App Support**: Packaged with Electron for Windows.
- **Window Frame Option**: Added `--frame` flag / `WINDOW_FRAME` env var for native window management.
- **Performance**: Added "Reduce Motion" and "Disable Shadows" settings affecting all system components.
- **Applet Optimizations**: Notification Center and Desktop now respect performance settings.

## v0.5.0

- **Renamed to Aurora OS.js**.
- Implemented Radix UI Checkbox for settings.
- Fixed visual inconsistencies in Switch component.
- Improved window management and dock behavior.
- Refactored multiple apps for consistency.

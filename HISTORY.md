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

### v0.7.4

#### UI/UX Enhancements
- **Root User Visual Indicator**: Windows owned by `root` now display a distinctive accent-colored border (full opacity when focused, 80% when unfocused)

#### Notepad Major Improvements
- **Expanded File Format Support**: Added support for 8 file types (`txt`, `md`, `json`, `js`, `ts`, `tsx`, `css`, `html`) with automatic syntax highlighting using Prism.js
- **Smart Language Selector**: Replaced simple toggle with searchable combobox featuring glassmorphism effects, accent colors, and smooth transitions
- **HTML Preview Mode**: Added live HTML preview for `.html` files with sandboxed iframe rendering

#### Music App Enhancements
- **Extended Audio Format Support**: Verified compatibility with `mp3`, `wav`, `flac`, `ogg`, `m4a` and updated FileIcon component for visual consistency

#### Terminal Command Updates
- **Permission Handling**: Updated `cd` to use `terminalUser` parameter; enhanced `rm` with explicit parent directory permission checks
- **Code Audit**: Systematically reviewed all 26 terminal commands for consistency and best practices

#### Technical Improvements
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

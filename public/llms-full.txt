---
trigger: always_on
---

# AURORA OS.JS SYSTEM CONTEXT

<!-- OPTIMIZED_FOR: GEMINI_3_PRO_HIGH -->

<project_identity>

**Aurora OS.js**: Ultra-realistic web-based OS simulator and hacking simulator game (React 19/Vite/Electron).
**Goal**: High-fidelity hacking/sysadmin simulation (Linux/macOS hybrid).
**Core Philosophy**: "Files-First". State acts as a view layer over the Virtual File System (VFS).

</project_identity>

<tech_stack>

**Core**: React 19, TypeScript, Vite, Tailwind CSS (v4), Radix UI.
**Platform**: Web (PWA) + Desktop (Electron).
**State**: React Context + `localStorage` persistence (Hierarchical: System Defaults + User Overrides).
**Config**: `src/config/systemConfig.ts` defines core limits (e.g., Default RAM), **Graphics** (GPU, Blur, Shadows), and **Brand Identity** (Name, Colors, Standardized AVIF Wallpapers).
**Networking**: Zero-dependency architecture (native `fetch` only). No `axios`.

</tech_stack>

<architecture_mechanics>

1.  **Virtual File System (VFS)**:
    - **Structure**: In-memory recursive JSON tree (`FileNode`).
    - **Storage**: Serialized to `memory` (via `STORAGE_KEYS.FILESYSTEM`). Persisted to IndexedDB (Web) or JSON (Electron).
    - **Sync**: Unidirectional State -> File sync (e.g., `users` state updates `/etc/passwd`).
2.  **Modularized Logic & NPCs**:
    - **Shared Source**: Pure, React-free operations in `src/utils/fileSystemOps.ts` provide the engine for all FS queries and mutations.
    - **Adapters**:
      - **Player**: `useFileSystemQueries`/`Mutations` wrap pure ops in React state/memoization.
      - **NPC**: `WorldContext` and `npcFileSystem.ts` act as a plain-object adapter for headless computers.
    - **WorldContext**: Manages NPC provisioning, persistence (`os_npc_<ip>`), and runtime state. The `getNpcApi(ip)` function returns an API matched to the local VFS for contextual bridging.
    - **Performance**: Operations are pure and non-mutative, returning new tree snapshots for state/ref updates.

3.  **User System**:
    - **Ids**: `root` (0), `guest` (1001), `activeUser` (physical), `currentUser` (logical).
    - **Auth**: `useAuth()` hook. Logic synced to `/etc/passwd` & `/etc/group`.
    - **Persistent**: `useAppStorage` uses `activeUser` to scope keys (e.g., `os_app_data_<app>-<user>`).
    - **Home**: `/home/<user>` created via `createUserHome()`. Includes `~/.Config` (700 permissions) for sensitive app data.
    - **Fast User Switching**: `suspendSession()` preserves RAM (open windows, terminal history) while switching users. Exposed via `FileSystemContext` and used by `MenuBar.tsx` "Switch User" action.
    - **Developer Mode**: Toggled via Settings > About. Controls visibility of "Dev Center" app in App Store and other debug features.

4.  **App Engine**:
    - **Registry**: `src/config/appRegistry.ts` (Definition source of truth).
    - **Runtime**: Apps render in `WindowContext`.
    - **ContextMenu**: Can be global (registry `contextMenu`) or localized (wrapping specific UI areas with `ContextMenuTrigger` in the app component).
    - **Persistence**: Per-app storage via `useAppStorage` (key: `os_app_data_<app>-<user>`) or manual `localStorage` with `getAppStateKey`.
    - **Installer**: `useAppInstaller` hook.
      - **Gates**: Requires **Active Network Connection** for installs. Checks active user permissions (`/usr/bin` write access).
      - **Simulation**: Phased progress. **0-50% (Download)**: Speed depends on Network Bandwidth. **50-100% (Install)**: Jitter simulation.
      - **Controls**: Supports cancelling downloads and viewing real-time speed.
    - **Launch Gates**: `useWindowManager` prevents app launch if `currentRamUsage + app.ramUsage > totalMemoryGB` (Default: 2GB).
    - **Config**: Simulation apps (Mail, Messages) use `~/.Config/<app>.json` for encrypted credentials, enabling "hacking" gameplay mechanisms.

5.  **Terminal Architecture ("Files-First")**:
    - **PATH**: `["/bin", "/usr/bin"]`.
    - **`/bin`**: Contains **system commands** (e.g., `ls`, `cat`, `cd`, `connect`).
      - **Implementation**: Text files containing `#command <name>` (e.g., `ls` -> `#command ls`).
      - **Execution**: Realism is rigorously enforced. `useTerminalLogic` ALWAYS checks PATH. If a binary is deleted, the command stops working globally. Resolves to `src/utils/terminal/registry.ts`.
    - **`/usr/bin`**: Contains **App Launchers** (e.g., `chrome`, `code`).
      - **Implementation**: Text files containing `#!app <appId>` (e.g., `#!app terminal`).
      - **Execution**: Launches the corresponding AppID from `src/config/appRegistry.ts`.
    - **Contextual Execution**: Terminal automatically routes filesystem operations (e.g., `ls`, `cat`) to the remote NPC API if a connection is active (via `useWorldContext`).
    - **Shell Scripting**: Text that isn't `#command` or `#!app` is parsed as Shell Script (supports `$VAR`, `VAR=val`).
    - **`exit` Command & `onClose` Wiring**:
      - `exit` pops the session stack (e.g., `sudo -s` / `su` chains) until the base user, then calls `closeWindow(windowId)`.
      - `onClose` is wired in `OS.tsx` via a **stable ref pattern**: `closeWindowRef` mirrors `closeWindow`, a `windowId` is **pre-computed** in `getAppContent` for the terminal type (`terminal-${Date.now()}`), and `onClose: () => closeWindowRef.current(preId)` is passed as a prop. `useWindowManager.openWindow` uses the returned `windowId` as the actual window ID to guarantee the IDs match.
      - This avoids `React.cloneElement` in the render loop, preserving `React.memo(Window)` optimizations.
    - **Persistence**:
      - **Strategy**: "Crash Proof". History survives refresh (`is_refreshing` flag) but clears on explicit Window Close or Logout.
      - **Storage**: `localStorage` with custom serialization (preserving text content from React components to avoid `[Complex Output]`).
      - **Hostname**: Fully dynamic. `hostname` command reads `/etc/hostname` from VFS.

6.  **Notification & UI System**:
    - **Usage**: `notify.system(type, source, message, subtitle)` or `notify.app(appId, title, message)` (via CustomEvent).
    - **Architecture**: Event-based (`aurora-app-notification`). Applets listen via `useAppNotifications`.
    - **Formatting**: `message` prop accepts `React.ReactNode`, allowing for rich grid/list layouts in toasts.
    - **Display**: Stacking "Heads-Up" toasts (top-right, max 3) + Notification Center (sidebar).
    - **Performance**: High-traffic apps (like Notepad) MUST isolate re-renders by splitting the main editor/content logic into memoized sub-components.
    - **Provider**: Handled via `Sonner` (system) and `AppNotificationsContext` (app-level).
    - **Global Indicators**: Retro "Hard Drive" LED (Green/Red) in bottom-left.
      - **Green (Load)**: Triggered by PHYSICAL disk/IndexedDB read in `SaveManager.ts`.
      - **Red (Save)**: Triggered by PHYSICAL disk/IndexedDB write in `SaveManager.ts`.
      - **Optimization**: `memory.setItem` uses "Dirty Checking" to skip redundant saves if values are identical.

7.  **Audio & Metadata System**:
    - **Howler Core**: All system audio (SFX, Music, Ambiance) is managed via `soundManager` (`src/services/sound.ts`).
    - **Channels**: Dedicated `ambiance` channel (looping, independent volume) + `master`, `system`, `ui`, `feedback`, `music`.
    - **Realism**: Global mute (`Howler.mute(true)`) silences the system without stopping background processes (e.g., music keep "playing" silently).
    - **Startup**: High-fidelity `computerStart.mp3` (Intro) and `biosStart.mp3` (Boot).
    - **Binary Metadata**: Custom ID3 parser (`src/utils/id3Parser.ts`) extracts professional tags (TIT2, TPE1, TALB) from MP3 files.
    - **Asset Fetching**: Metadata resolution for local assets uses `fetch` with `Range: bytes=0-512KB` to efficiently read headers without full downloads.

8.  **Game Flow & Pre-OS Experience**:
    - **State Machine**: 6-state flow handled by `GameRoot.tsx` (INTRO → MENU → FIRST_BOOT/BOOT → ONBOARDING → GAMEPLAY).
    - **Main Menu**: Video game-style interface with keyboard nav. Includes **Settings** (Tabbed: Display/Audio/System) and **Credits** modals.
      - **Web-only extensions**: Collapsible "Community" menu and "Download" buttons are conditionally rendered in the footer when `!isElectron`.
      - **Exit Flow**: Retro terminal-style confirmation modal. Triggers immediate filesystem save (`saveFileSystem`) upon confirmation.
      - **Floating Window**: `DevStatusWindow.tsx` provides persistent system status and contribution CTAs. Fully internationalized via `useI18n`.
    - **Save Detection**: Checks `localStorage.getItem(STORAGE_KEYS.VERSION)` to determine if save exists.
    - **New Game**: Calls `hardReset()` to wipe all `localStorage`, then `resetFileSystem()` for in-memory sync. **Preserves** BIOS settings (GPU/Blur/Motion) via `resetSystemConfig(overrides)`.
    - **Boot Sequence**: Realistic OS boot animation with dynamic log generation.
      - **Dynamic Hardware**: Bridges to Electron (`get-system-info`) to fetch **real** CPU/GPU/RAM specs and weaves them into the boot logs for immersion.
      - **Pre-load**: Pre-loads OS chunk during boot animation.
    - **Onboarding**: Multi-step wizard (Language → Account → Theme → Finishing) for first-time setup.
      - Supports `Escape` (back/abort) and `Enter` (next) navigation.
      - Creates user via `createUser()`, initializes home directory, sets system creation timestamp.
    - **GAMEPLAY State**: Unmounts/remounts OS Desktop to force app re-initialization after state changes.
    - **AudioContext**: Unlocked in IntroSequence via user interaction (browser requirement).
    - **GameScreenLayout**: Unified wrapper with dual modes:
      - `mode="terminal"` (Default): ASCII art, monospaced font, pure black bg. Used for Boot/Menu.
      - `mode="glass"`: Restored legacy glassmorphism, sans-serif, animated "Orbit" logo. Used for Login/Onboarding.

9.  **Reference Implementations**:
    - **Finder (`FileManager.tsx`)**:
      - **Pattern**: Recursive directory traversal via `useFileSystem`.
      - **UI**: Dynamic breadcrumbs with drag-and-drop support.
      - **State**: Persists `viewMode` via `useAppStorage`.

    - **Terminal**:
      - **Pattern**: Command Pattern Registry (`registry.ts`).
      - **State**: Custom crash-proof history persistence (HTML-preserving).
      - **UI**: "Ghost Text" autocomplete overlay.

10. **Build & Distribution (Electron)**:
    - **Config**: Enhanced `package.json` build config (`NSIS` for Win, `DMG` for Mac, `AppImage` for Linux).
    - **Branding**: Derived from `productName` ("Aurora OS.js"), `copyright`, and `nsis.menuCategory` ("Dope Pixels").
    - **Hardening**:
      - **Electron Fuses**: Disabled `runAsNode`, enforced `enableEmbeddedAsarIntegrityValidation` and `onlyLoadAppFromAsar`.
      - **Source Map**: Explicitly disabled for production (`tsconfig.electron.json`) to prevent code reversal.
      - **DevTools**: Production lockout in `main.ts` (shortcuts blocked, auto-close on open).
    - **Signing**: Explicitly disabled (`identity: null`) for first release; Gatekeeper warnings expected.
    - **Splash Screen** (Electron-only):
      - **Architecture**: Separate lightweight `BrowserWindow` loading `electron/splash.html` (static HTML, no React).
      - **Dual-Condition Close**: Splash stays visible until BOTH `SPLASH_MIN_DURATION_MS` (10s) timer elapses AND React app sends `app-ready` IPC.
      - **Real Progress**: Milestones tracked via `splashProgress()` at actual Electron/Chromium events (window creation, `dom-ready`, `did-finish-load`, React mount). Idle crawl fills gaps between milestones.
      - **Logo**: Inline ASCII art matching `GameScreenLayout.tsx` terminal mode logo.
      - **Build**: `copy:electron-assets` script copies `splash.html` to `dist-electron/` (HTML not handled by `tsc`).

11. **Display & Input Constraints**:
    - **Resolution**:
      - **Target**: 1920x1080 (Default launch size).
      - **Minimum**: 1366x768 (Strictly enforced via Electron `minWidth/Height` and Web `ScreenGuard`).
    - **Orientation**: Landscape ONLY.
    - **PWA**: `public/manifest.json` enforces `standalone` and `landscape` for Chromium OS/Tablets.
    - **ScreenGuard**: React component (`src/components/ui/ScreenGuard.tsx`) blocks execution on unsupported viewports (Phones/Portrait).

12. **Network System**:
    - **Context**: `NetworkContext` (`src/components/NetworkContext.tsx`) manages global network state (WiFi on/off, Available/Current Networks).
    - **Simulation**:
      - **Historical Speeds**: Speed tiers based on 802.11 eras: `OPEN` (<1Mbps) < `WEP` (1-5Mbps) < `WPA` (5-15Mbps) < `WPA2` (20-150Mbps) < `WPA3` (150-600+Mbps).
      - **Signal Strength**: Realized speed = `MaxSpeed * (SignalStrength / 100)`. Strength fluctuates dynamically.
      - **Determinism**: SSID properties (Security, Channel, BSSID) are deterministically generated via hash to ensure consistency across reloads.
    - **Persistence**: "Known" networks (password-protected ones that were successfully joined) are saved to `STORAGE_KEYS.KNOWN_NETWORKS`. Session Data Usage is stored in `STORAGE_KEYS.NETWORK_USAGE`.
    - **UI**:
      - `InternetApplet` (Tray): Quick actions, visually consistent with system theme.
      - `NetworkSettings` (App): Detailed connection stats (Signal, Security, Speed), Manual IP config, Data Usage tracking.
      - `AppStore`: Download speed simulation.

13. **Display & Window Management**:
    - **Modes**:
      - **Electron**: Fullscreen, Borderless, Windowed (with custom resolution/frame).
      - **Browser**: Fullscreen toggle via `useFullscreen` hook.
    - **Backend (Electron)**: `electron/main.ts` manages state via `display-settings.json`.
    - **Frontend**: `DisplaySettings.tsx` provides unified UI for Resolution, Scaling, and Modes.
      - **Resolution**: Filters options based on screen dimensions.
    - **Bridge**: `useFullscreen` hook unifies Browser (DOM API) and Electron (IPC) logic.
      - **Detection**: "Bulletproof" multi-check (`window.electron` + UA + process) prevents race conditions.

14. **Storage & Persistence**:
    - **Core Utility**: `src/utils/memory.ts` -> `memory` API (replaces direct `localStorage`).
    - **Security**: **ALWAYS** use `safeParseLocal` from `src/utils/safeStorage.ts` for reading raw storage data.
    - **Performance**: Writes to `memory` (e.g., Window moves, Notepad typing) are debounced via `SaveManager` (100ms) to prevent I/O thrashing.
    - **Keys**: Managed via `STORAGE_KEYS` in `src/utils/memory.ts`. 3-tier architecture:
      - **BIOS (`sys_` prefix)**: System hardware settings (language, display, sound). Survives ALL resets.
      - **HDD (`os_` prefix)**: OS data (filesystem, users, app data, mail). Wiped on Hard Reset (New Game).
      - **RAM (`session_` prefix)**: Session state (windows, terminal history). Wiped on Soft Reset (Logout/Restart).
    - **Absolute Persistence**:
      - **Universal Snapshotting**: `SnapshotEngine.ts` captures ALL keys starting with `os_`, `sys_`, or `session_`, ensuring dynamic app data (Notepad tabs, Finder path) is never lost.
      - **Emergency Buffer**: Synchronous `emergencySave()` dumps memory to `localStorage` during `beforeunload` to survive abrupt refreshes.
      - **Safe Reload**: `useAppStorage` and `useSessionStorage` use a "Locked-Pair" pattern to prevent stale data overwrites during rapid context switches.
    - **Reset Functions**:
      - `softReset()`: Wipes Session (RAM).
      - `hardReset()`: Wipes HDD + Session. Keeps BIOS.
      - `factoryReset()`: Wipes Everything.
    - **Helper Functions**: `getAppStateKey(appId, user)` and `getWindowKey(user)`.
    - **Tests**: Test assertions MUST use `memory.getItem` or `STORAGE_KEYS` constants, never direct `localStorage`.

</architecture_mechanics>

<critical_rules>

- **FS Integrity**: ALWAYS use `createFile`, `writeFile`, `deleteNode` from `useFileSystem`.
- **Trash Resolution**: `moveToTrash` MUST resolve path based on `asUser` context (e.g., `/root/.Trash`).
- **Path Resolution**: Use absolute paths. Resolve relative via `resolvePath(path, cwd)`.
- **Security**: Check permissions via `checkPermissions(node, user, 'read'|'write'|'execute')`.
- **UI Integrity**: Use `forwardRef` for any component used with `<ContextMenuTrigger asChild>` to ensure Radix UI ref handling works.
- **I18n**: All UI strings MUST use `useI18n()`. definition: `src/i18n/locales/en.ts`.
- **I18n Sync**: Maintain strict sync across all 13 locales (`en`, `de`, `es`, `fr`, `pt`, `ro`, `zh`, `ru`, `ja`, `pl`, 'ko', 'tr', 'hi'). Run `/update-translations` and `.scripts/sync-i18n.js` after changes.
- **Accessibility**: All `Dialog` or `AlertDialog` components MUST include a `Title` and `Description`. Use `sr-only` class to hide them if they clash with visual design but are required for A11y.
- **Standards**: All imports should user the @ alias for the /src folder and ALL FEATURES added should have a matching debug way in Dev Center.
- **Docs Sync**: On architecture changes, update `.agents/rules/context.md` & `public/llms-full.txt`.
- **URL Security**: User-provided URLs (images, media) MUST be sanitized via `getSafeImageUrl(url)` to prevent XSS and satisfy CodeQL taint tracking.
- **Window Management**: `isElectron` detection MUST use the robust multi-check pattern (`window.electron` + userAgent + process.versions) found in `useFullscreen.ts` to prevent race conditions.
- **Asset Optimization**: Use modern formats (AVIF) for large assets like wallpapers. Ensure 4:2:0 subsampling and aggressive compression (Quality 45-60) for complex images to minimize build size.
- **Import Standards**: ALWAYS use the `@` alias for `src` directory imports (e.g., `import { foo } from '@/components/bar'`) to ensure path stability.
- **Time/Dates**: Calendar uses `react-day-picker` v9. The app relies on a custom `toDisplayDate` offset simulation to visually manipulate faked UTC time. Ensure all navigation props in `react-day-picker` correctly wrap and unwrap native dates with `toDisplayDate()` and `fromDisplayDate()`.

</critical_rules>

<codebase_map>

| Path                                   | Component         | Description                                              |
| :------------------------------------- | :---------------- | :------------------------------------------------------- |
| `src/components/FileSystemContext.tsx` | **VFS Core**      | Context for all FS operations.                           |
| `src/utils/fileSystemUtils.ts`         | **VFS Utils**     | `FileNode` types, `initialFileSystem`, permission logic. |
| `src/components/AppContext.tsx`        | **Session**       | Theme, Wallpapers, Physical User session.                |
| `src/components/DisplaySettings.tsx`   | **Display**       | Cross-platform display management UI.                    |
| `src/config/appRegistry.ts`            | **Registry**      | Installed Apps configuration.                            |
| `src/services/notifications.tsx`       | **Notifications** | Central service for rich system toasts.                  |
| `src/utils/memory.ts`                  | **Memory Core**   | Centralized in-memory cache and persistence logic.       |
| `src/utils/save/*`                     | **Save System**   | `SaveManager`, `SnapshotEngine`, and Adapters.           |
| `src/services/resourceMonitor.ts`      | **Resource Mon**  | logic for RAM calculation & Task Manager.                |

| `src/services/sound.ts` | **Sound Manager** | Global audio state and Howler integration. |
| `src/utils/id3Parser.ts" | **ID3 Parser** | Binary metadata extractor for MP3 files. |
| `src/components/apps/\*`| **Apps** | Individual App components (Notepad, Terminal, etc). |
|`src/hooks/useAppInstaller.ts`| **Installer** | Hook for app install/uninstall/restore logic. |
|`src/components/apps/AppStore/`| **App Store** | App Store components (AppCard, etc). |
|`src/hooks/useWindowManager.ts`| **Window Manager** | Handles window state and memory usage gates. |
|`src/components/NetworkContext.tsx`| **Network** | Global network state and simulation logic. |
|`src/hooks/useFullscreen.ts`| **Display Utils** | Shared hook for Electron/Browser fullscreen logic. |
|`electron/main.ts`| **Electron Main** | Native window management, splash screen, and backend logic. |
|`electron/splash.html`| **Splash Screen** | Electron-only splash with real progress milestones. |
|`src/test/` | **Tests** | Unit tests for utilities and logic. |

</codebase_map>

<ai_context>

**External Alignment**:

- `public/llms.txt`: Standard entry point for external AI agents (summary + links).
- `public/llms-full.txt`: Full system context (mirror of this file) for deep understanding.

</ai_context>

<mcp_usage>

**Server**: `aurora-os-docs`
**Source**: `mental-os/Aurora-OS.js` via `gitmcp.io`.
**Purpose**: Retrieval Augmented Generation (RAG) for codebase documentation.
**When to use**:

- When you need deep context on specific functions or architecture not covered in this summary.
- To search for usage patterns across the entire repository without manual grepping.
  **Tools**:
- `search_Aurora_OS_js_documentation(query)`: Semantic search over docs.
- `fetch_Aurora_OS_js_documentation()`: Fetch full README/Docs.
- `search_Aurora_OS_js_code(query)`: Search code via GitHub API.

</mcp_usage>

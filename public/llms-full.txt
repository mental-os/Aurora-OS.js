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
**Config**: `src/config/systemConfig.ts` defines core limits (e.g., Default RAM) and **Brand Identity** (Name, Colors, Wallpapers).

</tech_stack>

<architecture_mechanics>

1.  **Virtual File System (VFS)**:
    - **Structure**: In-memory recursive JSON tree (`FileNode`).
    - **Storage**: Serialized to `localStorage` key `aurora-filesystem`.
    - **Sync**: Unidirectional State -> File sync (e.g., `users` state updates `/etc/passwd`).
    - **Access**: MUST use `useFileSystem()` hook. NEVER mutate JSON directly.

2.  **User System**:
    - **Ids**: `root` (0), `guest` (1001), `activeUser` (physical), `currentUser` (logical).
    - **Auth**: `useAuth()` hook. Logic synced to `/etc/passwd` & `/etc/group`.
    - **Persistence**: `useAppStorage` uses `activeUser` to scope keys (e.g., `aurora-os-settings-user`).
    - **Home**: `/home/<user>` created via `createUserHome()`.

3.  **App Engine**:
    - **Registry**: `src/config/appRegistry.ts` (Definition source of truth).
    - **Runtime**: Apps render in `WindowContext`.
    - **ContextMenu**: Can be global (registry `contextMenu`) or localized (wrapping specific UI areas with `ContextMenuTrigger` in the app component).
    - **Persistence**: Per-app storage via `useAppStorage` (key: `app-user`) or manual `localStorage` with `getAppStateKey`.
    - **Installer**: `useAppInstaller` hook handles install/uninstall/restore with permission checks.
    - **Launch Gates**: `useWindowManager` prevents app launch if `currentRamUsage + app.ramUsage > totalMemoryGB` (Default: 2GB).
    - **Config**: Simulation apps (Mail, Messages) use `~/.Config/<app>.json` for encrypted credentials, enabling "hacking" gameplay mechanisms.

4.  **Terminal Architecture**:
    - **PATH**: `["/bin", "/usr/bin"]`.
    - **`/bin`**: Contains **system commands** (e.g., `ls`, `cat`).
      - Implemented as **Internal Commands** in `src/utils/terminal/registry`.
      - Represented in VFS as files containing `#command <name>`.
    - **`/usr/bin`**: Contains **App Launchers** (e.g., `chrome`, `code`).
      - Implemented as **App IDs** in `src/config/appRegistry.ts`.
      - Represented in VFS as files containing `#!app <appId>`.
    - **Execution**:
      - `useTerminalLogic` resolves input -> checks built-ins -> checks PATH.
      - If `#!app ...` -> Launches Window.
      - If `#command ...` -> Executes internal function.
      - If other text -> Parses as Shell Script (supports `$VAR`, `VAR=val`).
    - **Persistence**:
      - **Strategy**: "Crash Proof". History survives refresh (`is_refreshing` flag) but clears on explicit Window Close or Logout.
      - **Storage**: `localStorage` with custom serialization (preserving text content from React components to avoid `[Complex Output]`).
      - **Hostname**: Fully dynamic. `hostname` command reads `/etc/hostname` from VFS.

5.  **Notification & UI System**:
    - **Usage**: `notify.system(type, source, message, subtitle)` or `notify.app(appId, title, message)` (via CustomEvent).
    - **Architecture**: Event-based (`aurora-app-notification`). Applets listen via `useAppNotifications`.
    - **Formatting**: `message` prop accepts `React.ReactNode`, allowing for rich grid/list layouts in toasts.
    - **Display**: Stacking "Heads-Up" toasts (top-right, max 3) + Notification Center (sidebar).
    - **Performance**: High-traffic apps (like Notepad) MUST isolate re-renders by splitting the main editor/content logic into memoized sub-components.
    - **Provider**: Handled via `Sonner` (system) and `AppNotificationsContext` (app-level).
    - **Global Indicators**: Retro "Hard Drive" LED (Green/Red) in bottom-left, triggered by `localStorage` I/O. Filters out "Soft" reads (e.g., volume) via monkey-patched `memory.ts`.

6.  **Audio & Metadata System**:
    - **Howler Core**: All system audio (SFX, Music, Ambiance) is managed via `soundManager` (`src/services/sound.ts`).
    - **Channels**: Dedicated `ambiance` channel (looping, independent volume) + `master`, `system`, `ui`, `feedback`, `music`.
    - **Realism**: Global mute (`Howler.mute(true)`) silences the system without stopping background processes (e.g., music keep "playing" silently).
    - **Startup**: High-fidelity `computerStart.mp3` (Intro) and `biosStart.mp3` (Boot).
    - **Binary Metadata**: Custom ID3 parser (`src/utils/id3Parser.ts`) extracts professional tags (TIT2, TPE1, TALB) from MP3 files.
    - **Asset Fetching**: Metadata resolution for local assets uses `fetch` with `Range: bytes=0-512KB` to efficiently read headers without full downloads.

7.  **Game Flow & Pre-OS Experience**:
    - **State Machine**: 6-state flow handled by `GameRoot.tsx` (INTRO → MENU → FIRST_BOOT/BOOT → ONBOARDING → GAMEPLAY).
    - **Main Menu**: Video game-style interface with keyboard nav. Includes **Settings** (Tabbed: Display/Audio/System) and **Credits** modals.
      - **Floating Window**: `DevStatusWindow.tsx` provides persistent system status and contribution CTAs.
    - **Save Detection**: Checks `localStorage.getItem(STORAGE_KEYS.VERSION)` to determine if save exists.
    - **New Game**: Calls `hardReset()` to wipe all `localStorage`, then `resetFileSystem()` for in-memory sync.
    - **Boot Sequence**: Realistic OS boot animation with dynamic log generation (real `APP_REGISTRY` iteration, authentic tech stack logs), pre-loads OS chunk.
    - **Onboarding**: Multi-step wizard (Language → Account → Theme → Finishing) for first-time setup.
      - Supports `Escape` (back/abort) and `Enter` (next) navigation.
      - Creates user via `createUser()`, initializes home directory, sets system creation timestamp.
    - **GAMEPLAY State**: Unmounts/remounts OS Desktop to force app re-initialization after state changes.
    - **AudioContext**: Unlocked in IntroSequence via user interaction (browser requirement).
    - **GameScreenLayout**: Unified wrapper with dual modes:
      - `mode="terminal"` (Default): ASCII art, monospaced font, pure black bg. Used for Boot/Menu.
      - `mode="glass"`: Restored legacy glassmorphism, sans-serif, animated "Orbit" logo. Used for Login/Onboarding.

8.  **Reference Implementations**:
    - **Finder (`FileManager.tsx`)**:
      - **Pattern**: Recursive directory traversal via `useFileSystem`.
      - **UI**: Dynamic breadcrumbs with drag-and-drop support.
      - **State**: Persists `viewMode` via `useAppStorage`.

    - **Terminal**:
      - **Pattern**: Command Pattern Registry (`registry.ts`).
      - **State**: Custom crash-proof history persistence (HTML-preserving).
      - **UI**: "Ghost Text" autocomplete overlay.

</architecture_mechanics>

<critical_rules>

- **FS Integrity**: ALWAYS use `createFile`, `writeFile`, `deleteNode` from `useFileSystem`.
- **Trash Resolution**: `moveToTrash` MUST resolve path based on `asUser` context (e.g., `/root/.Trash`).
- **Path Resolution**: Use absolute paths. Resolve relative via `resolvePath(path, cwd)`.
- **Security**: Check permissions via `checkPermissions(node, user, 'read'|'write'|'execute')`.
- **UI Integrity**: Use `forwardRef` for any component used with `<ContextMenuTrigger asChild>` to ensure Radix UI ref handling works.
- **I18n**: All UI strings MUST use `useI18n()`. definition: `src/i18n/locales/en.ts`.
- **I18n Sync**: Maintain strict sync across all 12 locales (`en`, `de`, `es`, `fr`, `pt`, `ro`, `zh`, `ru`, `ja`, `pl`, `ko`, `tr`). Run `/update-translations` and `.scripts/sync-i18n.js` after changes.
- **Accessibility**: All `Dialog` or `AlertDialog` components MUST include a `Title` and `Description`. Use `sr-only` class to hide them if they clash with visual design but are required for A11y.
- **Standards**: All imports should user the @ alias for the /src folder and ALL FEATURES added should have a matching debug way in Dev Center.
- **Docs Sync**: On architecture changes, update `.agent/rules/context.md` & `public/llms-full.txt`.
- **URL Security**: User-provided URLs (images, media) MUST be sanitized via `getSafeImageUrl(url)` to prevent XSS and satisfy CodeQL taint tracking.

</critical_rules>

<codebase_map>

| Path                                   | Component          | Description                                              |
| :------------------------------------- | :----------------- | :------------------------------------------------------- |
| `src/components/FileSystemContext.tsx` | **VFS Core**       | Context for all FS operations.                           |
| `src/utils/fileSystemUtils.ts`         | **VFS Utils**      | `FileNode` types, `initialFileSystem`, permission logic. |
| `src/components/AppContext.tsx`        | **Session**        | Theme, Wallpapers, Physical User session.                |
| `src/config/appRegistry.ts`            | **Registry**       | Installed Apps configuration.                            |
| `src/services/notifications.tsx`       | **Notifications**  | Central service for rich system toasts.                  |
| `src/services/sound.ts`                | **Sound Manager**  | Global audio state and Howler integration.               |
| `src/utils/id3Parser.ts`               | **ID3 Parser**     | Binary metadata extractor for MP3 files.                 |
| `src/components/apps/*`                | **Apps**           | Individual App components (Notepad, Terminal, etc).      |
| `src/hooks/useAppInstaller.ts`         | **Installer**      | Hook for app install/uninstall/restore logic.            |
| `src/components/apps/AppStore/`        | **App Store**      | App Store components (AppCard, etc).                     |
| `src/hooks/useWindowManager.ts`        | **Window Manager** | Handles window state and memory usage gates.             |

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

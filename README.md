# Aurora OS.js

[![Version](https://img.shields.io/badge/Version-v0.8.4-blue)](https://github.com/mental-os/Aurora-OS.js) ![Roadmap Status](<https://img.shields.io/badge/Roadmap-Stage%200%20(OS%20Foundation)-blue>) [![Build (Main)](<https://img.shields.io/github/actions/workflow/status/mental-os/Aurora-OS.js/ci.yml?branch=main&label=Build%20(Main)&logo=github>)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml) [![Build (Nightly)](<https://img.shields.io/github/actions/workflow/status/mental-os/Aurora-OS.js/ci.yml?branch=nightly&label=Build%20(Nightly)&logo=github>)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml) [![GitHub Pages](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml)

![Social media image for Aurora OS.js hacking simulator game project](.github/openGraph.png)

A hacking game where the operating system is the game.

Aurora OS.js is an experimental, open‑source OS‑simulation / hacking game framework built entirely with modern web technologies: React, Vite, Tailwind, and Electron.  
It’s not a finished game, yet. It’s the foundation: a playable, extensible virtual operating system designed to host hacking mechanics, scripting, multiplayer systems, and emergent gameplay.

## ✨ What exists right now

Even in its current proof‑of‑concept state, Aurora OS already solves the hard problems:

- 🗂 **Virtual User Space**: Persistent `localStorage` filesystem with real user permissions (`rwx`), user homes, and multi-user isolation (`root`, `guest`, custom users).
- 🧠 **App Engine**: Window management, z-indexing, process lifecycle, and a global context-aware Menu Bar.
- 💻 **Terminal**: Bash-like environment with pipes, IO redirection, history, and internal commands (`ls`, `cat`, `grep`, `sudo`, `su`).
- � **System Apps**:
  - **Finder**: Drag & drop file management, list/grid views, and trash can.
  - **App Store**: Install/uninstall apps with permission checks (`sudo` support).
  - **Settings**: System configuration, user management, and personalization.
  - **DevCenter**: System diagnostics and logs.
- 🎨 **Creative & Media**:
  - **Photos**: Full gallery with albums, favorites, lightbox, and reactive library scanning.
  - **Music**: Playlist management, background playback, and binary ID3 metadata parsing.
- 📝 **Productivity & Internet**:
  - **Notepad**: Monaco-like editor with syntax highlighting for 10+ languages.
  - **Browser**: Functional web browser simulation with history and tabs.
  - **Mail**: Email client simulation with attachments and multiple mailboxes.
  - **Calendar**: Event management with drag & drop support.
  - **Messages**: Chat interface simulation.
- � **Localization**: Fully translated in English, German, Spanish, French, Portuguese, Romanian, Chinese, Russian, Japanese, Polish, Korean, and Turkish.

## 🧭 Where This Is Going

Aurora OS is developed in clear evolutionary steps:

- **Stage 0 (0.x.x) — Foundation & Usability**: Functional desktop OS with real applications and natural usability.
- **Stage 1 (1.x.x) — Single-Player Hacking Game**: Playable single-player hacking experience (Steam Early Access).
- **Stage 2 (2.x.x) — Multiplayer Hacking World**: Persistent multiplayer hacking environment (Steamworks).

### [View full roadmap](ROADMAP.md)

The long‑term vision is an OS that feels real, but behaves like a game.

## 🧠 Why This Exists

I’m deeply inspired by hacking and programming‑driven games:

- [Hackmud](https://store.steampowered.com/app/469920/hackmud/) — brilliant multiplayer scripting
- [Grey Hack](https://store.steampowered.com/app/605230/Grey_Hack/) — ambitious PvP and persistence
- [Bitburner](https://github.com/bitburner-official/bitburner-src) — elegant JavaScript sandboxing
- [else Heart.break()](https://store.steampowered.com/app/400110/Else_HeartBreak/) — unmatched atmosphere and immersion

Each of them nailed something important — and each of them also felt like they stopped just short of broader reach or replayability.  
When I discovered [OS.js](https://github.com/os-js/OS.js), a thought clicked instantly:

> What if the OS itself is the game engine?

Aurora OS.js began as that experiment — inspired by OS.js and [Puter](https://github.com/HeyPuter/puter), but reshaped into a game‑first system.

## 🧪 Current Status

- Actively developed
- Architecture stabilizing
- UX polishing in progress
- Looking for **early testers, contributors, and curious minds**

This is the ideal phase to influence direction, architecture, and gameplay systems.

## 🤝 Contributing & Contribution Terms

Aurora OS.js is open-source and community-friendly, with a long-term vision that will include commercial releases.

Contributions of all kinds are welcome — code, design, documentation, ideas, and feedback.  
To keep things transparent and fair for everyone, contributions are made under clear contribution terms.

Before submitting a Pull Request, please read:

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to contribute, expectations, and contribution terms
- **[CONTRIBUTORS.md](CONTRIBUTORS.md)** — permanent credit for everyone who helped shape the project

In short:

- You keep authorship of your work
- Your contribution is credited permanently
- Your contribution may be used in open-source and future commercial versions of Aurora OS.js
- There are no retroactive license changes or hidden transfers

If anything feels unclear, open a [discussion](https://github.com/mental-os/Aurora-OS.js/discussions) — transparency matters here.

## Tech Stack

- **Framework**: React 19 (Vite 7)
- **Engine**: Electron 39 (Node 25) / ESNext
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui (Radix UI, Sonner, Vaul, CMDK) + Custom Components
- **Icons**: Lucide React
- **Animation**: Motion (Framer Motion)
- **Audio**: Howler.js
- **Testing**: Vitest

## 🚀 Getting Started

> **Prerequisite**:  
> Node.js 24.0.0+ is required.  
> Chromium-based browsers (Chrome, Edge, Brave, etc.)

```bash
npm install
npm run dev
```

Or use the [GitHub Pages](https://mental-os.github.io/Aurora-OS.js) (LIVE DEMO)

## Release Notes (v0.8.4)

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

### [View full version history](HISTORY.md)

## 📝 License & Others

### Community

- Discord (soon)
- [mental.os() Universe](https://instagram.com/mental.os)
- [CONTRIBUTORS.md](CONTRIBUTORS.md)

### Other links

- [GitHub](https://github.com/mental-os/Aurora-OS.js)
- [GitHub Pages](https://mental-os.github.io/Aurora-OS.js) (LIVE)
- GitBook (soon)

### License

- **Licensed as**: [AGPL-3.0e](LICENSE)
- **Open-source code**: [OPEN-SOURCE.md](OPEN-SOURCE.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

### AI Disclosure

This project, "Aurora OS," is human-written, with AI tools assisting in documentation, GitHub integrations, bug testing, and roadmap tracking. As soon as this project is ready for release, all the AI tools will be removed and the generated content (audio, images, etc.) will be human-created.

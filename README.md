# Aurora OS.js

[![Version](https://img.shields.io/badge/Version-v0.8.5-blue)](https://github.com/mental-os/Aurora-OS.js) [![Discord](https://img.shields.io/discord/1455762640595980452?label=Discord&logo=discord&logoColor=white)](https://discord.gg/G4WktdX7eE) ![Roadmap Status](<https://img.shields.io/badge/Roadmap-Stage%200%20(OS%20Foundation)-blue>) [![Build (Main)](<https://img.shields.io/github/actions/workflow/status/mental-os/Aurora-OS.js/ci.yml?branch=main&label=Build%20(Main)&logo=github>)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml) [![Build (Nightly)](<https://img.shields.io/github/actions/workflow/status/mental-os/Aurora-OS.js/ci.yml?branch=nightly&label=Build%20(Nightly)&logo=github>)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml) [![GitHub Pages](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml)

![Social media image for Aurora OS.js hacking simulator game project](.github/openGraph.png)

A hacking game where the operating system is the game.

Aurora OS.js is an experimental, open‑source OS‑simulation / hacking game framework built entirely with modern web technologies: React, Vite, Tailwind, and Electron.  
It’s not a finished game, yet. It’s the foundation: a playable, extensible virtual operating system designed to host hacking mechanics, scripting, multiplayer systems, and emergent gameplay.

## ✨ What exists right now

Even in its current proof‑of‑concept state, Aurora OS already solves the hard problems:

- 🗂 **Virtual User Space**: Persistent `localStorage` filesystem with real user permissions (`rwx`), user homes, and multi-user isolation (`root`, `guest`, custom users).
- 🧠 **App Engine**: Window management, z-indexing, process lifecycle, and a global context-aware Menu Bar.
- 💻 **Terminal**: Bash-like environment with pipes, IO redirection, history, and internal commands (`ls`, `cat`, `grep`, `sudo`, `su`).
- **System Apps**:
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
- **Localization**: Fully translated in English, German, Spanish, French, Portuguese, Romanian, Chinese, Russian, Japanese, Polish, Korean, and Turkish.

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
- **Engine**: Electron 40 (Node 25) / ESNext
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

## Release Notes (v0.8.5)

### Added

- **GPU Capabilities**: Added hardware acceleration toggle in BIOS and Settings (High Fidelity vs Performance presets).
- **Network Simulation**: with functional connection applet and password input. OS is responsive to the network state and react to the connection specifications (speed, signal, etc.): open/WEP/WPA/WPA2/WPA3 security that reflects the max. download speed of the network, signal strength that sets the percentage of the max. download speed, and more to come.
- **Localization**: Full native translations for 12 languages (EN, DE, ES, FR, PT, RO, RU, JA, PL, KO, TR, ZH) and added Hindi language WIP.
- **Persistence**: Graphics settings (BioS) now strictly survive "New Game" resets.

### Improved

- **Window Performance**: Implemented "Safe" closing animations and optimized z-index handling to reduce layout thrashing.
- **Browser UI**: to match the OS theme and dynamic colors.
- **Browser's websites**: Improved layout and responsiveness for all the available websites.
- **Context Awareness**: Updated AI agent documentation (`context.md`) to reflect the latest architecture mechanics.
- **App Center**: Improved with network connection check and progress the install of apps based on the effective speed of the network (first 50% of the progress bar is network, second 50% is based on system performance - random for now, not yet implemented).

### Fixed

- **Translation Gaps**: Resolved missing keys and placeholders in non-English locales.
- **Settings Sync**: Fixed issues where BIOS settings weren't correctly applying to the `SystemConfig`.

### [View full version history](HISTORY.md)

## 📝 License & Others

### Community

- [Discord](https://discord.gg/G4WktdX7eE)
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

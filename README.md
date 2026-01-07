# Aurora OS.js

[![Version](https://img.shields.io/badge/Version-v0.8.1-blue)](https://github.com/mental-os/Aurora-OS.js) ![Roadmap Status](<https://img.shields.io/badge/Roadmap-Stage%200%20(OS%20Foundation)-blue>) [![Build (Main)](<https://img.shields.io/github/actions/workflow/status/mental-os/Aurora-OS.js/ci.yml?branch=main&label=Build%20(Main)&logo=github>)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml) [![Build (Nightly)](<https://img.shields.io/github/actions/workflow/status/mental-os/Aurora-OS.js/ci.yml?branch=nightly&label=Build%20(Nightly)&logo=github>)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml) [![GitHub Pages](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml)

![Social media image for Aurora OS.js hacking simulator game project](.github/openGraph.png)

A hacking game where the operating system is the game.

Aurora OS.js is an experimental, open‑source OS‑simulation / hacking game framework built entirely with modern web technologies: React, Vite, Tailwind, and Electron.  
It’s not a finished game, yet. It’s the foundation: a playable, extensible virtual operating system designed to host hacking mechanics, scripting, multiplayer systems, and emergent gameplay.

## ✨ What exists right now

Even in its current proof‑of‑concept state, Aurora OS already solves the hard problems:

- 🗂 Virtual filesystem (persistent, sandboxed)
- 🧠 App lifecycle & OS‑level user flow
- 💻 Functional bash‑like terminal
- 🧩 Modular app architecture with context-aware Menu Bar system
- 📝 Notepad app with syntax highlighting for: .txt, .md, .js, .jsx, .css, .html, .sh, and more
- 🎛 Window management & desktop UX

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

## Release Notes (v0.8.1)

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

# Aurora OS.js - Hacking simulator game

[![Version](https://img.shields.io/badge/Version-v0.8.5-c4b5fd?style=flat-square&logo=git&logoColor=white)](https://github.com/mental-os/Aurora-OS.js) ![Roadmap Progress](<https://img.shields.io/badge/Progress-Stage%200%20(Foundation%20%26%20Usability)-f0abfc?style=flat-square&logo=steam&logoColor=white>) [![Discord](https://img.shields.io/discord/1455762640595980452?label=Discord&logo=discord&logoColor=white&color=67e8f9&style=flat-square)](https://discord.gg/G4WktdX7eE) [![Build (Main)](<https://img.shields.io/github/actions/workflow/status/mental-os/Aurora-OS.js/ci.yml?branch=main&label=Build%20(Main)&logo=github&logoColor=white&style=flat-square&color=86efac>)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml) [![GitHub Pages](https://img.shields.io/github/actions/workflow/status/mental-os/Aurora-OS.js/deploy.yml?label=GitHub%20Pages&logo=github&logoColor=white&style=flat-square&color=86efac)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml)

![Social media image for Aurora OS.js hacking simulator game project](.github/openGraph.png)

**Aurora OS.js** isn't just a web-based OS. It's a portal.

Born from the intersection of digital art and cyberpunk culture, this project reimagines the operating system as an immersive game world. It is a **high-fidelity hacking simulator** built on modern web technologies _(React, Vite, Electron)_, designed to blur the line between utility and gameplay.

Currently in its **pre-Alpha** stage, it serves as the foundation for a future MMO hacking universe - a persistent world where you script, hack, and uncover the lore of an emerging game universe.

## ₩Ⱨ₳₮ ɆӾł₴₮₴ Ɽł₲Ⱨ₮ ₦Ø₩

### Key features:

- **High-Fidelity Desktop Environment**: Pixel-perfect window manager with snapping, z-indexing, and a global menu bar that feels exactly like a real OS.
- **True Virtual Filesystem (VFS)**: A persistent, permission-aware (`rwx`) filesystem. Create, delete, and modify files in `/home`, `/etc`, and `/var`.
- **Fully Functional Terminal**:
  - **Core Utils**: `ls`, `cd`, `cat`, `grep`, `pwd`, `cp`, `mv`, `rm`, `mkdir`, `touch`.
  - **Advanced**: `sudo`, `su`, piping (`|`), redirection (`>`), and environment variables.
- **Network & Hacking Simulation**:
  - **WiFi**: Realistic signal strength and bandwidth simulation _(WEP/WPA/WPA2/WPA3)_.
  - **DNS**: `Browser` respects `/etc/hosts` for local domain spoofing.
- **Gamified System Resources**:
  - **Memory**: Apps consume virtual RAM; opening too many apps triggers launch gates.
  - **Internet speed**: Realistic internet speed simulation based on WiFi signal strength, bandwidth, and security.
  - **Battery**: Detailed battery health and discharge simulation.
- **Included Applications**:
  - **Browser**: Tabbed browsing, history, bookmarks, and offline state simulation.
  - **Notepad**: VS Code-like editor with syntax highlighting for multiple languages _(JS, TS, HTML, CSS, JSON, and more)_.
  - **DevCenter**: Real-time system diagnostics, process manager, and filesystem explorer.
  - **Mail**: Email client with attachment downloads and HTML sanitization.
  - **Calendar**: Event management with drag & drop support.
  - **Messages**: Chat interface simulation.
  - **Media**: Photos and Music apps with binary metadata parsing.

## WⱧɆⱤE ₮Ⱨł₴ łS ₲Øł₦G?

Aurora OS.js is developed in clear evolutionary steps:

- **Stage 0 (0.x.x) → Foundation & Usability**: Functional desktop OS with real applications and natural usability.
- **Stage 1 (1.x.x) → Single-Player Hacking Game**: Playable single-player hacking experience (Steam Early Access).
- **Stage 2 (2.x.x) → Multiplayer Hacking World**: Persistent multiplayer hacking environment (Steamworks).

The long‑term vision is a MMO hacking simulator based on a high-fidelity OS (Aurora OS.js) that lets you engage in scripting _(JS/TS/bash)_, PvP, PvE, and lots of social aspects, while discovering the lore behind an extensive universe.

### [View full roadmap](ROADMAP.md)

## ₩ⱧɎ THł₴ ɆӾłST₴?

I'm an artist with over 15 years for multidisciplinary digital art & design. The topics I cover in my art are usually borderline technology, psychology, philosophy, and the human condition - all, in the context of the digital age and the future that we are building - you can discover more on my [Instagram page](https://www.instagram.com/mental_os/).

With my personality deeply influenced by the hacking culture and the cyberpunk aesthetic, I've always been fascinated by the idea of a world where technology and humanity are intertwined in a way that blurs the lines between the two.

Having my art evolved over the years from artworks, to full-blown ARG's, to interactive experiences, and now to a full-blown OS simulation, I've always wanted to create something that would allow people to experience the world I've built in a more immersive way. This is the right medium to do that: the next step in my artistic evolution.

I’m deeply inspired by hacking and programming‑driven games:

- [Hackmud](https://store.steampowered.com/app/469920/hackmud/) - brilliant multiplayer scripting
- [Grey Hack](https://store.steampowered.com/app/605230/Grey_Hack/) - ambitious PvP and persistence
- [Bitburner](https://github.com/bitburner-official/bitburner-src) - elegant JavaScript sandboxing
- [else Heart.break()](https://store.steampowered.com/app/400110/Else_HeartBreak/) - unmatched atmosphere and immersion

Each of them nailed something important - and each of them also felt like they stopped just short of broader reach or replayability.  

When I discovered [OS.js](https://github.com/os-js/OS.js) back in 2020, a thought clicked instantly:

> What if the OS itself is the game engine and the portal to the mental.os() word?

Now is the time to make it happen.

## ₵ɄRⱤɆ₦T ₴₮₳₮US (Contributors wanted)

> This is a **work in progress**. The project is still under development and may contain bugs and unfinished features.

- High-fidelity OS simulation inspired by MacOS, Windows, and Linux
- Functional system and core apps
- Proto-gameplay elements
- Looking for **early testers, contributors, and curious minds**

This is the ideal phase to influence direction, architecture, and gameplay systems.

## ₵Ø₦TRł฿Ʉ₮IN₲ & CON₮Ɽł฿Ʉ₮ł₦₲ TɆⱤM₴

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

## TɆ₵Ⱨ ST₳C₭

- **Framework**: React 19 (Vite 7)
- **Engine**: Electron 40 (Node 25) / ESNext
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui (Radix UI, Sonner, Vaul, CMDK) + Custom Components
- **Icons**: Lucide React
- **Window Management**: react-rnd
- **System Info**: systeminformation
- **Animation**: Motion (Framer Motion)
- **Audio**: Howler.js
- **Testing**: Vitest

## GET₮ł₦₲ ₴₮ARTɆĐ

The fastest way to try it out is to use the [GitHub Pages](https://mental-os.github.io/Aurora-OS.js) _(Live version)_.

If you want to run it locally:

> **Prerequisite**:  
> Node.js 24.0.0+ is required.  
> Chromium-based browsers (Chrome, Edge, Brave, etc.)

After a ```npm install``` you can run the in-browser live-version with:

```bash
npm run dev
```

or run the native version (dev mode):

```bash
npm run electron:dev
```

or build it for your native OS (as intended):

```
npm run electron:build
```

## ⱤɆⱠEASɆ NØ₮ɆS (v0.8.5)

### [View full version history](HISTORY.md)

## Ⱡł₵ENSɆ & Ø₮ⱧɆRS

### Community

- [Discord](https://discord.gg/G4WktdX7eE) - chat, help, etc.
- [GitHub Discussions](https://github.com/mental-os/Aurora-OS.js/discussions) - ideas, suggestions, etc.
- [mental.os() Universe](https://instagram.com/mental.os) - lore & more
- [CONTRIBUTORS.md](CONTRIBUTORS.md) - permanent credit for everyone who helped shape the project

### Other links

- [Official GitHub repository](https://github.com/mental-os/Aurora-OS.js)
- [GitHub Pages](https://mental-os.github.io/Aurora-OS.js) _(Live version)_
- [GitBook](https://mental-os.gitbook.io/aurora-os.js/) _(WIP)_ - Guides, docs, etc.
- [GitHub Releases](https://github.com/mental-os/Aurora-OS.js/releases) - Releases
- [GitMCP](https://gitmcp.io/mental-os/Aurora-OS.js) - MCP Server for AI tools

### License

- **Licensed as**: [AGPL-3.0e](LICENSE)
- **Open-source code**: [OPEN-SOURCE.md](OPEN-SOURCE.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

### AI Disclosure

This project, "Aurora OS.js", is human-written, with AI tools assisting in documentation, GitHub integrations, bug testing, and roadmap tracking. As soon as this project is ready for release, all the AI tools will be removed and the generated content (audio, images, etc.) will be human-created.

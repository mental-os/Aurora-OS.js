# Aurora OS.js v0.5.2 [![Dependencies](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependency-review.yml) [![Build](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml)

A modern, web-based desktop operating system interface built with React, Tailwind CSS, and Radix UI.

## Features

- **Desktop Environment**: Fully functional desktop with draggable windows, dock, and menu bar.
- **Window Management**: Minimize, maximize, close, and focus management.
- **App Ecosystem**:
  - **Finder**: File system navigation.
  - **Settings**: System configuration (Appearance, Accent Colors, Blur effects).
  - **Music**: Interactive music player with library and controls.
  - **Messages**: Chat interface.
  - **Photos**: Photo gallery.
  - **Calculator**: Functional calculator app.
  - **Calendar**: Month view calendar.
  - **Mail**: Email client interface.
- **Customization**:
  - **Dark/Light Mode**: System-wide theme switching.
  - **Accent Colors**: Dynamic system accent colors.
  - **Blur & Transparency**: Toggleable glassmorphism effects.

## Tech Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Animation**: Framer Motion

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

    npm run build
    ```

## Maintenance

### Manual Triggers
- **CI / Tests**: Go to **Actions** tab > Select workflow > Click **Run workflow**.
- **Dependabot**: Go to **Insights** tab > **Dependency graph** > **Dependabot** > Click **Check for updates**.

### Testing
This project uses **Vitest** for unit & integration testing.
```bash
npm test
```

## Release Notes

### v0.5.2
- **Tech Stack Overhaul**: Upgraded to **React 19**, **Vite 7**, and **Recharts 3**.
- **CI/CD**: Added GitHub Actions workflow for automated testing.
- **Code Quality**: Implemented ESLint and fixed code consistency issues.
- **Maintenance**: Improved `.gitignore` and dynamic versioning.

[View full version history](HISTORY.md)

## License

Not yet available

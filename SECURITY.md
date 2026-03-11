# Security Policy

## Supported Versions

Aurora OS.js is under active development. Security updates are currently provided only for the latest stable version published on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| Latest main (0.8.5)  | :white_check_mark: |
| Latest nightly (0.8.6)  | :white_check_mark: |
| Older releases | :x: |

Only the most recent version receives security patches. Users are strongly encouraged to keep their local copies and deployments up to date.

---

## Reporting a Vulnerability

If you discover a security vulnerability in Aurora OS.js, please report it responsibly.

### Where to report

Please **do not open a public GitHub issue** for security vulnerabilities.

Instead, report the issue via:

- **GitHub Security Advisories** (private disclosure), or  
- Email: **mentalos@proton.me**

If unsure, use GitHub’s private vulnerability reporting feature.

---

## What to include

To help us resolve the issue quickly, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- A proof-of-concept (if applicable)
- Environment details (browser, OS, Electron version if relevant)
- Potential impact assessment (if known)

---

## Scope

Aurora OS.js is a high-fidelity web-based OS simulation that includes:

- Virtual file systems
- Terminal environments
- Script execution layers
- App sandboxing
- Local storage/session persistence
- Electron desktop builds (when applicable)

Relevant security concerns may include:

- Script injection (XSS)
- Local storage manipulation
- Sandbox escape attempts
- File system abuse
- Electron privilege escalation
- Dependency vulnerabilities

---

## Response Process

- You will receive an acknowledgment within **72 hours**
- A fix timeline will depend on severity and complexity
- Confirmed vulnerabilities will be patched in the latest supported version
- Credit will be given to responsible reporters (unless anonymity is requested)

---

## Responsible Disclosure

Please allow reasonable time for remediation before publicly disclosing the vulnerability.

We aim to maintain Aurora OS.js as a safe sandboxed simulation environment and appreciate responsible security research.

---

Thank you for helping improve Aurora OS.js.

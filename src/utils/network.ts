export async function checkLatency(url: string = 'https://caravane.digital/favicon.ico'): Promise<{ system: number | null, caravane: number | null } | null> {
    // 1. Electron Strategy (Main Process via systeminformation)
    if (window.electron?.checkConnection) {
        try {
            return await window.electron.checkConnection();
        } catch (e) {
            console.error('Electron network check failed:', e);
            return null;
        }
    }

    // 2. Web API Strategy (Browser / Fallback)
    const start = performance.now();
    try {
        // Cache-busting to ensure we measure real network latency
        const cacheBuster = `?t=${Date.now()}`;
        await fetch(`${url}${cacheBuster}`, {
            mode: 'no-cors',
            cache: 'no-store'
        });
        const latency = Math.round(performance.now() - start);
        return {
            system: null, // Browser can't do system ping
            caravane: latency
        };
    } catch (error) {
        console.error('Ping failed:', error);
        return null;
    }
}

export function isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Parses the content of a hosts file into a mapping of domain -> IP.
 * Ignores comments (#) and empty lines.
 * Handles multiple hostnames per line.
 * 
 * @param content The raw content of the hosts file
 * @returns A record where keys are domains and values are IPs
 */
export function parseHostsFile(content: string): Record<string, string> {
    const mappings: Record<string, string> = {};
    if (!content) return mappings;

    const lines = content.split('\n');
    for (const line of lines) {
        // Remove comments
        const cleanLine = line.split('#')[0].trim();
        if (!cleanLine) continue;

        // Split by whitespace (tabs or spaces)
        const parts = cleanLine.split(/\s+/);
        if (parts.length >= 2) {
            const ip = parts[0];
            // Remaining parts are hostnames
            for (let i = 1; i < parts.length; i++) {
                const hostname = parts[i].toLowerCase();
                mappings[hostname] = ip;
            }
        }
    }
    return mappings;
}

/**
 * Resolves a domain name using the provided hosts mapping.
 * If the domain is found in the hosts file, returns the mapped IP.
 * Otherwise, returns the original domain.
 * 
 * @param domain The domain to resolve
 * @param hosts The parsed hosts mapping
 * @returns The resolved IP or the original domain
 */
export function resolveHost(domain: string, hosts: Record<string, string>): string {
    const normalized = domain.toLowerCase();
    return hosts[normalized] || domain;
}

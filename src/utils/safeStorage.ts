// Lightweight safe localStorage parser + sanitizer
// Prevents basic prototype pollution by stripping dangerous keys
export function safeParseLocal<T = any>(key: string): T | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return sanitize(parsed) as T;
    } catch (e) {
        // Malformed JSON or other issue
        // Keep behavior resilient: return null so callers can fallback
        console.warn(`safeParseLocal: failed to parse key ${key}`, e);
        return null;
    }
}

function sanitize(value: any, seen = new WeakSet()): any {
    if (value === null) return null;
    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean') return value;
    if (Array.isArray(value)) return value.map(v => sanitize(v, seen));
    if (t === 'object') {
        if (seen.has(value)) return null;
        seen.add(value);

        const out: Record<string, any> = {};
        Object.keys(value).forEach(k => {
            // Drop dangerous keys that can cause prototype-pollution or unexpected behavior
            if (k === '__proto__' || k === 'constructor' || k === 'prototype') return;
            try {
                out[k] = sanitize(value[k], seen);
            } catch {
                out[k] = null;
            }
        });
        return out;
    }

    // Fallback for functions, symbols, etc.
    return null;
}

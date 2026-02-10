import _pkg from '../../package.json';
const pkg = _pkg as any;

// Critical Constants - Hashed identity values of the project
// Modifying these values in package.json without a dev key will trigger Safe Mode.
const EXPECTED_IDENTITY = {
    name: 1297699491, // Hash of 'yami-os-js'
    author: 2105392086, // Hash of 'Cătălin-Robert Drăgoiu'
    license: 555217376, // Hash of 'AGPL-3.0'
};

// Simple DJB2 hash for the dev key and identity verification
const hashString = (str: string) => {
    let hash = 3770;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure unsigned 32-bit integer
};

// Hash of the secret password "aurora-r00t-override"
// We store the hash so the actual password isn't easily greppable in the source.
export const DEV_KEY_HASH = 2282602482; // Hash of "aurora-r00t-override"
const STORAGE_KEY = 'AURORA_DEV_OVERRIDE';

export type SystemHealth = 'OK' | 'CORRUPTED';

export const validateIntegrity = (): boolean => {
    // 1. Check for Developer Override (The "Bypass")
    try {
        const storedHash = localStorage.getItem(STORAGE_KEY);
        if (storedHash && parseInt(storedHash) === DEV_KEY_HASH) {
            console.warn('SYSTEM INTEGRITY: Developer Override Active. Security checks skipped.');
            return true;
        }
    } catch (e) {
        // LocalStorage might be disabled or unavailable
        console.error('Integrity Check: storage access failed', e);
    }

    // 2. Validate Identity using hashes
    const isIdentityValid =
        hashString(pkg.name) === EXPECTED_IDENTITY.name &&
        hashString(pkg.author) === EXPECTED_IDENTITY.author &&
        hashString(pkg.license) === EXPECTED_IDENTITY.license;
    // checking productName might be too strict if they just want to config it, 
    // but 'name' and 'author' are strict IP markers.

    if (!isIdentityValid) {
        console.error('SYSTEM INTEGRITY COMPROMISED: Identity mismatch.');
        console.table({
            expected: EXPECTED_IDENTITY,
            actual: {
                name: hashString(pkg.name),
                author: hashString(pkg.author),
                license: hashString(pkg.license)
            }
        });
        return false;
    }

    return true;
};

export const getSystemHealth = (): SystemHealth => {
    return validateIntegrity() ? 'OK' : 'CORRUPTED';
};

export const unlockDeveloperMode = (password: string): boolean => {
    if (hashString(password) === DEV_KEY_HASH) {
        localStorage.setItem(STORAGE_KEY, DEV_KEY_HASH.toString());
        return true;
    }
    return false;
};

export const lockDeveloperMode = () => {
    localStorage.removeItem(STORAGE_KEY);
}

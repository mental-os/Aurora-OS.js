import { describe, it, expect } from 'vitest';
import {
    parseSymbolicMode,
    octalToPermissions,
    parsePasswd,
    formatPasswd
} from '../utils/fileSystemUtils';

describe('fileSystemUtils', () => {
    describe('parseSymbolicMode (chmod)', () => {
        // This covers the security fix for [+\-=]
        it('parses simple symbolic modes', () => {
            expect(parseSymbolicMode('drwxr-xr-x', '+w')).toBe('drwxrwxrwx'); // Adds w to everyone (default a)
            expect(parseSymbolicMode('drwxr-xr-x', 'u+w')).toBe('drwxr-xr-x'); // u already has w, no change
            expect(parseSymbolicMode('drwxr-xr-x', 'o-rx')).toBe('drwxr-x---'); // removes r and x from others
        });

        it('parses strict assignment (=)', () => {
            // u=rw -> u should be rw-
            expect(parseSymbolicMode('-rwxrwxrwx', 'u=rw')).toBe('-rw-rwxrwx');
            expect(parseSymbolicMode('-rwxrwxrwx', 'a=r')).toBe('-r--r--r--');
        });

        it('ignores invalid input safely', () => {
            expect(parseSymbolicMode('drwxr-xr-x', 'invalid')).toBeNull();
            // Test the regex edge case (should not allow range interpretation)
            // '0-9' would be matched if [+-=] was [+-=] (range + to =) which includes digits
            // But with [\+\-=], it should fail or not match digit as operator
            expect(parseSymbolicMode('drwxr-xr-x', 'u9r')).toBeNull();
        });
    });

    describe('octalToPermissions', () => {
        it('converts common octal modes', () => {
            expect(octalToPermissions('755', 'directory')).toBe('drwxr-xr-x');
            expect(octalToPermissions('644', 'file')).toBe('-rw-r--r--');
            expect(octalToPermissions('777', 'file')).toBe('-rwxrwxrwx');
        });

        it('handles fallback for invalid input', () => {
            expect(octalToPermissions('888', 'file')).toBe('-rw-r--r--');
            expect(octalToPermissions('abc', 'directory')).toBe('drwxr-xr-x');
        });
    });

    describe('User Parsing (/etc/passwd)', () => {
        const passwdContent = `root:admin:0:0:System Administrator:/root:/bin/bash
user:1234:1000:1000:User:/home/user:/bin/bash`;

        it('parses passwd file content correctly', () => {
            const users = parsePasswd(passwdContent);
            expect(users).toHaveLength(2);
            expect(users[0]).toEqual({
                username: 'root',
                password: 'admin',
                uid: 0,
                gid: 0,
                fullName: 'System Administrator',
                homeDir: '/root',
                shell: '/bin/bash'
            });
        });

        it('formats users back to string', () => {
            const users = parsePasswd(passwdContent);
            const formatted = formatPasswd(users);
            expect(formatted).toBe(passwdContent);
        });
    });
});

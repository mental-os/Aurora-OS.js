import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileSystemProvider, useFileSystem } from './FileSystemContext';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('FileSystemContext', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FileSystemProvider>{children}</FileSystemProvider>
    );

    it('resolves home path ~', () => {
        const { result } = renderHook(() => useFileSystem(), { wrapper });

        // Must login to have a home path
        act(() => {
            result.current.login('user', '1234');
        });

        expect(result.current.resolvePath('~')).toBe('/home/user');
        expect(result.current.resolvePath('~/Desktop')).toBe('/home/user/Desktop');
    });

    it('resolves absolute path aliases (/Desktop -> ~/Desktop)', () => {
        const { result } = renderHook(() => useFileSystem(), { wrapper });

        act(() => { result.current.login('user', '1234'); });

        // Test the newly added aliases
        expect(result.current.resolvePath('/Desktop')).toBe('/home/user/Desktop');
        expect(result.current.resolvePath('/Documents')).toBe('/home/user/Documents');
        expect(result.current.resolvePath('/Downloads')).toBe('/home/user/Downloads');

        // Subdirectories
        expect(result.current.resolvePath('/Desktop/test.txt')).toBe('/home/user/Desktop/test.txt');
    });

    it('preserves system paths', () => {
        const { result } = renderHook(() => useFileSystem(), { wrapper });
        expect(result.current.resolvePath('/bin')).toBe('/bin');
        expect(result.current.resolvePath('/usr/bin')).toBe('/usr/bin');
        expect(result.current.resolvePath('/etc')).toBe('/etc');
    });

    it('handles relative paths', () => {
        const { result } = renderHook(() => useFileSystem(), { wrapper });
        act(() => { result.current.login('user', '1234'); });

        // Default cwd is ~ (/home/user)
        expect(result.current.resolvePath('test.txt')).toBe('/home/user/test.txt');

        // Change cwd
        act(() => {
            result.current.setCurrentPath('/bin');
        });
        expect(result.current.resolvePath('ls')).toBe('/bin/ls');
    });

    it('enforces unique filenames', () => {
        const { result } = renderHook(() => useFileSystem(), { wrapper });
        act(() => { result.current.login('user', '1234'); });

        const path = '/home/user/Desktop';

        // Create first file
        let success = false;
        act(() => {
            success = result.current.createFile(path, 'test.txt');
        });
        expect(success).toBe(true);

        // Try creating duplicate
        act(() => {
            success = result.current.createFile(path, 'test.txt');
        });
        expect(success).toBe(false);
    });

    describe('Trash Logic', () => {
        it('moves file to trash', () => {
            const { result } = renderHook(() => useFileSystem(), { wrapper });
            act(() => { result.current.login('user', '1234'); });
            const desktop = '/home/user/Desktop';

            // Create file
            act(() => { result.current.createFile(desktop, 'junk.txt'); });

            // Move to trash
            let success = false;
            act(() => {
                success = result.current.moveToTrash(`${desktop}/junk.txt`);
            });

            expect(success).toBe(true);
            expect(result.current.getNodeAtPath(`${desktop}/junk.txt`)).toBeNull();
            expect(result.current.getNodeAtPath('/home/user/.Trash/junk.txt')).not.toBeNull();
        });

        it('handles trash collisions by renaming', () => {
            const { result } = renderHook(() => useFileSystem(), { wrapper });
            act(() => { result.current.login('user', '1234'); });
            const desktop = '/home/user/Desktop';

            // Create two files
            act(() => {
                result.current.createFile(desktop, 'file.txt');
                result.current.createFile(desktop, 'file_1.txt'); // placeholder to ensure distinct creation
            });

            // Move first one
            act(() => { result.current.moveToTrash(`${desktop}/file.txt`); });

            // Re-create file.txt at source
            act(() => { result.current.createFile(desktop, 'file.txt'); });

            // Move second one
            act(() => { result.current.moveToTrash(`${desktop}/file.txt`); });

            expect(result.current.getNodeAtPath('/home/user/.Trash/file.txt')).not.toBeNull();
            expect(result.current.getNodeAtPath('/home/user/.Trash/file 1.txt')).not.toBeNull();
        });

        it('empties trash', () => {
            const { result } = renderHook(() => useFileSystem(), { wrapper });
            act(() => { result.current.login('user', '1234'); });
            const desktop = '/home/user/Desktop';

            act(() => {
                result.current.createFile(desktop, 'rubbish.txt');
            });

            act(() => {
                result.current.moveToTrash(`${desktop}/rubbish.txt`);
            });

            expect(result.current.getNodeAtPath('/home/user/.Trash/rubbish.txt')).not.toBeNull();

            act(() => { result.current.emptyTrash(); });

            // Trash folder should check for children being empty, but the folder itself might remain or be empty.
            // Based on implementation, .Trash node always exists but children are cleared.
            const trash = result.current.getNodeAtPath('/home/user/.Trash');
            expect(trash?.children?.length).toBe(0);
        });
    });
});

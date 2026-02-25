import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTerminalLogic } from '@/hooks/useTerminalLogic';
import { FileSystemProvider, useFileSystem } from '@/components/FileSystemContext';
import { AppProvider } from '@/components/AppContext';
import { STORAGE_KEYS, memory } from '@/utils/memory';

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

// Mock colors
vi.mock('../utils/colors', () => ({
    getColorShades: () => ({ bg: '', border: '', text: '' }),
}));

// Mock WorldContext
vi.mock('../components/WorldContext', () => ({
    useWorldContext: () => ({
        resolveNpcTarget: vi.fn(),
        getNpcApi: vi.fn(),
    })
}));

// Mock NetworkContext
vi.mock('../components/NetworkContext', () => ({
    useNetworkContext: () => ({
        wifiEnabled: true,
        currentNetwork: 'Aurora_Net',
    })
}));

describe('useTerminalLogic', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>
            <FileSystemProvider>{children}</FileSystemProvider>
        </AppProvider>
    );

    it('expands globs correctly in commands', async () => {
        const { result } = renderHook(() => {
            const fs = useFileSystem();
            const terminal = useTerminalLogic(undefined, 'user');
            return { fs, terminal };
        }, { wrapper });

        // 1. Setup Filesystem state
        await waitFor(() => {
            expect(result.current.fs.users.length).toBeGreaterThan(0);
        });

        await act(async () => {
            // Login as root to create user home
            result.current.fs.login('root', 'admin');
        });

        await act(async () => {
            result.current.fs.addUser('user', 'User', '1234');
        });

        // addUser creates home directory.

        await act(async () => {
            // Switch to user
            result.current.fs.login('user', '1234');
        });

        await act(async () => {
            result.current.fs.createFile('/home/user', 'note.txt', 'content');
        });
        await act(async () => {
            result.current.fs.createFile('/home/user', 'log.txt', 'log');
        });

        // 1a. Check Echo (Baseline functionality)
        await act(async () => {
            result.current.terminal.setInput('echo hello');
        });
        await act(async () => {
            result.current.terminal.handleKeyDown({ key: 'Enter', preventDefault: () => { } } as any);
        });

        await waitFor(() => {
            const last = result.current.terminal.history.slice(-1)[0];
            expect(last).toBeDefined();
            expect(last?.output.join(' ')).toContain('hello');
        });

        // 2. Glob Test
        // Ensure CWD matches expectation (Terminal session maintains its own state)
        await act(async () => {
            result.current.terminal.setInput('cd /home/user');
        });
        await act(async () => {
            result.current.terminal.handleKeyDown({ key: 'Enter', preventDefault: () => { } } as any);
        });

        await act(async () => {
            result.current.terminal.setInput('ls *.txt');
        });
        await act(async () => {
            result.current.terminal.handleKeyDown({ key: 'Enter', preventDefault: () => { } } as any);
        });

        await waitFor(() => {
            const last = result.current.terminal.history.slice(-1)[0];
            const outputString = last?.output.join(' ');
            expect(outputString).toContain('note.txt');
            expect(outputString).toContain('log.txt');
        });
    });

    it('sanitizes regex injection in globs', async () => {
        const { result } = renderHook(() => {
            const fs = useFileSystem();
            const terminal = useTerminalLogic(undefined, 'user');
            return { fs, terminal };
        }, { wrapper });

        await waitFor(() => {
            expect(result.current.fs.users.length).toBeGreaterThan(0);
        });

        await act(async () => {
            result.current.fs.login('root', 'admin');
        });

        await act(async () => {
            result.current.fs.addUser('user', 'User', '1234');
        });

        await act(async () => {
            result.current.fs.login('user', '1234');
        });

        await act(async () => {
            result.current.fs.createFile('/home/user', 'a+b.txt', 'content', 'user');
        });

        // Ensure CWD
        await act(async () => {
            result.current.terminal.setInput('cd /home/user');
        });
        await act(async () => {
            result.current.terminal.handleKeyDown({ key: 'Enter', preventDefault: () => { } } as any);
        });

        await act(async () => {
            result.current.terminal.setInput('ls a+b.txt');
        });
        await act(async () => {
            result.current.terminal.handleKeyDown({ key: 'Enter', preventDefault: () => { } } as any);
        });

        await waitFor(() => {
            const last = result.current.terminal.history.slice(-1)[0];
            expect(last?.output.join(' ')).toContain('a+b.txt');
        });
    });
    it('persists history to memory', async () => {
        const { result } = renderHook(() => {
            const fs = useFileSystem();
            const terminal = useTerminalLogic(undefined, 'user');
            return { fs, terminal };
        }, { wrapper });

        // Setup environment
        await waitFor(() => expect(result.current.fs.users.length).toBeGreaterThan(0));
        await act(async () => { result.current.fs.login('root', 'admin'); });
        await act(async () => { result.current.fs.addUser('user', 'User', '1234'); });
        await act(async () => { result.current.fs.login('user', '1234'); });

        const setItemSpy = vi.spyOn(memory, 'setItem');

        // Execute command
        await act(async () => {
            result.current.terminal.setInput('echo persistence_test');
        });
        await act(async () => {
            result.current.terminal.handleKeyDown({ key: 'Enter', preventDefault: () => { } } as any);
        });

        // Verify memory was updated with the new key format
        await waitFor(() => {
            expect(setItemSpy).toHaveBeenCalledWith(
                `${STORAGE_KEYS.TERM_HISTORY_PREFIX}user`,
                expect.stringContaining('persistence_test')
            );
        });
    });
});

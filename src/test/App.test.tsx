import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
class ResizeObserverMock {
    observe() { }
    unobserve() { }
    disconnect() { }
}
window.ResizeObserver = ResizeObserverMock;

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {

        div: ({ children, ...props }: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { initial, animate, exit, transition, whileHover, whileTap, ...validProps } = props;
            return <div {...validProps}>{children}</div>;
        },

        button: ({ children, ...props }: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { initial, animate, exit, transition, whileHover, whileTap, ...validProps } = props;
            return <button {...validProps}>{children}</button>;
        },
    },

    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock GameRoot to bypass intro/menu/boot sequence
vi.mock('../components/Game/GameRoot', () => ({
    GameRoot: ({ children }: any) => <>{children}</>,
}));

describe('Aurora OS Integration', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('boots and renders the Login Screen', () => {
        // Skip first-run language onboarding for this test
        localStorageMock.setItem(
            'aurora-system-config',
            JSON.stringify({ devMode: false, exposeRoot: false, locale: 'en-US', onboardingComplete: true })
        );

        render(<App />);

        // Verify Login Screen is present
        expect(screen.getByText(/Select User/i)).toBeInTheDocument();
        expect(screen.getByText(/Soft Reset/i)).toBeInTheDocument();

        // Finder (Dock) should NOT be present yet
        const finder = screen.queryByLabelText('Finder');
        expect(finder).not.toBeInTheDocument();
    });

    it('loads persistence data on boot', () => {
        render(<App />);
        expect(localStorageMock.getItem).toHaveBeenCalledWith('aurora-os-settings');
        expect(localStorageMock.getItem).toHaveBeenCalledWith('aurora-filesystem');
    });
});

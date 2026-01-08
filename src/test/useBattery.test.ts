import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useBattery } from '../hooks/useBattery';
import { BatteryManager } from '../types';

describe('useBattery', () => {
    let mockBattery: BatteryManager;
    let mockGetBattery: () => Promise<BatteryManager>;
    let eventListeners: Record<string, (() => void)[]>;

    beforeEach(() => {
        // Réinitialiser les event listeners
        eventListeners = {
            chargingchange: [],
            levelchange: [],
            chargingtimechange: [],
            dischargingtimechange: [],
        };

        // Créer un mock BatteryManager
        mockBattery = {
            level: 0.85,
            charging: false,
            chargingTime: Infinity,
            dischargingTime: 7200, // 2 heures
            addEventListener: vi.fn((type: string, listener: () => void) => {
                if (eventListeners[type]) {
                    eventListeners[type].push(listener);
                }
            }),
            removeEventListener: vi.fn((type: string, listener: () => void) => {
                if (eventListeners[type]) {
                    const index = eventListeners[type].indexOf(listener);
                    if (index > -1) {
                        eventListeners[type].splice(index, 1);
                    }
                }
            }),
            dispatchEvent: vi.fn(),
        } as unknown as BatteryManager;

        // Créer un mock getBattery qui retourne une Promise
        mockGetBattery = vi.fn(() => Promise.resolve(mockBattery));

        // Mocker navigator.getBattery
        Object.defineProperty(navigator, 'getBattery', {
            writable: true,
            value: mockGetBattery,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('retourne null quand l\'API getBattery n\'est pas disponible (PC fixe)', async () => {
        // Supprimer getBattery de navigator
        Object.defineProperty(navigator, 'getBattery', {
            writable: true,
            value: undefined,
        });

        const { result } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).toBeNull();
        });
    });

    it('retourne les bonnes valeurs quand l\'API est disponible (portable)', async () => {
        const { result } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        expect(result.current).toEqual({
            level: 0.85,
            charging: false,
            chargingTime: null, // Infinity est converti en null
            dischargingTime: 7200,
        });
    });

    it('met à jour l\'état quand l\'événement levelchange est déclenché', async () => {
        const { result } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        // Changer le niveau de batterie
        Object.defineProperty(mockBattery, 'level', {
            writable: true,
            value: 0.5,
        });

        // Déclencher l'événement levelchange
        const levelChangeListeners = eventListeners.levelchange;
        levelChangeListeners.forEach(listener => listener());

        await waitFor(() => {
            expect(result.current?.level).toBe(0.5);
        });
    });

    it('met à jour l\'état quand l\'événement chargingchange est déclenché', async () => {
        const { result } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        // Changer l'état de charge
        Object.defineProperty(mockBattery, 'charging', {
            writable: true,
            value: true,
        });

        // Déclencher l'événement chargingchange
        const chargingChangeListeners = eventListeners.chargingchange;
        chargingChangeListeners.forEach(listener => listener());

        await waitFor(() => {
            expect(result.current?.charging).toBe(true);
        });
    });

    it('met à jour l\'état quand l\'événement chargingtimechange est déclenché', async () => {
        const { result } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        // Changer le temps de charge
        Object.defineProperty(mockBattery, 'chargingTime', {
            writable: true,
            value: 3600, // 1 heure
        });

        // Déclencher l'événement chargingtimechange
        const chargingTimeChangeListeners = eventListeners.chargingtimechange;
        chargingTimeChangeListeners.forEach(listener => listener());

        await waitFor(() => {
            expect(result.current?.chargingTime).toBe(3600);
        });
    });

    it('met à jour l\'état quand l\'événement dischargingtimechange est déclenché', async () => {
        const { result } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        // Changer le temps de décharge
        Object.defineProperty(mockBattery, 'dischargingTime', {
            writable: true,
            value: 5400, // 1.5 heures
        });

        // Déclencher l'événement dischargingtimechange
        const dischargingTimeChangeListeners = eventListeners.dischargingtimechange;
        dischargingTimeChangeListeners.forEach(listener => listener());

        await waitFor(() => {
            expect(result.current?.dischargingTime).toBe(5400);
        });
    });

    it('gère correctement les erreurs quand getBattery échoue', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Faire échouer getBattery
        mockGetBattery = vi.fn(() => Promise.reject(new Error('Battery API not available')));
        Object.defineProperty(navigator, 'getBattery', {
            writable: true,
            value: mockGetBattery,
        });

        const { result } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).toBeNull();
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Failed to get battery information:',
            expect.any(Error)
        );

        consoleWarnSpy.mockRestore();
    });

    it('nettoie les event listeners au démontage du composant', async () => {
        const { result, unmount } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        // Vérifier que les event listeners ont été ajoutés
        expect(mockBattery.addEventListener).toHaveBeenCalledWith('chargingchange', expect.any(Function));
        expect(mockBattery.addEventListener).toHaveBeenCalledWith('levelchange', expect.any(Function));
        expect(mockBattery.addEventListener).toHaveBeenCalledWith('chargingtimechange', expect.any(Function));
        expect(mockBattery.addEventListener).toHaveBeenCalledWith('dischargingtimechange', expect.any(Function));

        // Démonter le composant
        unmount();

        // Vérifier que les event listeners ont été retirés
        expect(mockBattery.removeEventListener).toHaveBeenCalledWith('chargingchange', expect.any(Function));
        expect(mockBattery.removeEventListener).toHaveBeenCalledWith('levelchange', expect.any(Function));
        expect(mockBattery.removeEventListener).toHaveBeenCalledWith('chargingtimechange', expect.any(Function));
        expect(mockBattery.removeEventListener).toHaveBeenCalledWith('dischargingtimechange', expect.any(Function));
    });

    it('convertit Infinity en null pour chargingTime et dischargingTime', async () => {
        Object.defineProperty(mockBattery, 'chargingTime', {
            writable: true,
            value: Infinity,
        });
        Object.defineProperty(mockBattery, 'dischargingTime', {
            writable: true,
            value: Infinity,
        });

        const { result } = renderHook(() => useBattery());

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        expect(result.current?.chargingTime).toBeNull();
        expect(result.current?.dischargingTime).toBeNull();
    });
});

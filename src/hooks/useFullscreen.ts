import { useState, useEffect, useCallback } from 'react';
import { DisplaySettings } from '@/types/electron';

/**
 * Hook to manage display settings and fullscreen state.
 * Supports both standard Web API and native Electron advanced modes.
 */
export function useFullscreen() {
  // Absolute detection: checks both the injected API and the UserAgent
  const checkIsElectron = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).electron ||
      navigator.userAgent.includes('Electron') ||
      (typeof (window as any).process !== 'undefined' && !!(window as any).process.versions.electron);
  }, []);

  const [isElectron, setIsElectron] = useState(checkIsElectron);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displaySettings, setDisplaySettingsState] = useState<DisplaySettings | null>(null);

  // Periodic re-check in case API is injected late
  useEffect(() => {
    if (!isElectron) {
      const timer = setInterval(() => {
        if (checkIsElectron()) {
          setIsElectron(true);
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isElectron, checkIsElectron]);

  const getElectron = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      return (window as any).electron;
    }
    return null;
  }, []);

  useEffect(() => {
    const electron = getElectron();
    if (electron) {
      // Sync initial state from Electron
      const syncInitial = async () => {
        try {
          const settings = await electron.getDisplaySettings();
          if (settings) {
            setDisplaySettingsState(settings);
            setIsFullscreen(settings.mode === 'fullscreen');
          }
        } catch (err) {
          console.error('Failed to sync display settings:', err);
        }
      };

      syncInitial();

      // Listen for Electron-specific display changes (including fullscreen events)
      const unsubscribe = electron.onDisplayChange((settings: DisplaySettings) => {
        if (settings) {
          setDisplaySettingsState(settings);
          setIsFullscreen(settings.mode === 'fullscreen');
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      // Standard DOM Fullscreen logic for browsers
      const checkFullscreen = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      checkFullscreen();
      document.addEventListener('fullscreenchange', checkFullscreen);
      return () => {
        document.removeEventListener('fullscreenchange', checkFullscreen);
      };
    }
  }, [getElectron, isElectron]);

  const setDisplaySettings = useCallback(async (settings: DisplaySettings) => {
    const electron = getElectron();
    if (electron) {
      await electron.setDisplaySettings(settings);
    }
  }, [getElectron]);

  const toggleFullscreen = useCallback(async () => {
    const electron = getElectron();
    if (electron) {
      const newMode = isFullscreen ? 'windowed' : 'fullscreen';
      await electron.setDisplaySettings({
        mode: newMode,
        width: displaySettings?.width || 1920,
        height: displaySettings?.height || 1080,
        frame: displaySettings?.frame ?? false,
      });
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          console.warn('Failed to enter fullscreen');
        });
      } else {
        document.exitFullscreen().catch(() => {
          console.warn('Failed to exit fullscreen');
        });
      }
    }
  }, [getElectron, isFullscreen, displaySettings]);

  return {
    isFullscreen,
    isElectron,
    displaySettings,
    setDisplaySettings,
    toggleFullscreen,
  };
}

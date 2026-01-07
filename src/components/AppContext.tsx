import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/memory';
import { SUPPORTED_LOCALES } from '../i18n/translations';

type ThemeMode = 'neutral' | 'shades' | 'contrast';

type AppLocale = string;

interface AppContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  blurEnabled: boolean;
  setBlurEnabled: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
  disableShadows: boolean;
  setDisableShadows: (enabled: boolean) => void;
  disableGradients: boolean;
  setDisableGradients: (enabled: boolean) => void;
  wallpaper: string;
  setWallpaper: (id: string) => void;
  devMode: boolean;
  setDevMode: (enabled: boolean) => void;
  exposeRoot: boolean;
  setExposeRoot: (enabled: boolean) => void;

  // Localization
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;

  // Lock user session without logging out
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;

  // User Context Switching
  switchUser: (username: string) => void;
  activeUser: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Legacy Global Key for Migration
const LEGACY_STORAGE_KEY = 'aurora-os-settings';

const SYSTEM_CONFIG_KEY = 'aurora-system-config';

interface UserPreferences {
  accentColor: string;
  themeMode: ThemeMode;
  blurEnabled: boolean;
  reduceMotion: boolean;
  disableShadows: boolean;
  disableGradients: boolean;
  wallpaper: string;
}

interface SystemConfig {
  devMode: boolean;
  exposeRoot: boolean;
  locale: AppLocale;
  onboardingComplete: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  accentColor: '#5755e4',
  themeMode: 'neutral',
  blurEnabled: true,
  reduceMotion: false,
  disableShadows: false,
  disableGradients: false,
  wallpaper: 'default',
};

function getBestSupportedLocale(candidate: string | undefined): AppLocale {
  if (!candidate) return 'en-US';

  // 1. Try exact match (e.g. 'en-US', 'pt-BR')
  if (SUPPORTED_LOCALES.some(l => l.locale === candidate)) {
    return candidate;
  }

  // 2. Try base language match (e.g. 'en-GB' -> 'en-US', 'pt-PT' -> 'pt-BR')
  const base = candidate.split('-')[0].toLowerCase();
  const matched = SUPPORTED_LOCALES.find(l => l.locale.split('-')[0].toLowerCase() === base);
  if (matched) {
    return matched.locale;
  }

  // 3. Absolute fallback
  return 'en-US';
}

function detectDefaultLocale(): AppLocale {
  try {
    // Check for saved language (e.g. from Onboarding recovery)
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (saved) return getBestSupportedLocale(saved);

    const navLang = typeof navigator !== 'undefined' ? navigator.language : undefined;
    return getBestSupportedLocale(navLang);
  } catch {
    return 'en-US';
  }
}

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  devMode: false,
  exposeRoot: false,
  locale: detectDefaultLocale(),
  onboardingComplete: false,
};

// Helper: Get key for specific user
const getUserKey = (username: string) => `aurora-os-settings-${username}`;

function loadUserPreferences(username: string): UserPreferences {
  try {
    const key = getUserKey(username);
    const stored = localStorage.getItem(key);

    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }

    // Migration Check: If loading for 'root' (system default) and no root settings exist,
    // check for legacy global settings to migrate them.
    if (username === 'root') {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        console.log('Migrating legacy settings to root');
        const legacyParsed = JSON.parse(legacy);

        // Extract preferences
        const migratedProps: Partial<UserPreferences> = {};
        (Object.keys(DEFAULT_PREFERENCES) as Array<keyof UserPreferences>).forEach(k => {
          if (k in legacyParsed) migratedProps[k] = legacyParsed[k];
        });

        const migrated = { ...DEFAULT_PREFERENCES, ...migratedProps };
        // Save immediately to new key
        localStorage.setItem(key, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (e) {
    console.warn(`Failed to load settings for ${username}:`, e);
  }
  return DEFAULT_PREFERENCES;
}

function loadSystemConfig(): SystemConfig {
  try {
    const stored = localStorage.getItem(SYSTEM_CONFIG_KEY);
    if (stored) {
      return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(stored) };
    }

    // Migration: Check legacy global storage for devMode stuff if not found in new key
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const legacyParsed = JSON.parse(legacy);

      // Only migrate if they actually exist in legacy
      const migrated: SystemConfig = { ...DEFAULT_SYSTEM_CONFIG };
      let hasMigration = false;

      if ('devMode' in legacyParsed) { migrated.devMode = legacyParsed.devMode; hasMigration = true; }
      if ('exposeRoot' in legacyParsed) { migrated.exposeRoot = legacyParsed.exposeRoot; hasMigration = true; }

      if (hasMigration) {
        console.log('Migrated system config from legacy storage');
        localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

  } catch (e) {
    console.warn('Failed to load system config:', e);
  }
  return DEFAULT_SYSTEM_CONFIG;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // activeUser determines which "slot" we are reading/writing to.
  const [activeUser, setActiveUser] = useState('root');
  // Lock state
  const [isLocked, setIsLocked] = useState(false);

  // User Preferences (Per User)
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences('root'));

  // System Config (Global)
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => loadSystemConfig());

  // Destructure for easy access
  const { accentColor, themeMode, blurEnabled, reduceMotion, disableShadows, disableGradients, wallpaper } = preferences;
  const { devMode, exposeRoot, locale, onboardingComplete } = systemConfig;

  // Function to switch context to a different user
  const switchUser = useCallback((username: string) => {
    setActiveUser(prev => {
      if (prev === username) return prev;
      const newPrefs = loadUserPreferences(username);
      setPreferences(newPrefs);
      return username;
    });
  }, []);

  // Persistence: User Preferences
  useEffect(() => {
    const key = getUserKey(activeUser);
    try {
      localStorage.setItem(key, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences:', e);
    }
  }, [preferences, activeUser]);

  // Persistence: System Config
  useEffect(() => {
    try {
      localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(systemConfig));
    } catch (e) {
      console.warn('Failed to save system config:', e);
    }
  }, [systemConfig]);

  // Setters for Preferences
  const setAccentColor = (color: string) => setPreferences(s => ({ ...s, accentColor: color }));
  const setThemeMode = (mode: ThemeMode) => setPreferences(s => ({ ...s, themeMode: mode }));
  const setBlurEnabled = (enabled: boolean) => setPreferences(s => ({ ...s, blurEnabled: enabled }));
  const setReduceMotion = (enabled: boolean) => setPreferences(s => ({ ...s, reduceMotion: enabled }));
  const setDisableShadows = (enabled: boolean) => setPreferences(s => ({ ...s, disableShadows: enabled }));
  const setDisableGradients = (enabled: boolean) => setPreferences(s => ({ ...s, disableGradients: enabled }));
  const setWallpaper = (id: string) => setPreferences(s => ({ ...s, wallpaper: id }));

  // Setters for System Config
  const setDevMode = (enabled: boolean) => setSystemConfig(s => ({ ...s, devMode: enabled }));
  const setExposeRoot = (enabled: boolean) => setSystemConfig(s => ({ ...s, exposeRoot: enabled }));
  const setLocale = useCallback((newLocale: AppLocale) => setSystemConfig(s => ({ ...s, locale: newLocale })), []);
  const setOnboardingComplete = (complete: boolean) => setSystemConfig(s => ({ ...s, onboardingComplete: complete }));

  // Sync locale from Electron if available and not explicitly stored
  useEffect(() => {
    const syncElectronLocale = async () => {
      if (window.electron?.getLocale) {
        try {
          const storedLocale = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
          if (!storedLocale) {
            const systemLocale = await window.electron.getLocale();
            if (systemLocale) {
              const bestLocale = getBestSupportedLocale(systemLocale);
              if (bestLocale !== locale) {
                setLocale(bestLocale);
              }
            }
          }
        } catch (e) {
          console.warn('Failed to sync locale from Electron:', e);
        }
      }
    };
    syncElectronLocale();
  }, [locale, setLocale]);

  // Sync accent color to CSS variable for global theming
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-user', accentColor);
  }, [accentColor]);

  // Sync blur state to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--blur-enabled', blurEnabled ? '1' : '0');
  }, [blurEnabled]);

  // Sync performance settings
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
  }, [reduceMotion]);

  useEffect(() => {
    document.documentElement.dataset.disableShadows = disableShadows ? 'true' : 'false';
  }, [disableShadows]);

  useEffect(() => {
    document.documentElement.dataset.disableGradients = disableGradients ? 'true' : 'false';
  }, [disableGradients]);

  // Sync dev mode for global styling/logic
  useEffect(() => {
    document.documentElement.dataset.devMode = devMode ? 'true' : 'false';
    if (devMode) {
      document.documentElement.style.setProperty('--dev-mode-enabled', '1');
    } else {
      document.documentElement.style.removeProperty('--dev-mode-enabled');
    }
  }, [devMode]);

  return (
    <AppContext.Provider value={{
      accentColor,
      setAccentColor,
      themeMode,
      setThemeMode,
      blurEnabled,
      setBlurEnabled,
      reduceMotion,
      setReduceMotion,
      disableShadows,
      setDisableShadows,
      disableGradients,
      setDisableGradients,
      wallpaper,
      setWallpaper,
      devMode,
      setDevMode,
      exposeRoot,
      setExposeRoot,
      locale,
      setLocale,
      onboardingComplete,
      setOnboardingComplete,
      switchUser,
      activeUser,
      isLocked,
      setIsLocked,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}


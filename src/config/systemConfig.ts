import nebulaWallpaper from '@/assets/images/wallpaper-nebula.avif';
import cityWallpaper from '@/assets/images/wallpaper-city.avif';
import auroraWallpaper from '@/assets/images/wallpaper-aurora.avif';
import lakeWallpaper from '@/assets/images/wallpaper-lake.avif';

export const DEFAULT_SYSTEM_MEMORY_GB = 2;

export const BRAND = {
  // Default accent color
  accentColor: '#5755e4',

  // User-selectable accent colors
  accentPalette: [
    { name: 'Rose', value: '#e11d48' },     // Rose-600 (Vibrant Red)
    { name: 'MOONHOUND Orange', value: '#fe5000' }, // MOONHOUND Studio Orange
    { name: 'Amber', value: '#f59e0b' },    // Amber-500 (Warm Gold)
    { name: 'Emerald', value: '#10b981' },  // Emerald-500 (Crisp Green)
    { name: 'Blue', value: '#3b82f6' },     // Blue-500 (Classic Tech Blue)
    { name: 'Indigo', value: '#5755e4' },   // Indigo-500 (Deep Modern Blue)
    { name: 'Violet', value: '#8b5cf6' },   // Violet-500 (Bright Purple)
    { name: 'mental.os() Fuchsia', value: '#d453f6' }, // mental.os() Fuchsia
  ],

  // Desktop wallpapers
  wallpapers: [
    { id: 'default', name: 'Nebula', src: nebulaWallpaper },
    { id: 'city', name: 'City', src: cityWallpaper },
    { id: 'aurora', name: 'Aurora', src: auroraWallpaper },
    { id: 'lake', name: 'Lake', src: lakeWallpaper },
  ],
} as const;

// Type exports for consumers
export type AccentColor = (typeof BRAND.accentPalette)[number];
export type Wallpaper = (typeof BRAND.wallpapers)[number];

// Keys in SystemConfig that should survive a "New Game" reset (BIOS settings)
export const PERSISTENT_CONFIG_KEYS = [
  'locale',
  'gpuEnabled',
  'blurEnabled',
  'reduceMotion',
  'disableShadows',
  'disableGradients'
] as const;

import nebulaWallpaper from '@/assets/images/background.png';
import orbitWallpaper from '@/assets/images/wallpaper-orbit.png';
import meshWallpaper from '@/assets/images/wallpaper-mesh.png';
import dunesWallpaper from '@/assets/images/wallpaper-dunes.png';

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
    { id: 'orbit', name: 'Orbit', src: orbitWallpaper },
    { id: 'mesh', name: 'Flux', src: meshWallpaper },
    { id: 'dunes', name: 'Midnight Dunes', src: dunesWallpaper },
  ],
} as const;

// Type exports for consumers
export type AccentColor = (typeof BRAND.accentPalette)[number];
export type Wallpaper = (typeof BRAND.wallpapers)[number];

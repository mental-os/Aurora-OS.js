# feat: Centralize Brand Configuration

## Overview

Create a single source of truth for brand identity (app name, colors, wallpapers, logo) by extracting hardcoded values into one config file. This makes it easy to update branding without hunting through multiple files.

## Problem Statement

**Current state:**
- Preset colors hardcoded in `Settings.tsx:49-58`
- Wallpapers hardcoded in `Settings.tsx:30-35`
- Default accent color in `AppContext.tsx:72`
- App name scattered across multiple places
- No centralized logo or favicon configuration

**Why this matters:**
- Changing branding requires editing 3+ files
- Easy to miss a value and have inconsistent branding
- No clear "brand" concept in the codebase

## Proposed Solution

A single config file with all brand values, imported where needed.

**No React Context. No providers. No build-time switching. Just a constants file.**

## Technical Approach

### Step 1: Create Brand Config

**Create** `src/config/brand.ts`

```typescript
// Brand asset imports
import nebulaWallpaper from '@/assets/images/background.png';
import orbitWallpaper from '@/assets/images/wallpaper-orbit.png';
import meshWallpaper from '@/assets/images/wallpaper-mesh.png';
import dunesWallpaper from '@/assets/images/wallpaper-dunes.png';

export const BRAND = {
  name: 'Aurora OS',

  // Default accent color
  accentColor: '#5755e4',

  // User-selectable accent colors
  accentPalette: [
    { name: 'Crimson', value: '#e11d48' },
    { name: 'Carbon', value: '#fe5000' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Azure', value: '#3b82f6' },
    { name: 'Indigo', value: '#5755e4' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Fuchsia', value: '#d946ef' },
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
export type AccentColor = typeof BRAND.accentPalette[number];
export type Wallpaper = typeof BRAND.wallpapers[number];
```

### Step 2: Update Settings.tsx

**Modify** `src/components/Settings.tsx`

```diff
+ import { BRAND } from '@/config/brand';

- const presetColors = [
-   { name: 'Crimson', value: '#e11d48' },
-   { name: 'Carbon', value: '#fe5000' },
-   // ... etc
- ];
+ const presetColors = BRAND.accentPalette;

- const WALLPAPERS = [
-   { id: 'default', name: 'Nebula', src: defaultWallpaper },
-   // ... etc
- ];
+ const WALLPAPERS = BRAND.wallpapers;
```

Remove the wallpaper imports from Settings.tsx since they're now in brand.ts.

### Step 3: Update AppContext.tsx

**Modify** `src/components/AppContext.tsx:72`

```diff
+ import { BRAND } from '@/config/brand';

  const [settings, setSettings] = useState<Settings>(() => {
    // ...
    return {
      // ...
-     accentColor: '#5755e4',
+     accentColor: BRAND.accentColor,
      // ...
    };
  });
```

### Step 4: Update Page Title (Optional)

**Modify** `src/App.tsx` or wherever the document title is set:

```diff
+ import { BRAND } from '@/config/brand';

- document.title = 'Aurora OS';
+ document.title = BRAND.name;
```

## Acceptance Criteria

- [ ] All brand values come from `src/config/brand.ts`
- [ ] `Settings.tsx` imports colors and wallpapers from brand config
- [ ] `AppContext.tsx` imports default accent color from brand config
- [ ] Changing a value in `brand.ts` reflects everywhere in the app
- [ ] No duplicate hardcoded values remain

## Files Changed

| File | Change |
|------|--------|
| `src/config/brand.ts` | **Create** - new brand config file |
| `src/components/Settings.tsx` | **Modify** - import from brand config |
| `src/components/AppContext.tsx` | **Modify** - import default accent |

## Future Considerations

If you ever need multi-brand support (white-labeling), you can:
1. Create multiple brand files (`brand-aurora.ts`, `brand-acme.ts`)
2. Add a Vite alias to select which one to use
3. Add a BrandProvider context if runtime switching is needed

**Build these when you have an actual second brand, not before.**

## References

- Current preset colors: `src/components/Settings.tsx:49-58`
- Current wallpapers: `src/components/Settings.tsx:30-35`
- Current default accent: `src/components/AppContext.tsx:72`

---

*Generated with Claude Code*

import { useAppContext } from '@/components/AppContext';
import { getComplementaryColor, mixColors } from '@/utils/colors';

/**
 * Custom hook to get theme-aware colors based on accent color and theme mode
 */
export function useThemeColors() {
    const { accentColor, themeMode, blurEnabled } = useAppContext();

    // True neutral dark gray (replacing blue-tinted slate-900)
    const NEUTRAL_BASE = '#171717'; // Neutral-900 equivalent

    /**
     * Get the base tint color for the current mode
     */
    const getBaseTintColor = (): string => {
        switch (themeMode) {
            case 'shades':
                return mixColors(NEUTRAL_BASE, accentColor, 0.15); // Subtle 15% tint
            case 'contrast': {
                const complement = getComplementaryColor(accentColor);
                return mixColors(NEUTRAL_BASE, complement, 0.15); // Subtle 15% tint
            }
            case 'neutral':
            default:
                return NEUTRAL_BASE;
        }
    };

    /**
     * Helper to apply opacity to a hex color
     * If blur is disabled, forces 100% opacity (no transparency)
     */
    const withOpacity = (hex: string, opacity: number): string => {
        // If blur is disabled, use 100% opacity (FF)
        if (!blurEnabled) {
            return `${hex}FF`;
        }
        const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${hex}${alpha}`;
    };

    const baseColor = getBaseTintColor();

    // Visual Hierarchy: Title (Darkest) > Sidebar (Medium) > Content (Lightest)
    return {
        accentColor,
        themeMode,
        blurEnabled,
        // General background with opacity
        getBackgroundColor: (opacity: number = 0.7) => withOpacity(baseColor, opacity),

        // Component specific colors - Hierarchy enforced
        windowBackground: withOpacity(baseColor, 0.7),      // Content: Lightest
        sidebarBackground: withOpacity(baseColor, 0.85),    // Sidebar: Medium
        titleBarBackground: withOpacity(baseColor, 0.95),   // Title Bar: Darkest
        dockBackground: withOpacity(baseColor, 0.5),        // Dock: Translucent
        menuBarBackground: withOpacity(baseColor, 0.95),    // Menu Bar: Almost Opaque
        notificationBackground: withOpacity(baseColor, 0.85), // Notifications: Medium

        // Blur style helper - disables backdrop-filter if blur is disabled
        blurStyle: blurEnabled ? { backdropFilter: 'blur(12px)' } : { backdropFilter: 'none' },
    };
}

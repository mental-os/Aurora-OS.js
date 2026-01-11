import { useId } from 'react';
import {
    FileText,
    Music,
    Image,
    Film,
    Trash,
    Trash2,
    Settings
} from 'lucide-react';
import { lightenColor } from '../../utils/colors';
import { useAppContext } from '../AppContext';

interface FileIconProps {
    name: string;
    type: 'directory' | 'file' | 'folder';
    accentColor?: string;
    className?: string; // For sizing, e.g. "w-8 h-8"
    isEmpty?: boolean;
}

export function FileIcon({ name, type, accentColor = '#3b82f6', className = "w-full h-full", isEmpty }: FileIconProps) {
    const { disableGradients } = useAppContext();
    const isDirectory = type === 'directory' || type === 'folder';

    // Standardized padding style to scale icons to 70% (100% - 15%*2)
    // Matches folder graphic size (56/80 approx 70%)
    // Using style for percentage padding to ensure it works across all container sizes
    const iconStyle = { padding: '15%', boxSizing: 'border-box' as const };

    // Generate unique ID for gradient
    // We utilize a deterministic ID based on name where possible to avoid hydration mismatch if this were SSR
    // But for client side purely, this is fine.
    // Fixed lint error (math.random) by using useId
    const uniqueId = useId();

    // Gradient Logic
    const lightAccent = lightenColor(accentColor, 20);
    const folderGradientId = `folder-gradient-${uniqueId}`;
    const strokeGradientId = `stroke-gradient-${uniqueId}`;

    if (isDirectory) {
        // Special folder icons (Trash, Config) now use Gradients on Stroke
        if (name === '.Trash' || name === 'Config') {
            const isTrash = name === '.Trash';
            const IconComp = isTrash ? (isEmpty ? Trash : Trash2) : Settings;

            if (disableGradients) {
                return <IconComp className={className} strokeWidth={1.5} style={{ ...iconStyle, color: accentColor }} />;
            }
            return (
                <>
                    <svg width="0" height="0" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
                        <defs>
                            <linearGradient id={strokeGradientId} x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor={lightAccent} />
                                <stop offset="100%" stopColor={accentColor} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <IconComp className={className} strokeWidth={1.5} style={{ ...iconStyle, stroke: `url(#${strokeGradientId})` }} />
                </>
            );
        }

        // Default Folder Icon (SVG Gradient Fill)
        return (
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                <path
                    d="M12 18C12 15.7909 13.7909 14 16 14H32L37 21H64C66.2091 21 68 22.7909 68 25V62C68 64.2091 66.2091 66 64 66H16C13.7909 66 12 64.2091 12 62V18Z"
                    fill={disableGradients ? accentColor : `url(#${folderGradientId})`}
                />
                {!disableGradients && (
                    <defs>
                        <linearGradient id={folderGradientId} x1="40" y1="14" x2="40" y2="66" gradientUnits="userSpaceOnUse">
                            <stop stopColor={lightAccent} />
                            <stop offset="1" stopColor={accentColor} />
                        </linearGradient>
                    </defs>
                )}
            </svg>
        );
    }

    // Generic Icon Gradient Definition (reused for files)
    const renderIconWithGradient = (IconComponent: any, colorClass?: string) => {
        if (disableGradients) {
            return <IconComponent
                className={`${className} ${colorClass || ''}`}
                strokeWidth={1.5}
                style={{ ...iconStyle, color: colorClass ? undefined : accentColor }}
            />;
        }

        return (
            <>
                <svg width="0" height="0" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
                    <defs>
                        <linearGradient id={strokeGradientId} x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor={lightAccent} />
                            <stop offset="100%" stopColor={accentColor} />
                        </linearGradient>
                    </defs>
                </svg>
                <IconComponent
                    className={`${className} ${colorClass || ''}`}
                    strokeWidth={1.5}
                    style={{ ...iconStyle, stroke: colorClass ? undefined : `url(#${strokeGradientId})` }}
                />
            </>
        );
    };

    // File type icons based on extension
    const lowerName = name.toLowerCase();

    if (/\.(mp3|wav|flac|ogg|m4a)$/i.test(lowerName)) {
        return renderIconWithGradient(Music);
    }
    if (lowerName.endsWith('.jpg') || lowerName.endsWith('.png') || lowerName.endsWith('.gif') || lowerName.endsWith('.webp')) {
        return renderIconWithGradient(Image);
    }
    if (lowerName.endsWith('.mp4') || lowerName.endsWith('.mov') || lowerName.endsWith('.avi')) {
        return renderIconWithGradient(Film, 'text-purple-400');
    }

    // Default generic/text file icon -> Accent Gradient
    return renderIconWithGradient(FileText);
}

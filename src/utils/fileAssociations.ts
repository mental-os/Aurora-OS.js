// Map file extensions to their associated app IDs
export const getAppForExtension = (filename: string): string | null => {
    const ext = filename.split('.').pop()?.toLowerCase();

    if (!ext) return null;

    // Audio files -> Music
    if (['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(ext)) {
        return 'music';
    }

    // Text/code files -> Notepad
    if (['txt', 'md', 'json', 'js', 'ts', 'tsx', 'css', 'html', 'htm'].includes(ext)) {
        return 'notepad';
    }

    // Image files -> Photos
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        return 'photos';
    }

    return null;
};

/**
 * Minimal ID3 v2.3 / v2.4 parser for yAMI OS.
 * Specifically handles TIT2 (Title), TPE1 (Artist), and TALB (Album).
 */

export interface ID3Tags {
    title?: string;
    artist?: string;
    album?: string;
}

export function parseID3(buffer: ArrayBuffer | Uint8Array): ID3Tags {
    const view = new Uint8Array(buffer);
    
    // Check for "ID3" signature
    if (view[0] !== 0x49 || view[1] !== 0x44 || view[2] !== 0x33) {
        return {};
    }

    const version = view[3];
    if (version !== 3 && version !== 4) {
        // We only support v2.3 and v2.4 reliably
        return {};
    }

    // Size is synchsafe (4 bytes, 7 bits per byte)
    const totalSize = 
        ((view[6] & 0x7F) << 21) |
        ((view[7] & 0x7F) << 14) |
        ((view[8] & 0x7F) << 7) |
        (view[9] & 0x7F);

    const tags: ID3Tags = {};
    let offset = 10; // Header is 10 bytes

    const decodeText = (data: Uint8Array): string => {
        if (data.length === 0) return '';
        const encoding = data[0];
        const bytes = data.slice(1);

        let text = '';
        if (encoding === 0) {
            // ISO-8859-1 (Latin-1)
            text = new TextDecoder('iso-8859-1').decode(bytes);
        } else if (encoding === 1) {
            // UTF-16 with BOM
            text = new TextDecoder('utf-16').decode(bytes);
        } else if (encoding === 2) {
            // UTF-16BE without BOM
            text = new TextDecoder('utf-16be').decode(bytes);
        } else if (encoding === 3) {
            // UTF-8
            text = new TextDecoder('utf-8').decode(bytes);
        }
        
        return text.split('\0')[0].trim();
    };

    while (offset < totalSize + 10 && offset < view.length - 10) {
        // Read Frame ID
        const frameId = String.fromCharCode(view[offset], view[offset+1], view[offset+2], view[offset+3]);
        
        // Size interpretation depends on version (v2.4 size is synchsafe)
        let frameSize;
        if (version === 4) {
            frameSize = 
                ((view[offset+4] & 0x7F) << 21) |
                ((view[offset+5] & 0x7F) << 14) |
                ((view[offset+6] & 0x7F) << 7) |
                (view[offset+7] & 0x7F);
        } else {
            frameSize = 
                (view[offset+4] << 24) |
                (view[offset+5] << 16) |
                (view[offset+6] << 8) |
                view[offset+7];
        }

        if (frameSize <= 0 || offset + 10 + frameSize > view.length) break;

        const frameData = view.slice(offset + 10, offset + 10 + frameSize);

        switch (frameId) {
            case 'TIT2':
                tags.title = decodeText(frameData);
                break;
            case 'TPE1':
                tags.artist = decodeText(frameData);
                break;
            case 'TALB':
                tags.album = decodeText(frameData);
                break;
        }

        offset += 10 + frameSize;

        // Stop if we found all major tags
        if (tags.title && tags.artist && tags.album) break;
        
        // Check for padding (null bytes)
        if (view[offset] === 0) break;
    }

    return tags;
}

/**
 * Helper to convert Base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    // Strip metadata prefix if present (e.g., "data:audio/mp3;base64,")
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

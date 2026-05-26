/**
 * RemoteFileSystemProvider
 *
 * Wraps a window's component tree with an NPC's FileSystem context.
 * This is the "zero changes to apps" trick:
 *
 * Every app (Notepad, Finder, AppStore, Mail, Messages) calls `useFileSystem()`.
 * When an app is launched from a connected terminal, its window is wrapped in
 * this provider — transparently re-providing the NPC's filesystem API.
 * The app component itself has no knowledge of where the filesystem lives.
 *
 * Usage in OS.tsx getAppContent:
 *   if (remoteComputerId) {
 *     return <RemoteFileSystemProvider computerId={remoteComputerId}>
 *       <AppComponent />
 *     </RemoteFileSystemProvider>
 *   }
 */

import { type ReactNode, useMemo } from 'react';
import { FileSystemContext, type FileSystemContextType } from '@/components/FileSystemContext';
import { useWorldContext } from '@/components/WorldContext';

interface RemoteFileSystemProviderProps {
    /** The NPC's currentIP — used to resolve the NPC filesystem API. If null, acts as passthrough. */
    ip: string | null;
    children: ReactNode;
}

export function RemoteFileSystemProvider({ ip, children }: RemoteFileSystemProviderProps) {
    const world = useWorldContext();

    const npcApi = useMemo(() => {
        if (!ip) return null;
        return world.getNpcApi(ip);
    }, [ip, world]);

    if (!npcApi) {
        return <>{children}</>;
    }

    return (
        <FileSystemContext.Provider value={npcApi as unknown as FileSystemContextType}>
            {children}
        </FileSystemContext.Provider>
    );
}

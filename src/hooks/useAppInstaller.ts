import { useState, useRef, useEffect, useCallback } from 'react';
import { useFileSystem } from '@/components/FileSystemContext';
import { notify } from '@/services/notifications';
import { useI18n } from '@/i18n';

interface UseAppInstallerProps {
    owner?: string;
}

export function useAppInstaller({ owner }: UseAppInstallerProps) {
    const { t } = useI18n();
    const { installApp, uninstallApp, installedApps, users, getNodeAtPath, createFile } = useFileSystem();
    const [installingApps, setInstallingApps] = useState<Record<string, number>>({});

    // We use a ref to track active timeouts so we can clear them on unmount
    const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
    // We also need to track current progress in a ref to avoid stale closures in the recursive timeout
    const progressRef = useRef<Record<string, number>>({});

    // Cleanup timeouts on unmount
    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            Object.values(timeouts).forEach(clearTimeout);
        };
    }, []);

    const handleInstall = useCallback((appId: string, appSize: number = 50) => {
        // 1. Permission Check
        // Apps are installed to /usr/bin. Check if the effective user can write there.
        // We resolve the user object first.
        const effectiveUser = owner || 'guest'; // Default to guest if undefined? Or maybe active context
        // Ideally owner should always be defined if we are in a window context
        // If owner is undefined, we might be system level? 
        // Let's assume passed owner is the effective user.
        
        // However, installApp in FileSystemContext ALREADY handles the actual permission check
        // for the final write. But we want to fail EARLY before the animation starts.
        
        // Check /usr/bin permissions
        const usrBin = getNodeAtPath('/usr/bin');
        if (usrBin) {
            const userObj = users.find(u => u.username === effectiveUser);
            if (userObj) {
                // BUT: installApp requires admin/root privileges specifically in its implementation,
                // overriding standard file permissions somewhat (it explicitly checks for admin group).
                // So let's replicate that check here for UI consistency.
                const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';
                
                if (!isAdmin) {
                    // We don't trigger notification here, we let the installApp call fail? 
                    // Or we let the UI handle it?
                    // Better to rely on installApp's check.
                    // If we want to fail fast for UI:
                     // notify.system('error', 'Permission Denied', 'Admin privileges required');
                     // return;
                     // ACTUALLY: Let's let the animation run and fail at the end? 
                     // NO, that's bad UX. "Fake download" then "Error".
                     
                     // Let's replicate the admin check.
                     if (!isAdmin) {
                         // We can't use notify here easily without importing it, but hook shouldn't be too coupled.
                         // Let's just try to install immediately to trigger the permission error from FS context
                         installApp(appId, owner);
                         return;
                     }
                }
            }
        }

        // If already installing, ignore
        if (installingApps[appId] !== undefined) return;

        // Initialize state
        setInstallingApps(prev => ({ ...prev, [appId]: 0 }));
        progressRef.current[appId] = 0;

        // Base speed factor: Larger apps = slower
        const speedFactor = Math.max(1, Math.min(10, appSize / 20));

        const loop = () => {
            const currentProgress = progressRef.current[appId];

            if (currentProgress >= 100) {
                // Final pause before actual install
                timeoutsRef.current[appId] = setTimeout(() => {
                    installApp(appId, owner);

                    // Cleanup
                    delete timeoutsRef.current[appId];
                    delete progressRef.current[appId];

                    setInstallingApps(prev => {
                        const next = { ...prev };
                        delete next[appId];
                        return next;
                    });
                }, 500);
                return;
            }

            // Variable increment: 1% to 4%
            const increment = Math.random() * 3 + 1;
            const newProgress = Math.min(100, currentProgress + increment);

            progressRef.current[appId] = newProgress;
            setInstallingApps(prev => ({ ...prev, [appId]: Math.floor(newProgress) }));

            // Variable delay logic
            const jitter = Math.random() + 0.5;
            let delay = 30 * speedFactor * jitter;

            // "Stall" simulation
            if (newProgress > 85 && newProgress < 95 && Math.random() > 0.8) {
                delay += 800;
            }

            timeoutsRef.current[appId] = setTimeout(loop, delay);
        };

        // Start
        timeoutsRef.current[appId] = setTimeout(loop, 100);
    }, [installingApps, owner, users, getNodeAtPath, installApp]);

    const handleUninstall = useCallback((appId: string) => {
        // Permission Check for Uninstall
        // Uninstalling apps from /usr/bin requires admin/root privileges
        const effectiveUser = owner || 'guest';
        
        // Replicate the admin check from installApp/FileContext
        // We need to check if the user is in the admin group or is root
        const userObj = users.find(u => u.username === effectiveUser);
        if (userObj) {
            const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';
            if (!isAdmin) {
                // Since this is a direct action (no long animation), we can fail fast
                // However, following the pattern of delegating to the FS, we call uninstallApp
                // which handles the check properly (and throws/returns false).
                // But for consistency with "checking for the same permissions", 
                // we'll rely on uninstallApp's internal check which mimics installApp's logic.
                // If we want to be explicit here (as requested "check for the same permissions"):
                 uninstallApp(appId, owner);
                 return;
            }
        }
        
        uninstallApp(appId, owner);
    }, [uninstallApp, owner, users]);

    const isAppBroken = useCallback((appId: string) => {
        // App is "broken" if it is in the installed registry but the binary in /usr/bin is missing
        if (!installedApps.has(appId)) return false;
        
        // Check for file existence
        // Note: getNodeAtPath is synchronous(ish) in this context (in-memory)
        const binaryPath = `/usr/bin/${appId}`;
        const binaryNode = getNodeAtPath(binaryPath);
        
        return !binaryNode;
    }, [installedApps, getNodeAtPath]);

    const handleRestore = useCallback((appId: string) => {
         // Permission Check (Same as Install)
        const effectiveUser = owner || 'guest';
        const userObj = users.find(u => u.username === effectiveUser);
         if (userObj) {
            const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';
            if (!isAdmin) {
                // Fail immediately if no permission
                 notify.system('error', t('notifications.titles.permissionDenied'), t('appStore.restorePermissionDenied'));
                 return;
            }
        }

        // Direct restoration (no animation)
        // We call createFile directly to bypass "Already Installed" check in installApp
        const binaryContent = `#!app ${appId}`;
        const success = createFile('/usr/bin', appId, binaryContent, 'root', '-rwxr-xr-x');
        
        if (success) {
            notify.system('success', 'App Store', t('appStore.restoreSuccess', { app: appId }));
        } else {
             notify.system('error', 'App Store', t('appStore.restoreError', { app: appId }));
        }
    }, [owner, users, createFile, t]);

    return {
        installingApps,
        handleInstall,
        handleUninstall,
        installedApps, // Re-export for convenience
        isAppInstalled: (id: string) => installedApps.has(id),
        isAppBroken,
        handleRestore
    };
}


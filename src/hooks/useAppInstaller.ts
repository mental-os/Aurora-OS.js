import { useState, useRef, useEffect, useCallback } from 'react';
import { useFileSystem } from '@/components/FileSystemContext';
import { notify } from '@/services/notifications';
import { useI18n } from '@/i18n';
import { useNetworkContext } from '@/components/NetworkContext';
import { incrementSessionDataUsage } from '@/utils/memory';

interface UseAppInstallerProps {
    owner?: string;
}

export function useAppInstaller({ owner }: UseAppInstallerProps) {
    const { t } = useI18n();
    const { installApp, uninstallApp, installedApps, users, getNodeAtPath, createFile } = useFileSystem();
    const { wifiEnabled, currentNetwork, availableNetworks } = useNetworkContext();
    const [installingApps, setInstallingApps] = useState<Record<string, number>>({});

    // We use a ref to track active timeouts so we can clear them on unmount
    const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
    // We also need to track current progress in a ref to avoid stale closures in the recursive timeout
    const progressRef = useRef<Record<string, number>>({});
    // Track downloaded bytes (in MB)
    const downloadedRef = useRef<Record<string, number>>({});

    // Cleanup timeouts on unmount
    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            Object.values(timeouts).forEach(clearTimeout);
        };
    }, []);

    // Track network state in ref for the loop closure
    const networkRef = useRef({ currentNetwork, availableNetworks });
    useEffect(() => {
        networkRef.current = { currentNetwork, availableNetworks };
    }, [currentNetwork, availableNetworks]);

    const handleInstall = useCallback((appId: string, appSize: number = 50) => {
        // 0. Network Check
        // Use ref for initial check too to be consistent, or just state. State is fine here.
        const activeConnection = availableNetworks.find(n => n.ssid === currentNetwork);

        if (!wifiEnabled || !currentNetwork || !activeConnection) {
            notify.system('error', 'App Store', 'No Internet Connection - Please connect to a network to install apps.');
            return;
        }

        // 1. Permission Check
        // Check /usr/bin permissions for effective user
        const usrBin = getNodeAtPath('/usr/bin');
        if (usrBin) {
            const effectiveUser = owner || 'guest';
            const userObj = users.find(u => u.username === effectiveUser);
            if (userObj) {
                const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';

                // Replicate admin check logic from installApp for UI consistency
                if (!isAdmin) {
                    // Fail via standard installApp call (which handles error notification/result)
                    installApp(appId, owner);
                    return;
                }
            }
        }

        // If already installing, ignore
        if (installingApps[appId] !== undefined) return;

        // Initialize state
        setInstallingApps(prev => ({ ...prev, [appId]: 0 }));
        progressRef.current[appId] = 0;
        downloadedRef.current[appId] = 0;

        const loop = () => {
            const currentProgress = progressRef.current[appId];
            let newProgress = currentProgress;
            let delay = 100; // Base tick default

            if (currentProgress < 50) {
                // PHASE 1: DOWNLOAD
                // Get fresh speed from ref to support network switching mid-download
                const { currentNetwork: netName, availableNetworks: nets } = networkRef.current;
                const active = nets.find(n => n.ssid === netName);

                // If network lost mid-download, maybe pause or fail? For now, fallback to 0.1 or keep last speed.
                // If we lose connection, let's stall.
                const speedMbps = active ? active.speed : 0;

                // Speed in MB/s = Mbps / 8
                const speedMBps = speedMbps / 8;

                // Duration of this tick: ~100ms = 0.1s
                const downloadedMB = speedMBps * 0.1;

                downloadedRef.current[appId] += downloadedMB;

                // Track usage
                incrementSessionDataUsage(downloadedMB);

                // Calculate percentage of APP SIZE (mapped to 0-50% range)
                // Fraction: downloaded / total
                const fraction = downloadedRef.current[appId] / appSize;
                const percent = fraction * 50;

                // If we downloaded enough, clamp to 50
                newProgress = Math.min(50, percent);

                // If we reached 50 (download complete), we will switch to Phase 2 next tick.
            } else {
                // PHASE 2: INSTALLATION (50-100%)
                if (currentProgress >= 100) {
                    // Finalize
                    timeoutsRef.current[appId] = setTimeout(() => {
                        installApp(appId, owner);

                        // Cleanup
                        delete timeoutsRef.current[appId];
                        delete progressRef.current[appId];
                        delete downloadedRef.current[appId];

                        setInstallingApps(prev => {
                            const next = { ...prev };
                            delete next[appId];
                            return next;
                        });
                    }, 500);
                    return;
                }

                // Random jitter logic (Phase 2)
                const increment = Math.random() * 3 + 1;
                newProgress = Math.min(100, currentProgress + increment);

                const jitter = Math.random() + 0.5;
                delay = 30 * jitter; // Standard install speed simulation

                // "Stall" simulation
                if (newProgress > 85 && newProgress < 95 && Math.random() > 0.8) {
                    delay += 800;
                }
            }

            progressRef.current[appId] = newProgress;
            setInstallingApps(prev => ({ ...prev, [appId]: Math.floor(newProgress) }));
            timeoutsRef.current[appId] = setTimeout(loop, delay);
        };

        // Start
        timeoutsRef.current[appId] = setTimeout(loop, 100);
    }, [installingApps, owner, users, getNodeAtPath, installApp, wifiEnabled, currentNetwork, availableNetworks]);

    const handleUninstall = useCallback((appId: string) => {
        // Permission Check for Uninstall
        const effectiveUser = owner || 'guest';
        const userObj = users.find(u => u.username === effectiveUser);
        if (userObj) {
            const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';
            if (!isAdmin) {
                uninstallApp(appId, owner);
                return;
            }
        }

        uninstallApp(appId, owner);
    }, [uninstallApp, owner, users]);

    const cancelInstall = useCallback((appId: string) => {
        if (timeoutsRef.current[appId]) {
            clearTimeout(timeoutsRef.current[appId]);
            delete timeoutsRef.current[appId];
        }
        delete progressRef.current[appId];
        delete downloadedRef.current[appId];

        setInstallingApps(prev => {
            const next = { ...prev };
            delete next[appId];
            return next;
        });
    }, []);

    const isAppBroken = useCallback((appId: string) => {
        if (!installedApps.has(appId)) return false;
        // Check for file existence
        const binaryPath = `/usr/bin/${appId}`;
        const binaryNode = getNodeAtPath(binaryPath);
        return !binaryNode;
    }, [installedApps, getNodeAtPath]);

    const handleRestore = useCallback((appId: string) => {
        // Permission Check
        const effectiveUser = owner || 'guest';
        const userObj = users.find(u => u.username === effectiveUser);
        if (userObj) {
            const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';
            if (!isAdmin) {
                notify.system('error', t('notifications.titles.permissionDenied'), t('appStore.restorePermissionDenied'));
                return;
            }
        }

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
        cancelInstall,
        handleUninstall,
        installedApps,
        isAppInstalled: (id: string) => installedApps.has(id),
        isAppBroken,
        handleRestore
    };
}

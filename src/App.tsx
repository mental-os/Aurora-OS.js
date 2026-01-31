import { lazy, Suspense, useEffect } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { AppProvider, useAppContext } from '@/components/AppContext';
import { FileSystemProvider, useFileSystem } from '@/components/FileSystemContext';
import { GameRoot } from '@/components/Game/GameRoot';
import { MusicProvider } from '@/components/MusicContext';
import { PhotosProvider } from '@/components/PhotosContext';

// Lazy load the Heavy OS component
// This ensures we don't load Desktop/Apps/Assets until we actually start the game
const OS = lazy(() => import('@/components/OS'));

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useI18n } from './i18n';
import { calculateTotalRamUsage } from './utils/resourceMonitor';

function KernelLoadingFallback() {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center font-mono">
      {t('app.loadingKernel')}
    </div>
  );
}

function AppContent() {
  const { currentUser } = useFileSystem();
  const { switchUser, isLocked } = useAppContext();

  // Sync Global Settings with Current User (or root for login screen)
  useEffect(() => {
    switchUser(currentUser || 'root');
  }, [currentUser, switchUser]);

  // Expose RAM usage utility for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.aurora = {
        ...window.aurora,
        checkRamUsage: () => {
          try {
            const report = calculateTotalRamUsage(currentUser || 'root');
            console.group('RAM Usage Report');
            console.table(report.breakdown);
            console.log(`Total Gamified RAM Usage: ${report.totalMB} MB`);
            console.groupEnd();
            return report;
          } catch (e) {
            console.error('Failed to calculate RAM usage:', e);
            return { error: e };
          }
        }
      };
    }
  }, [currentUser]);
  
  // Track page refresh/unload state to distinguish from app window closing
  useEffect(() => {
      const handleUnload = () => {
          sessionStorage.setItem('is_refreshing', 'true');
      };
      
      // Cleanup flag on mount (if we just refreshed, we are now fresh)
      // But we should verify if we want to clear it immediately?
      // Yes, if we are running, we are not refreshing anymore.
      sessionStorage.removeItem('is_refreshing');

      window.addEventListener('beforeunload', handleUnload);
      return () => {
          window.removeEventListener('beforeunload', handleUnload);
      };
  }, []);

  // Global click sound (Persistent across all states)


  return (
    <PhotosProvider owner={currentUser || 'guest'}>
      <MusicProvider owner={currentUser || 'guest'}>
        {/* Render OS if user is logged in (even if locked) */}
        {/* Suspense ensures we can load the chunk while showing BootSequence or nothing */}
        {currentUser && (
          <ErrorBoundary>
            <Suspense fallback={<KernelLoadingFallback />}>
              <OS />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Render Login Overlay if logged out OR locked */}
        {(!currentUser || isLocked) && (
          <div className="absolute inset-0 z-20000">
            <LoginScreen />
          </div>
        )}
      </MusicProvider>
    </PhotosProvider>
  );
}

import { ScreenGuard } from '@/components/ui/ScreenGuard';
import { NetworkProvider } from '@/components/NetworkContext';

export default function App() {
  return (
    <ScreenGuard>
      <AppProvider>
        <NetworkProvider>
          <FileSystemProvider>
            <GameRoot>
              <AppContent />
            </GameRoot>
          </FileSystemProvider>
        </NetworkProvider>
      </AppProvider>
    </ScreenGuard>
  );
}

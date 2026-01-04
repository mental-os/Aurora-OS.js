import { lazy, Suspense, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AppProvider, useAppContext } from './components/AppContext';
import { FileSystemProvider, useFileSystem } from './components/FileSystemContext';
import { GameRoot } from './components/Game/GameRoot';
import { MusicProvider } from './components/MusicContext';

// Lazy load the Heavy OS component
// This ensures we don't load Desktop/Apps/Assets until we actually start the game
const OS = lazy(() => import('./components/OS'));

import { ErrorBoundary } from './components/ErrorBoundary';
import { useI18n } from './i18n';

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

  return (
    <>
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
        <div className="absolute inset-0 z-[20000]">
          <LoginScreen />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <FileSystemProvider>
        <GameRoot>
          <MusicProvider>
            <AppContent />
          </MusicProvider>
        </GameRoot>
      </FileSystemProvider>
    </AppProvider>
  );
}

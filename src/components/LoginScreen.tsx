import { useState, useRef, useEffect } from 'react';
import { useFileSystem, User } from '@/components/FileSystemContext';
import { cn } from '@/components/ui/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import { GameScreenLayout } from '@/components/Game/GameScreenLayout';
import { feedback } from '@/services/soundFeedback';
import { hasSavedSession, clearSession, softReset } from '@/utils/memory';

import { useAppContext } from '@/components/AppContext';
import { useI18n } from '@/i18n/index';

export function LoginScreen() {
    const { users, login, currentUser, logout, resetFileSystem } = useFileSystem();
    const { exposeRoot, accentColor, isLocked, setIsLocked } = useAppContext();
    const { t } = useI18n();

    // If locked, default to current user
    const lockedUser = isLocked ? users.find(u => u.username === currentUser) : null;

    const [selectedUser, setSelectedUser] = useState<User | null>(lockedUser || null);
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState(false);
    const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when user is selected
    useEffect(() => {
        if (selectedUser && inputRef.current) {
            // setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [selectedUser]);

    /*
    console.log('[LoginScreen] Render', {
        hasUser: !!selectedUser,
        passLen: password.length,
        loggingIn: isLoggingIn,
        disabled: !password || isLoggingIn
    });
    */

    const handleUserClick = (user: User) => {
        feedback.click();
        setSelectedUser(user);
        setPassword('');
        setError(false);
        setShowSwitchConfirm(false);
    };

    const handleLogin = async () => {
        if (!selectedUser) {
            return;
        }

        try {
            setIsLoggingIn(true);
            setError(false);

            // Removing artificial delay for debugging/responsiveness
            // await new Promise(resolve => setTimeout(resolve, 600));

            let success = false;

            if (isLocked) {
                // Now using the robust login() function so verify password against authoritative source
                // avoiding stale state issues in selectedUser
                success = login(selectedUser.username, password);

                if (success) {
                    feedback.click();
                    setIsLocked(false);
                }
            } else {
                success = login(selectedUser.username, password);
                if (success) feedback.click();
            }

            if (!success) {
                setIsLoggingIn(false);
                setError(true);
                // feedback.error(); // If error sound existed
                inputRef.current?.focus();
            } else {
                // On success, we expect unmount. 
                // But just in case, stop spinning.
                setIsLoggingIn(false);
            }
        } catch (e) {
            console.error('Login error:', e);
            setIsLoggingIn(false);
            setError(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleBack = () => {
        if (isLocked) {
            // If locked and going back -> Suspend Session (keep storage, clear RAM user)
            setIsLocked(false);
            setSelectedUser(null); // Clear selection to show user list
            setShowSwitchConfirm(false);
            logout(); // Suspend session (keep storage, clear RAM user)
            // State updates will follow re-render
        } else {
            setSelectedUser(null);
            setPassword('');
            setError(false);
        }
    };



    return (
        <GameScreenLayout
            zIndex={50000}
            mode="glass"
            footerActions={
                <>
                    <button
                        onClick={() => {
                            softReset();
                            window.location.reload();
                        }}
                        className="hover:text-white transition-colors"
                    >
                        {t('login.softReset')}
                    </button>
                    <span>•</span>
                    <button
                        onClick={() => {
                            if (window.confirm(t('login.hardResetConfirm'))) {
                                resetFileSystem();
                                window.location.reload();
                            }
                        }}
                        className="hover:text-red-400 transition-colors"
                    >
                        {t('login.hardReset')}
                    </button>
                </>
            }
        >
            {/* User Selection / Login Container */}
            <div className="w-full max-w-md flex flex-col items-center">
                {!selectedUser ? (
                    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-white/80 text-center mb-4 text-lg font-medium">{t('login.selectUser')}</h2>
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto px-2">
                            {users.filter(u => exposeRoot || u.username !== 'root').map((user) => (
                                <button
                                    key={user.uid}
                                    onClick={() => handleUserClick(user)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group",
                                        "bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 backdrop-blur-md",
                                        "text-left"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform relative">
                                        <span className="text-xl font-bold text-white uppercase">{user.fullName.charAt(0)}</span>
                                        {(currentUser === user.username || hasSavedSession(user.username)) && (
                                            <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 shadow-lg border-2 border-slate-800" title={t('login.sessionActive')}>
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-medium text-lg group-hover:text-white transition-colors">
                                            {user.fullName}
                                        </div>
                                        <div className="text-white/50 text-sm font-mono flex items-center gap-2">
                                            @{user.username}
                                            {currentUser === user.username ? (
                                                <span className="text-amber-400 text-[10px] uppercase tracking-wider font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{t('login.active')}</span>
                                            ) : hasSavedSession(user.username) ? (
                                                <span className="text-blue-400 text-[10px] uppercase tracking-wider font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">{t('login.resume')}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/0 group-hover:bg-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Password / Login Stage */
                    <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full bg-linear-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-2xl ring-4 ring-white/10 overflow-hidden">
                                <span className="text-4xl font-bold text-white uppercase">{selectedUser.fullName.charAt(0)}</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold text-white mb-2">{selectedUser.fullName}</h2>
                        <p className="text-white/50 mb-6 flex flex-col items-center gap-1">
                            <span>{t('login.enterPasswordToUnlock')}</span>
                            {hasSavedSession(selectedUser.username) && (
                                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                    {t('login.restoringPreviousSession')}
                                </span>
                            )}
                        </p>

                        <div className="w-full relative mb-4">
                            <input
                                ref={inputRef}
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={t('login.passwordPlaceholder')}
                                className={cn(
                                    "w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-center outline-none focus:border-white/30 transition-all",
                                    error && "border-red-500/50 bg-red-500/10 animate-shake"
                                )}
                                autoFocus
                            />
                            {error && (
                                <p className="absolute -bottom-6 left-0 right-0 text-center text-red-300 text-xs animate-in fade-in slide-in-from-top-1 whitespace-nowrap">
                                    {t('login.incorrectPassword')}
                                    {(selectedUser.passwordHint || selectedUser.username === 'root' || selectedUser.username === 'user' || selectedUser.username === 'guest') && (
                                        <>
                                            . {t('login.hint')}: {selectedUser.passwordHint || (selectedUser.username === 'root' ? 'admin' : selectedUser.username === 'user' ? '1234' : 'guest')}
                                        </>
                                    )}
                                </p>
                            )}
                        </div>

                        {hasSavedSession(selectedUser.username) ? (
                            <div className="w-full flex gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        if (window.confirm(t('login.logOutConfirm', { username: selectedUser.username }))) {
                                            clearSession(selectedUser.username);
                                            setSelectedUser(null);
                                        }
                                    }}
                                    className="flex-1 py-3 px-2 rounded-xl font-medium text-sm transition-all border-2 flex items-center justify-center hover:bg-white/10 active:scale-95"
                                    style={{ borderColor: accentColor, color: accentColor }}
                                >
                                    {t('login.logOut')}
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogin();
                                    }}
                                    disabled={!password || isLoggingIn}
                                    className={cn(
                                        "flex-3 py-3 px-6 rounded-xl font-medium text-white shadow-lg transition-all",
                                        "active:scale-95 disabled:opacity-50 disabled:active:scale-100",
                                        "flex items-center justify-center gap-2"
                                    )}
                                    style={{
                                        backgroundColor: accentColor,
                                        filter: 'brightness(1.1)'
                                    }}
                                >
                                    {isLoggingIn ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>{t('login.enterSystem')} <ArrowRight className="w-4 h-4 ml-1" /></>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                disabled={!password || isLoggingIn}
                                className={cn(
                                    "w-full py-3 px-6 rounded-xl font-medium text-white shadow-lg transition-all mt-4",
                                    "active:scale-95 disabled:opacity-50 disabled:active:scale-100",
                                    "flex items-center justify-center gap-2"
                                )}
                                style={{
                                    backgroundColor: accentColor,
                                    filter: 'brightness(1.1)'
                                }}
                            >
                                {isLoggingIn ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>{t('login.enterSystem')} <ArrowRight className="w-4 h-4 ml-1" /></>
                                )}
                            </button>
                        )}

                        <div className="flex flex-col items-center w-full min-h-[60px] justify-end pb-2">
                            {!showSwitchConfirm ? (
                                <button
                                    onClick={() => {
                                        if (isLocked) {
                                            setShowSwitchConfirm(true);
                                        } else {
                                            handleBack();
                                        }
                                    }}
                                    className="mt-6 text-white/40 hover:text-white/70 text-sm transition-colors"
                                >
                                    {isLocked ? t('login.switchAccount') : t('login.back')}
                                </button>
                            ) : (
                                <div className="mt-6 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                                    <span className="text-white/60 text-sm">{t('login.suspendToSwitch')}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowSwitchConfirm(false)}
                                            className="px-3 py-1 text-xs rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                                        >
                                            {t('login.cancel')}
                                        </button>
                                        <button
                                            onClick={handleBack}
                                            className="px-3 py-1 text-xs rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors border border-amber-500/20"
                                        >
                                            {t('login.switchUser')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </GameScreenLayout>
    );
}


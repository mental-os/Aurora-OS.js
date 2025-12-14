
import { useState, useRef, useEffect } from 'react';
import pkg from '../../package.json';
import { useFileSystem, User } from './FileSystemContext';
import { cn } from './ui/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import { feedback } from '../services/soundFeedback';

import { useAppContext } from './AppContext';

export function LoginScreen() {
    const { users, login, currentUser, logout } = useFileSystem();
    const { exposeRoot, accentColor, isLocked, setIsLocked } = useAppContext();

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
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [selectedUser]);

    const handleUserClick = (user: User) => {
        feedback.click();
        setSelectedUser(user);
        setPassword('');
        setError(false);
        setShowSwitchConfirm(false);
    };

    const handleLogin = async () => {
        if (!selectedUser) return;

        setIsLoggingIn(true);
        setError(false);

        // Small artificial delay for effect
        await new Promise(resolve => setTimeout(resolve, 600));

        // If locked, we just check password against current user data without full login() call
        // Actually, login() handles auth check well.
        // But if locked, we just want to UNLOCK (setIsLocked(false))

        let success = false;

        if (isLocked) {
            // Verify password manually or reuse login logic?
            // Use login logic but if success, just setIsLocked(false)
            // We can check password directly if we have access, or use login() which sets currentUser (already set).
            // Let's use simple check:
            if (selectedUser.password === password) {
                success = true;
                setIsLocked(false);
                feedback.click(); // Success sound
            } else {
                success = false;
            }
        } else {
            success = login(selectedUser.username, password);
            if (success) feedback.click();
        }

        if (!success) {
            setIsLoggingIn(false);
            setError(true);
            feedback.click(); // Error sound ideally
            inputRef.current?.focus();
            // Shake effect could be added here
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleBack = () => {
        if (isLocked) {
            // If locked and going back -> Log Out
            if (currentUser) {
                localStorage.removeItem(`aurora-os-windows-${currentUser}`);
            }
            setIsLocked(false);
            setSelectedUser(null); // Clear selection to show user list
            setShowSwitchConfirm(false);
            logout();
            // State updates will follow re-render
        } else {
            setSelectedUser(null);
            setPassword('');
            setError(false);
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=3870')] bg-cover bg-center flex items-center justify-center relative">
            {/* Backdrop Blur Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

            <div className="z-10 w-full max-w-md p-8 flex flex-col items-center">
                {/* Logo / Header */}
                <div className="mb-12 text-center">
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl mx-auto mb-6">
                        <div
                            className="w-12 h-12 rounded-full shadow-lg animate-pulse"
                            style={{
                                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
                            }}
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">Aurora OS</h1>
                </div>

                {/* User Selection Stage */}
                {!selectedUser ? (
                    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-white/80 text-center mb-4 text-lg font-medium">Select User</h2>
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
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                        <span className="text-xl font-bold text-white uppercase">{user.fullName.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-medium text-lg group-hover:text-white transition-colors">
                                            {user.fullName}
                                        </div>
                                        <div className="text-white/50 text-sm font-mono">
                                            @{user.username}
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
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-2xl border-4 border-white/10">
                                <span className="text-4xl font-bold text-white uppercase">{selectedUser.fullName.charAt(0)}</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold text-white mb-2">{selectedUser.fullName}</h2>
                        <p className="text-white/50 mb-6">Enter password to unlock</p>

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
                                placeholder="Password"
                                className={cn(
                                    "w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-center outline-none focus:border-white/30 transition-all",
                                    error && "border-red-500/50 bg-red-500/10 animate-shake"
                                )}
                                autoFocus
                            />
                            {error && (
                                <p className="absolute -bottom-6 left-0 right-0 text-center text-red-300 text-xs animate-in fade-in slide-in-from-top-1">
                                    Incorrect password. Hint: {selectedUser.username === 'root' ? 'admin' : selectedUser.username === 'user' ? '1234' : 'guest'}
                                </p>
                            )}
                        </div>

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
                                <>Enter System <ArrowRight className="w-4 h-4 ml-1" /></>
                            )}
                        </button>

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
                                    {isLocked ? 'Switch Account' : 'Back'}
                                </button>
                            ) : (
                                <div className="mt-6 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                                    <span className="text-white/60 text-sm">Log out to switch?</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowSwitchConfirm(false)}
                                            className="px-3 py-1 text-xs rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBack}
                                            className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors border border-red-500/20"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-white/20 text-xs font-mono">v{pkg.version} • Secure System</p>
                </div>
            </div>
        </div>
    );
}

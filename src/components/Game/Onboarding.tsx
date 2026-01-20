import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Check, User, Globe, Palette, Loader2, Search } from "lucide-react";
import { GameScreenLayout } from "@/components/Game/GameScreenLayout";
import { useFileSystem } from "@/components/FileSystemContext";
import { useAppContext } from "@/components/AppContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { cn } from "@/components/ui/utils";
import { SUPPORTED_LOCALES } from "@/i18n/translations";
import { useI18n } from "@/i18n/index";
import { STORAGE_KEYS } from "@/utils/memory";

import { updateStoredVersion } from "@/utils/migrations";
import { BRAND } from "@/config/systemConfig";

interface OnboardingProps {
    onContinue: () => void;
    onBack?: () => void;
}

type Step = "language" | "account" | "theme" | "finishing";

export function Onboarding({ onContinue, onBack }: OnboardingProps) {
    const [step, setStep] = useState<Step>("language");
    const { addUser, addUserToGroup, users, saveFileSystem } = useFileSystem();
    const {
        setAccentColor,
        setThemeMode,
        accentColor,
        themeMode,
        locale,
        setLocale,
        switchUser,
        setOnboardingComplete
    } = useAppContext();
    const { t } = useI18n();



    // Step 2: Account
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [hint, setHint] = useState("");
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [error, setError] = useState("");
    const [isUsernameModified, setIsUsernameModified] = useState(false);

    // Step 3: Theme (Local state for preview, applied on finish)
    const [previewAccent, setPreviewAccent] = useState(accentColor || "#3b82f6");

    // Language Search
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLocales = SUPPORTED_LOCALES.filter(lang =>
        lang.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.locale.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handlers
    const handleLanguageNext = useCallback(() => {
        setStep("account");
    }, []);

    const handleAccountNext = useCallback(async () => {
        if (!fullName || !username || !password) {
            setError(t('onboarding.validation.requiredFields'));
            return;
        }

        // Password Validation
        if (password.length < 6) {
            setError(t('onboarding.validation.passwordLength'));
            return;
        }

        // Password Hint Validation
        if (hint) {
            if (hint.length > 50) {
                setError(t('onboarding.validation.hintLength'));
                return;
            }
            if (password.includes(hint) || hint.includes(password)) {
                setError(t('onboarding.validation.hintSecurity'));
                return;
            }
            // Sanitize Hint (prevent scripts/html just in case, though React escapes it)
            // Allow standard text punctuation
            const hintRegex = /^[a-zA-Z0-9\s.,?!()'-]+$/;
            if (!hintRegex.test(hint)) {
                setError(t('onboarding.validation.hintFormat'));
                return;
            }
        }

        // Full Name Validation (Letters, spaces, hyphens, apostrophes)
        // Using unicode range for international support (e.g. Romanian characters)
        const nameRegex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'-]+$/;
        if (!nameRegex.test(fullName)) {
            setError(t('onboarding.validation.fullNameFormat'));
            return;
        }

        // Username Validation (Alphanumeric only)
        const usernameRegex = /^[a-z0-9]+$/;
        if (!usernameRegex.test(username)) {
            setError(t('onboarding.validation.usernameFormat'));
            return;
        }

        setIsCreatingUser(true);
        setError("");

        // Check if user already exists (Simulated check)
        // We defer actual creation to the end to prevent partial saves
        setTimeout(() => {
            const userExists = users.some(u => u.username === username);

            if (!userExists) {
                setStep("theme");
            } else {
                setError(t('onboarding.validation.userExists'));
            }
            setIsCreatingUser(false);
        }, 500);
    }, [fullName, username, password, hint, t, users]);

    const handleFinishOnboarding = useCallback(() => {
        setStep("finishing");

        // Finalize: Create User and Save System State
        setTimeout(() => {
            // 1. Create User (as root)
            const success = addUser(username, fullName, password, hint, "root", true);

            if (success) {
                // 2. Add to groups
                addUserToGroup(username, "admin");
                addUserToGroup(username, "users");

                // 3. Switch Context
                switchUser(username);

                // 4. Apply Preferences
                setAccentColor(previewAccent);

                // 5. Mark Complete & Save
                try {
                    localStorage.setItem(STORAGE_KEYS.LANGUAGE, locale);
                    localStorage.setItem(STORAGE_KEYS.INSTALL_DATE, new Date().toISOString());
                } catch (e) { console.warn(e) }

                setOnboardingComplete(true);
                updateStoredVersion(); // Commit session
                saveFileSystem(); // Force write to disk

                // 6. Continue to Game
                setTimeout(() => {
                    onContinue();
                }, 1500);
            } else {
                // Fallback error handling if creation fails at the last second
                // (Shouldn't happen given the check in previous step, unless race condition)
                setStep("account");
                setError(t('onboarding.validation.creationFailed'));
            }
        }, 500);
    }, [username, fullName, password, hint, previewAccent, locale, addUser, addUserToGroup, switchUser, setAccentColor, setOnboardingComplete, saveFileSystem, onContinue, t]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (step === "language") {
                    onBack?.();
                } else if (step === "account") {
                    setStep("language");
                    setError("");
                } else if (step === "theme") {
                    setStep("account");
                }
            }

            if (e.key === "Enter") {
                e.preventDefault();
                if (step === "language") {
                    handleLanguageNext();
                } else if (step === "account") {
                    handleAccountNext();
                } else if (step === "theme") {
                    handleFinishOnboarding();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [step, onBack, handleLanguageNext, handleAccountNext, handleFinishOnboarding]);

    // Auto-generate username from full name
    const handleNameChange = (val: string) => {
        setFullName(val);
        if (!isUsernameModified) {
            const slug = val.toLowerCase().replace(/[^a-z0-9]/g, "");
            setUsername(slug);
        }
    };

    return (
        <GameScreenLayout zIndex={40000} mode="glass">
            {/* Modal Overlay matching SettingsModal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 p-4 md:p-0">
                <Card className="w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl border-white/10 shadow-2xl p-2 my-auto max-h-[90vh] flex flex-col">
                    <CardHeader className="shrink-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                {step === "language" && <Globe className="w-5 h-5 text-white" />}
                                {step === "account" && <User className="w-5 h-5 text-white" />}
                                {step === "theme" && <Palette className="w-5 h-5 text-white" />}
                                {step === "finishing" && <Loader2 className="w-5 h-5 text-white animate-spin" />}
                            </div>
                            <div>
                                <CardTitle className="text-xl text-white font-bold tracking-wide">
                                    {step === "language" && t('onboarding.steps.language.title')}
                                    {step === "account" && t('onboarding.steps.account.title')}
                                    {step === "theme" && t('onboarding.steps.theme.title')}
                                    {step === "finishing" && t('onboarding.steps.finishing.title')}
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    {step === "language" && t('onboarding.steps.language.description')}
                                    {step === "account" && t('onboarding.steps.account.description')}
                                    {step === "theme" && t('onboarding.steps.theme.description')}
                                    {step === "finishing" && t('onboarding.steps.finishing.description')}
                                </CardDescription>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        {step !== 'finishing' && (
                            <div className="flex gap-2 mt-4">
                                <div className={cn("h-1 flex-1 rounded-full transition-colors", step === "language" ? "bg-white" : "bg-white/10")} />
                                <div className={cn("h-1 flex-1 rounded-full transition-colors", step === "account" ? "bg-white" : "bg-white/10")} />
                                <div className={cn("h-1 flex-1 rounded-full transition-colors", step === "theme" ? "bg-white" : "bg-white/10")} />
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="py-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === "language" && (
                                <motion.div
                                    key="lang"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <GlassInput
                                        icon={<Search className="w-4 h-4" />}
                                        placeholder={t('onboarding.search.placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/20 focus:bg-black/40"
                                        autoFocus
                                    />

                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                        {filteredLocales.length > 0 ? (
                                            filteredLocales.map((lang) => (
                                                <button
                                                    key={lang.locale}
                                                    onClick={() => setLocale(lang.locale)}
                                                    className={cn(
                                                        "w-full p-3 rounded-lg border text-left flex justify-between items-center transition-all group",
                                                        locale === lang.locale
                                                            ? "bg-white/10 border-white/40 ring-1 ring-white/20"
                                                            : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                                                    )}
                                                >
                                                    <span className={cn("font-medium transition-colors text-sm", locale === lang.locale ? "text-white" : "text-white/70 group-hover:text-white")}>{lang.label}</span>
                                                    {locale === lang.locale && <Check className="w-4 h-4 text-white" />}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-white/30 text-sm">
                                                {t('onboarding.search.noResults')}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === "account" && (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/80">{t('onboarding.account.fullName')}</label>
                                            <GlassInput
                                                placeholder={t('onboarding.account.fullNamePlaceholder')}
                                                value={fullName}
                                                onChange={(e) => handleNameChange(e.target.value)}
                                                autoFocus
                                                className="bg-black/20 focus:bg-black/40"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/80">{t('onboarding.account.username')}</label>
                                            <GlassInput
                                                placeholder="johndoe"
                                                value={username}
                                                onChange={(e) => {
                                                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                                                    setIsUsernameModified(true);
                                                }}
                                                className="bg-black/20 focus:bg-black/40"
                                            />
                                            {username && <p className="text-xs text-white/40 font-mono">/home/{username}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/80">{t('onboarding.account.password')}</label>
                                            <GlassInput
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-black/20 focus:bg-black/40"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/80">{t('onboarding.account.passwordHint')}</label>
                                            <GlassInput
                                                placeholder={t('onboarding.account.passwordHintPlaceholder')}
                                                value={hint}
                                                onChange={(e) => setHint(e.target.value)}
                                                className="bg-black/20 focus:bg-black/40"
                                            />
                                        </div>
                                    </div>
                                    {error && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                            {error}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === "theme" && (
                                <motion.div
                                    key="theme"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white/80">{t('onboarding.theme.mode')}</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setThemeMode('neutral')} // Previewing
                                                className={cn(
                                                    "p-4 rounded-xl border transition-all text-left group",
                                                    themeMode === 'neutral' ? "bg-white/10 border-white/40" : "bg-black/20 border-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <div className="w-full h-24 bg-[#09090b] rounded-lg mb-3 border border-white/10 relative overflow-hidden">
                                                    <div className="absolute top-2 left-2 w-16 h-4 bg-white/10 rounded" />
                                                    <div className="absolute top-8 left-2 w-8 h-8 bg-white/5 rounded-full" />
                                                </div>
                                                <div className="text-white font-medium group-hover:text-white/90">{t('onboarding.theme.darkMode')}</div>
                                            </button>
                                            <div className="relative opacity-50 cursor-not-allowed">
                                                <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left h-full">
                                                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 border border-black/5 relative overflow-hidden">
                                                        <div className="absolute top-2 left-2 w-16 h-4 bg-black/10 rounded" />
                                                    </div>
                                                    <div className="text-white font-medium">{t('onboarding.theme.lightMode')}</div>
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs text-white font-medium">{t('onboarding.theme.comingSoon')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white/80">{t('onboarding.theme.accentColor')}</label>
                                        <div className="flex gap-2 flex-wrap items-center">
                                            {BRAND.accentPalette.map((color) => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => setPreviewAccent(color.value)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full transition-all border-2 relative",
                                                        previewAccent === color.value
                                                            ? "border-white scale-110 shadow-lg shadow-white/10"
                                                            : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
                                                    )}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                >
                                                    {previewAccent === color.value && (
                                                        <motion.div
                                                            layoutId="active-check"
                                                            className="absolute inset-0 flex items-center justify-center"
                                                        >
                                                            <Check className="w-5 h-5 text-white drop-shadow-md" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                            <div className="w-px h-8 bg-white/10" />
                                            <div className="relative group">
                                                <input
                                                    type="color"
                                                    value={previewAccent}
                                                    onChange={(e) => setPreviewAccent(e.target.value)}
                                                    className="w-10 h-10 rounded-full opacity-0 cursor-pointer absolute inset-0 z-10"
                                                />
                                                <div
                                                    className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center transition-transform group-hover:scale-105"
                                                    style={{ backgroundColor: previewAccent }}
                                                >
                                                    <Palette className="w-4 h-4 text-white drop-shadow-md" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === "finishing" && (
                                <motion.div
                                    key="finishing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full py-12 text-center"
                                >
                                    <h3 className="text-2xl font-bold text-white mb-2">{t('onboarding.finishing.title')}</h3>
                                    <p className="text-white/60 mb-8 max-w-xs mx-auto">
                                        {t('onboarding.finishing.subtitle')}
                                    </p>
                                    <div className="w-64 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    {step !== 'finishing' && (
                        <CardFooter className="flex justify-between border-t border-white/5 pt-6 p-6 relative z-50">
                            {step === "language" ? (
                                <GlassButton
                                    variant="ghost"
                                    onClick={() => onBack?.()}
                                    className="text-white/60 hover:text-white"
                                >
                                    {t('onboarding.buttons.back')}
                                </GlassButton>
                            ) : (
                                <GlassButton
                                    variant="ghost"
                                    onClick={() => setStep(step === "theme" ? "account" : "language")}
                                    className="text-white/60 hover:text-white"
                                >
                                    {t('onboarding.buttons.back')}
                                </GlassButton>
                            )}

                            {step === "language" && (
                                <GlassButton
                                    type="button"
                                    onClick={handleLanguageNext}
                                    className="group relative z-50 pointer-events-auto"
                                    data-testid="onboarding-next-language"
                                >
                                    {t('onboarding.buttons.next')} <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                                </GlassButton>
                            )}

                            {step === "account" && (
                                <GlassButton
                                    type="button"
                                    onClick={handleAccountNext}
                                    disabled={isCreatingUser}
                                    className="min-w-[100px]"
                                >
                                    {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{t('onboarding.buttons.next')} <ChevronRight className="w-4 h-4 ml-2" /></>}
                                </GlassButton>
                            )}

                            {step === "theme" && (
                                <GlassButton
                                    type="button"
                                    onClick={handleFinishOnboarding}
                                    style={{ backgroundColor: previewAccent }}
                                    className="px-6 shadow-lg shadow-black/20 hover:shadow-black/40"
                                >
                                    {t('onboarding.buttons.startUsing')}
                                </GlassButton>
                            )}
                        </CardFooter>
                    )}
                </Card>
            </div>
        </GameScreenLayout>
    );
}
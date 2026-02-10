import { Palette, Monitor, Bell, Shield, Wifi, User, HardDrive, Zap, Info, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from './AppContext';
import { useFileSystem } from './FileSystemContext';
import { Checkbox } from './ui/checkbox';
import { AppTemplate } from './apps/AppTemplate';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { softReset, hardReset, getStorageStats, formatBytes } from '../utils/memory';
import { getComplementaryColor } from '../utils/colors';
import { cn } from './ui/utils';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { EmptyState } from './ui/empty-state';
import { useSessionStorage } from '../hooks/useSessionStorage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { SUPPORTED_LOCALES } from '../i18n/translations';
import { useI18n } from '../i18n/index';
import pkg from '../../package.json';
// New yAMI wallpaper (place your image at public/yami-wallpaper.jpg)
const yamiWallpaper = '/yami-wallpaper.jpg';
import orbitWallpaper from '../assets/images/wallpaper-orbit.png';
import meshWallpaper from '../assets/images/wallpaper-mesh.png';
import dunesWallpaper from '../assets/images/wallpaper-dunes.png';

const WALLPAPERS = [
  { id: 'default', name: 'yAMI Skyline', src: yamiWallpaper },
  { id: 'orbit', name: 'Orbit', src: orbitWallpaper },
  { id: 'mesh', name: 'Flux', src: meshWallpaper },
  { id: 'dunes', name: 'Midnight Dunes', src: dunesWallpaper },
];

const settingsSidebarIcons = {
  appearance: Palette,
  performance: Zap,
  displays: Monitor,
  notifications: Bell,
  network: Wifi,
  security: Shield,
  users: User,
  storage: HardDrive,
  about: Info,
} as const;

const presetColors = [
  { name: 'Crimson', value: '#e11d48' },  // Rose-600 (Vibrant Red)
  { name: 'Carbon', value: '#fe5000' },   // MOONHOUND Studio
  { name: 'Amber', value: '#f59e0b' },    // Amber-500 (Warm Gold)
  { name: 'Emerald', value: '#10b981' },  // Emerald-500 (Crisp Green)
  { name: 'Azure', value: '#3b82f6' },    // Blue-500 (Classic Tech Blue)
  { name: 'Indigo', value: '#5755e4' },   // Indigo-500 (Deep Modern Blue)
  { name: 'Violet', value: '#8b5cf6' },   // Violet-500 (Bright Purple)
  { name: 'Fuchsia', value: '#d946ef' },  // Fuchsia-500 (Neon Pink)
];

export function Settings({ owner }: { owner?: string }) {
  const [activeSection, setActiveSection] = useSessionStorage('settings-active-section', 'appearance', owner);
  const { t } = useI18n();

  const settingsSidebar = useMemo(() => {
    return {
      sections: [
        {
          title: t('settings.sidebar.system'),
          items: [
            { id: 'appearance', label: t('settings.sections.appearance'), icon: settingsSidebarIcons.appearance },
            { id: 'performance', label: t('settings.sections.performance'), icon: settingsSidebarIcons.performance },
            { id: 'displays', label: t('settings.sections.displays'), icon: settingsSidebarIcons.displays },
            { id: 'notifications', label: t('settings.sections.notifications'), icon: settingsSidebarIcons.notifications },
            { id: 'network', label: t('settings.sections.network'), icon: settingsSidebarIcons.network },
            { id: 'security', label: t('settings.sections.security'), icon: settingsSidebarIcons.security },
            { id: 'users', label: t('settings.sections.users'), icon: settingsSidebarIcons.users },
            { id: 'storage', label: t('settings.sections.storage'), icon: settingsSidebarIcons.storage },
          ]
        },
        {
          title: t('settings.sidebar.general'),
          items: [
            { id: 'about', label: t('settings.sections.about'), icon: settingsSidebarIcons.about },
          ]
        }
      ]
    };
  }, [t]);

  // Check for pending section request (Deep Linking)
  useEffect(() => {
    const pending = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('settings-pending-section') : null;
    if (pending) {
      sessionStorage.removeItem('settings-pending-section');
      setActiveSection(pending);
    }
  }, [setActiveSection]);

  // Listen for external requests to change section (when app is already open)
  useEffect(() => {
    const handleOpenSection = (e: CustomEvent<string>) => {
      if (e.detail) {
        setActiveSection(e.detail);
      }
    };

    window.addEventListener('yami-open-settings-section', handleOpenSection as EventListener);
    return () => {
      window.removeEventListener('yami-open-settings-section', handleOpenSection as EventListener);
    };
  }, [setActiveSection]);
  const {
    accentColor,
    setAccentColor,
    themeMode,
    setThemeMode,
    blurEnabled,
    setBlurEnabled,
    reduceMotion,
    setReduceMotion,
    disableShadows,
    setDisableShadows,
    disableGradients,
    setDisableGradients,
    devMode,
    setDevMode,
    exposeRoot,
    setExposeRoot,
    locale,
    setLocale,
    wallpaper,
    setWallpaper
  } = useAppContext();
  const { users, addUser, updateUser, deleteUser, currentUser } = useFileSystem();
  const { activeUser: desktopUser } = useAppContext();
  const activeUser = owner || desktopUser;
  
  // Permission Check
  const currentUserObj = users.find(u => u.username === activeUser);
  const currentUserGroups = currentUserObj?.groups || [];
  const canManageUsers = activeUser === 'root' || currentUserGroups.some(g => ['admin', 'root', 'wheel'].includes(g));

  const [customColor, setCustomColor] = useState(accentColor);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordHint, setNewPasswordHint] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // Edit User State
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editHint, setEditHint] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  // About section state
  const storageStats = useMemo(() => {
    return activeSection === 'about' ? getStorageStats() : {
      softMemory: { keys: 0, bytes: 0 },
      hardMemory: { keys: 0, bytes: 0 },
      total: { keys: 0, bytes: 0 }
    };
  }, [activeSection]);

  const [showSoftConfirm, setShowSoftConfirm] = useState(false);
  const [showHardConfirm, setShowHardConfirm] = useState(false);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomColor(value);
    setAccentColor(value);
  };

  const content = ({ width }: { width: number }) => {
    const isNarrow = width < 400;

    return (
      <div className={cn("max-w-3xl", isNarrow ? "p-4" : "p-8")}>
        {activeSection === 'appearance' && (
          <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.appearance.title')}</h2>

            {/* Language */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">{t('settings.appearance.languageTitle')}</h3>
              <p className="text-sm text-white/60 mb-6">
                {t('settings.appearance.languageDescription')}
              </p>

              <div className="max-w-sm">
                  <Select
                    value={locale}
                    onValueChange={(val) => {
                      setLocale(val);
                    }}
                  >
                    <SelectTrigger 
                      className="bg-black/20 border-white/10 text-white hover:bg-white/5 transition-colors"
                      style={{
                        '--ring': accentColor
                      } as React.CSSProperties}
                    >
                      <SelectValue placeholder={t('settings.appearance.languagePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent 
                      className="backdrop-blur-xl border-white/10 text-white"
                      style={{
                        backgroundColor: 'rgba(28, 28, 30, 0.95)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      {SUPPORTED_LOCALES.map((opt) => (
                        <SelectItem 
                          key={opt.locale} 
                          value={opt.locale}
                          className="focus:bg-white/10 focus:text-white data-[state=checked]:bg-(--active-bg)! data-[state=checked]:text-(--active-text)! cursor-pointer transition-colors"
                          style={{
                            '--active-bg': `${accentColor}15`,
                            '--active-text': accentColor
                          } as React.CSSProperties}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>

            {/* Wallpaper Selection */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">{t('settings.appearance.wallpaperTitle')}</h3>
              <p className="text-sm text-white/60 mb-6">
                {t('settings.appearance.wallpaperDescription')}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={cn(
                      "group relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                      wallpaper === wp.id
                        ? "border-white ring-2 ring-white/20 ring-offset-2 ring-offset-black/50"
                        : "border-transparent hover:border-white/50"
                    )}
                  >
                    <img
                      src={wp.src}
                      alt={wp.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={cn(
                      "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                      wallpaper === wp.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      {wallpaper === wp.id && (
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{t('settings.appearance.wallpaperActive')}</span>
                        </div>
                      )}
                      {wallpaper !== wp.id && (
                        <span className="text-xs font-bold text-white uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform">{t('settings.appearance.wallpaperUse')}</span>
                      )}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-linear-to-t from-black/80 to-transparent">
                      <span className="text-bg text-white/90 text-xs font-medium">{wp.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Section */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">{t('settings.appearance.accentTitle')}</h3>
              <p className="text-sm text-white/60 mb-6">
                {t('settings.appearance.accentDescription')}
              </p>

              {/* Preset Colors */}
              <div className="mb-6">
                <label className="text-sm text-white/80 mb-3 block">{t('settings.appearance.presetColors')}</label>
                <div className="grid grid-cols-4 gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setAccentColor(color.value);
                        setCustomColor(color.value);
                      }}
                      className={`relative w-full aspect-square rounded-lg transition-all ${accentColor === color.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800/40'
                        : 'hover:scale-105'
                        }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {accentColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              <div>
                <label className="text-sm text-white/80 mb-3 block">{t('settings.appearance.customColor')}</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      value={customColor}
                      onChange={handleCustomColorChange}
                      className="w-16 h-16 rounded-lg cursor-pointer border-none"
                      style={{ padding: 0, background: customColor }}
                    />
                  </div>
                  <div className="flex-1">
                    <GlassInput
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomColor(value);
                        if (/^#[0-9A-F]{6}$/i.test(value)) {
                          setAccentColor(value);
                        }
                      }}
                      placeholder="#3b82f6"
                      className="w-full"
                    />
                    <p className="text-xs text-white/40 mt-1">
                      {t('settings.appearance.customColorHint')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <label className="text-sm text-white/80 mb-3 block">{t('settings.appearance.preview')}</label>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg text-white transition-all w-1/2 aspect-3/1 flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    {t('settings.appearance.previewPrimary')}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg transition-all border-2 w-1/2 aspect-3/1 flex items-center justify-center"
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    {t('settings.appearance.previewOutlined')}
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Mode Section */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">{t('settings.appearance.themeModeTitle')}</h3>
              <p className="text-sm text-white/60 mb-6">
                {t('settings.appearance.themeModeDescription')}
              </p>

              <div className={cn("grid gap-4", isNarrow ? "grid-cols-1" : "grid-cols-3")}>
                <button
                  onClick={() => setThemeMode('neutral')}
                  className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col ${themeMode === 'neutral'
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 hover:border-white/20 bg-black/20'
                    }`}
                >
                  <div
                    className={cn("w-full rounded mb-3 border border-white/10 shrink-0", isNarrow ? "h-24" : "aspect-square")}
                    style={{
                      background: `linear-gradient(to bottom right, ${accentColor}20, #1f2937)`
                    }}
                  />
                  <div className="text-white text-sm font-medium mb-1">{t('settings.appearance.themeModeNeutralTitle')}</div>
                  <div className="text-white/50 text-xs text-left">{t('settings.appearance.themeModeNeutralDesc')}</div>
                </button>

                <button
                  onClick={() => setThemeMode('shades')}
                  className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col ${themeMode === 'shades'
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 hover:border-white/20 bg-black/20'
                    }`}
                >
                  <div
                    className={cn("w-full rounded mb-3 border border-white/10 shrink-0", isNarrow ? "h-24" : "aspect-square")}
                    style={{
                      background: `linear-gradient(to bottom right, ${accentColor}40, ${accentColor}80)`
                    }}
                  />
                  <div className="text-white text-sm font-medium mb-1">{t('settings.appearance.themeModeShadesTitle')}</div>
                  <div className="text-white/50 text-xs text-left">{t('settings.appearance.themeModeShadesDesc')}</div>
                </button>

                <button
                  onClick={() => setThemeMode('contrast')}
                  className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col ${themeMode === 'contrast'
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 hover:border-white/20 bg-black/20'
                    }`}
                >
                  <div
                    className={cn("w-full rounded mb-3 border border-white/10 shrink-0", isNarrow ? "h-24" : "aspect-square")}
                    style={{
                      background: `linear-gradient(to bottom right, ${accentColor}, ${getComplementaryColor(accentColor)})`
                    }}
                  />
                  <div className="text-white text-sm font-medium mb-1">{t('settings.appearance.themeModeContrastTitle')}</div>
                  <div className="text-white/50 text-xs text-left">{t('settings.appearance.themeModeContrastDesc')}</div>
                </button>
              </div>
            </div>

            {/* Theme Section */}
            <div className="bg-black/20 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">{t('settings.appearance.themeTitle')}</h3>
              <div className={cn("grid gap-4", isNarrow ? "grid-cols-1" : "grid-cols-2")}>
                <button className="p-4 rounded-lg bg-gray-900/50 border-2 border-white/20 hover:border-white/40 transition-all text-left group flex flex-col h-full">
                  <div
                    className="w-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded mb-3 shrink-0"
                    style={{ aspectRatio: '16/9' }}
                  />
                  <span className="text-white text-sm">{t('settings.appearance.themeDark')}</span>
                </button>
                <button className="p-4 rounded-lg bg-black/20 border border-white/10 hover:border-white/20 transition-all opacity-50 cursor-not-allowed text-left flex flex-col h-full">
                  <div
                    className="w-full bg-linear-to-br from-gray-100 to-gray-300 rounded mb-3 shrink-0"
                    style={{ aspectRatio: '16/9' }}
                  />
                  <span className="text-white/60 text-sm">{t('settings.appearance.themeLightSoon')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'performance' && (
          <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.performance')}</h2>
            {/* Blur & Transparency Toggle */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg text-white mb-1">{t('settings.performance.blurTitle')}</h3>
                  <p className="text-sm text-white/60">
                    {t('settings.performance.blurDescription')}
                  </p>
                </div>
                <Checkbox
                  checked={blurEnabled}
                  onCheckedChange={(checked) => setBlurEnabled(checked === true)}
                />
              </div>
            </div>
            {/* Reduce Motion Toggle */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg text-white mb-1">{t('settings.performance.reduceMotionTitle')}</h3>
                  <p className="text-sm text-white/60">
                    {t('settings.performance.reduceMotionDescription')}
                  </p>
                </div>
                <Checkbox
                  checked={reduceMotion}
                  onCheckedChange={(checked) => setReduceMotion(checked === true)}
                />
              </div>
            </div>
            {/* Disable Shadows Toggle */}
            <div className="bg-black/20 rounded-xl p-6 border border-white/5 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg text-white mb-1">{t('settings.performance.disableShadowsTitle')}</h3>
                  <p className="text-sm text-white/60">
                    {t('settings.performance.disableShadowsDescription')}
                  </p>
                </div>
                <Checkbox
                  checked={disableShadows}
                  onCheckedChange={(checked) => setDisableShadows(checked === true)}
                />
              </div>
            </div>
            {/* Disable Gradients Toggle */}
            <div className="bg-black/20 rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg text-white mb-1">{t('settings.performance.disableGradientsTitle')}</h3>
                  <p className="text-sm text-white/60">
                    {t('settings.performance.disableGradientsDescription')}
                  </p>
                </div>
                <Checkbox
                  checked={disableGradients}
                  onCheckedChange={(checked) => setDisableGradients(checked === true)}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'displays' && (
          <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.displays')}</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={Monitor}
                title={t('settings.placeholders.displaysTitle')}
                description={t('settings.placeholders.displaysDescription')}
              />
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.notifications')}</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={Bell}
                title={t('settings.placeholders.notificationsTitle')}
                description={t('settings.placeholders.notificationsDescription')}
              />
            </div>
          </div>
        )}

        {activeSection === 'network' && (
          <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.network')}</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={Wifi}
                title={t('settings.placeholders.networkTitle')}
                description={t('settings.placeholders.networkDescription')}
              />
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.security')}</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={Shield}
                title={t('settings.placeholders.securityTitle')}
                description={t('settings.placeholders.securityDescription')}
              />
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.users')}</h2>

            {/* User List */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-white">{t('settings.users.currentUsersTitle')}</h3>
                {canManageUsers && (
                  <GlassButton
                    onClick={() => setIsAddingUser(!isAddingUser)}
                    style={{ backgroundColor: isAddingUser ? undefined : accentColor }}
                    className={isAddingUser ? "bg-white/10" : ""}
                  >
                    {isAddingUser ? t('settings.users.cancel') : t('settings.users.addUser')}
                  </GlassButton>
                )}
              </div>

              {isAddingUser && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                  <h4 className="text-white text-sm font-medium">{t('settings.users.newUserDetails')}</h4>
                  <div className="grid gap-3">
                    <GlassInput
                      placeholder={t('settings.users.usernamePlaceholder')}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    />
                    <GlassInput
                      placeholder={t('settings.users.fullNamePlaceholder')}
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                    />
                    <GlassInput
                      type="password"
                      placeholder={t('settings.users.passwordOptionalPlaceholder')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <GlassInput
                      type="text"
                      placeholder={t('settings.users.passwordHintOptionalPlaceholder')}
                      value={newPasswordHint}
                      onChange={(e) => setNewPasswordHint(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <GlassButton
                      disabled={!newUsername || !newFullName}
                      onClick={() => {
                        if (addUser(newUsername, newFullName, newPassword, newPasswordHint, activeUser)) {
                          setNewUsername('');
                          setNewFullName('');
                          setNewPassword('');
                          setNewPasswordHint('');
                          setIsAddingUser(false);
                        } else {
                          // alert? using custom notify handling from calling code usually, but here just inline check
                          alert(t('settings.users.userExists'));
                        }
                      }}
                      style={{ backgroundColor: accentColor }}
                    >
                      {t('settings.users.createUser')}
                    </GlassButton>
                  </div>
                </div>
              )}


              <div className="space-y-3">
                {users.map((user) => {
                  const isAdmin =
                    user.uid === 0 ||
                    (user.groups?.some((g) => ['admin', 'root', 'wheel'].includes(g)) ?? false);
                  const isEditing = editingUser === user.username;
                  const canModify = canManageUsers;

                  return (
                    <div key={user.username} className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-lg">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium flex items-center gap-2">
                              {user.fullName}
                              {user.username === currentUser && (
                                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white/80">
                                  {t('settings.users.currentBadge')}
                                </span>
                              )}
                              {user.uid === 0 && (
                                <span className="text-xs bg-red-500/50 px-1.5 py-0.5 rounded text-white">
                                  {t('settings.users.rootBadge')}
                                </span>
                              )}
                              {user.uid !== 0 && isAdmin && (
                                <span className="text-xs bg-red-500/50 px-1.5 py-0.5 rounded text-white">
                                  {t('settings.users.adminBadge')}
                                </span>
                              )}
                            </div>
                            <div className="text-white/40 text-sm">
                              {user.username} • {user.homeDir}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {canModify && (
                            <GlassButton
                              onClick={() => {
                                if (isEditing) {
                                  setEditingUser(null);
                                } else {
                                  setEditingUser(user.username);
                                  setEditName(user.fullName);
                                  setEditPassword('');
                                  setEditHint(user.passwordHint || '');
                                  setEditIsAdmin(isAdmin);
                                }
                              }}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              {isEditing ? t('settings.users.cancel') : t('settings.users.editAction')}
                            </GlassButton>
                          )}

                          {canModify && user.uid >= 1000 && user.username !== 'user' && (
                            <button
                              onClick={() => {
                                if (confirm(t('settings.users.confirmDeleteUser', { username: user.username }))) {
                                  deleteUser(user.username, activeUser);
                                }
                              }}
                              className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Edit Form */}
                      {isEditing && (
                        <div className="p-4 bg-black/20 border-t border-white/5 space-y-3">
                          <div className="grid gap-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-white/40 mb-1 block">{t('settings.users.editForm.fullNameLabel')}</label>
                                <GlassInput value={editName} onChange={(e) => setEditName(e.target.value)} />
                              </div>
                              <div>
                                <label className="text-xs text-white/40 mb-1 block">{t('settings.users.editForm.roleLabel')}</label>
                                <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-white/10 bg-white/5">
                                  <Checkbox
                                    id={`admin-check-${user.username}`}
                                    checked={editIsAdmin}
                                    onCheckedChange={(c) => setEditIsAdmin(!!c)}
                                    disabled={user.uid === 0}
                                  />
                                  <label
                                    htmlFor={`admin-check-${user.username}`}
                                    className="text-sm text-white cursor-pointer select-none"
                                  >
                                    {t('settings.users.editForm.administrator')}
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-white/40 mb-1 block">{t('settings.users.editForm.newPasswordLabel')}</label>
                              <GlassInput
                                type="password"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="••••••••"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/40 mb-1 block">{t('settings.users.editForm.passwordHintLabel')}</label>
                              <GlassInput value={editHint} onChange={(e) => setEditHint(e.target.value)} />
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <GlassButton
                              onClick={() => {
                                updateUser(
                                  user.username,
                                  {
                                    fullName: editName,
                                    password: editPassword || undefined,
                                    passwordHint: editHint,
                                    isAdmin: editIsAdmin,
                                  },
                                  activeUser
                                );
                                setEditingUser(null);
                              }}
                              style={{ backgroundColor: accentColor }}
                            >
                              {t('settings.users.editForm.saveChanges')}
                            </GlassButton>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'storage' && (
          <div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.storage')}</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={HardDrive}
                title={t('settings.placeholders.storageTitle')}
                description={t('settings.placeholders.storageDescription')}
              />
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div>
            {/* yAMI OS Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <img 
                src="/yami-logo.jpg" 
                alt="yAMI OS Logo" 
                className="h-32 w-32 object-cover rounded-xl shadow-lg ring-2 ring-cyan-500/30 mb-4"
              />
              <h1 className="text-2xl font-bold text-white/90 tracking-tight">yAMI OS</h1>
              <p className="text-sm text-white/50 mt-1">Advanced Operating System</p>
            </div>
            <h2 className="text-2xl text-white mb-6">{t('settings.sections.about')} {pkg.build.productName}</h2>
            {/* System Info */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">System Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-white/60">{t('settings.about.version')}</span>
                  <span className="text-white font-mono text-sm">{pkg.version}</span>
                </div>
                {/* Dynamic Build Info */}
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-white/60">{t('settings.about.framework')}</span>
                  <span className="text-white text-right text-sm">React {React.version} + Vite</span>
                </div>
                {typeof process !== 'undefined' && process.versions && process.versions.electron ? (
                  <>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-white/60">{t('settings.about.electron')}</span>
                      <span className="text-white font-mono text-sm">{process.versions.electron}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-white/60">{t('settings.about.chrome')}</span>
                      <span className="text-white font-mono text-sm">{process.versions.chrome}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-white/60">{t('settings.about.node')}</span>
                      <span className="text-white font-mono text-sm">{process.versions.node}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-white/60">{t('settings.about.v8')}</span>
                      <span className="text-white font-mono text-sm">{process.versions.v8}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center gap-4 flex-wrap">
                    <span className="text-white/60">{t('settings.about.environment')}</span>
                    <span className="text-white text-right text-sm">{t('settings.about.browserMode')}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <span className="text-white block">{t('settings.about.developerMode')}</span>
                  <span className="text-white/60 text-sm">{t('settings.about.developerModeDescription')}</span>
                </div>
                <Checkbox
                  checked={devMode}
                  onCheckedChange={(checked) => setDevMode(checked === true)}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <span className="text-white block">{t('settings.about.exposeRootUser')}</span>
                  <span className="text-white/60 text-sm">{t('settings.about.exposeRootUserDescription')}</span>
                </div>
                <Checkbox
                  checked={exposeRoot}
                  onCheckedChange={(checked) => setExposeRoot(checked === true)}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">{t('settings.about.memoryUsage')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-white/60">{t('settings.about.preferencesSoft')}</span>
                  <span className="text-white text-right">{formatBytes(storageStats.softMemory.bytes)} ({storageStats.softMemory.keys} items)</span>
                </div>
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-white/60">{t('settings.about.filesystemHard')}</span>
                  <span className="text-white text-right">{formatBytes(storageStats.hardMemory.bytes)} ({storageStats.hardMemory.keys} items)</span>
                </div>
                <div className="flex justify-between items-center gap-4 flex-wrap border-t border-white/10 pt-3">
                  <span className="text-white/80 font-medium">{t('settings.about.total')}</span>
                  <span className="text-white font-medium text-right">{formatBytes(storageStats.total.bytes)}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone Accordion */}
            <Accordion type="single" collapsible className="bg-black/20 rounded-xl border border-red-500/30 overflow-hidden">
              <AccordionItem value="danger-zone" className="border-none">
                <AccordionTrigger className="w-full px-6! py-4 text-red-400 hover:no-underline hover:text-red-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-lg font-medium">{t('settings.danger.title')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6! pb-6">
                  <div className="space-y-6">
                    {/* Soft Reset */}
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-5 h-5 text-white" />
                        <h4 className="text-white font-medium">{t('settings.danger.softResetTitle')}</h4>
                      </div>
                      <p className="text-sm text-white/60 mb-4">
                        {t('settings.danger.softResetDescription')}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {!showSoftConfirm ? (
                          <GlassButton
                            onClick={() => setShowSoftConfirm(true)}
                            className="w-full sm:w-auto"
                            style={{ backgroundColor: accentColor }}
                          >
                            {t('settings.danger.resetPreferences')}
                          </GlassButton>
                        ) : (
                          <>
                            <GlassButton
                              onClick={() => setShowSoftConfirm(false)}
                              variant="ghost"
                              className="w-full sm:w-auto"
                            >
                              {t('settings.users.cancel')}
                            </GlassButton>
                            <GlassButton
                              onClick={() => {
                                softReset();
                                setShowSoftConfirm(false);
                                window.location.reload();
                              }}
                              className="w-full sm:w-auto"
                              style={{ backgroundColor: accentColor }}
                            >
                              {t('settings.danger.confirmReset')}
                            </GlassButton>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Hard Reset */}
                    <div className="bg-black/30 rounded-lg p-4 border border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <h4 className="text-white font-medium">{t('settings.danger.hardResetTitle')}</h4>
                      </div>
                      <p className="text-sm text-white/60 mb-2">
                        {t('settings.danger.hardResetDescription')}
                      </p>
                      <p className="text-sm text-red-400 mb-4">
                        {t('settings.danger.hardResetWarning')}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {!showHardConfirm ? (
                          <GlassButton
                            onClick={() => setShowHardConfirm(true)}
                            variant="danger"
                            className="w-full sm:w-auto"
                          >
                            {t('settings.danger.factoryReset')}
                          </GlassButton>
                        ) : (
                          <>
                            <GlassButton
                              onClick={() => setShowHardConfirm(false)}
                              variant="ghost"
                              className="w-full sm:w-auto"
                            >
                              {t('settings.users.cancel')}
                            </GlassButton>
                            <GlassButton
                              onClick={() => {
                                hardReset();
                                setShowHardConfirm(false);
                                window.location.reload();
                              }}
                              variant="danger"
                              className="w-full sm:w-auto"
                            >
                              {t('settings.danger.deleteEverything')}
                            </GlassButton>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppTemplate
      sidebar={settingsSidebar}
      content={content}
      activeItem={activeSection}
      onItemClick={setActiveSection}
      contentClassName="overflow-y-auto"
    />
  );
}

import { AppMenuConfig } from '../types';

export const settingsMenuConfig: AppMenuConfig = {
  menus: ['File', 'Edit', 'View', 'Window', 'Help'],
  items: {
    'File': [
      { label: 'Close Window', labelKey: 'menubar.items.closeWindow', shortcut: '⌘W', action: 'close-window' }
    ],
    'View': [
      { label: 'General', labelKey: 'settings.sidebar.general', action: 'view-general' },
      { label: 'Appearance', labelKey: 'settings.sidebar.appearance', action: 'view-appearance' },
      { label: 'Display', labelKey: 'settings.sidebar.display', action: 'view-display' }
    ]
  }
};
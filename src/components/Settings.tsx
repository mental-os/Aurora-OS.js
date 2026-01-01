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
import pkg from '../../package.json';
import defaultWallpaper from '../assets/images/background.png';
import orbitWallpaper from '../assets/images/wallpaper-orbit.png';
import meshWallpaper from '../assets/images/wallpaper-mesh.png';
import dunesWallpaper from '../assets/images/wallpaper-dunes.png';

const WALLPAPERS = [
  { id: 'default', name: 'Nebula', src: defaultWallpaper },
  { id: 'orbit', name: 'Orbit', src: orbitWallpaper },
  { id: 'mesh', name: 'Flux', src: meshWallpaper },
  { id: 'dunes', name: 'Midnight Dunes', src: dunesWallpaper },
];

const settingsSidebar = {
  sections: [
    {
      title: 'System',
      items: [
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'performance', label: 'Performance', icon: Zap },
        { id: 'displays', label: 'Displays', icon: Monitor },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'network', label: 'Network', icon: Wifi },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
        { id: 'users', label: 'Users & Groups', icon: User },
        { id: 'storage', label: 'Storage', icon: HardDrive },
      ]
    },
    {
      title: 'General',
      items: [
        { id: 'about', label: 'About', icon: Info },
      ]
    }
  ]
};

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

    window.addEventListener('aurora-open-settings-section', handleOpenSection as EventListener);
    return () => {
      window.removeEventListener('aurora-open-settings-section', handleOpenSection as EventListener);
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
    wallpaper,
    setWallpaper
  } = useAppContext();
  const { users, addUser, deleteUser, currentUser } = useFileSystem();
  const { activeUser: desktopUser } = useAppContext();
  const activeUser = owner || desktopUser;
  const [customColor, setCustomColor] = useState(accentColor);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordHint, setNewPasswordHint] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

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
            <h2 className="text-2xl text-white mb-6">Appearance</h2>

            {/* Wallpaper Selection */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">Desktop Wallpaper</h3>
              <p className="text-sm text-white/60 mb-6">
                Select a background for your desktop environment
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
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Active</span>
                        </div>
                      )}
                      {wallpaper !== wp.id && (
                        <span className="text-xs font-bold text-white uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform">Use</span>
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
              <h3 className="text-lg text-white mb-4">Accent Color</h3>
              <p className="text-sm text-white/60 mb-6">
                Choose an accent color to personalize your desktop experience
              </p>

              {/* Preset Colors */}
              <div className="mb-6">
                <label className="text-sm text-white/80 mb-3 block">Preset Colors</label>
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
                <label className="text-sm text-white/80 mb-3 block">Custom Color</label>
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
                      Enter a hex color code (e.g., #3b82f6)
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <label className="text-sm text-white/80 mb-3 block">Preview</label>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg text-white transition-all w-1/2 aspect-3/1 flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg transition-all border-2 w-1/2 aspect-3/1 flex items-center justify-center"
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    Outlined
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Mode Section */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">Theme Mode</h3>
              <p className="text-sm text-white/60 mb-6">
                Choose how the accent color affects background tints
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
                  <div className="text-white text-sm font-medium mb-1">Neutral</div>
                  <div className="text-white/50 text-xs text-left">Natural grays only</div>
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
                  <div className="text-white text-sm font-medium mb-1">Shades</div>
                  <div className="text-white/50 text-xs text-left">Accent color tints</div>
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
                  <div className="text-white text-sm font-medium mb-1">Contrast</div>
                  <div className="text-white/50 text-xs text-left">Complementary colors</div>
                </button>
              </div>
            </div>

            {/* Theme Section */}
            <div className="bg-black/20 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">Theme</h3>
              <div className={cn("grid gap-4", isNarrow ? "grid-cols-1" : "grid-cols-2")}>
                <button className="p-4 rounded-lg bg-gray-900/50 border-2 border-white/20 hover:border-white/40 transition-all text-left group flex flex-col h-full">
                  <div
                    className="w-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded mb-3 shrink-0"
                    style={{ aspectRatio: '16/9' }}
                  />
                  <span className="text-white text-sm">Dark</span>
                </button>
                <button className="p-4 rounded-lg bg-black/20 border border-white/10 hover:border-white/20 transition-all opacity-50 cursor-not-allowed text-left flex flex-col h-full">
                  <div
                    className="w-full bg-linear-to-br from-gray-100 to-gray-300 rounded mb-3 shrink-0"
                    style={{ aspectRatio: '16/9' }}
                  />
                  <span className="text-white/60 text-sm">Light (Coming Soon)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'performance' && (
          <div>
            <h2 className="text-2xl text-white mb-6">Performance</h2>
            {/* Blur & Transparency Toggle */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg text-white mb-1">Blur & Transparency</h3>
                  <p className="text-sm text-white/60">
                    Enable glass blur effect and window transparency
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
                  <h3 className="text-lg text-white mb-1">Reduce Motion</h3>
                  <p className="text-sm text-white/60">
                    Disable animations for faster response and accessibility
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
                  <h3 className="text-lg text-white mb-1">Disable Shadows</h3>
                  <p className="text-sm text-white/60">
                    Remove window shadows to improve rendering performance
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
                  <h3 className="text-lg text-white mb-1">Disable Gradients</h3>
                  <p className="text-sm text-white/60">
                    Use solid colors instead of gradients for icons
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
            <h2 className="text-2xl text-white mb-6">Displays</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={Monitor}
                title="Display Settings"
                description="Resolution, scaling, and brightness controls coming soon."
              />
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div>
            <h2 className="text-2xl text-white mb-6">Notifications</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={Bell}
                title="Notifications"
                description="Notification center preferences coming soon."
              />
            </div>
          </div>
        )}

        {activeSection === 'network' && (
          <div>
            <h2 className="text-2xl text-white mb-6">Network</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={Wifi}
                title="Network"
                description="Wi-Fi and Bluetooth configurations coming soon."
              />
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div>
            <h2 className="text-2xl text-white mb-6">Security & Privacy</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={Shield}
                title="Security & Privacy"
                description="Firewall, permissions, and privacy settings coming soon."
              />
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div>
            <h2 className="text-2xl text-white mb-6">Users & Groups</h2>

            {/* User List */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-white">Current Users</h3>
                <GlassButton
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  style={{ backgroundColor: isAddingUser ? undefined : accentColor }}
                  className={isAddingUser ? "bg-white/10" : ""}
                >
                  {isAddingUser ? 'Cancel' : 'Add User'}
                </GlassButton>
              </div>

              {isAddingUser && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                  <h4 className="text-white text-sm font-medium">New User Details</h4>
                  <div className="grid gap-3">
                    <GlassInput
                      placeholder="Username (e.g. alice)"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    />
                    <GlassInput
                      placeholder="Full Name"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                    />
                    <GlassInput
                      type="password"
                      placeholder="Password (optional)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <GlassInput
                      type="text"
                      placeholder="Password Hint (optional)"
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
                          alert('User already exists');
                        }
                      }}
                      style={{ backgroundColor: accentColor }}
                    >
                      Create User
                    </GlassButton>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.username} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          {user.fullName}
                          {user.username === currentUser && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white/80">Current</span>}
                          {user.uid === 0 && <span className="text-xs bg-red-500/50 px-1.5 py-0.5 rounded text-white">Root</span>}
                        </div>
                        <div className="text-white/40 text-sm">
                          {user.username} • UID: {user.uid} • {user.homeDir}
                        </div>
                      </div>
                    </div>

                    {user.uid >= 1000 && user.username !== 'user' && ( // Prevent deleting default 'user' or root for safety
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${user.username}?`)) {
                            deleteUser(user.username, activeUser);
                          }
                        }}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'storage' && (
          <div>
            <h2 className="text-2xl text-white mb-6">Storage</h2>
            <div className="bg-black/20 rounded-xl border border-white/5">
              <EmptyState
                icon={HardDrive}
                title="Storage"
                description="Disk usage analysis and management coming soon."
              />
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div>
            <h2 className="text-2xl text-white mb-6">About {pkg.build.productName}</h2>
            {/* System Info */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">System Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-white/60">Version</span>
                  <span className="text-white font-mono text-sm">{pkg.version}</span>
                </div>
                {/* Dynamic Build Info */}
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-white/60">Framework</span>
                  <span className="text-white text-right text-sm">React {React.version} + Vite</span>
                </div>
                {typeof process !== 'undefined' && process.versions && process.versions.electron ? (
                  <>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-white/60">Electron</span>
                      <span className="text-white font-mono text-sm">{process.versions.electron}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-white/60">Chrome</span>
                      <span className="text-white font-mono text-sm">{process.versions.chrome}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-white/60">Node.js</span>
                      <span className="text-white font-mono text-sm">{process.versions.node}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <span className="text-white/60">V8</span>
                      <span className="text-white font-mono text-sm">{process.versions.v8}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center gap-4 flex-wrap">
                    <span className="text-white/60">Environment</span>
                    <span className="text-white text-right text-sm">Browser Mode</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <span className="text-white block">Developer Mode</span>
                  <span className="text-white/60 text-sm">Enable advanced tools and debug features</span>
                </div>
                <Checkbox
                  checked={devMode}
                  onCheckedChange={(checked) => setDevMode(checked === true)}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <span className="text-white block">Expose Root User</span>
                  <span className="text-white/60 text-sm">Show root user on login screen</span>
                </div>
                <Checkbox
                  checked={exposeRoot}
                  onCheckedChange={(checked) => setExposeRoot(checked === true)}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg text-white mb-4">Memory Usage</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-white/60">Preferences (Soft Memory)</span>
                  <span className="text-white text-right">{formatBytes(storageStats.softMemory.bytes)} ({storageStats.softMemory.keys} items)</span>
                </div>
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-white/60">Filesystem (Hard Memory)</span>
                  <span className="text-white text-right">{formatBytes(storageStats.hardMemory.bytes)} ({storageStats.hardMemory.keys} items)</span>
                </div>
                <div className="flex justify-between items-center gap-4 flex-wrap border-t border-white/10 pt-3">
                  <span className="text-white/80 font-medium">Total</span>
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
                    <span className="text-lg font-medium">Danger Zone</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6! pb-6">
                  <div className="space-y-6">
                    {/* Soft Reset */}
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-5 h-5 text-white" />
                        <h4 className="text-white font-medium">Soft Reset</h4>
                      </div>
                      <p className="text-sm text-white/60 mb-4">
                        Resets preferences, theme settings, desktop icon positions, and app states.
                        Your files and folders will be preserved.
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {!showSoftConfirm ? (
                          <GlassButton
                            onClick={() => setShowSoftConfirm(true)}
                            className="w-full sm:w-auto"
                            style={{ backgroundColor: accentColor }}
                          >
                            Reset Preferences
                          </GlassButton>
                        ) : (
                          <>
                            <GlassButton
                              onClick={() => setShowSoftConfirm(false)}
                              variant="ghost"
                              className="w-full sm:w-auto"
                            >
                              Cancel
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
                              Confirm Reset
                            </GlassButton>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Hard Reset */}
                    <div className="bg-black/30 rounded-lg p-4 border border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <h4 className="text-white font-medium">Hard Reset</h4>
                      </div>
                      <p className="text-sm text-white/60 mb-2">
                        Completely wipes all data including files, folders, and settings.
                        This action cannot be undone.
                      </p>
                      <p className="text-sm text-red-400 mb-4">
                        ⚠️ All custom files and folders will be permanently deleted
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {!showHardConfirm ? (
                          <GlassButton
                            onClick={() => setShowHardConfirm(true)}
                            variant="danger"
                            className="w-full sm:w-auto"
                          >
                            Factory Reset
                          </GlassButton>
                        ) : (
                          <>
                            <GlassButton
                              onClick={() => setShowHardConfirm(false)}
                              variant="ghost"
                              className="w-full sm:w-auto"
                            >
                              Cancel
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
                              Yes, Delete Everything
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
      { label: 'Close Window', shortcut: '⌘W', action: 'close-window' }
    ],
    'View': [
      { label: 'General', action: 'view-general' },
      { label: 'Appearance', action: 'view-appearance' },
      { label: 'Display', action: 'view-display' }
    ]
  }
};
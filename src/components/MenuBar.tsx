import { useState, useRef, useEffect, memo } from 'react';
import pkg from '../../package.json';
import { Orbit, Wifi, Battery } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { CreditsDrawer } from './Credits/CreditsDrawer';
import { cn } from './ui/utils';
import { useAppContext } from './AppContext';
import { useFileSystem } from './FileSystemContext';
import { AudioApplet } from './AudioApplet';
import { NotificationCenter } from './NotificationCenter';
import { hardReset, clearSession } from '../utils/memory';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from './ui/menubar';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import { getApp } from '../config/appRegistry';
import { useI18n } from '../i18n';

interface MenuBarProps {
  focusedApp?: string | null;
  onOpenApp?: (type: string, data?: any, owner?: string) => void;
}

function MenuBarComponent({ focusedApp, onOpenApp }: MenuBarProps) {
  const { menuBarBackground, blurStyle, getBackgroundColor } = useThemeColors();
  const { devMode, disableShadows, setIsLocked, locale } = useAppContext();
  const { logout, currentUser } = useFileSystem();
  const { t } = useI18n();
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  );

  const [currentDate, setCurrentDate] = useState(() =>
    new Date().toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  );

  // Hidden Credits Trigger
  const [showCredits, setShowCredits] = useState(false);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handleSystemClick = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current > 2000) {
      // Reset if too slow
      clickCountRef.current = 0;
    }

    lastClickTimeRef.current = now;
    clickCountRef.current++;

    if (clickCountRef.current >= 6) {
      setShowCredits(true);
      clickCountRef.current = 0;
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
      setCurrentDate(now.toLocaleDateString(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [locale]);

  // Get the menu config for the focused app
  const activeApp = focusedApp ? getApp(focusedApp) : getApp('finder');
  const appConfig = {
    name: activeApp?.name || 'Finder',
    menus: activeApp?.menu?.menus || ['File', 'Edit', 'View', 'Go', 'Window', 'Help'],
    items: activeApp?.menu?.items
  };

  const menuNameToKey: Record<string, string> = {
    'File': 'menubar.menus.file',
    'Shell': 'menubar.menus.shell',
    'Edit': 'menubar.menus.edit',
    'Format': 'menubar.menus.format',
    'Song': 'menubar.menus.song',
    'View': 'menubar.menus.view',
    'Go': 'menubar.menus.go',
    'Controls': 'menubar.menus.controls',
    'Window': 'menubar.menus.window',
    'Help': 'menubar.menus.help',
    'Image': 'menubar.menus.image',
    'Tools': 'menubar.menus.tools',
    'Conversations': 'menubar.menus.conversations',
    'Store': 'menubar.menus.store',
    'History': 'menubar.menus.history',
    'Bookmarks': 'menubar.menus.bookmarks',
    'Mailbox': 'menubar.menus.mailbox',
    'Message': 'menubar.menus.message',
    'DEV Center': 'menubar.menus.devCenter'
  };

  const getMenuDisplayName = (menuName: string) => {
    const key = menuNameToKey[menuName];
    return key ? t(key) : menuName;
  };

  // Add "DEV Center" to Finder menus if devMode is enabled
  const menuLabels = (appConfig.name === 'Finder' && devMode)
    ? [...appConfig.menus, 'DEV Center']
    : appConfig.menus;

  // Render dummy menu content for now, can be expanded to be real later
  const renderMenuContent = (menuName: string) => {
    // 1. Render App-Specific Custom Items
    if (appConfig.items && appConfig.items[menuName]) {
      return (
        <>
          {appConfig.items[menuName].map((item, idx) => {
            if (item.type === 'separator') {
              return <MenubarSeparator key={idx} />;
            }

            const label = item.labelKey
              ? t(item.labelKey, { appName: appConfig.name })
              : (item.label ?? '');

            return (
              <MenubarItem
                key={idx}
                disabled={item.disabled}
                onClick={() => {
                  if (item.action) {
                    window.dispatchEvent(new CustomEvent('app-menu-action', {
                      detail: {
                        action: item.action,
                        appId: activeApp?.id
                      }
                    }));
                  }
                }}
              >
                {label}
                {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
              </MenubarItem>
            );
          })}
        </>
      );
    }

    // 2. Default Fallbacks (if no custom items provided for this menu)
    switch (menuName) {
      case 'File':
        return (
          <>
            <MenubarItem>{t('menubar.items.newWindow')} <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
            <MenubarItem>{t('menubar.items.closeWindow')} <MenubarShortcut>⌘W</MenubarShortcut></MenubarItem>
          </>
        );
      case 'Edit':
        return (
          <>
            <MenubarItem>{t('menubar.items.undo')} <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
            <MenubarItem>{t('menubar.items.redo')} <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>{t('menubar.items.cut')} <MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
            <MenubarItem>{t('menubar.items.copy')} <MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
            <MenubarItem>{t('menubar.items.paste')} <MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
            <MenubarItem>{t('menubar.items.selectAll')} <MenubarShortcut>⌘A</MenubarShortcut></MenubarItem>
          </>
        );
      case 'View':
        return (
          <>
            <MenubarItem>{t('menubar.items.reload')} <MenubarShortcut>⌘R</MenubarShortcut></MenubarItem>
            <MenubarItem>{t('menubar.items.toggleFullscreen')} <MenubarShortcut>F11</MenubarShortcut></MenubarItem>
          </>
        );
      case 'Window':
        return (
          <>
            <MenubarItem>{t('menubar.items.minimize')} <MenubarShortcut>⌘M</MenubarShortcut></MenubarItem>
            <MenubarItem>{t('menubar.items.bringAllToFront')}</MenubarItem>
          </>
        );
      case 'Help':
        return (
          <>
            <MenubarItem>{t('menubar.help.appHelp', { appName: appConfig.name })}</MenubarItem>
          </>
        );
      default:
        return (
          <MenubarItem disabled>{t('menubar.default.featureNotImplemented')}</MenubarItem>
        );
    }
  };


  return (
    <div
      className={cn("absolute top-0 left-0 right-0 h-7 border-b border-white/10 flex items-center justify-between px-2 z-[9999]")}
      style={{ background: menuBarBackground, ...blurStyle }}
    >
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Menubar className="border-none bg-transparent h-auto p-0 space-x-1">
          <MenubarMenu>
            <MenubarTrigger
              className="bg-transparent focus:bg-white/10 data-[state=open]:bg-white/10 px-2 py-0.5 h-7 rounded-sm cursor-default"
              onClick={handleSystemClick}
            >
              <Orbit className="w-4 h-4 text-white/90" />
            </MenubarTrigger>

            {/* Hidden Credits Drawer */}
            <CreditsDrawer isOpen={showCredits} onClose={() => setShowCredits(false)} />

            <MenubarContent
              className={cn("border-white/10 text-white min-w-[14rem] p-1 z-[10000]", !disableShadows ? "shadow-xl" : "shadow-none")}
              style={{ background: getBackgroundColor(0.8), ...blurStyle }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => {
                    // Direct link to About section
                    sessionStorage.setItem('settings-pending-section', 'about');
                    window.dispatchEvent(new CustomEvent('aurora-open-settings-section', { detail: 'about' }));
                    onOpenApp?.('settings');
                  }}>
                      {t('menubar.system.aboutThisComputer')}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                    <p>{t('menubar.system.viewSystemInfo')}</p>
                </TooltipContent>
              </Tooltip>
              <MenubarSeparator className="bg-white/10" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => onOpenApp?.('settings')}>
                      {t('menubar.system.systemSettings')}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                    <p>{t('menubar.system.viewSystemSettings')}</p>
                </TooltipContent>
              </Tooltip>
              <MenubarItem onClick={() => onOpenApp?.('appstore')}>
                  {t('menubar.system.appStore')}
              </MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => {
                    // Lock Screen -> Overlay LoginScreen but KEEP session
                    setIsLocked(true);
                  }}>
                    {t('menubar.system.lockScreen')}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{t('menubar.system.returnToLoginWhile')} <b>{t('menubar.system.keepingSession')}</b></p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => {
                    // Switch User -> Logout to suspend, keep storage
                    logout();
                  }}>
                    {t('menubar.system.switchUser')}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{t('menubar.system.returnToUserSelectionWhile')} <b>{t('menubar.system.keepingSession')}</b></p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => {
                    // Log Out -> Clear windows session
                    if (currentUser) {
                      clearSession(currentUser);
                    }
                    logout();
                  }}>
                    {t('menubar.system.logOutAs', { username: currentUser ? currentUser : t('menubar.system.user') })}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{t('menubar.system.returnToUserSelectionWhile')} <b>{t('menubar.system.clearingSession')}</b></p>
                </TooltipContent>
              </Tooltip>
              <MenubarSeparator className="bg-white/10" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem
                    onClick={() => {
                      // Hard Reset -> PANIC
                      hardReset();
                      window.location.reload();
                    }}
                    className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                  >
                    <span className="flex-1 text-left">{t('menubar.system.panic')}</span>
                    <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1.5">{t('menubar.system.hardReset')}</Badge>
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p><b>{t('menubar.system.warning')}:</b> {t('menubar.system.panicWarningBody', { productName: pkg.build.productName })}</p>
                </TooltipContent>
              </Tooltip>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="font-semibold text-xs px-0 data-[state=open]:text-white focus:text-white rounded-sm h-7 items-center flex transition-colors hover:text-white/80">
              {appConfig.name}
            </MenubarTrigger>
            <MenubarContent
              className={cn("border-white/10 text-white min-w-[14rem] p-1 z-[10000]", !disableShadows ? "shadow-xl" : "shadow-none")}
              style={{ background: getBackgroundColor(0.8), ...blurStyle }}
            >
              <MenubarItem>{t('menubar.app.aboutApp', { appName: appConfig.name })}</MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <MenubarItem>{t('menubar.app.settings')}</MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <MenubarItem>{t('menubar.app.quitApp', { appName: appConfig.name })}</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {menuLabels.map((menu) => (
            <MenubarMenu key={menu}>
              <MenubarTrigger
                className={cn(
                  "px-0 text-xs h-7 items-center flex transition-colors rounded-sm",
                  "text-white/70 hover:text-white data-[state=open]:text-white focus:text-white"
                )}
                onClick={() => {
                  if (menu === 'DEV Center') {
                    onOpenApp?.('dev-center');
                  }
                }}
              >
                {getMenuDisplayName(menu)}
              </MenubarTrigger>
              {menu !== 'DEV Center' && (
                <MenubarContent
                  className={cn("border-white/10 text-white min-w-[12rem] p-1 z-[10000]", !disableShadows ? "shadow-xl" : "shadow-none")}
                  style={{ background: getBackgroundColor(0.8), ...blurStyle }}
                >
                  {renderMenuContent(menu)}
                </MenubarContent>
              )}
            </MenubarMenu>
          ))}
        </Menubar>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 px-2">
        <button className="text-white/90 hover:text-white transition-colors">
          <Battery className="w-4 h-4" />
        </button>
        <button className="text-white/90 hover:text-white transition-colors">
          <Wifi className="w-4 h-4" />
        </button>
        <AudioApplet />
        <NotificationCenter />

        <div className="text-white/90 text-xs font-medium flex items-center gap-2">
          <span>{currentDate}</span>
          <span>{currentTime}</span>
        </div>
      </div>
    </div >
  );
}

export const MenuBar = memo(MenuBarComponent);
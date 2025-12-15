import { useState, useEffect, memo } from 'react';
import { Apple, Wifi, Battery } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
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

interface MenuBarProps {
  focusedApp?: string | null;
  onOpenApp?: (appId: string) => void;
}

// App-specific menu configurations
const appMenus: Record<string, { name: string; menus: string[] }> = {
  finder: { name: 'Finder', menus: ['File', 'Edit', 'View', 'Go', 'Window', 'Help'] },
  settings: { name: 'System Settings', menus: ['File', 'Edit', 'View', 'Window', 'Help'] },
  photos: { name: 'Photos', menus: ['File', 'Edit', 'Image', 'View', 'Window', 'Help'] },
  music: { name: 'Music', menus: ['File', 'Edit', 'Song', 'View', 'Controls', 'Window', 'Help'] },
  messages: { name: 'Messages', menus: ['File', 'Edit', 'View', 'Conversations', 'Window', 'Help'] },
  browser: { name: 'Browser', menus: ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window', 'Help'] },
  terminal: { name: 'Terminal', menus: ['Shell', 'Edit', 'View', 'Window', 'Help'] },
  videos: { name: 'Videos', menus: ['File', 'Edit', 'View', 'Playback', 'Window', 'Help'] },
  calendar: { name: 'Calendar', menus: ['File', 'Edit', 'View', 'Window', 'Help'] },
  notes: { name: 'Notes', menus: ['File', 'Edit', 'Format', 'View', 'Window', 'Help'] },
  mail: { name: 'Mail', menus: ['File', 'Edit', 'View', 'Mailbox', 'Message', 'Window', 'Help'] },
  'dev-center': { name: 'DevCenter', menus: ['File', 'Edit', 'View', 'Window', 'Help'] },
};

const defaultMenus = { name: 'Finder', menus: ['File', 'Edit', 'View', 'Go', 'Window', 'Help'] };

function MenuBarComponent({ focusedApp, onOpenApp }: MenuBarProps) {
  const { menuBarBackground, blurStyle, getBackgroundColor } = useThemeColors();
  const { devMode, disableShadows, setIsLocked } = useAppContext();
  const { logout, currentUser } = useFileSystem();
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  );

  const [currentDate, setCurrentDate] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get the menu config for the focused app
  const appConfig = focusedApp ? appMenus[focusedApp] || defaultMenus : defaultMenus;

  // Add "DEV Center" to Finder menus if devMode is enabled
  const menuLabels = (appConfig.name === 'Finder' && devMode)
    ? [...appConfig.menus, 'DEV Center'] // Keep existing logic for top-level item if needed, though usually this is an app, not a top-level menu
    : appConfig.menus;

  // Render dummy menu content for now, can be expanded to be real later
  const renderMenuContent = (menuName: string) => {
    switch (menuName) {
      case 'File':
        return (
          <>
            <MenubarItem>New Window <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
            <MenubarItem>Open... <MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Close Window <MenubarShortcut>⌘W</MenubarShortcut></MenubarItem>
          </>
        );
      case 'Edit':
        return (
          <>
            <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
            <MenubarItem>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Cut <MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
            <MenubarItem>Copy <MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
            <MenubarItem>Paste <MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
            <MenubarItem>Select All <MenubarShortcut>⌘A</MenubarShortcut></MenubarItem>
          </>
        );
      case 'View':
        return (
          <>
            <MenubarItem>Reload <MenubarShortcut>⌘R</MenubarShortcut></MenubarItem>
            <MenubarItem>Toggle Fullscreen <MenubarShortcut>F11</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Actual Size <MenubarShortcut>⌘0</MenubarShortcut></MenubarItem>
            <MenubarItem>Zoom In <MenubarShortcut>⌘+</MenubarShortcut></MenubarItem>
            <MenubarItem>Zoom Out <MenubarShortcut>⌘-</MenubarShortcut></MenubarItem>
          </>
        );
      case 'Window':
        return (
          <>
            <MenubarItem>Minimize <MenubarShortcut>⌘M</MenubarShortcut></MenubarItem>
            <MenubarItem>Zoom</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Bring All to Front</MenubarItem>
          </>
        );
      case 'Help':
        return (
          <>
            <MenubarItem>{appConfig.name} Help</MenubarItem>
          </>
        );
      default:
        return (
          <MenubarItem>Feature not implemented</MenubarItem>
        );
    }
  };


  return (
    <div
      className={cn("absolute top-0 left-0 right-0 h-7 border-b border-white/10 flex items-center justify-between px-2 z-[9999]")}
      style={{ background: menuBarBackground, ...blurStyle }}
    >
      {/* Left side */}
      <div className="flex items-center gap-1">
        <Menubar className="border-none bg-transparent h-7 p-0 space-x-0 shadow-none gap-4">
          <MenubarMenu>
            <MenubarTrigger className="px-0 w-8 justify-center data-[state=open]:bg-white/10 data-[state=open]:text-white focus:bg-white/10 focus:text-white rounded-md h-7 items-center flex">
              <Apple className="w-4 h-4 fill-current" />
            </MenubarTrigger>
            <MenubarContent
              className={cn("border-white/10 text-white min-w-[14rem] p-1 z-[10000]", !disableShadows ? "shadow-xl" : "shadow-none")}
              style={{ background: getBackgroundColor(0.8), ...blurStyle }}
            >
              <MenubarItem onClick={() => {
                // Direct link to About section
                sessionStorage.setItem('settings-pending-section', 'about');
                window.dispatchEvent(new CustomEvent('aurora-open-settings-section', { detail: 'about' }));
                onOpenApp?.('settings');
              }}>
                <Tooltip>
                  <TooltipTrigger className="w-full text-left">About This Computer...</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <p>View system information</p>
                  </TooltipContent>
                </Tooltip>
                {/* <MenubarShortcut>⌘M</MenubarShortcut> */}
              </MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <MenubarItem onClick={() => onOpenApp?.('settings')}>
                <Tooltip>
                  <TooltipTrigger className="w-full text-left">System Settings...</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <p>View system settings</p>
                  </TooltipContent>
                </Tooltip>
              </MenubarItem>
              <MenubarItem>App Store...<MenubarShortcut>Soon</MenubarShortcut></MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <MenubarItem onClick={() => {
                // Lock Screen -> Overlay LoginScreen but KEEP session
                setIsLocked(true);
              }}>
                <Tooltip>
                  <TooltipTrigger className="w-full text-left">Lock Screen</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <p>Return to login screen while <b>keeping session</b></p>
                  </TooltipContent>
                </Tooltip>
              </MenubarItem>
              <MenubarItem onClick={() => {
                // Switch User -> Logout to suspend, keep storage
                logout();
              }}>
                <Tooltip>
                  <TooltipTrigger className="w-full text-left">Switch User...</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <p>Return to user selection screen while <b>keeping session</b></p>
                  </TooltipContent>
                </Tooltip>
              </MenubarItem>
              <MenubarItem onClick={() => {
                // Log Out -> Clear windows session
                if (currentUser) {
                  clearSession(currentUser);
                }
                logout();
              }}>
                <Tooltip>
                  <TooltipTrigger className="w-full text-left">Log Out {currentUser ? currentUser : 'User'}...</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <p>Return to user selection screen while <b>clearing session</b></p>
                  </TooltipContent>
                </Tooltip>
              </MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <MenubarItem
                onClick={() => {
                  // Hard Reset -> PANIC
                  hardReset();
                  window.location.reload();
                }}
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <Tooltip>
                  <TooltipTrigger className="w-full text-left">PANIC</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <p><b>Warning:</b> This will reset AuroraOS to factory defaults. Good as a panic button if something goes wrong, too.</p>
                  </TooltipContent>
                </Tooltip>
                <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1.5">Hard Reset</Badge>
              </MenubarItem>
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
              <MenubarItem>About {appConfig.name}</MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <MenubarItem>Settings...</MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <MenubarItem>Quit {appConfig.name}</MenubarItem>
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
                {menu}
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
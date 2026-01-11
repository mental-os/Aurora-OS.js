import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useElementSize } from '../../hooks/useElementSize';
import { cn } from '../ui/utils';
import { LAYOUT_CONFIG } from '../../config/layout';

interface AppTemplateProps {
  sidebar?: {
    sections: {
      title: string;
      items: {
        id: string;
        label: string;
        icon: LucideIcon;
        badge?: string;
        action?: () => void;
        // Drag and drop support
        onDrop?: (e: React.DragEvent) => void;
        onDragOver?: (e: React.DragEvent) => void;
        onDragLeave?: (e: React.DragEvent) => void;
      }[];
    }[];
  };
  toolbar?: ReactNode;
  content: ReactNode | ((props: { width: number, contentWidth: number, isSidebarCompact: boolean }) => ReactNode);
  hasSidebar?: boolean;
  className?: string;
  contentClassName?: string;
  toolbarClassName?: string;
  activeItem?: string;
  onItemClick?: (id: string) => void;
  sidebarCollapseBreakpoint?: number;
  minContentWidth?: number;
  style?: React.CSSProperties;
}

export function AppTemplate({
  sidebar,
  toolbar,
  content,
  hasSidebar = true,
  className,
  contentClassName,
  toolbarClassName,
  activeItem,
  onItemClick,
  sidebarCollapseBreakpoint,
  minContentWidth,
  style
}: AppTemplateProps) {
  const { accentColor } = useAppContext();
  const { windowBackground, sidebarBackground, titleBarBackground, blurStyle } = useThemeColors();
  const [containerRef, { width }] = useElementSize();

  // Calculate breakpoint: either redundant usage of sidebarCollapseBreakpoint or derived from minContentWidth
  // Default to 500 if neither is provided.
  // Sidebar width is w-64 (256px) when expanded.
  const SIDEBAR_WIDTH = LAYOUT_CONFIG.SIDEBAR.WIDTH_EXPANDED;
  const effectiveBreakpoint = sidebarCollapseBreakpoint ?? (minContentWidth ? minContentWidth + SIDEBAR_WIDTH : LAYOUT_CONFIG.SIDEBAR.BREAKPOINT_OFFSET);

  // Explicit breakpoint for collapsing sidebar
  // Treat 0 (loading) as expanded to prevent expansion animation on desktop
  const isCompact = width === 0 ? false : width < effectiveBreakpoint;

  // Calculate actual content width available
  const sidebarWidth = hasSidebar && sidebar
    ? (isCompact ? LAYOUT_CONFIG.SIDEBAR.WIDTH_COMPACT : LAYOUT_CONFIG.SIDEBAR.WIDTH_EXPANDED)
    : 0;
  const contentWidth = width - sidebarWidth;

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col h-full select-none", className)}
      style={{ background: windowBackground, ...blurStyle, ...style }}
    >
      {/* Toolbar */}
      {toolbar && (
        <div
          className={cn("h-12 border-b border-white/10 flex items-center px-4 shrink-0", toolbarClassName)}
          style={{ background: titleBarBackground, ...blurStyle }}
        >
          {toolbar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {hasSidebar && sidebar && (
          <div
            className={cn(
              "border-r border-white/10 py-3 px-2 overflow-y-auto transition-all duration-300 ease-in-out shrink-0",
              isCompact ? "w-16 items-center" : "w-64"
            )}
            style={{ background: sidebarBackground, ...blurStyle }}
          >
            {sidebar.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-4' : ''}>
                {section.title && !isCompact && (
                  <div className="px-3 py-1 text-xs text-white/40 mb-1 truncate">
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.action ? item.action() : onItemClick?.(item.id)}
                      onDrop={item.onDrop}
                      onDragOver={item.onDragOver}
                      onDragLeave={item.onDragLeave}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-md transition-colors group",
                        isCompact ? "justify-center" : "justify-start",
                        activeItem === item.id
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/5"
                      )}
                      title={isCompact ? item.label : undefined}
                      style={{
                        '--accent-color': accentColor,
                      } as React.CSSProperties}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0",
                        activeItem === item.id ? "text-white" : "text-white/50 group-hover:text-white/70"
                      )} />
                      {!isCompact && (
                        <>
                          <span className="flex-1 text-left truncate transition-opacity duration-200">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className="text-xs transition-opacity duration-200 font-medium text-white/40"
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className={cn("flex-1 flex flex-col min-h-0", contentClassName)}>
          {typeof content === 'function' ? content({ width, contentWidth, isSidebarCompact: isCompact }) : content}
        </div>
      </div>
    </div >
  );
}

/**
 * Base layout component for websites
 * Provides common structure and styling
 */

import { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

interface WebsiteLayoutProps {
  children: ReactNode;
  className?: string;
  bg?: string;
}

export function WebsiteLayout({
  children,
  className,
  bg = "bg-white",
}: WebsiteLayoutProps) {
  return (
    <div className={cn('@container min-h-full w-full', bg, className)}>
      {children}
    </div>
  );
}

interface WebsiteHeaderProps {
  logo?: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  bg?: string;
  border?: boolean;
}

export function WebsiteHeader({
  logo,
  nav,
  actions,
  bg = "bg-white",
  border = true,
}: WebsiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-6 py-4 flex items-center justify-between gap-6",
        bg,
        border && "border-b border-gray-200",
      )}
    >
      {logo && <div className="shrink-0">{logo}</div>}
      {nav && <nav className="flex-1">{nav}</nav>}
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}

interface WebsiteFooterProps {
  children: ReactNode;
  bg?: string;
}

export function WebsiteFooter({
  children,
  bg = "bg-gray-50",
}: WebsiteFooterProps) {
  return <footer className={cn("px-6 py-8 mt-auto", bg)}>{children}</footer>;
}

interface WebsiteContainerProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function WebsiteContainer({
  children,
  size = "lg",
  className,
}: WebsiteContainerProps) {
  const maxWidthClass = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  }[size];

  return (
    <div className={cn("mx-auto px-6 py-8", maxWidthClass, className)}>
      {children}
    </div>
  );
}

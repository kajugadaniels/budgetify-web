"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS } from "./nav-items";

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-elevated border-t border-border h-16 flex items-stretch"
      aria-label="Tab navigation"
    >
      {NAV_ITEMS.map(({ href, shortLabel, icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all"
          >
            <span
              className={cn(
                "transition-colors",
                isActive ? "text-primary" : "text-text-secondary",
              )}
            >
              {icon}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-text-secondary/50",
              )}
            >
              {shortLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

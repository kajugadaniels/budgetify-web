"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pt-4 md:px-5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.85rem)" }}
    >
      <div className="mx-auto w-full max-w-[980px]">
        <div className="relative overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(199,191,167,0.18),transparent_36%),linear-gradient(180deg,rgba(23,28,34,0.96),rgba(11,13,16,0.98))] px-2 py-2 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-[28px] md:px-3 md:py-3">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="pointer-events-none absolute -right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="grid grid-cols-5 gap-1 md:gap-2">
            {NAV_ITEMS.map(({ href, label, shortLabel, icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex min-h-[52px] items-center justify-center gap-1.5 rounded-full px-2 py-2 text-center transition-[transform,background-color,border-color,box-shadow,color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 motion-safe:hover:-translate-y-0.5 md:min-h-[58px] md:gap-2 md:px-4",
                    isActive
                      ? "bg-[linear-gradient(180deg,rgba(199,191,167,0.18),rgba(199,191,167,0.07))] text-text-primary shadow-[0_14px_28px_rgba(199,191,167,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "text-text-secondary hover:bg-white/[0.045] hover:text-text-primary",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 transition-colors duration-300",
                      isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary",
                    )}
                  >
                    {icon}
                  </span>

                  <span className="truncate text-[10px] font-medium leading-none sm:hidden">
                    {shortLabel}
                  </span>
                  <span className="hidden truncate text-xs font-medium leading-none sm:block">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

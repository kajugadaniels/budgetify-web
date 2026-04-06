"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/constant/navigation/nav-items";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pt-4 md:px-5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.85rem)" }}
    >
      <div className="flex justify-center">
        <div className="relative inline-flex max-w-full items-center overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(199,191,167,0.18),transparent_36%),linear-gradient(180deg,rgba(23,28,34,0.96),rgba(11,13,16,0.98))] px-2 py-2 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-[28px] md:px-3 md:py-3">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="pointer-events-none absolute -right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="flex min-w-0 items-center">
            <Link
              href="/dashboard"
              aria-label="Budgetify dashboard"
              className="mr-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform duration-300 motion-safe:hover:-translate-y-0.5 md:mr-2 md:h-14 md:w-14"
            >
              <Image
                src="/logo_color.png"
                alt="Budgetify"
                width={30}
                height={30}
                className="h-7 w-7 object-contain md:h-8 md:w-8"
                priority
              />
            </Link>

            <div className="min-w-0 overflow-x-auto [scrollbar-width:none]">
              <div className="flex min-w-max items-center gap-1 md:gap-2">
                {NAV_ITEMS.map(({ href, label, shortLabel, icon, badge }) => {
                  const isActive =
                    pathname === href || pathname.startsWith(`${href}/`);
                  const showBadge =
                    badge !== undefined &&
                    Date.now() < new Date(badge.expiresAt).getTime();

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "group flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-6 text-center transition-[transform,background-color,border-color,box-shadow,color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 motion-safe:hover:-translate-y-0.5 md:h-14 md:gap-2 md:px-4",
                        isActive
                          ? "bg-[linear-gradient(180deg,rgba(199,191,167,0.18),rgba(199,191,167,0.07))] text-text-primary shadow-[0_14px_28px_rgba(199,191,167,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "text-text-secondary hover:bg-white/[0.045] hover:text-text-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 transition-colors duration-300",
                          isActive
                            ? "text-primary"
                            : "text-text-secondary group-hover:text-text-primary",
                        )}
                      >
                        {icon}
                      </span>

                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-[10px] font-medium leading-none sm:hidden">
                          {shortLabel}
                        </span>
                        <span className="hidden truncate text-xs font-medium leading-none sm:block">
                          {label}
                        </span>
                        {showBadge ? (
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]",
                              isActive
                                ? "border-primary/20 bg-primary/12 text-primary"
                                : "border-primary/16 bg-primary/10 text-primary/88",
                            )}
                          >
                            {badge.label}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="ml-1 inline-flex h-12 shrink-0 items-center justify-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.16em] text-danger transition-[transform,color,background-color] duration-300 hover:bg-danger/10 hover:text-danger motion-safe:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 md:ml-2 md:h-14 md:px-5"
            >
              {loggingOut ? "Logging out" : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

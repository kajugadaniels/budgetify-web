"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuth();

  const displayName =
    user?.fullName ?? user?.firstName ?? user?.email ?? "Budgetify";
  const secondaryText = user?.email ?? "Personal finance";
  const initial = displayName[0]?.toUpperCase() ?? "B";

  async function handleLogout() {
    await logout();
    toast.info("You've been signed out.");
    router.push("/login");
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pt-4 md:px-5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.85rem)" }}
    >
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(199,191,167,0.18),transparent_30%),linear-gradient(180deg,rgba(23,28,34,0.96),rgba(11,13,16,0.98))] px-3 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-[28px] md:rounded-[38px] md:px-4 md:py-4">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
          <div className="pointer-events-none absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="pointer-events-none absolute -right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="flex flex-col gap-3 lg:hidden">
            <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-white/[0.035] px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-primary/28 bg-primary/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="text-sm font-semibold text-primary">B</span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-heading-sm text-text-primary">
                    Budgetify
                  </p>
                  <p className="truncate text-[11px] uppercase tracking-[0.18em] text-text-secondary/70">
                    Cash flow control
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <span className="text-sm font-semibold text-primary">
                    {initial}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-text-secondary transition-all duration-300 hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
                >
                  <SignOutIcon />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">

            <div className="min-w-[240px] rounded-[26px] border border-white/8 bg-white/[0.035] px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/24 bg-primary/15">
                  <span className="text-sm font-semibold text-primary">
                    {initial}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-text-secondary">
                    {secondaryText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-text-secondary transition-all duration-300 hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <SignOutIcon />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 lg:absolute lg:inset-x-[252px] lg:top-1/2 lg:mt-0 lg:-translate-y-1/2">
            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                {NAV_ITEMS.map(({ href, label, shortLabel, icon }) => {
                  const isActive =
                    pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "group relative flex min-h-[70px] flex-col items-center justify-center rounded-[22px] border px-2 py-2.5 text-center transition-[transform,background-color,border-color,box-shadow,color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 motion-safe:hover:-translate-y-0.5",
                        isActive
                          ? "border-primary/28 bg-[linear-gradient(180deg,rgba(199,191,167,0.18),rgba(199,191,167,0.06))] text-text-primary shadow-[0_18px_36px_rgba(199,191,167,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "border-transparent bg-transparent text-text-secondary hover:border-white/10 hover:bg-white/[0.045] hover:text-text-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full transition-all duration-300",
                          isActive
                            ? "bg-primary/90 opacity-100"
                            : "bg-transparent opacity-0 group-hover:bg-white/12 group-hover:opacity-100",
                        )}
                      />

                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-[16px] border transition-all duration-300",
                          isActive
                            ? "border-primary/20 bg-primary/14 text-primary shadow-[0_12px_24px_rgba(199,191,167,0.12)]"
                            : "border-white/8 bg-white/[0.03] text-text-secondary group-hover:border-white/14 group-hover:text-text-primary",
                        )}
                      >
                        {icon}
                      </span>

                      <span className="mt-2 text-[11px] font-medium leading-none sm:hidden">
                        {shortLabel}
                      </span>
                      <span className="mt-2 hidden text-xs font-medium leading-none sm:block">
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function SignOutIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

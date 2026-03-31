"use client";

import { usePathname } from "next/navigation";
import { ROUTE_TITLES } from "@/constant/navigation/route-titles";
import { useAuth } from "@/hooks/use-auth";

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title = ROUTE_TITLES[pathname] ?? "Budgetify";
  const initial = (
    user?.fullName ??
    user?.firstName ??
    user?.email ??
    "B"
  )[0]?.toUpperCase() ?? "B";

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 glass-elevated border-b border-border h-14 flex items-center justify-between px-4">
      <span className="text-text-primary font-semibold text-base tracking-heading-sm">
        {title}
      </span>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30">
        <span className="text-primary text-sm font-semibold">{initial}</span>
      </div>
    </header>
  );
}

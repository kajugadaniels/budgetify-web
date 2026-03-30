"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "./nav-items";

export function NavLink({ href, label, icon }: Pick<NavItem, "href" | "label" | "icon">) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        isActive
          ? "glass-subtle text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
      )}
    >
      <span
        className={cn(
          "shrink-0 transition-colors",
          isActive ? "text-primary" : "text-text-secondary",
        )}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

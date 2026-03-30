import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./nav-link";
import { UserPanel } from "./user-panel";

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 glass-elevated border-r border-border px-4 py-6 z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1 mb-8">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 shrink-0">
          <span className="text-primary text-sm font-bold">B</span>
        </div>
        <span className="text-text-primary font-semibold text-base tracking-heading-sm">
          Budgetify
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5" aria-label="Main navigation">
        <p className="text-text-secondary/40 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>

      {/* User panel */}
      <div className="border-t border-border pt-4">
        <UserPanel />
      </div>
    </aside>
  );
}

interface DashboardMonthSwitcherProps {
  embedded?: boolean;
  months: readonly { label: string; value: number }[];
  selectedMonth: number;
  onSelect: (month: number) => void;
}

export function DashboardMonthSwitcher({
  embedded = false,
  months,
  selectedMonth,
  onSelect,
}: DashboardMonthSwitcherProps) {
  return (
    <section
      className={
        embedded
          ? "rounded-[24px] border border-white/8 bg-background/34 p-2.5"
          : "glass-panel rounded-[28px] p-3"
      }
    >
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {months.map((month) => {
          const active = selectedMonth === month.value;

          return (
            <button
              key={month.value}
              type="button"
              onClick={() => onSelect(month.value)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-background shadow-[0_10px_24px_rgba(196,164,132,0.18)]"
                  : "border border-white/8 bg-background-secondary/70 text-text-secondary hover:bg-white/[0.06] hover:text-text-primary"
              }`}
            >
              {month.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

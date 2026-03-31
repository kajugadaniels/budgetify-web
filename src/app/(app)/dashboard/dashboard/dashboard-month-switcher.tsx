interface DashboardMonthSwitcherProps {
  months: readonly { label: string; value: number }[];
  selectedMonth: number;
  onSelect: (month: number) => void;
}

export function DashboardMonthSwitcher({
  months,
  selectedMonth,
  onSelect,
}: DashboardMonthSwitcherProps) {
  return (
    <section className="glass-panel rounded-[28px] p-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {months.map((month) => {
          const active = selectedMonth === month.value;

          return (
            <button
              key={month.value}
              type="button"
              onClick={() => onSelect(month.value)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-background"
                  : "border border-white/8 bg-background-secondary/70 text-text-secondary hover:text-text-primary"
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

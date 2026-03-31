import { MONTH_OPTIONS } from "@/constant/months";
import { cn } from "@/lib/utils/cn";

interface IncomeMonthFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onChange: (month: number) => void;
}

export function IncomeMonthFilter({
  selectedMonth,
  selectedYear,
  onChange,
}: IncomeMonthFilterProps) {
  return (
    <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex min-w-full gap-2 rounded-[24px] border border-white/8 bg-background-secondary/60 p-2">
        {MONTH_OPTIONS.map((month) => {
          const selected = month.value === selectedMonth;

          return (
            <button
              key={month.value}
              type="button"
              onClick={() => onChange(month.value)}
              aria-pressed={selected}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                selected
                  ? "bg-primary text-background shadow-[0_12px_24px_rgba(199,191,167,0.22)]"
                  : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
              )}
            >
              <span>{month.label.slice(0, 3)}</span>
              {selected ? (
                <span className="rounded-full bg-background/14 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-background">
                  {selectedYear}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

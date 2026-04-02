import { MONTH_OPTIONS } from "@/constant/months";
import { cn } from "@/lib/utils";

interface MonthStepperProps {
  month: number;
  onChange: (month: number) => void;
  className?: string;
}

export function MonthStepper({
  month,
  onChange,
  className,
}: MonthStepperProps) {
  const activeMonth = MONTH_OPTIONS[month] ?? MONTH_OPTIONS[0];

  function step(direction: -1 | 1) {
    const nextMonth = (month + direction + 12) % 12;
    onChange(nextMonth);
  }

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center gap-1 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-1 shadow-[0_10px_30px_rgba(5,10,18,0.12)] backdrop-blur-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label={`Go to ${MONTH_OPTIONS[(month + 11) % 12].label}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-lg text-text-secondary transition-all hover:border-white/10 hover:bg-white/6 hover:text-text-primary"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div className="min-w-[134px] rounded-full bg-background-secondary/72 px-4 py-1.5 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary/48">
          Month
        </p>
        <p className="mt-0.5 text-sm font-semibold tracking-[-0.03em] text-text-primary">
          {activeMonth.label}
        </p>
      </div>

      <button
        type="button"
        onClick={() => step(1)}
        aria-label={`Go to ${MONTH_OPTIONS[(month + 1) % 12].label}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-lg text-text-secondary transition-all hover:border-white/10 hover:bg-white/6 hover:text-text-primary"
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}

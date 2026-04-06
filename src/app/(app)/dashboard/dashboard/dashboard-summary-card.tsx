import { useState } from "react";

type DashboardSummaryTone = "income" | "expense" | "saving" | "todo";

interface DashboardSummaryCardProps {
  label: string;
  tone: DashboardSummaryTone;
  compactValue: string;
  fullValue: string;
  description: string;
}

const TONE_STYLES: Record<
  DashboardSummaryTone,
  { chip: string; dot: string; value: string }
> = {
  income: {
    chip: "bg-success/12 text-success",
    dot: "bg-success",
    value: "text-success",
  },
  expense: {
    chip: "bg-danger/12 text-danger",
    dot: "bg-danger",
    value: "text-danger",
  },
  saving: {
    chip: "bg-sky-500/12 text-sky-300",
    dot: "bg-sky-400",
    value: "text-sky-300",
  },
  todo: {
    chip: "bg-amber-500/12 text-amber-300",
    dot: "bg-amber-400",
    value: "text-amber-300",
  },
};

export function DashboardSummaryCard({
  label,
  tone,
  compactValue,
  fullValue,
  description,
}: DashboardSummaryCardProps) {
  const styles = TONE_STYLES[tone];
  const [showFullValue, setShowFullValue] = useState(false);
  const visibleValue = showFullValue ? fullValue : compactValue;

  return (
    <button
      type="button"
      onClick={() => setShowFullValue((current) => !current)}
      aria-pressed={showFullValue}
      className="glass-panel rounded-[30px] p-4 text-left transition-colors hover:bg-white/3 md:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles.chip}`}
        >
          {label}
        </span>
        <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
      </div>

      <p className={`mt-5 text-[1.6rem] font-semibold tracking-heading-md ${styles.value}`}>
        {visibleValue}
      </p>
      <p className="mt-2.5 text-sm leading-6 text-text-secondary">{description}</p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary/55">
        Click to {showFullValue ? "collapse" : "expand"}
      </p>
    </button>
  );
}

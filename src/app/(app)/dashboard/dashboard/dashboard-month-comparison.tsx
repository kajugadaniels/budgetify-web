import { rwf, rwfCompact } from "@/lib/utils/currency";
import type {
  DashboardMonthComparisonMetric,
  DashboardMonthComparisonSummary,
} from "./dashboard.utils";

interface DashboardMonthComparisonProps {
  summary: DashboardMonthComparisonSummary;
}

const TONE_STYLES: Record<
  DashboardMonthComparisonMetric["tone"],
  { badge: string; dot: string; panel: string }
> = {
  negative: {
    badge: "border-danger/18 bg-danger/10 text-danger",
    dot: "bg-danger",
    panel: "border-danger/10 bg-danger/[0.04]",
  },
  neutral: {
    badge: "border-white/10 bg-white/[0.04] text-text-secondary",
    dot: "bg-white/40",
    panel: "border-white/8 bg-white/[0.03]",
  },
  positive: {
    badge: "border-success/18 bg-success/10 text-success",
    dot: "bg-success",
    panel: "border-success/10 bg-success/[0.04]",
  },
};

function formatDeltaLabel(metric: DashboardMonthComparisonMetric): string {
  if (metric.trend === "flat") {
    return "No change";
  }

  const direction = metric.trend === "up" ? "Up" : "Down";

  if (metric.deltaPercent === null) {
    return `${direction} from no baseline`;
  }

  return `${direction} ${Math.round(metric.deltaPercent)}%`;
}

function formatComparisonCopy(metric: DashboardMonthComparisonMetric): string {
  if (metric.trend === "flat") {
    return "This matched the previous month exactly.";
  }

  return `${metric.label} moved by ${rwf(Math.abs(metric.deltaAmount))} compared with the previous month.`;
}

function MetricCard({ metric }: { metric: DashboardMonthComparisonMetric }) {
  const styles = TONE_STYLES[metric.tone];

  return (
    <div
      className={`rounded-[24px] border p-4 ${styles.panel}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
          {metric.label}
        </span>
        <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
      </div>

      <p className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em] text-text-primary">
        {rwfCompact(metric.currentAmount)}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-background/32 px-3 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/58">
            Previous month
          </p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {rwfCompact(metric.previousAmount)}
          </p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles.badge}`}
        >
          {formatDeltaLabel(metric)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {formatComparisonCopy(metric)}
      </p>
    </div>
  );
}

export function DashboardMonthComparison({
  summary,
}: DashboardMonthComparisonProps) {
  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/62">
            Month over month
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
            Compare this month against the one before it
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            This highlights how income, expense, and net flow changed from{" "}
            {summary.previousLabel} to {summary.currentLabel}.
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
            Period
          </p>
          <p className="mt-2 text-sm font-semibold text-text-primary">
            {summary.previousLabel} to {summary.currentLabel}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {summary.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}

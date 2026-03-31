type DashboardSummaryTone = "income" | "expense" | "saving";

interface DashboardSummaryCardProps {
  label: string;
  tone: DashboardSummaryTone;
  value: string;
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
    chip: "bg-primary/12 text-primary",
    dot: "bg-primary",
    value: "text-primary",
  },
};

export function DashboardSummaryCard({
  label,
  tone,
  value,
  description,
}: DashboardSummaryCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <article className="glass-panel rounded-[30px] p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles.chip}`}
        >
          {label}
        </span>
        <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
      </div>

      <p className={`mt-6 text-3xl font-semibold tracking-heading-md ${styles.value}`}>
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
    </article>
  );
}

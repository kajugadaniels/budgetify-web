interface IncomeSummaryCardProps {
  eyebrow: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "primary";
}

export function IncomeSummaryCard({
  eyebrow,
  value,
  detail,
  tone = "default",
}: IncomeSummaryCardProps) {
  const valueClass =
    tone === "success"
      ? "text-success"
      : tone === "primary"
        ? "text-primary"
        : "text-text-primary";

  return (
    <div className="glass-subtle rounded-[28px] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
        {eyebrow}
      </p>
      <p className={`mt-3 text-2xl font-semibold tracking-heading-sm ${valueClass}`}>
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{detail}</p>
    </div>
  );
}

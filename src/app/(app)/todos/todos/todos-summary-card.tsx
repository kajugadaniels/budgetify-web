interface TodosSummaryCardProps {
  eyebrow: string;
  value: string;
  detail: string;
  eyebrowClassName?: string;
  valueClassName?: string;
}

export function TodosSummaryCard({
  eyebrow,
  value,
  detail,
  eyebrowClassName,
  valueClassName,
}: TodosSummaryCardProps) {
  return (
    <div className="glass-subtle rounded-[28px] p-5">
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55 ${eyebrowClassName ?? ""}`}>
        {eyebrow}
      </p>
      <p className={`mt-3 text-2xl font-semibold tracking-heading-sm text-text-primary ${valueClassName ?? ""}`}>
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{detail}</p>
    </div>
  );
}

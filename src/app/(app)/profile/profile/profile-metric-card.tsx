interface ProfileMetricCardProps {
  label: string;
  value: string;
}

export function ProfileMetricCard({
  label,
  value,
}: ProfileMetricCardProps) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.2em] text-text-secondary/62">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold tracking-heading-sm text-text-primary">
        {value}
      </p>
    </div>
  );
}

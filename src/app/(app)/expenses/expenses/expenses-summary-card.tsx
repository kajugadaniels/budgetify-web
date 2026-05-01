"use client";

import { useState } from "react";

interface ExpensesSummaryCardProps {
  eyebrow: string;
  compactValue: string;
  fullValue: string;
  detail: string;
}

export function ExpensesSummaryCard({
  eyebrow,
  compactValue,
  fullValue,
  detail,
}: ExpensesSummaryCardProps) {
  const [showFullValue, setShowFullValue] = useState(false);
  const visibleValue = showFullValue ? fullValue : compactValue;

  return (
    <button
      type="button"
      onClick={() => setShowFullValue((current) => !current)}
      aria-pressed={showFullValue}
      className="glass-subtle rounded-[28px] p-5 text-left transition-colors hover:bg-white/3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
        {eyebrow}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-heading-sm text-text-primary">
        {visibleValue}
      </p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{detail}</p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary/55">
        Click to {showFullValue ? "collapse" : "expand"}
      </p>
    </button>
  );
}

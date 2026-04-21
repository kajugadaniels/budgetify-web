"use client";

import { rwfCompact } from "@/lib/utils/currency";
import type { ExpenseAuditResponse } from "@/lib/types/expense.types";

interface ExpensesAuditPanelProps {
  audit: ExpenseAuditResponse | null;
  error: string | null;
  loading: boolean;
}

export function ExpensesAuditPanel({
  audit,
  error,
  loading,
}: ExpensesAuditPanelProps) {
  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
            Expense audit
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
            Charged-spend reconciliation
          </h2>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
            audit?.isBalanced
              ? "border-success/20 bg-success/10 text-success"
              : "border-warning/20 bg-warning/10 text-warning"
          }`}
        >
          {audit?.isBalanced ? "Balanced" : "Fee gap detected"}
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-text-secondary">Loading audit…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-text-secondary">{error}</p>
      ) : audit ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AuditStat
            label="Before expenses"
            value={rwfCompact(audit.availableMoneyBeforeExpensesRwf)}
            detail="Money available before this period's expenses were applied."
          />
          <AuditStat
            label="Reported after expenses"
            value={rwfCompact(audit.availableMoneyAfterExpensesRwf)}
            detail="Current dashboard-style figure based on base expense totals."
          />
          <AuditStat
            label="Recomputed after charged"
            value={rwfCompact(audit.recomputedAvailableMoneyAfterExpensesRwf)}
            detail="Figure after including payment fees in the outflow."
          />
          <AuditStat
            label="Reconciliation gap"
            value={rwfCompact(audit.reconciliationDifferenceRwf)}
            detail={`${audit.feeBearingExpenseCount} fee-bearing expense${audit.feeBearingExpenseCount === 1 ? "" : "s"} in this period.`}
          />
        </div>
      ) : null}
    </section>
  );
}

function AuditStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="glass-subtle rounded-[28px] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-heading-sm text-text-primary">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{detail}</p>
    </div>
  );
}

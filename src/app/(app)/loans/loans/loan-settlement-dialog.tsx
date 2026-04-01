"use client";

import { Dialog } from "@/components/ui/dialog";
import { rwf } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { LoanResponse } from "@/lib/types/loan.types";
import type { LoanSettlementFormValues } from "./loans-page.types";
import { formatLoanDate } from "./loans.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

interface LoanSettlementDialogProps {
  entry: LoanResponse;
  form: LoanSettlementFormValues;
  saving: boolean;
  onChange: (next: Partial<LoanSettlementFormValues>) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LoanSettlementDialog({
  entry,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: LoanSettlementDialogProps) {
  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          Send to expense
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-heading-md text-text-primary">
              Settle this loan into expenses
            </h2>
          </div>
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="">
          <Field label="Expense date">
            <input
              type="date"
              value={form.date}
              onChange={(event) => onChange({ date: event.target.value })}
              className={INPUT_CLASS}
              required
            />
          </Field>
        </div>

        <Field label="Expense note">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Optional settlement note. Leave blank to reuse the loan note."
            className={cn(INPUT_CLASS, "min-h-[128px] resize-none")}
            maxLength={500}
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Recording..." : "Send to expense"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-surface-elevated/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
        {label}
      </p>
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

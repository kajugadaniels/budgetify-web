"use client";

import { Dialog } from "@/components/ui/dialog";
import type { SavingResponse } from "@/lib/types/saving.types";
import { rwf, usd } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { SavingExpenseFormValues } from "./saving-page.types";
import { formatSavingDate } from "./saving.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

interface SavingExpenseDialogProps {
  entry: SavingResponse;
  form: SavingExpenseFormValues;
  saving: boolean;
  onChange: (next: Partial<SavingExpenseFormValues>) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function SavingExpenseDialog({
  entry,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: SavingExpenseDialogProps) {
  const parsedAmount = Number(form.amountRwf);
  const amountPreview =
    !Number.isNaN(parsedAmount) && parsedAmount > 0 ? rwf(parsedAmount) : "Enter RWF amount";

  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          Record expense
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-heading-md text-text-primary">
              Send to expenses
            </h2>
          </div>
          <span className="inline-flex h-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Category: Savings
          </span>
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

        <Field label="Amount in RWF">
          <div className="space-y-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0.01}
              value={form.amountRwf}
              onChange={(event) => onChange({ amountRwf: event.target.value })}
              placeholder="125000"
              className={INPUT_CLASS}
              required
            />
            <p className="text-sm text-text-secondary">{amountPreview}</p>
          </div>
        </Field>

        <Field label="Expense note">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Optional note for the recorded expense"
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
            {saving ? "Recording..." : "Record expense"}
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

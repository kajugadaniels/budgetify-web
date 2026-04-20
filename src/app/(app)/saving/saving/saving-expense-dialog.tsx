"use client";

import { Dialog } from "@/components/ui/dialog";
import type { SavingResponse } from "@/lib/types/saving.types";
import { rwf } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { SavingWithdrawalFormValues } from "./saving-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

interface SavingExpenseDialogProps {
  entry: SavingResponse;
  form: SavingWithdrawalFormValues;
  saving: boolean;
  onChange: (next: Partial<SavingWithdrawalFormValues>) => void;
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
  const parsedAmount = Number(form.amount);
  const balancePreview = rwf(entry.currentBalanceRwf);
  const amountPreview =
    !Number.isNaN(parsedAmount) && parsedAmount > 0
      ? form.currency === "USD"
        ? `${parsedAmount.toFixed(2)} USD`
        : rwf(parsedAmount)
      : "Enter amount";

  return (
    <Dialog onClose={onClose} className="sm:max-w-xl">
      <div className="mb-6 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          Withdraw from saving
        </p>
        <div>
          <h2 className="text-2xl font-semibold tracking-heading-md text-text-primary">
            Move money back out
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Current balance: <span className="font-semibold text-text-primary">{balancePreview}</span>
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0.01}
              value={form.amount}
              onChange={(event) => onChange({ amount: event.target.value })}
              placeholder="50000"
              className={INPUT_CLASS}
              required
            />
          </Field>

          <Field label="Currency">
            <select
              value={form.currency}
              onChange={(event) =>
                onChange({ currency: event.target.value as "RWF" | "USD" })
              }
              className={INPUT_CLASS}
            >
              <option value="RWF">RWF</option>
              <option value="USD">USD</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(event) => onChange({ date: event.target.value })}
              className={INPUT_CLASS}
              required
            />
          </Field>

          <Field label="Preview">
            <div className="rounded-2xl border border-white/8 bg-surface-elevated px-4 py-3 text-sm text-text-secondary">
              {amountPreview}
            </div>
          </Field>
        </div>

        <Field label="Note">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Moved back to available money"
            className={cn(INPUT_CLASS, "min-h-[112px] resize-none")}
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
            {saving ? "Withdrawing..." : "Withdraw"}
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

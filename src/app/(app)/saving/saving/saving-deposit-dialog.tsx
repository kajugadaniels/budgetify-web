"use client";

import type { IncomeResponse } from "@/lib/types/income.types";
import type { SavingResponse } from "@/lib/types/saving.types";
import { rwf } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { Dialog } from "@/components/ui/dialog";
import type {
  SavingDepositFormValues,
  SavingSourceAllocationValues,
} from "./saving-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

interface SavingDepositDialogProps {
  entry: SavingResponse;
  form: SavingDepositFormValues;
  incomes: IncomeResponse[];
  saving: boolean;
  onChange: (next: Partial<SavingDepositFormValues>) => void;
  onSourceChange: (
    index: number,
    next: Partial<SavingSourceAllocationValues>,
  ) => void;
  onAddSource: () => void;
  onRemoveSource: (index: number) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function SavingDepositDialog({
  entry,
  form,
  incomes,
  saving,
  onChange,
  onSourceChange,
  onAddSource,
  onRemoveSource,
  onClose,
  onSubmit,
}: SavingDepositDialogProps) {
  const totalSourceAmount = form.sources.reduce((sum, source) => {
    const amount = Number(source.amount);
    return Number.isNaN(amount) ? sum : sum + amount;
  }, 0);

  return (
    <Dialog onClose={onClose} className="sm:max-w-3xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          Add money
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          Fund {entry.label}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Current balance:{" "}
          <span className="font-semibold text-text-primary">
            {rwf(entry.currentBalanceRwf)}
          </span>
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Deposit amount">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0.01}
              value={form.amount}
              onChange={(event) => onChange({ amount: event.target.value })}
              placeholder="150000"
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

          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(event) => onChange({ date: event.target.value })}
              className={INPUT_CLASS}
              required
            />
          </Field>
        </div>

        <Field label="Note">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Moved part of salary into this saving"
            className={cn(INPUT_CLASS, "min-h-[96px] resize-none")}
            maxLength={500}
          />
        </Field>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Source incomes
              </p>
              <p className="text-xs text-text-secondary">
                Choose one or more received income records and enter the amount taken from each.
              </p>
            </div>
            <button
              type="button"
              onClick={onAddSource}
              className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/16"
            >
              Add source
            </button>
          </div>

          {form.sources.map((source, index) => (
            <div
              key={`${index}-${source.incomeId}`}
              className="grid gap-3 rounded-[22px] border border-white/8 bg-surface-elevated/60 p-4 md:grid-cols-[minmax(0,1.4fr)_160px_120px_auto]"
            >
              <Field label="Income">
                <select
                  value={source.incomeId}
                  onChange={(event) =>
                    onSourceChange(index, { incomeId: event.target.value })
                  }
                  className={INPUT_CLASS}
                  required
                >
                  <option value="">Select income</option>
                  {incomes.map((income) => (
                    <option key={income.id} value={income.id}>
                      {income.label} · {rwf(income.amountRwf)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Amount">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0.01}
                  value={source.amount}
                  onChange={(event) =>
                    onSourceChange(index, { amount: event.target.value })
                  }
                  className={INPUT_CLASS}
                  placeholder="50000"
                  required
                />
              </Field>

              <Field label="Currency">
                <select
                  value={source.currency}
                  onChange={(event) =>
                    onSourceChange(index, {
                      currency: event.target.value as "RWF" | "USD",
                    })
                  }
                  className={INPUT_CLASS}
                >
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                </select>
              </Field>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => onRemoveSource(index)}
                  disabled={form.sources.length === 1}
                  className="w-full rounded-2xl border border-white/10 px-3 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <p className="text-sm text-text-secondary">
            Source total: <span className="font-semibold text-text-primary">{totalSourceAmount || 0}</span> {form.sources[0]?.currency ?? "RWF"} across {form.sources.length} source{form.sources.length === 1 ? "" : "s"}.
          </p>
        </div>

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
            {saving ? "Adding..." : "Add money"}
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

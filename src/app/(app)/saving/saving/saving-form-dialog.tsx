"use client";

import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rwf } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { SavingFormValues } from "./saving-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

interface SavingFormDialogProps {
  form: SavingFormValues;
  mode: "create" | "edit";
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (next: Partial<SavingFormValues>) => void;
}

export function SavingFormDialog({
  form,
  mode,
  saving,
  onClose,
  onSubmit,
  onChange,
}: SavingFormDialogProps) {
  const targetPreview =
    Number(form.targetAmount) > 0
      ? form.targetCurrency === "USD"
        ? `${Number(form.targetAmount).toFixed(2)} USD`
        : rwf(Number(form.targetAmount))
      : "Enter target amount";

  return (
    <Dialog onClose={onClose} className="sm:max-w-xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          {mode === "edit" ? "Edit saving" : "New saving"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          {mode === "edit" ? "Update saving bucket" : "Add saving bucket"}
        </h2>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Label">
          <input
            type="text"
            value={form.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="Emergency reserve contribution"
            className={INPUT_CLASS}
            maxLength={120}
            required
          />
        </Field>

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
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-white/8 bg-surface-elevated/60 px-4 py-3">
          <input
            type="checkbox"
            checked={form.hasTarget}
            onChange={(event) => onChange({ hasTarget: event.target.checked })}
            className="mt-1 h-4 w-4 rounded border-border bg-surface-elevated text-primary focus:ring-primary/30"
          />
          <div>
            <span className="block text-sm font-medium text-text-primary">
              This saving bucket has a target
            </span>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              Turn this on to require a target amount and an end date for the
              bucket.
            </span>
          </div>
        </label>

        {form.hasTarget ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target amount">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0.01}
                  value={form.targetAmount}
                  onChange={(event) =>
                    onChange({ targetAmount: event.target.value })
                  }
                  placeholder="1000000"
                  className={INPUT_CLASS}
                  required={form.hasTarget}
                />
              </Field>

              <Field label="End date">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => onChange({ endDate: event.target.value })}
                  className={INPUT_CLASS}
                  required={form.hasTarget}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target currency">
                <Select
                  value={form.targetCurrency}
                  onValueChange={(value) =>
                    onChange({
                      targetCurrency: value as "RWF" | "USD",
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      INPUT_CLASS,
                      "h-[50px] px-4 py-3 focus-visible:border-primary/60 focus-visible:ring-primary/20",
                    )}
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RWF">RWF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Target preview">
                <div className="rounded-2xl border border-white/8 bg-surface-elevated px-4 py-3 text-sm text-text-secondary">
                  {targetPreview}
                </div>
              </Field>
            </div>
          </>
        ) : null}

        <Field label="Note">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Optional context for this saving entry"
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
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Save changes"
                : "Create saving"}
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

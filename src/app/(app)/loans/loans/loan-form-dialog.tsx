"use client";

import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { LoanFormValues } from "./loans-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

const PAID_OPTIONS = [
  { value: true, label: "Paid" },
  { value: false, label: "Unpaid" },
] as const;

interface LoanFormDialogProps {
  form: LoanFormValues;
  mode: "create" | "edit";
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (next: Partial<LoanFormValues>) => void;
}

export function LoanFormDialog({
  form,
  mode,
  saving,
  onClose,
  onSubmit,
  onChange,
}: LoanFormDialogProps) {
  return (
    <Dialog onClose={onClose} className="sm:max-w-xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          {mode === "edit" ? "Edit loan" : "New loan"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          {mode === "edit" ? "Update record" : "Add loan record"}
        </h2>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Label">
          <input
            type="text"
            value={form.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="Family emergency advance"
            className={INPUT_CLASS}
            maxLength={120}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount">
            <input
              type="number"
              value={form.amount}
              onChange={(event) => onChange({ amount: event.target.value })}
              placeholder="300000"
              min={1}
              className={INPUT_CLASS}
              required
            />
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

        <Field label="Payment state">
          <div className="flex flex-wrap gap-2">
            {PAID_OPTIONS.map((option) => {
              const selected = form.paid === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ paid: option.value })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                    selected
                      ? option.value
                        ? "border-success bg-success text-background"
                        : "border-danger bg-danger text-background"
                      : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border text-[10px]",
                      selected
                        ? "border-background/20 bg-background/15 text-background"
                        : "border-white/10 bg-white/6 text-transparent",
                    )}
                  >
                    ✓
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Note">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Optional context for this loan"
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
                : "Add loan"}
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

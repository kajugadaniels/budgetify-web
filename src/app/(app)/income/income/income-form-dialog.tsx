"use client";

import { Dialog } from "@/components/ui/dialog";
import type {
  IncomeCategoryOptionResponse,
  IncomeResponse,
} from "@/lib/types/income.types";
import { cn } from "@/lib/utils/cn";
import type { IncomeFormValues } from "./income-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

interface IncomeFormDialogProps {
  categories: IncomeCategoryOptionResponse[];
  entry?: IncomeResponse;
  form: IncomeFormValues;
  mode: "create" | "edit";
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (next: Partial<IncomeFormValues>) => void;
}

export function IncomeFormDialog({
  categories,
  entry,
  form,
  mode,
  saving,
  onClose,
  onSubmit,
  onChange,
}: IncomeFormDialogProps) {
  const hasSavingAllocations =
    mode === "edit" && (entry?.allocatedToSavingsRwf ?? 0) > 0;

  return (
    <Dialog onClose={onClose} className="sm:max-w-xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          {mode === "edit" ? "Edit income" : "New income"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          {mode === "edit" ? "Update entry" : "Add income entry"}
        </h2>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Source">
          <input
            type="text"
            value={form.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="Monthly salary"
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
              placeholder="450000"
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

        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected = form.category === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ category: category.value })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                    selected
                      ? "border-primary bg-primary text-background"
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
                  {category.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Received state">
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "Received",
                value: true,
                selectedClass: "border-success bg-success text-background",
              },
              {
                label: "Pending",
                value: false,
                selectedClass: "border-primary bg-primary text-background",
              },
            ].map((option) => {
              const selected = form.received === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={selected}
                  disabled={hasSavingAllocations && option.value === false}
                  onClick={() => onChange({ received: option.value })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                    selected
                      ? option.selectedClass
                      : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary",
                    hasSavingAllocations && option.value === false
                      ? "cursor-not-allowed opacity-40"
                      : "",
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
          <p className="mt-2 text-xs leading-5 text-text-secondary">
            Use <span className="font-medium text-text-primary">Pending</span> for planned income that is not in your hands yet. Use <span className="font-medium text-text-primary">Received</span> only after the money is actually available.
          </p>
          {hasSavingAllocations ? (
            <p className="mt-2 text-xs leading-5 text-warning">
              This income already funds savings. You can update labels and dates,
              but you cannot mark it pending or reduce it below the allocated
              amount.
            </p>
          ) : null}
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
                : "Add income"}
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

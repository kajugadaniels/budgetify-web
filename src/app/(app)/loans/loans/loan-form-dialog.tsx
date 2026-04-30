"use client";

import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { LoanFormValues } from "./loans-page.types";
import {
  formatLoanDirection,
  LOAN_DIRECTION_OPTIONS,
  LOAN_REPAYMENT_ALLOCATION_OPTIONS,
  LOAN_STATUS_OPTIONS,
  LOAN_TYPE_OPTIONS,
} from "./loans.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

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
          <Field label="Direction">
            <div className="flex flex-wrap gap-2">
              {LOAN_DIRECTION_OPTIONS.map((option) => {
                const selected = form.direction === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange({ direction: option.value })}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                      selected
                        ? "border-primary bg-primary text-background"
                        : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Loan type">
            <select
              value={form.type}
              onChange={(event) =>
                onChange({ type: event.target.value as LoanFormValues["type"] })
              }
              className={INPUT_CLASS}
            >
              {LOAN_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={form.direction === "LENT" ? "Borrower" : "Lender"}>
            <input
              type="text"
              value={form.counterpartyName}
              onChange={(event) =>
                onChange({ counterpartyName: event.target.value })
              }
              placeholder={
                form.direction === "LENT"
                  ? "Who received the money?"
                  : "Who gave you the money?"
              }
              className={INPUT_CLASS}
              maxLength={120}
              required
            />
          </Field>

          <Field label="Counterparty contact">
            <input
              type="text"
              value={form.counterpartyContact}
              onChange={(event) =>
                onChange({ counterpartyContact: event.target.value })
              }
              placeholder="Phone, email, or note"
              className={INPUT_CLASS}
              maxLength={120}
            />
          </Field>
        </div>

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

          <Field label="Currency">
            <select
              value={form.currency}
              onChange={(event) =>
                onChange({
                  currency: event.target.value as LoanFormValues["currency"],
                })
              }
              className={INPUT_CLASS}
            >
              <option value="RWF">RWF</option>
              <option value="USD">USD</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Issued date">
            <input
              type="date"
              value={form.issuedDate}
              onChange={(event) => onChange({ issuedDate: event.target.value })}
              className={INPUT_CLASS}
              required
            />
          </Field>

          <Field label="Due date">
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => onChange({ dueDate: event.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Lifecycle status">
          <select
            value={form.status}
            onChange={(event) =>
              onChange({
                status: event.target.value as LoanFormValues["status"],
              })
            }
            className={INPUT_CLASS}
          >
            {LOAN_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Repayment allocation">
          <select
            value={form.repaymentAllocation}
            onChange={(event) =>
              onChange({
                repaymentAllocation:
                  event.target.value as LoanFormValues["repaymentAllocation"],
              })
            }
            className={INPUT_CLASS}
          >
            {LOAN_REPAYMENT_ALLOCATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-text-secondary">
          <p className="font-medium text-text-primary">
            {formatLoanDirection(form.direction)} loan
          </p>
          <p className="mt-1">
            {form.direction === "LENT"
              ? "This is money you gave out and expect to collect back later."
              : "This is money you received and expect to repay later."}
          </p>
          <p className="mt-2 text-xs text-text-secondary/80">
            General repayments will apply{" "}
            {form.repaymentAllocation === "PRINCIPAL_FIRST"
              ? "principal before interest."
              : "interest before principal."}
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

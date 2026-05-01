"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";
const SELECT_TRIGGER_CLASS =
  "h-12 w-full rounded-2xl border-border bg-surface-elevated px-4 text-sm text-text-primary";

interface LoanFormDialogProps {
  form: LoanFormValues;
  mode: "create" | "edit";
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (next: Partial<LoanFormValues>) => void;
}

type WizardStep = 1 | 2;

export function LoanFormDialog({
  form,
  mode,
  saving,
  onClose,
  onSubmit,
  onChange,
}: LoanFormDialogProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const amount = Number(form.amount);
  const canContinue =
    form.label.trim().length > 0 &&
    form.counterpartyName.trim().length > 0 &&
    !Number.isNaN(amount) &&
    amount > 0;
  const counterpartyLabel = form.direction === "LENT" ? "Borrower" : "Lender";

  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6 space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
            {mode === "edit" ? "Edit loan" : "New loan"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
            {mode === "edit" ? "Update loan record" : "Add loan record"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Capture the counterparty first, then confirm timing and repayment
            rules before saving.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <StepPill
            index={1}
            title="Loan details"
            detail="Direction, counterparty, amount"
            active={step === 1}
            complete={step > 1}
          />
          <StepPill
            index={2}
            title="Terms"
            detail="Dates, lifecycle, allocation"
            active={step === 2}
            complete={false}
          />
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        {step === 1 ? (
          <div className="space-y-5">
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

            <Field label="Direction">
              <div className="grid gap-3 sm:grid-cols-2">
                {LOAN_DIRECTION_OPTIONS.map((option) => {
                  const selected = form.direction === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onChange({ direction: option.value })}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition-all",
                        selected
                          ? "border-primary/70 bg-primary text-background shadow-[0_18px_40px_rgba(199,191,167,0.16)]"
                          : "border-border bg-surface-elevated text-text-secondary hover:border-primary/30 hover:text-text-primary",
                      )}
                    >
                      <span className="block text-sm font-semibold">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 opacity-75">
                        {option.value === "LENT"
                          ? "Money you gave out and expect to collect."
                          : "Money you received and expect to repay."}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Loan type">
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    onChange({ type: value as LoanFormValues["type"] })
                  }
                >
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Currency">
                <Select
                  value={form.currency}
                  onValueChange={(value) =>
                    onChange({
                      currency: value as LoanFormValues["currency"],
                    })
                  }
                >
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RWF">RWF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={counterpartyLabel}>
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
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Issued date">
                <input
                  type="date"
                  value={form.issuedDate}
                  onChange={(event) =>
                    onChange({ issuedDate: event.target.value })
                  }
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

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Lifecycle status">
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    onChange({
                      status: value as LoanFormValues["status"],
                    })
                  }
                >
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Repayment allocation">
                <Select
                  value={form.repaymentAllocation}
                  onValueChange={(value) =>
                    onChange({
                      repaymentAllocation:
                        value as LoanFormValues["repaymentAllocation"],
                    })
                  }
                >
                  <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder="Allocation rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_REPAYMENT_ALLOCATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Note">
              <textarea
                value={form.note}
                onChange={(event) => onChange({ note: event.target.value })}
                placeholder="Optional context for this loan"
                className={cn(INPUT_CLASS, "min-h-[124px] resize-none")}
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
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step === 1 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep(2)}
              className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
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
          )}
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
    <div>
      <span className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </span>
      {children}
    </div>
  );
}

function StepPill({
  index,
  title,
  detail,
  active,
  complete,
}: {
  index: number;
  title: string;
  detail: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
        active || complete
          ? "border-primary/35 bg-primary/10"
          : "border-border bg-surface-elevated/70",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          active || complete
            ? "bg-primary text-background"
            : "bg-white/6 text-text-secondary",
        )}
      >
        {index}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-text-primary">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-text-secondary">
          {detail}
        </span>
      </span>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { rwf } from "@/lib/utils/currency";
import type { LoanFormValues } from "./loans-page.types";
import {
  formatLoanDirection,
  formatLoanRepaymentAllocation,
  formatLoanStatus,
  formatLoanType,
  LOAN_DIRECTION_OPTIONS,
  LOAN_REPAYMENT_ALLOCATION_OPTIONS,
  LOAN_STATUS_OPTIONS,
  LOAN_TYPE_OPTIONS,
} from "./loans.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

const SECTION_CLASS =
  "rounded-[22px] border border-white/8 bg-background/36 p-4 sm:p-5";

const EYEBROW_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/60";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Details",
  2: "Terms",
  3: "Review",
};

const CURRENCY_OPTIONS = [
  { value: "RWF", label: "RWF" },
  { value: "USD", label: "USD" },
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
  const [step, setStep] = useState<Step>(1);
  const formRef = useRef<HTMLFormElement>(null);

  const parsedAmount = Number(form.amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const canContinueFromStep1 =
    form.label.trim().length > 0 &&
    hasAmount &&
    form.issuedDate.trim().length > 0;
  const canContinueFromStep2 = form.counterpartyName.trim().length > 0;

  const amountDisplay = useMemo(() => {
    if (!hasAmount) return "Enter amount";
    return form.currency === "USD"
      ? `${parsedAmount.toFixed(2)} USD`
      : rwf(parsedAmount);
  }, [form.currency, hasAmount, parsedAmount]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (step < 3) {
      event.preventDefault();
      return;
    }

    onSubmit(event);
  }

  return (
    <Dialog
      onClose={onClose}
      className="sm:max-w-2xl lg:max-w-3xl p-4 sm:p-5"
    >
      <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(199,191,167,0.14),transparent_72%)]" />

        <Header mode={mode} step={step} onClose={onClose} />

        <StepProgress step={step} />

        <form
          ref={formRef}
          className="relative z-10 mt-5 space-y-4"
          onSubmit={handleSubmit}
        >
          {step === 1 ? (
            <StepOne form={form} onChange={onChange} />
          ) : step === 2 ? (
            <StepTwo form={form} onChange={onChange} />
          ) : (
            <StepThree
              form={form}
              amountDisplay={amountDisplay}
              hasAmount={hasAmount}
              parsedAmount={parsedAmount}
              onChange={onChange}
            />
          )}

          <DialogFooter
            step={step}
            saving={saving}
            mode={mode}
            canContinue={
              step === 1
                ? canContinueFromStep1
                : step === 2
                  ? canContinueFromStep2
                  : true
            }
            onClose={onClose}
            onContinue={() => setStep((prev) => (prev + 1) as Step)}
            onBack={() => setStep((prev) => (prev - 1) as Step)}
            onFinalSubmit={() => formRef.current?.requestSubmit()}
          />
        </form>
      </div>
    </Dialog>
  );
}

function Header({
  mode,
  step,
  onClose,
}: {
  mode: "create" | "edit";
  step: Step;
  onClose: () => void;
}) {
  const eyebrow = mode === "edit" ? "Edit loan" : "New loan";
  const heading = mode === "edit" ? "Update entry" : "Add loan entry";
  const description =
    step === 1
      ? "Step 1 - Define the loan and amount."
      : step === 2
        ? "Step 2 - Set the counterparty and repayment terms."
        : "Step 3 - Review and save.";

  return (
    <div className="relative z-10 mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {eyebrow}
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-heading-md text-text-primary sm:text-[1.35rem]">
          {heading}
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        x
      </button>
    </div>
  );
}

function StepProgress({ step }: { step: Step }) {
  return (
    <div className="relative z-10 rounded-[20px] border border-white/8 bg-background/36 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <StepDot index={1} active={step === 1} complete={step > 1} />
        <StepBar complete={step > 1} />
        <StepDot index={2} active={step === 2} complete={step > 2} />
        <StepBar complete={step > 2} />
        <StepDot index={3} active={step === 3} complete={false} />
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/70">
        Step {step} of 3 · {STEP_LABELS[step]}
      </p>
    </div>
  );
}

function StepBar({ complete }: { complete: boolean }) {
  return (
    <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/8">
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500 ease-out",
          complete ? "w-full" : "w-0",
        )}
      />
    </div>
  );
}

function StepDot({
  index,
  active,
  complete,
}: {
  index: number;
  active: boolean;
  complete: boolean;
}) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-background"
          : complete
            ? "border-success/50 bg-success/15 text-success"
            : "border-white/10 bg-white/[0.04] text-text-secondary/70",
      )}
    >
      {complete ? "✓" : index}
    </span>
  );
}

function StepOne({
  form,
  onChange,
}: {
  form: LoanFormValues;
  onChange: (next: Partial<LoanFormValues>) => void;
}) {
  return (
    <>
      <section className={cn(SECTION_CLASS, "space-y-4")}>
        <p className={EYEBROW_CLASS}>Basics</p>

        <Field label="Label">
          <input
            type="text"
            value={form.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="Family emergency advance"
            className={INPUT_CLASS}
            maxLength={120}
            autoFocus
            required
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_170px_minmax(140px,0.9fr)]">
          <Field label="Amount">
            <input
              type="number"
              value={form.amount}
              onChange={(event) => onChange({ amount: event.target.value })}
              placeholder="300000"
              min={1}
              step="0.01"
              className={cn(INPUT_CLASS, "text-lg font-semibold tabular-nums")}
              required
            />
          </Field>

          <Field label="Issued date">
            <input
              type="date"
              value={form.issuedDate}
              onChange={(event) => onChange({ issuedDate: event.target.value })}
              className={INPUT_CLASS}
              required
            />
          </Field>

          <Field label="Currency">
            <CheckboxGroup
              options={CURRENCY_OPTIONS}
              value={form.currency}
              onChange={(value) =>
                onChange({ currency: value as LoanFormValues["currency"] })
              }
            />
          </Field>
        </div>
      </section>

      <section className={cn(SECTION_CLASS, "space-y-3")}>
        <p className={EYEBROW_CLASS}>Direction</p>
        <CheckboxGroup
          options={LOAN_DIRECTION_OPTIONS}
          value={form.direction}
          onChange={(value) =>
            onChange({ direction: value as LoanFormValues["direction"] })
          }
        />
      </section>

      <section className={cn(SECTION_CLASS, "space-y-3")}>
        <p className={EYEBROW_CLASS}>Loan type</p>
        <CheckboxGroup
          options={LOAN_TYPE_OPTIONS}
          value={form.type}
          onChange={(value) =>
            onChange({ type: value as LoanFormValues["type"] })
          }
        />
      </section>
    </>
  );
}

function StepTwo({
  form,
  onChange,
}: {
  form: LoanFormValues;
  onChange: (next: Partial<LoanFormValues>) => void;
}) {
  const counterpartyLabel = form.direction === "LENT" ? "Borrower" : "Lender";

  return (
    <>
      <section className={cn(SECTION_CLASS, "space-y-4")}>
        <p className={EYEBROW_CLASS}>Counterparty</p>

        <div className="grid gap-3 sm:grid-cols-2">
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

          <Field label="Contact">
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

        <Field label="Due date">
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => onChange({ dueDate: event.target.value })}
            className={INPUT_CLASS}
          />
        </Field>
      </section>

      <section className={cn(SECTION_CLASS, "space-y-3")}>
        <p className={EYEBROW_CLASS}>Lifecycle status</p>
        <CheckboxGroup
          options={LOAN_STATUS_OPTIONS}
          value={form.status}
          onChange={(value) =>
            onChange({ status: value as LoanFormValues["status"] })
          }
        />
      </section>

      <section className={cn(SECTION_CLASS, "space-y-3")}>
        <p className={EYEBROW_CLASS}>Repayment allocation</p>
        <CheckboxGroup
          options={LOAN_REPAYMENT_ALLOCATION_OPTIONS}
          value={form.repaymentAllocation}
          onChange={(value) =>
            onChange({
              repaymentAllocation:
                value as LoanFormValues["repaymentAllocation"],
            })
          }
        />
      </section>
    </>
  );
}

function StepThree({
  form,
  amountDisplay,
  hasAmount,
  parsedAmount,
  onChange,
}: {
  form: LoanFormValues;
  amountDisplay: string;
  hasAmount: boolean;
  parsedAmount: number;
  onChange: (next: Partial<LoanFormValues>) => void;
}) {
  const rwfEquivalent =
    form.currency === "RWF" && hasAmount ? rwf(parsedAmount) : "Calculated by API";
  const counterpartyLabel = form.direction === "LENT" ? "Borrower" : "Lender";

  return (
    <>
      <section className={cn(SECTION_CLASS, "grid gap-2.5 sm:grid-cols-3")}>
        <MiniStat label="Amount" value={amountDisplay} tone="primary" />
        <MiniStat label="Direction" value={formatLoanDirection(form.direction)} />
        <MiniStat label="RWF value" value={rwfEquivalent} tone="muted" />
      </section>

      <section className={cn(SECTION_CLASS, "space-y-2.5")}>
        <p className={EYEBROW_CLASS}>Summary</p>
        <SummaryRow label="Label" value={form.label || "—"} />
        <SummaryRow label="Type" value={formatLoanType(form.type)} />
        <SummaryRow label={counterpartyLabel} value={form.counterpartyName || "—"} />
        <SummaryRow
          label="Status"
          value={formatLoanStatus(form.status)}
        />
        <SummaryRow
          label="Allocation"
          value={formatLoanRepaymentAllocation(form.repaymentAllocation)}
        />
        <SummaryRow label="Issued" value={form.issuedDate || "—"} />
        <SummaryRow label="Due" value={form.dueDate || "No due date"} />
      </section>

      <section className={cn(SECTION_CLASS)}>
        <Field label="Note (optional)">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Optional context for this loan"
            className={cn(INPUT_CLASS, "min-h-[88px] resize-none")}
            maxLength={500}
          />
        </Field>
      </section>
    </>
  );
}

function DialogFooter({
  step,
  saving,
  mode,
  canContinue,
  onClose,
  onContinue,
  onBack,
  onFinalSubmit,
}: {
  step: Step;
  saving: boolean;
  mode: "create" | "edit";
  canContinue: boolean;
  onClose: () => void;
  onContinue: () => void;
  onBack: () => void;
  onFinalSubmit: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
      {step === 1 ? (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:min-w-[140px]"
        >
          Cancel
        </button>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:min-w-[140px]"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      )}

      {step < 3 ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onContinue();
          }}
          disabled={!canContinue}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[180px]"
        >
          Continue
          <span aria-hidden="true">→</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onFinalSubmit}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[180px]"
        >
          {saving
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Add loan"}
        </button>
      )}
    </div>
  );
}

function CheckboxGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { readonly value: T; readonly label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-medium transition-all",
              selected
                ? "border-primary/70 bg-primary/14 text-text-primary shadow-[inset_0_0_0_1px_rgba(199,191,167,0.35)]"
                : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-[6px] border text-[10px] transition-colors",
                selected
                  ? "border-primary bg-primary text-background"
                  : "border-white/15 bg-white/[0.04] text-transparent",
              )}
            >
              ✓
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
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

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "primary" | "muted";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "muted"
        ? "text-text-secondary"
        : "text-text-primary";

  return (
    <div className="rounded-[18px] border border-white/8 bg-surface-elevated/70 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 line-clamp-2 text-sm font-semibold tabular-nums",
          toneClass,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/6 py-1.5 last:border-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="truncate text-sm font-medium text-text-primary">
        {value}
      </span>
    </div>
  );
}

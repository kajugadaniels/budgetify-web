"use client";

import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { PRIORITY_META } from "@/constant/todos/priority-meta";
import type { ExpenseCategoryOptionResponse } from "@/lib/types/expense.types";
import type { TodoResponse } from "@/lib/types/todo.types";
import { cn } from "@/lib/utils/cn";
import { rwf } from "@/lib/utils/currency";
import type { TodoExpenseFormValues } from "./todos-page.types";
import {
  canRecordTodoExpense,
  formatTodoDate,
  formatTodoFrequencyLabel,
  getRemainingOccurrenceDates,
  getSuggestedTodoExpenseAmount,
  isRecurringTodo,
} from "./todos.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

const SECTION_CLASS =
  "rounded-[22px] border border-white/8 bg-background/36 p-4 sm:p-5";

const EYEBROW_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/60";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, string> = {
  1: "Todo",
  2: "Category",
  3: "Amount & date",
  4: "Review",
};

interface TodoExpenseDialogProps {
  categories: ExpenseCategoryOptionResponse[];
  entry: TodoResponse;
  form: TodoExpenseFormValues;
  saving: boolean;
  onChange: (next: Partial<TodoExpenseFormValues>) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function TodoExpenseDialog({
  categories,
  entry,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: TodoExpenseDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const formRef = useRef<HTMLFormElement>(null);
  const priorityMeta = PRIORITY_META[entry.priority];
  const recurring = isRecurringTodo(entry);
  const remainingOccurrenceDates = getRemainingOccurrenceDates(entry);
  const suggestedAmount = getSuggestedTodoExpenseAmount(entry);
  const recordable = canRecordTodoExpense(entry);
  const canContinueFromStep2 = form.category.length > 0;
  const canContinueFromStep3 =
    form.amount.trim().length > 0 && form.date.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (step < 4) {
      event.preventDefault();
      return;
    }

    onSubmit(event);
  }

  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl lg:max-w-3xl p-4 sm:p-5">
      <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(199,191,167,0.14),transparent_72%)]" />

        <div className="relative z-10 mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Record expense
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-heading-md text-text-primary sm:text-[1.35rem]">
              Move todo into expenses
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">
              {step === 1
                ? recurring
                  ? "Review the todo first, then record it as an expense against one recurring occurrence."
                  : "Review the todo first, then move it into expenses and mark it done."
                : step === 2
                  ? "Choose where this spend belongs in your expense ledger."
                  : step === 3
                    ? recurring
                      ? "Set the amount and pick the specific occurrence date to charge."
                      : "Set the amount and confirm the expense date."
                    : recurring
                      ? "Review the recurring deduction before recording the expense."
                      : "Review the final details before recording the expense."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <StepProgress step={step} />

        <form
          ref={formRef}
          className="relative z-10 mt-5 space-y-4"
          onSubmit={handleSubmit}
        >
          {step === 1 ? (
            <>
              <section
                className={cn(
                  SECTION_CLASS,
                  "grid gap-2.5 sm:grid-cols-[minmax(0,1.25fr)_minmax(180px,0.75fr)]",
                )}
              >
                <div className="min-w-0 rounded-[18px] border border-white/8 bg-surface-elevated/70 px-3.5 py-3">
                  <p className={EYEBROW_CLASS}>Todo</p>
                  <p className="mt-2 truncate text-sm font-semibold text-text-primary">
                    {entry.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${priorityMeta.chipClass}`}
                    >
                      {priorityMeta.label}
                    </span>
                    <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                      Added {formatTodoDate(entry.createdAt)}
                    </span>
                    <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                      {formatTodoFrequencyLabel(entry.frequency)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <MiniStat
                    label="Wishlist price"
                    value={rwf(Number(entry.price))}
                  />
                  <MiniStat
                    label={recurring ? "Remaining budget" : "Status on save"}
                    value={
                      recurring ? rwf(Number(entry.remainingAmount ?? 0)) : "Done"
                    }
                    valueClassName={recurring ? "text-primary" : "text-success"}
                  />
                </div>
              </section>

              {recurring ? (
                <section className={cn(SECTION_CLASS, "grid gap-2.5 sm:grid-cols-3")}>
                  <MiniStat
                    label="Occurrences left"
                    value={`${remainingOccurrenceDates.length}`}
                  />
                  <MiniStat
                    label="Suggested amount"
                    value={rwf(suggestedAmount)}
                  />
                  <MiniStat
                    label="Window"
                    value={
                      entry.endDate
                        ? `${formatTodoDate(entry.startDate ?? entry.createdAt)} - ${formatTodoDate(entry.endDate)}`
                        : formatTodoDate(entry.startDate ?? entry.createdAt)
                    }
                  />
                </section>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <section className={cn(SECTION_CLASS, "space-y-3")}>
              <p className={EYEBROW_CLASS}>Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const selected = form.category === category.value;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        onChange({
                          category:
                            category.value as TodoExpenseFormValues["category"],
                        })
                      }
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all",
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
                            : "border-white/10 bg-white/[0.04] text-transparent",
                        )}
                      >
                        ✓
                      </span>
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className={cn(SECTION_CLASS, "space-y-4")}>
              <p className={EYEBROW_CLASS}>Amount & date</p>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)]">
                <Field label="Amount in RWF">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={0.01}
                    value={form.amount}
                    onChange={(event) => onChange({ amount: event.target.value })}
                    placeholder="125000"
                    className={cn(
                      INPUT_CLASS,
                      "text-lg font-semibold tabular-nums",
                    )}
                    required
                  />
                </Field>

                <Field label={recurring ? "Occurrence date" : "Expense date"}>
                  {recurring ? (
                    <select
                      value={form.date}
                      onChange={(event) => onChange({ date: event.target.value })}
                      className={INPUT_CLASS}
                      required
                    >
                      <option value="" disabled>
                        Select occurrence date
                      </option>
                      {remainingOccurrenceDates.map((date) => (
                        <option key={date} value={date}>
                          {formatTodoDate(date)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) => onChange({ date: event.target.value })}
                      className={INPUT_CLASS}
                      required
                    />
                  )}
                </Field>
              </div>

              {recurring ? (
                <p className="text-xs leading-5 text-text-secondary">
                  Default amount is split from the remaining budget across the
                  remaining occurrence dates. You can override it before saving.
                </p>
              ) : null}
            </section>
          ) : null}

          {step === 4 ? (
            <>
              <section className={cn(SECTION_CLASS, "grid gap-2.5 sm:grid-cols-3")}>
                <MiniStat
                  label="Amount"
                  value={form.amount.trim() ? rwf(Number(form.amount)) : "—"}
                />
                <MiniStat
                  label="Category"
                  value={
                    categories.find((category) => category.value === form.category)
                      ?.label ?? "—"
                  }
                />
                <MiniStat
                  label={recurring ? "Occurrence date" : "Expense date"}
                  value={form.date ? formatTodoDate(form.date) : "—"}
                />
              </section>

              <section className={SECTION_CLASS}>
                <div className="rounded-[18px] border border-white/8 bg-surface-elevated/70 px-4 py-3">
                  <p className={EYEBROW_CLASS}>What happens on save</p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {recurring
                      ? "The chosen occurrence is recorded as an expense and deducted from the todo's remaining recurring budget."
                      : "The todo is recorded as an expense and marked as done immediately after save."}
                  </p>
                </div>
              </section>
            </>
          ) : null}

          <DialogFooter
            step={step}
            saving={saving}
            recordable={recordable}
            canContinue={
              step === 1
                ? true
                : step === 2
                  ? canContinueFromStep2
                  : step === 3
                    ? canContinueFromStep3
                    : true
            }
            onClose={onClose}
            onBack={() => setStep((prev) => (prev - 1) as Step)}
            onContinue={() => setStep((prev) => (prev + 1) as Step)}
            onFinalSubmit={() => formRef.current?.requestSubmit()}
          />
        </form>
      </div>
    </Dialog>
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
        <StepDot index={3} active={step === 3} complete={step > 3} />
        <StepBar complete={step > 3} />
        <StepDot index={4} active={step === 4} complete={false} />
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/70">
        Step {step} of 4 · {STEP_LABELS[step]}
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

function DialogFooter({
  step,
  saving,
  recordable,
  canContinue,
  onClose,
  onBack,
  onContinue,
  onFinalSubmit,
}: {
  step: Step;
  saving: boolean;
  recordable: boolean;
  canContinue: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
  onFinalSubmit: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
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

      {step < 4 ? (
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
          disabled={saving || !recordable}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[180px]"
        >
          {saving
            ? "Recording..."
            : !recordable
              ? "No remaining budget"
              : "Record expense"}
        </button>
      )}
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
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-surface-elevated/70 px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
        {label}
      </p>
      <p
        className={`mt-2 line-clamp-2 text-sm font-semibold text-text-primary ${valueClassName ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}

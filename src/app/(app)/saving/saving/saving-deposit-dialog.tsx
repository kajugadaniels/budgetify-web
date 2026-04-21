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
import type { Currency } from "@/lib/types/currency.types";
import type { IncomeResponse } from "@/lib/types/income.types";
import type { SavingResponse } from "@/lib/types/saving.types";
import { cn } from "@/lib/utils/cn";
import { rwf } from "@/lib/utils/currency";
import type {
  SavingDepositFormValues,
  SavingSourceAllocationValues,
} from "./saving-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

const SELECT_TRIGGER_CLASS =
  "h-[50px] w-full rounded-2xl border-border bg-surface-elevated text-sm text-text-primary focus-visible:border-primary/60 focus-visible:ring-primary/20";

const SECTION_CLASS =
  "rounded-[22px] border border-white/8 bg-background/36 p-4 sm:p-5";

const EYEBROW_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/60";

type Step = 1 | 2;

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
  const [step, setStep] = useState<Step>(1);

  const depositAmount = Number(form.amount) || 0;
  const totalSourceAmount = form.sources.reduce((sum, source) => {
    const amount = Number(source.amount);
    return Number.isNaN(amount) ? sum : sum + amount;
  }, 0);

  const sourceCurrency = form.sources[0]?.currency ?? form.currency;
  const allocationMatches =
    form.currency === sourceCurrency &&
    depositAmount > 0 &&
    Math.abs(depositAmount - totalSourceAmount) < 0.01;

  const canContinue =
    form.amount.trim().length > 0 &&
    Number(form.amount) > 0 &&
    form.date.trim().length > 0;

  return (
    <Dialog onClose={onClose} className="sm:max-w-xl p-4 sm:p-5">
      <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(111,207,151,0.14),transparent_72%)]" />

        <Header
          label={entry.label}
          step={step}
          onClose={onClose}
        />

        <StepProgress step={step} />

        <form className="relative z-10 mt-6 space-y-5" onSubmit={onSubmit}>
          {step === 1 ? (
            <StepOne entry={entry} form={form} onChange={onChange} />
          ) : (
            <StepTwo
              form={form}
              incomes={incomes}
              totalSourceAmount={totalSourceAmount}
              sourceCurrency={sourceCurrency}
              depositAmount={depositAmount}
              allocationMatches={allocationMatches}
              onSourceChange={onSourceChange}
              onAddSource={onAddSource}
              onRemoveSource={onRemoveSource}
            />
          )}

          <DialogFooter
            step={step}
            saving={saving}
            canContinue={canContinue}
            onClose={onClose}
            onContinue={() => canContinue && setStep(2)}
            onBack={() => setStep(1)}
          />
        </form>
      </div>
    </Dialog>
  );
}

function Header({
  label,
  step,
  onClose,
}: {
  label: string;
  step: Step;
  onClose: () => void;
}) {
  const description =
    step === 1
      ? "Step 1 — Enter how much you are depositing and when."
      : "Step 2 — Choose which received incomes funded this deposit.";

  return (
    <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Add money
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-heading-md text-text-primary sm:text-[1.45rem]">
          Fund {label}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          {description}
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
  );
}

function StepProgress({ step }: { step: Step }) {
  return (
    <div className="relative z-10 rounded-[20px] border border-white/8 bg-background/36 px-4 py-3">
      <div className="flex items-center gap-3">
        <StepDot
          index={1}
          active={step === 1}
          complete={step > 1}
          label="Deposit details"
        />
        <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/8">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500 ease-out",
              step === 1 ? "w-0" : "w-full",
            )}
          />
        </div>
        <StepDot index={2} active={step === 2} complete={false} label="Sources" />
      </div>
    </div>
  );
}

function StepDot({
  index,
  active,
  complete,
  label,
}: {
  index: number;
  active: boolean;
  complete: boolean;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
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
      <span
        className={cn(
          "hidden text-[11px] font-semibold uppercase tracking-[0.16em] sm:inline",
          active
            ? "text-text-primary"
            : complete
              ? "text-success"
              : "text-text-secondary/60",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function StepOne({
  entry,
  form,
  onChange,
}: {
  entry: SavingResponse;
  form: SavingDepositFormValues;
  onChange: (next: Partial<SavingDepositFormValues>) => void;
}) {
  return (
    <>
      <section className={cn(SECTION_CLASS, "grid gap-3 sm:grid-cols-3")}>
        <MiniStat
          label="Current balance"
          value={rwf(entry.currentBalanceRwf)}
          valueClassName="text-text-primary"
        />
        <MiniStat
          label="Total deposited"
          value={rwf(entry.totalDepositedRwf)}
          valueClassName="text-success"
        />
        <MiniStat
          label="Saving currency"
          value={entry.currency}
          valueClassName="text-primary"
        />
      </section>

      <section className={cn(SECTION_CLASS, "space-y-4")}>
        <p className={EYEBROW_CLASS}>Deposit details</p>

        <Field label="Amount">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0.01}
            value={form.amount}
            onChange={(event) => onChange({ amount: event.target.value })}
            placeholder="150000"
            className={cn(INPUT_CLASS, "text-lg font-semibold tabular-nums")}
            autoFocus
            required
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Currency">
            <CurrencySelect
              value={form.currency}
              onChange={(value) => onChange({ currency: value })}
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

        <Field label="Note (optional)">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Moved part of salary into this saving"
            className={cn(INPUT_CLASS, "min-h-[84px] resize-none")}
            maxLength={500}
          />
        </Field>
      </section>
    </>
  );
}

function StepTwo({
  form,
  incomes,
  totalSourceAmount,
  sourceCurrency,
  depositAmount,
  allocationMatches,
  onSourceChange,
  onAddSource,
  onRemoveSource,
}: {
  form: SavingDepositFormValues;
  incomes: IncomeResponse[];
  totalSourceAmount: number;
  sourceCurrency: Currency;
  depositAmount: number;
  allocationMatches: boolean;
  onSourceChange: (
    index: number,
    next: Partial<SavingSourceAllocationValues>,
  ) => void;
  onAddSource: () => void;
  onRemoveSource: (index: number) => void;
}) {
  const remaining = depositAmount - totalSourceAmount;
  const sameCurrency = form.currency === sourceCurrency;

  return (
    <>
      <section className={cn(SECTION_CLASS, "grid gap-3 sm:grid-cols-3")}>
        <MiniStat
          label="Depositing"
          value={`${depositAmount.toLocaleString()} ${form.currency}`}
          valueClassName="text-text-primary"
        />
        <MiniStat
          label="Allocated"
          value={`${totalSourceAmount.toLocaleString()} ${sourceCurrency}`}
          valueClassName={
            allocationMatches ? "text-success" : "text-text-primary"
          }
        />
        <MiniStat
          label="Remaining"
          value={
            sameCurrency
              ? `${remaining.toLocaleString()} ${form.currency}`
              : "—"
          }
          valueClassName={
            !sameCurrency
              ? "text-text-secondary"
              : remaining === 0
                ? "text-success"
                : remaining < 0
                  ? "text-danger"
                  : "text-primary"
          }
        />
      </section>

      <section className={cn(SECTION_CLASS, "space-y-4")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={EYEBROW_CLASS}>Source incomes</p>
            <p className="mt-1.5 text-xs leading-5 text-text-secondary">
              Pick received income records and allocate how much of each flows
              into this saving.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddSource}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/24 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/18"
          >
            <span className="text-base leading-none">+</span>
            Add source
          </button>
        </div>

        <div className="space-y-3">
          {form.sources.map((source, index) => (
            <SourceCard
              key={`${index}-${source.incomeId}`}
              index={index}
              source={source}
              incomes={incomes}
              canRemove={form.sources.length > 1}
              onChange={(next) => onSourceChange(index, next)}
              onRemove={() => onRemoveSource(index)}
            />
          ))}
        </div>

        {allocationMatches ? (
          <div className="flex items-center gap-2 rounded-[18px] border border-success/25 bg-success/8 px-4 py-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success">
              ✓
            </span>
            <p className="text-xs font-medium text-success">
              Sources match the deposit amount
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}

function SourceCard({
  index,
  source,
  incomes,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  source: SavingSourceAllocationValues;
  incomes: IncomeResponse[];
  canRemove: boolean;
  onChange: (next: Partial<SavingSourceAllocationValues>) => void;
  onRemove: () => void;
}) {
  const selectedIncome = incomes.find(
    (income) => income.id === source.incomeId,
  );

  return (
    <div className="rounded-[20px] border border-white/8 bg-surface-elevated/60 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/70">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/18 text-[10px] font-bold text-primary">
            {index + 1}
          </span>
          Source {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="text-xs font-medium text-text-secondary transition-colors hover:text-danger disabled:pointer-events-none disabled:opacity-35"
        >
          Remove
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_150px]">
        <Field label="Income">
          <Select
            value={source.incomeId || undefined}
            onValueChange={(value) => onChange({ incomeId: value })}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select income" />
            </SelectTrigger>
            <SelectContent>
              {incomes.length === 0 ? (
                <div className="px-3 py-2 text-xs text-text-secondary">
                  No received incomes available
                </div>
              ) : (
                incomes.map((income) => (
                  <SelectItem key={income.id} value={income.id}>
                    {income.label} · {rwf(income.amountRwf)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Amount taken">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0.01}
            value={source.amount}
            onChange={(event) => onChange({ amount: event.target.value })}
            className={INPUT_CLASS}
            placeholder="50000"
            required
          />
        </Field>

        <Field label="Currency">
          <CurrencySelect
            value={source.currency}
            onChange={(value) => onChange({ currency: value })}
          />
        </Field>
      </div>

      {selectedIncome ? (
        <p className="mt-3 text-[11px] leading-5 text-text-secondary/80">
          Available from{" "}
          <span className="font-semibold text-text-primary">
            {selectedIncome.label}
          </span>
          : {rwf(selectedIncome.amountRwf)}
        </p>
      ) : null}
    </div>
  );
}

function DialogFooter({
  step,
  saving,
  canContinue,
  onClose,
  onContinue,
  onBack,
}: {
  step: Step;
  saving: boolean;
  canContinue: boolean;
  onClose: () => void;
  onContinue: () => void;
  onBack: () => void;
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

      {step === 1 ? (
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[180px]"
        >
          Continue
          <span aria-hidden="true">→</span>
        </button>
      ) : (
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[180px]"
        >
          {saving ? "Adding..." : "Add money"}
        </button>
      )}
    </div>
  );
}

function CurrencySelect({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (value: Currency) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as Currency)}>
      <SelectTrigger className={SELECT_TRIGGER_CLASS}>
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="RWF">RWF</SelectItem>
        <SelectItem value="USD">USD</SelectItem>
      </SelectContent>
    </Select>
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
    <div className="rounded-[18px] border border-white/8 bg-surface-elevated/70 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 line-clamp-2 text-sm font-semibold text-text-primary tabular-nums",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

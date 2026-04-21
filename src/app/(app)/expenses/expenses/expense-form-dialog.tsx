"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import type {
  ExpenseCategoryOptionResponse,
  MobileMoneyQuoteResponse,
} from "@/lib/types/expense.types";
import { rwf } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { ExpenseFormValues } from "./expenses-page.types";
import {
  isMobileMoneyExpense,
  requiresMobileMoneyNetwork,
} from "./expenses.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

interface ExpenseFormDialogProps {
  categories: ExpenseCategoryOptionResponse[];
  form: ExpenseFormValues;
  mode: "create" | "edit";
  saving: boolean;
  quote: MobileMoneyQuoteResponse | null;
  quoteError: string | null;
  quoteLoading: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (next: Partial<ExpenseFormValues>) => void;
}

const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" },
] as const;

const MOBILE_MONEY_PROVIDER_OPTIONS = [
  { value: "MTN_RWANDA", label: "MTN Rwanda" },
  { value: "OTHER", label: "Other provider" },
] as const;

const MOBILE_MONEY_CHANNEL_OPTIONS = [
  { value: "MERCHANT_CODE", label: "Merchant code" },
  { value: "P2P_TRANSFER", label: "Normal transfer" },
] as const;

const MOBILE_MONEY_NETWORK_OPTIONS = [
  { value: "ON_NET", label: "MTN to MTN" },
  { value: "OFF_NET", label: "Other network" },
] as const;

const CURRENCY_OPTIONS = [
  { value: "RWF", label: "RWF" },
  { value: "USD", label: "USD" },
] as const;

export function ExpenseFormDialog({
  categories,
  form,
  mode,
  saving,
  quote,
  quoteError,
  quoteLoading,
  onClose,
  onSubmit,
  onChange,
}: ExpenseFormDialogProps) {
  const mobileMoney = isMobileMoneyExpense(form.paymentMethod);
  const needsNetwork = requiresMobileMoneyNetwork(form.mobileMoneyChannel);
  const parsedAmount = Number(form.amount);
  const basePreview =
    !Number.isNaN(parsedAmount) && parsedAmount > 0
      ? form.currency === "USD"
        ? `${parsedAmount.toFixed(2)} USD`
        : rwf(parsedAmount)
      : "Enter amount";

  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          {mode === "edit" ? "Edit expense" : "New expense"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          {mode === "edit" ? "Update entry" : "Add expense entry"}
        </h2>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Label">
          <input
            type="text"
            value={form.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="Rent for April"
            className={INPUT_CLASS}
            maxLength={120}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Recipient amount">
            <input
              type="number"
              value={form.amount}
              onChange={(event) => onChange({ amount: event.target.value })}
              placeholder="150000"
              min={1}
              step="0.01"
              className={INPUT_CLASS}
              required
            />
          </Field>

          <Field label="Currency">
            <Select
              value={form.currency}
              onValueChange={(value) =>
                onChange({ currency: value as ExpenseFormValues["currency"] })
              }
            >
              <SelectTrigger className={INPUT_CLASS}>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Payment method">
            <Select
              value={form.paymentMethod}
              onValueChange={(value) =>
                onChange({
                  paymentMethod: value as ExpenseFormValues["paymentMethod"],
                })
              }
            >
              <SelectTrigger className={INPUT_CLASS}>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {mobileMoney ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Provider">
              <Select
                value={form.mobileMoneyProvider}
                onValueChange={(value) =>
                  onChange({
                    mobileMoneyProvider:
                      value as ExpenseFormValues["mobileMoneyProvider"],
                  })
                }
              >
                <SelectTrigger className={INPUT_CLASS}>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {MOBILE_MONEY_PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Payment type">
              <Select
                value={form.mobileMoneyChannel}
                onValueChange={(value) =>
                  onChange({
                    mobileMoneyChannel:
                      value as ExpenseFormValues["mobileMoneyChannel"],
                  })
                }
              >
                <SelectTrigger className={INPUT_CLASS}>
                  <SelectValue placeholder="Select transfer type" />
                </SelectTrigger>
                <SelectContent>
                  {MOBILE_MONEY_CHANNEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {needsNetwork ? (
              <Field label="Network">
                <Select
                  value={form.mobileMoneyNetwork}
                  onValueChange={(value) =>
                    onChange({
                      mobileMoneyNetwork:
                        value as ExpenseFormValues["mobileMoneyNetwork"],
                    })
                  }
                >
                  <SelectTrigger className={INPUT_CLASS}>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOBILE_MONEY_NETWORK_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}
          </div>
        ) : null}

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

        <div className="grid gap-4 sm:grid-cols-3">
          <PreviewField label="Recipient amount" value={basePreview} />
          <PreviewField
            label="Transfer fee"
            value={
              mobileMoney
                ? quoteLoading
                  ? "Calculating..."
                  : quote
                    ? form.currency === "USD"
                      ? `${quote.feeAmount.toFixed(2)} USD`
                      : rwf(quote.feeAmount)
                    : quoteError ?? "Enter transfer details"
                : rwf(0)
            }
            muted={!mobileMoney}
          />
          <PreviewField
            label="Total charged"
            value={
              mobileMoney
                ? quoteLoading
                  ? "Calculating..."
                  : quote
                    ? rwf(quote.totalAmountRwf)
                    : quoteError ?? "Enter transfer details"
                : !Number.isNaN(parsedAmount) && parsedAmount > 0
                  ? form.currency === "USD"
                    ? `${parsedAmount.toFixed(2)} USD`
                    : rwf(parsedAmount)
                  : "Enter amount"
            }
          />
        </div>

        <Field label="Note">
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Optional context for this expense"
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
                : "Add expense"}
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

function PreviewField({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-surface-elevated px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/60">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-sm font-medium text-text-primary",
          muted && "text-text-secondary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

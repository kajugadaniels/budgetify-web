"use client";

import { Dialog } from "@/components/ui/dialog";
import type {
  ExpenseCategoryOptionResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import { rwf } from "@/lib/utils/currency";
import {
  formatExpenseDate,
  formatExpenseNote,
  resolveExpenseCategoryLabel,
  resolveExpenseMobileMoneyChannelLabel,
  resolveExpenseMobileMoneyNetworkLabel,
  resolveExpensePaymentMethodLabel,
} from "./expenses.utils";

interface ExpenseDetailsDialogProps {
  categories: ExpenseCategoryOptionResponse[];
  entry: ExpenseResponse;
  onClose: () => void;
}

export function ExpenseDetailsDialog({
  categories,
  entry,
  onClose,
}: ExpenseDetailsDialogProps) {
  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
            Expense details
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
            {entry.label}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {resolveExpenseCategoryLabel(categories, entry.category)} · Recorded{" "}
            {formatExpenseDate(entry.date)}
          </p>
          {entry.linkedTodo ? (
            <p className="mt-2 text-sm text-text-secondary">
              Linked todo: {entry.linkedTodo.todoName} · Occurrence{" "}
              {entry.linkedTodo.occurrenceDate}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{resolveExpensePaymentMethodLabel(entry.paymentMethod)}</Badge>
            {entry.mobileMoneyChannel ? (
              <Badge tone="primary">
                {resolveExpenseMobileMoneyChannelLabel(entry.mobileMoneyChannel)}
              </Badge>
            ) : null}
            {entry.mobileMoneyNetwork ? (
              <Badge tone="warning">
                {resolveExpenseMobileMoneyNetworkLabel(entry.mobileMoneyNetwork)}
              </Badge>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Close dialog"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Recipient amount"
            value={rwf(entry.amountRwf)}
            hint="Base amount intended for the recipient."
          />
          <StatCard
            label="Transfer fee"
            value={rwf(entry.feeAmountRwf)}
            hint="Extra mobile money charge applied by the payment channel."
          />
          <StatCard
            label="Total charged"
            value={rwf(entry.totalAmountRwf)}
            hint="What actually left your money balance."
          />
        </section>

        <section className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
            Payment breakdown
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InlineSummary
              label="Payment method"
              value={resolveExpensePaymentMethodLabel(entry.paymentMethod)}
            />
            <InlineSummary label="Currency" value={entry.currency} />
            <InlineSummary
              label="Original amount"
              value={
                entry.currency === "USD"
                  ? `${entry.amount.toFixed(2)} USD`
                  : rwf(entry.amount)
              }
            />
            <InlineSummary
              label="Recipient amount"
              value={rwf(entry.amountRwf)}
            />
            <InlineSummary
              label="Charged amount"
              value={rwf(entry.totalAmountRwf)}
            />
            {entry.mobileMoneyChannel ? (
              <InlineSummary
                label="Transfer type"
                value={resolveExpenseMobileMoneyChannelLabel(
                  entry.mobileMoneyChannel,
                )}
              />
            ) : null}
            {entry.mobileMoneyNetwork ? (
              <InlineSummary
                label="Network"
                value={resolveExpenseMobileMoneyNetworkLabel(
                  entry.mobileMoneyNetwork,
                )}
              />
            ) : null}
          </div>
        </section>

        {entry.linkedTodo ? (
          <section className="rounded-[24px] border border-primary/12 bg-primary/6 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
              Todo linkage
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <InlineSummary label="Todo" value={entry.linkedTodo.todoName} />
              <InlineSummary
                label="Occurrence"
                value={entry.linkedTodo.occurrenceDate}
              />
              <InlineSummary
                label="Recording"
                value={entry.linkedTodo.recordingId}
              />
            </div>
          </section>
        ) : null}

        <section className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
            Note
          </p>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {formatExpenseNote(entry.note)}
          </p>
        </section>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-text-primary">{value}</p>
      <p className="mt-2 text-xs leading-5 text-text-secondary">{hint}</p>
    </div>
  );
}

function InlineSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-surface-elevated/60 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "primary" | "warning";
}) {
  const className =
    tone === "primary"
      ? "border-primary/20 bg-primary/10 text-primary"
      : tone === "warning"
        ? "border-warning/20 bg-warning/10 text-warning"
        : "border-white/10 bg-white/[0.04] text-text-secondary";

  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}

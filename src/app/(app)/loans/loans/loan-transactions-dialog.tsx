"use client";

import { Dialog } from "@/components/ui/dialog";
import type {
  LoanResponse,
  LoanTransactionResponse,
} from "@/lib/types/loan.types";
import { rwf } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { LoanTransactionFormValues } from "./loans-page.types";
import {
  formatLoanDate,
  formatLoanBalanceEffect,
  formatLoanRepaymentAllocation,
  formatLoanStatus,
  formatLoanTransactionType,
  LOAN_BALANCE_EFFECT_OPTIONS,
  LOAN_TRANSACTION_TYPE_OPTIONS,
} from "./loans.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

interface LoanTransactionsDialogProps {
  entry: LoanResponse;
  form: LoanTransactionFormValues;
  loading: boolean;
  saving: boolean;
  linkingId: string | null;
  transactions: LoanTransactionResponse[];
  onChange: (next: Partial<LoanTransactionFormValues>) => void;
  onClose: () => void;
  onCreateExpenseFlow: (transaction: LoanTransactionResponse) => void;
  onCreateIncomeFlow: (transaction: LoanTransactionResponse) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LoanTransactionsDialog({
  entry,
  form,
  loading,
  saving,
  linkingId,
  transactions,
  onChange,
  onClose,
  onCreateExpenseFlow,
  onCreateIncomeFlow,
  onSubmit,
}: LoanTransactionsDialogProps) {
  return (
    <Dialog onClose={onClose} className="sm:max-w-4xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          Loan ledger
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          {entry.label}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {entry.counterpartyName} · {formatLoanStatus(entry.status)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_320px]">
        <section className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Principal outstanding"
              value={
                entry.currency === "RWF"
                  ? rwf(entry.principalOutstanding)
                  : `${entry.currency} ${entry.principalOutstanding.toLocaleString("en-US")}`
              }
              subValue={rwf(entry.principalOutstandingRwf)}
            />
            <SummaryCard
              label="Interest outstanding"
              value={
                entry.currency === "RWF"
                  ? rwf(entry.interestOutstanding)
                  : `${entry.currency} ${entry.interestOutstanding.toLocaleString("en-US")}`
              }
              subValue={rwf(entry.interestOutstandingRwf)}
            />
            <SummaryCard
              label="Total outstanding"
              value={
                entry.currency === "RWF"
                  ? rwf(entry.totalOutstanding)
                  : `${entry.currency} ${entry.totalOutstanding.toLocaleString("en-US")}`
              }
              subValue={rwf(entry.totalOutstandingRwf)}
            />
            <SummaryCard
              label="Interest charged"
              value={
                entry.currency === "RWF"
                  ? rwf(entry.interestCharged)
                  : `${entry.currency} ${entry.interestCharged.toLocaleString("en-US")}`
              }
              subValue={rwf(entry.interestChargedRwf)}
            />
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03]">
            <div className="border-b border-white/8 px-4 py-3">
              <p className="text-sm font-semibold text-text-primary">
                Transaction history
              </p>
            </div>
            <div className="max-h-[460px] overflow-y-auto">
              {loading ? (
                <div className="px-4 py-5 text-sm text-text-secondary">
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="px-4 py-5 text-sm text-text-secondary">
                  No transactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-white/6">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-2 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {formatLoanTransactionType(transaction.type)}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary/70">
                            {formatLoanDate(transaction.date)} ·{" "}
                            {formatLoanBalanceEffect(transaction.balanceEffect)} ·
                            {" "}recorded by{" "}
                            {transaction.recordedBy.firstName ??
                              transaction.recordedBy.lastName ??
                              "User"}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary/70">
                            Principal {rwf(transaction.principalAmountRwf)} ·
                            Interest {rwf(transaction.interestAmountRwf)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-text-primary">
                            {transaction.currency === "RWF"
                              ? rwf(transaction.amount)
                              : `${transaction.currency} ${transaction.amount.toLocaleString("en-US")}`}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary/70">
                            {rwf(transaction.amountRwf)} tracked
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {transaction.note ?? "No note"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {transaction.linkedExpense ? (
                          <span className="rounded-full border border-primary/16 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                            Linked expense · {transaction.linkedExpense.label}
                          </span>
                        ) : (
                          ((entry.direction === "LENT" &&
                            transaction.type === "DISBURSEMENT") ||
                            (entry.direction === "BORROWED" &&
                              transaction.balanceEffect === "DECREASE" &&
                              (transaction.type === "REPAYMENT" ||
                                transaction.type === "INTEREST_PAYMENT"))) && (
                            <button
                              type="button"
                              onClick={() => onCreateExpenseFlow(transaction)}
                              disabled={linkingId === transaction.id}
                              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/16 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {linkingId === transaction.id
                                ? "Linking..."
                                : "Send to expense"}
                            </button>
                          )
                        )}

                        {transaction.linkedIncome ? (
                          <span className="rounded-full border border-success/16 bg-success/8 px-3 py-1 text-xs font-medium text-success">
                            Linked income · {transaction.linkedIncome.label}
                          </span>
                        ) : (
                          entry.direction === "LENT" &&
                          transaction.balanceEffect === "DECREASE" &&
                          (transaction.type === "REPAYMENT" ||
                            transaction.type === "INTEREST_PAYMENT") && (
                            <button
                              type="button"
                              onClick={() => onCreateIncomeFlow(transaction)}
                              disabled={linkingId === transaction.id}
                              className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success transition-colors hover:bg-success/16 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {linkingId === transaction.id
                                ? "Linking..."
                                : "Send to income"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-sm font-semibold text-text-primary">
              Record transaction
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Append a new audited movement to this loan.
            </p>
            <p className="mt-2 text-xs text-text-secondary/75">
              Repayments default to{" "}
              {formatLoanRepaymentAllocation(entry.repaymentAllocation).toLowerCase()}{" "}
              unless you enter explicit principal and interest portions below.
            </p>
          </div>

          <Field label="Type">
            <select
              value={form.type}
              onChange={(event) =>
                onChange({
                  type: event.target.value as LoanTransactionFormValues["type"],
                })
              }
              className={INPUT_CLASS}
            >
              {LOAN_TRANSACTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Balance effect">
            <select
              value={form.balanceEffect}
              onChange={(event) =>
                onChange({
                  balanceEffect:
                    event.target.value as LoanTransactionFormValues["balanceEffect"],
                })
              }
              className={INPUT_CLASS}
              disabled={
                form.type !== "ADJUSTMENT" && form.type !== "REVERSAL"
              }
            >
              {LOAN_BALANCE_EFFECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount">
              <input
                type="number"
                value={form.amount}
                onChange={(event) => onChange({ amount: event.target.value })}
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
                    currency:
                      event.target.value as LoanTransactionFormValues["currency"],
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
            <Field label="Principal portion">
              <input
                type="number"
                value={form.principalAmount}
                onChange={(event) =>
                  onChange({ principalAmount: event.target.value })
                }
                min={0}
                className={INPUT_CLASS}
                placeholder="Defaults by transaction type"
              />
            </Field>

            <Field label="Interest portion">
              <input
                type="number"
                value={form.interestAmount}
                onChange={(event) =>
                  onChange({ interestAmount: event.target.value })
                }
                min={0}
                className={INPUT_CLASS}
                placeholder="Defaults by transaction type"
              />
            </Field>
          </div>

          <Field label="Transaction date">
            <input
              type="date"
              value={form.date}
              onChange={(event) => onChange({ date: event.target.value })}
              className={INPUT_CLASS}
              required
            />
          </Field>

          <Field label="Note">
            <textarea
              value={form.note}
              onChange={(event) => onChange({ note: event.target.value })}
              className={cn(INPUT_CLASS, "min-h-[116px] resize-none")}
              placeholder="Optional transaction context"
              maxLength={500}
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Recording..." : "Record transaction"}
            </button>
          </div>
        </form>
      </div>
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

function SummaryCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary/70">{subValue} tracked</p>
    </div>
  );
}

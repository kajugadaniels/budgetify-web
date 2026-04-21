"use client";

import { Dialog } from "@/components/ui/dialog";
import type { SavingResponse, SavingTransactionResponse } from "@/lib/types/saving.types";
import { rwf } from "@/lib/utils/currency";
import { formatSavingDate } from "./saving.utils";

interface SavingHistoryDialogProps {
  entry: SavingResponse;
  loading: boolean;
  reversingTransactionId: string | null;
  transactions: SavingTransactionResponse[];
  onClose: () => void;
  onReverseDeposit: (
    entry: SavingResponse,
    transaction: SavingTransactionResponse,
  ) => void;
}

export function SavingHistoryDialog({
  entry,
  loading,
  reversingTransactionId,
  transactions,
  onClose,
  onReverseDeposit,
}: SavingHistoryDialogProps) {
  return (
    <Dialog onClose={onClose} className="sm:max-w-4xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          Saving history
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          {entry.label}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Balance {rwf(entry.currentBalanceRwf)} · Deposited {rwf(entry.totalDepositedRwf)} · Withdrawn {rwf(entry.totalWithdrawnRwf)}
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-[22px] border border-white/8 bg-surface-elevated/60 px-4 py-6 text-sm text-text-secondary">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-[22px] border border-white/8 bg-surface-elevated/60 px-4 py-6 text-sm text-text-secondary">
            No transactions recorded for this saving yet.
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-[22px] border border-white/8 bg-surface-elevated/60 p-4"
            >
              {transaction.isReversal ? (
                <div className="mb-3 flex justify-start">
                  <span className="rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
                    Reversal withdrawal
                  </span>
                </div>
              ) : transaction.isReversed ? (
                <div className="mb-3 flex justify-start">
                  <span className="rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
                    Reversed deposit
                  </span>
                </div>
              ) : null}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {transaction.type === "DEPOSIT"
                      ? "Deposit"
                      : transaction.type === "WITHDRAWAL"
                        ? "Withdrawal"
                        : "Adjustment"}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {formatSavingDate(transaction.date)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  {rwf(transaction.amountRwf)}
                </p>
              </div>

              {transaction.note ? (
                <p className="mt-3 text-sm text-text-secondary">
                  {transaction.note}
                </p>
              ) : null}

              {transaction.type === "DEPOSIT" &&
              transaction.incomeSources.length > 0 ? (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onReverseDeposit(entry, transaction)}
                    disabled={reversingTransactionId === transaction.id}
                    className="rounded-full border border-danger/25 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/16 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {reversingTransactionId === transaction.id
                      ? "Reversing..."
                      : "Reverse allocation"}
                  </button>
                </div>
              ) : null}

              {transaction.incomeSources.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/60">
                    Source incomes
                  </p>
                  {transaction.incomeSources.map((source) => (
                    <div
                      key={source.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-background/35 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {source.incomeLabel}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {source.incomeCategory}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">
                        {rwf(source.amountRwf)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </Dialog>
  );
}

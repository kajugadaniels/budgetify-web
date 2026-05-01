"use client";

import { Dialog } from "@/components/ui/dialog";
import type {
  LoanResponse,
  LoanTransactionResponse,
} from "@/lib/types/loan.types";
import type { LoanTransactionReversalFormValues } from "./loans-page.types";
import {
  formatLoanDate,
  formatLoanTransactionType,
} from "./loans.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

interface LoanTransactionReversalDialogProps {
  entry: LoanResponse;
  transaction: LoanTransactionResponse;
  form: LoanTransactionReversalFormValues;
  saving: boolean;
  onChange: (next: Partial<LoanTransactionReversalFormValues>) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LoanTransactionReversalDialog({
  entry,
  transaction,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: LoanTransactionReversalDialogProps) {
  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-danger/65">
          Reverse transaction
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          {entry.label}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Reverse this ledger movement and automatically unlink any generated
          income or expense record.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="rounded-2xl border border-danger/12 bg-danger/6 px-4 py-4">
          <p className="text-sm font-semibold text-text-primary">
            {formatLoanTransactionType(transaction.type)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {formatLoanDate(transaction.date)} · {transaction.currency}{" "}
            {transaction.amount.toLocaleString("en-US")}
          </p>
          <p className="mt-2 text-xs text-text-secondary/75">
            Any linked {transaction.linkedExpense ? "expense" : "income"} record
            will be removed from the active ledger as part of this correction.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-secondary">
            Reversal date
          </span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => onChange({ date: event.target.value })}
            className={INPUT_CLASS}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-secondary">
            Reason
          </span>
          <textarea
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
            className={`${INPUT_CLASS} min-h-[120px] resize-none`}
            maxLength={500}
            placeholder="Optional audit context for why this transaction is being reversed"
          />
        </label>

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
            className="flex-1 rounded-2xl bg-danger px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Reversing..." : "Reverse transaction"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

import type { LoanResponse } from "@/lib/types/loan.types";
import { rwf } from "@/lib/utils/currency";
import { CreatedByPill } from "@/components/ui/created-by-pill";
import {
  formatLoanDate,
  formatLoanDirection,
  formatLoanNote,
  formatLoanStatus,
  formatLoanType,
  isLoanSettled,
  isLoanTerminalStatus,
} from "./loans.utils";

interface LoansTableProps {
  busyStatusId: string | null;
  entries: LoanResponse[];
  onDelete: (entry: LoanResponse) => void;
  onEdit: (entry: LoanResponse) => void;
  onSendToExpense: (entry: LoanResponse) => void;
  onTransactions: (entry: LoanResponse) => void;
  onToggleSettled: (entry: LoanResponse) => void;
}

export function LoansTable({
  busyStatusId,
  entries,
  onDelete,
  onEdit,
  onSendToExpense,
  onTransactions,
  onToggleSettled,
}: LoansTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] border-separate border-spacing-0">
        <thead>
          <tr className="text-left">
            {[
              "Loan",
              "Issued",
              "Due",
              "State",
              "Amount",
              "Note",
              "Actions",
            ].map((label) => (
              <th
                key={label}
                className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55 md:px-6"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="group">
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {entry.label}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary/70">
                    Created {formatLoanDate(entry.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary/70">
                    {formatLoanDirection(entry.direction)} · {formatLoanType(entry.type)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary/70">
                    {entry.counterpartyName}
                    {entry.counterpartyContact
                      ? ` · ${entry.counterpartyContact}`
                      : ""}
                  </p>
                  <CreatedByPill creator={entry.createdBy} />
                </div>
              </td>
              <td className="border-t border-white/6 px-5 py-4 text-sm text-text-secondary md:px-6">
                {formatLoanDate(entry.issuedDate)}
              </td>
              <td className="border-t border-white/6 px-5 py-4 text-sm text-text-secondary md:px-6">
                {entry.dueDate ? formatLoanDate(entry.dueDate) : "No due date"}
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <button
                  type="button"
                  onClick={() => onToggleSettled(entry)}
                  disabled={busyStatusId === entry.id}
                  aria-pressed={isLoanSettled(entry.status)}
                  className={`inline-flex min-w-[104px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
                    isLoanSettled(entry.status)
                      ? "border-success/25 bg-success/12 text-success"
                      : entry.status === "OVERDUE"
                        ? "border-danger/25 bg-danger/12 text-danger"
                        : "border-warning/25 bg-warning/10 text-warning"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {busyStatusId === entry.id
                    ? "Updating..."
                    : formatLoanStatus(entry.status)}
                </button>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    isLoanSettled(entry.status) ? "text-success" : "text-danger"
                  }`}
                >
                  {entry.currency === "RWF"
                    ? rwf(Number(entry.totalOutstanding))
                    : `${entry.currency} ${Number(entry.totalOutstanding).toLocaleString("en-US")}`}
                </p>
                <p className="mt-1 text-xs text-text-secondary/70">
                  {rwf(Number(entry.totalOutstandingRwf))} outstanding
                </p>
                <p className="mt-1 text-xs text-text-secondary/70">
                  Principal {rwf(Number(entry.principalOutstandingRwf))} · Interest {rwf(Number(entry.interestOutstandingRwf))}
                </p>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <p className="max-w-[260px] truncate text-sm text-text-secondary">
                  {formatLoanNote(entry.note)}
                </p>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <div className="flex items-center gap-2">
                  <button
                  type="button"
                  onClick={() => onSendToExpense(entry)}
                    disabled={
                      isLoanSettled(entry.status) ||
                      isLoanTerminalStatus(entry.status)
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isLoanSettled(entry.status) ||
                      isLoanTerminalStatus(entry.status)
                        ? "cursor-not-allowed border-success/14 bg-success/8 text-success/65"
                        : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/16"
                    }`}
                  >
                    {isLoanSettled(entry.status)
                      ? "Settled"
                      : entry.direction === "BORROWED"
                        ? "Send repayment to expense"
                        : "Send disbursement to expense"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleSettled(entry)}
                    disabled={
                      busyStatusId === entry.id || isLoanTerminalStatus(entry.status)
                    }
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {isLoanSettled(entry.status) ? "Reopen" : "Mark settled"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onTransactions(entry)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Transactions
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(entry)}
                    className="rounded-full border border-danger/25 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/16"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { LoanResponse } from "@/lib/types/loan.types";
import { rwf } from "@/lib/utils/currency";
import { CreatedByPill } from "@/components/ui/created-by-pill";
import {
  formatLoanDate,
  formatLoanDirection,
  formatLoanNote,
  formatLoanType,
} from "./loans.utils";

interface LoansTableProps {
  busyPaidId: string | null;
  entries: LoanResponse[];
  onDelete: (entry: LoanResponse) => void;
  onEdit: (entry: LoanResponse) => void;
  onSendToExpense: (entry: LoanResponse) => void;
  onTogglePaid: (entry: LoanResponse) => void;
}

export function LoansTable({
  busyPaidId,
  entries,
  onDelete,
  onEdit,
  onSendToExpense,
  onTogglePaid,
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
                  onClick={() => onTogglePaid(entry)}
                  disabled={busyPaidId === entry.id}
                  aria-pressed={entry.paid}
                  className={`inline-flex min-w-[104px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
                    entry.paid
                      ? "border-success/25 bg-success/12 text-success"
                      : "border-danger/25 bg-danger/10 text-danger"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {busyPaidId === entry.id
                    ? "Updating..."
                    : entry.paid
                      ? "Paid"
                      : "Open"}
                </button>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    entry.paid ? "text-success" : "text-danger"
                  }`}
                >
                  {entry.currency === "RWF"
                    ? rwf(Number(entry.amount))
                    : `${entry.currency} ${Number(entry.amount).toLocaleString("en-US")}`}
                </p>
                <p className="mt-1 text-xs text-text-secondary/70">
                  {rwf(Number(entry.amountRwf))} tracked
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
                    disabled={entry.paid || entry.direction !== "BORROWED"}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      entry.paid || entry.direction !== "BORROWED"
                        ? "cursor-not-allowed border-success/14 bg-success/8 text-success/65"
                        : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/16"
                    }`}
                  >
                    {entry.paid
                      ? "Settled"
                      : entry.direction === "BORROWED"
                        ? "Send to expense"
                        : "Income flow soon"}
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

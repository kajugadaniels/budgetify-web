import type { SavingResponse } from "@/lib/types/saving.types";
import { rwf } from "@/lib/utils/currency";
import { CreatedByPill } from "@/components/ui/created-by-pill";
import { formatSavingDate } from "./saving.utils";

interface SavingTableProps {
  entries: SavingResponse[];
  onDelete: (entry: SavingResponse) => void;
  onDetails: (entry: SavingResponse) => void;
  onEdit: (entry: SavingResponse) => void;
  onDeposit: (entry: SavingResponse) => void;
  onWithdraw: (entry: SavingResponse) => void;
  onViewHistory: (entry: SavingResponse) => void;
}

export function SavingTable({
  entries,
  onDelete,
  onDetails,
  onEdit,
  onDeposit,
  onWithdraw,
  onViewHistory,
}: SavingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] border-separate border-spacing-0">
        <thead>
          <tr className="text-left">
            {["Label", "Date", "Balance", "Actions"].map((label) => (
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
                    Created {formatSavingDate(entry.createdAt)}
                  </p>
                  <CreatedByPill creator={entry.createdBy} />
                </div>
              </td>
              <td className="border-t border-white/6 px-5 py-4 text-sm text-text-secondary md:px-6">
                {formatSavingDate(entry.date)}
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    entry.currentBalanceRwf > 0 ? "text-success" : "text-text-secondary"
                  }`}
                >
                  {rwf(entry.currentBalanceRwf)}
                </p>
                <p className="mt-1 text-xs text-text-secondary/70">
                  {entry.stillHave ? "Available" : "Empty"}
                </p>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDetails(entry)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeposit(entry)}
                    className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/16"
                  >
                    Add money
                  </button>
                  <button
                    type="button"
                    onClick={() => onWithdraw(entry)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Withdraw
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewHistory(entry)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    History
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

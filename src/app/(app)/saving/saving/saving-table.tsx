import type { SavingResponse } from "@/lib/types/saving.types";
import { usd } from "@/lib/utils/currency";
import { formatSavingDate, formatSavingNote } from "./saving.utils";

interface SavingTableProps {
  busyStillHaveId: string | null;
  entries: SavingResponse[];
  onDelete: (entry: SavingResponse) => void;
  onEdit: (entry: SavingResponse) => void;
  onRecordExpense: (entry: SavingResponse) => void;
  onToggleStillHave: (entry: SavingResponse) => void;
}

export function SavingTable({
  busyStillHaveId,
  entries,
  onDelete,
  onEdit,
  onRecordExpense,
  onToggleStillHave,
}: SavingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] border-separate border-spacing-0">
        <thead>
          <tr className="text-left">
            {["Label", "Date", "Still have", "Amount", "Note", "Actions"].map((label) => (
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
                </div>
              </td>
              <td className="border-t border-white/6 px-5 py-4 text-sm text-text-secondary md:px-6">
                {formatSavingDate(entry.date)}
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={entry.stillHave}
                    onClick={() => onToggleStillHave(entry)}
                    disabled={busyStillHaveId === entry.id}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      entry.stillHave ? "bg-success/90" : "bg-danger/70"
                    } disabled:cursor-not-allowed disabled:opacity-55`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        entry.stillHave ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                      entry.stillHave ? "text-success" : "text-danger"
                    }`}
                  >
                    {busyStillHaveId === entry.id
                      ? "Updating"
                      : entry.stillHave
                        ? "Yes"
                        : "No"}
                  </span>
                </div>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    entry.stillHave ? "text-success" : "text-text-secondary"
                  }`}
                >
                  {usd(Number(entry.amount))}
                </p>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <p className="max-w-[260px] truncate text-sm text-text-secondary">
                  {formatSavingNote(entry.note)}
                </p>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRecordExpense(entry)}
                    className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/16"
                  >
                    Record expense
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

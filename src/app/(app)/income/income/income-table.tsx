import type {
  IncomeCategoryOptionResponse,
  IncomeResponse,
} from "@/lib/types/income.types";
import { rwf } from "@/lib/utils/currency";
import { CreatedByPill } from "@/components/ui/created-by-pill";
import {
  formatIncomeDate,
  resolveIncomeCategoryLabel,
} from "./income.utils";

interface IncomeTableProps {
  busyReceivedId: string | null;
  categories: IncomeCategoryOptionResponse[];
  canEdit: boolean;
  entries: IncomeResponse[];
  onDelete: (entry: IncomeResponse) => void;
  onEdit: (entry: IncomeResponse) => void;
  onRecordNextMonth: (entry: IncomeResponse) => void;
  onToggleReceived: (entry: IncomeResponse) => void;
}

export function IncomeTable({
  busyReceivedId,
  categories,
  canEdit,
  entries,
  onDelete,
  onEdit,
  onRecordNextMonth,
  onToggleReceived,
}: IncomeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-separate border-spacing-0">
        <thead>
          <tr className="text-left">
            {["Source", "Category", "Date", "Cash State", "Amount", "Actions"].map((label) => (
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
                    Created {formatIncomeDate(entry.createdAt)}
                  </p>
                  <CreatedByPill creator={entry.createdBy} />
                </div>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {resolveIncomeCategoryLabel(categories, entry.category)}
                </span>
              </td>
              <td className="border-t border-white/6 px-5 py-4 text-sm text-text-secondary md:px-6">
                {formatIncomeDate(entry.date)}
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <button
                  type="button"
                  onClick={() => onToggleReceived(entry)}
                  disabled={busyReceivedId === entry.id}
                  aria-pressed={entry.received}
                  className={`inline-flex min-w-[112px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
                    entry.received
                      ? "border-success/25 bg-success/12 text-success"
                      : "border-primary/25 bg-primary/10 text-primary"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {busyReceivedId === entry.id
                    ? "Updating..."
                    : entry.received
                      ? "Received"
                      : "Scheduled"}
                </button>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <p className="text-sm font-semibold tabular-nums text-success">
                  {rwf(entry.amountRwf)}
                </p>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    disabled={!canEdit}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRecordNextMonth(entry)}
                    disabled={!canEdit}
                    className="rounded-full border border-primary/18 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/14 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Record for next month
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

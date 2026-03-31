import type {
  IncomeCategoryOptionResponse,
  IncomeResponse,
} from "@/lib/types/income.types";
import { rwf } from "@/lib/utils/currency";
import {
  formatIncomeDate,
  resolveIncomeCategoryLabel,
} from "./income.utils";

interface IncomeTableProps {
  categories: IncomeCategoryOptionResponse[];
  canEdit: boolean;
  entries: IncomeResponse[];
  onDelete: (entry: IncomeResponse) => void;
  onEdit: (entry: IncomeResponse) => void;
}

export function IncomeTable({
  categories,
  canEdit,
  entries,
  onDelete,
  onEdit,
}: IncomeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-0">
        <thead>
          <tr className="text-left">
            {["Source", "Category", "Date", "Amount", "Actions"].map((label) => (
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
                <p className="text-sm font-semibold tabular-nums text-success">
                  {rwf(Number(entry.amount))}
                </p>
              </td>
              <td className="border-t border-white/6 px-5 py-4 md:px-6">
                <div className="flex items-center gap-2">
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

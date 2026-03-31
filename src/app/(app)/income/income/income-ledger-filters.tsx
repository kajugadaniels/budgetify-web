import type { IncomeCategoryOptionResponse } from "@/lib/types/income.types";
import { cn } from "@/lib/utils/cn";
import type {
  IncomeLedgerCategoryFilter,
  IncomeLedgerReceivedFilter,
} from "./income-page.types";

const RECEIVED_FILTER_OPTIONS: Array<{
  label: string;
  value: IncomeLedgerReceivedFilter;
}> = [
  { label: "All", value: "ALL" },
  { label: "Received", value: "RECEIVED" },
  { label: "Pending", value: "PENDING" },
];

interface IncomeLedgerFiltersProps {
  category: IncomeLedgerCategoryFilter;
  categoryOptions: IncomeCategoryOptionResponse[];
  hasActiveFilters: boolean;
  received: IncomeLedgerReceivedFilter;
  onCategoryChange: (value: IncomeLedgerCategoryFilter) => void;
  onClear: () => void;
  onReceivedChange: (value: IncomeLedgerReceivedFilter) => void;
}

export function IncomeLedgerFilters({
  category,
  categoryOptions,
  hasActiveFilters,
  received,
  onCategoryChange,
  onClear,
  onReceivedChange,
}: IncomeLedgerFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
            Category
          </span>
          <select
            value={category}
            onChange={(event) =>
              onCategoryChange(event.target.value as IncomeLedgerCategoryFilter)
            }
            className="min-w-[190px] rounded-full border border-white/10 bg-background-secondary px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary/45"
          >
            <option value="ALL">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
            Received
          </span>
          <div className="inline-flex flex-wrap gap-2 rounded-full border border-white/8 bg-background-secondary/70 p-1.5">
            {RECEIVED_FILTER_OPTIONS.map((option) => {
              const active = received === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onReceivedChange(option.value)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all",
                    active
                      ? option.value === "RECEIVED"
                        ? "bg-success text-background"
                        : option.value === "PENDING"
                          ? "bg-primary text-background"
                          : "bg-white/10 text-text-primary"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-text-primary"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

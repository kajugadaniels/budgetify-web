import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTH_OPTIONS } from "@/constant/months";
import type { IncomeCategoryOptionResponse } from "@/lib/types/income.types";
import type {
  IncomeLedgerCategoryFilter,
  IncomeLedgerReceivedFilter,
} from "./income-page.types";

interface IncomeLedgerFiltersProps {
  category: IncomeLedgerCategoryFilter;
  categoryOptions: IncomeCategoryOptionResponse[];
  dateFrom: string;
  dateTo: string;
  hasActiveFilters: boolean;
  month: number;
  received: IncomeLedgerReceivedFilter;
  search: string;
  onCategoryChange: (value: IncomeLedgerCategoryFilter) => void;
  onClear: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onMonthChange: (value: number) => void;
  onReceivedChange: (value: IncomeLedgerReceivedFilter) => void;
  onSearchChange: (value: string) => void;
}

export function IncomeLedgerFilters({
  category,
  categoryOptions,
  dateFrom,
  dateTo,
  hasActiveFilters,
  month,
  received,
  search,
  onCategoryChange,
  onClear,
  onDateFromChange,
  onDateToChange,
  onMonthChange,
  onReceivedChange,
  onSearchChange,
}: IncomeLedgerFiltersProps) {
  return (
    <div className="border-b border-white/8 px-5 py-4 md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block w-full max-w-md">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search source or category"
            className="h-11 w-full rounded-full border border-white/10 bg-background-secondary pl-4 pr-24 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/55 focus:border-primary/35"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/45">
            3+ chars
          </span>
        </label>

        <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="ml-auto flex min-w-max items-center justify-end gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              className="h-11 min-w-[148px] rounded-full border border-white/10 bg-background-secondary px-4 text-sm text-text-primary outline-none transition-colors [color-scheme:dark] focus:border-primary/35"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              className="h-11 min-w-[148px] rounded-full border border-white/10 bg-background-secondary px-4 text-sm text-text-primary outline-none transition-colors [color-scheme:dark] focus:border-primary/35"
            />

          <Select
            value={String(month)}
            onValueChange={(value) => onMonthChange(Number(value))}
          >
            <SelectTrigger className="h-11 min-w-[158px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
              {MONTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={category}
            onValueChange={(value) =>
              onCategoryChange(value as IncomeLedgerCategoryFilter)
            }
          >
            <SelectTrigger className="h-11 min-w-[188px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
              <SelectItem value="ALL">All categories</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={received}
            onValueChange={(value) =>
              onReceivedChange(value as IncomeLedgerReceivedFilter)
            }
          >
            <SelectTrigger className="h-11 min-w-[152px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
              <SelectValue placeholder="Received" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
              <SelectItem value="ALL">All states</SelectItem>
              <SelectItem value="RECEIVED">Received</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/4 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-text-primary"
            >
              Clear
            </button>
          ) : null}
        </div>
        </div>
      </div>
    </div>
  );
}

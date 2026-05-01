import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthStepper } from "@/components/ui/month-stepper";
import {
  buildLoanYearOptions,
  LOAN_DIRECTION_OPTIONS,
  LOAN_OPERATIONAL_FILTER_OPTIONS,
  LOAN_SORT_OPTIONS,
  LOAN_STATUS_OPTIONS,
  LOAN_TYPE_OPTIONS,
} from "./loans.utils";
import type {
  LoanLedgerDirectionFilter,
  LoanLedgerOperationalFilter,
  LoanLedgerSortFilter,
  LoanLedgerStatusFilter,
  LoanLedgerTypeFilter,
} from "./loans-page.types";

interface LoansLedgerFiltersProps {
  dateFrom: string;
  dateTo: string;
  direction: LoanLedgerDirectionFilter;
  hasActiveFilters: boolean;
  month: number;
  operationalFilter: LoanLedgerOperationalFilter;
  status: LoanLedgerStatusFilter;
  search: string;
  sortBy: LoanLedgerSortFilter;
  type: LoanLedgerTypeFilter;
  year: number;
  minOutstandingRwf: string;
  maxOutstandingRwf: string;
  onClear: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDirectionChange: (value: LoanLedgerDirectionFilter) => void;
  onOperationalFilterChange: (value: LoanLedgerOperationalFilter) => void;
  onMonthChange: (value: number) => void;
  onStatusChange: (value: LoanLedgerStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: LoanLedgerSortFilter) => void;
  onTypeChange: (value: LoanLedgerTypeFilter) => void;
  onYearChange: (value: number) => void;
  onMinOutstandingRwfChange: (value: string) => void;
  onMaxOutstandingRwfChange: (value: string) => void;
}

export function LoansLedgerFilters({
  dateFrom,
  dateTo,
  direction,
  hasActiveFilters,
  month,
  operationalFilter,
  status,
  search,
  sortBy,
  type,
  year,
  minOutstandingRwf,
  maxOutstandingRwf,
  onClear,
  onDateFromChange,
  onDateToChange,
  onDirectionChange,
  onOperationalFilterChange,
  onMonthChange,
  onStatusChange,
  onSearchChange,
  onSortByChange,
  onTypeChange,
  onYearChange,
  onMinOutstandingRwfChange,
  onMaxOutstandingRwfChange,
}: LoansLedgerFiltersProps) {
  const yearOptions = buildLoanYearOptions();

  return (
    <div className="border-b border-white/8 px-5 py-4 md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block w-full max-w-md">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search loan or note"
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

            <MonthStepper month={month} onChange={onMonthChange} />

            <Select
              value={String(year)}
              onValueChange={(value) => onYearChange(Number(value))}
            >
              <SelectTrigger className="h-11 min-w-[132px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) =>
                onStatusChange(value as LoanLedgerStatusFilter)
              }
            >
              <SelectTrigger className="h-11 min-w-[168px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                <SelectItem value="ALL">All statuses</SelectItem>
                {LOAN_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={direction}
              onValueChange={(value) =>
                onDirectionChange(value as LoanLedgerDirectionFilter)
              }
            >
              <SelectTrigger className="h-11 min-w-[168px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                <SelectItem value="ALL">All directions</SelectItem>
                {LOAN_DIRECTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={type}
              onValueChange={(value) => onTypeChange(value as LoanLedgerTypeFilter)}
            >
              <SelectTrigger className="h-11 min-w-[168px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                <SelectItem value="ALL">All types</SelectItem>
                {LOAN_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={operationalFilter}
              onValueChange={(value) =>
                onOperationalFilterChange(value as LoanLedgerOperationalFilter)
              }
            >
              <SelectTrigger className="h-11 min-w-[190px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                <SelectValue placeholder="Operational state" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                <SelectItem value="ALL">All operations</SelectItem>
                {LOAN_OPERATIONAL_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => onSortByChange(value as LoanLedgerSortFilter)}
            >
              <SelectTrigger className="h-11 min-w-[180px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                {LOAN_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <input
              type="number"
              min="0"
              value={minOutstandingRwf}
              onChange={(event) => onMinOutstandingRwfChange(event.target.value)}
              placeholder="Min outstanding"
              className="h-11 min-w-[160px] rounded-full border border-white/10 bg-background-secondary px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/55 focus:border-primary/35"
            />

            <input
              type="number"
              min="0"
              value={maxOutstandingRwf}
              onChange={(event) => onMaxOutstandingRwfChange(event.target.value)}
              placeholder="Max outstanding"
              className="h-11 min-w-[160px] rounded-full border border-white/10 bg-background-secondary px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/55 focus:border-primary/35"
            />

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

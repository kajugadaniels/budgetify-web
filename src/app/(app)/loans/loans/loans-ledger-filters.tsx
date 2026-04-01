import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_OPTIONS } from "@/constant/months";
import { buildLoanYearOptions } from "./loans.utils";
import type { LoanLedgerPaidFilter } from "./loans-page.types";

interface LoansLedgerFiltersProps {
  hasActiveFilters: boolean;
  month: number;
  paid: LoanLedgerPaidFilter;
  year: number;
  onClear: () => void;
  onMonthChange: (value: number) => void;
  onPaidChange: (value: LoanLedgerPaidFilter) => void;
  onYearChange: (value: number) => void;
}

export function LoansLedgerFilters({
  hasActiveFilters,
  month,
  paid,
  year,
  onClear,
  onMonthChange,
  onPaidChange,
  onYearChange,
}: LoansLedgerFiltersProps) {
  const yearOptions = buildLoanYearOptions();

  return (
    <div className="border-b border-white/8 px-5 py-4 md:px-6">
      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="ml-auto flex min-w-max items-center justify-end gap-3">
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
            value={paid}
            onValueChange={(value) => onPaidChange(value as LoanLedgerPaidFilter)}
          >
            <SelectTrigger className="h-11 min-w-[168px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
              <SelectValue placeholder="Paid" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
              <SelectItem value="ALL">All states</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
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
  );
}

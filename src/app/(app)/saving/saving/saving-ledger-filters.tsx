import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthStepper } from "@/components/ui/month-stepper";
import { buildSavingYearOptions } from "./saving.utils";

interface SavingLedgerFiltersProps {
  dateFrom: string;
  dateTo: string;
  hasActiveFilters: boolean;
  month: number;
  search: string;
  year: number;
  onClear: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onMonthChange: (value: number) => void;
  onSearchChange: (value: string) => void;
  onYearChange: (value: number) => void;
}

export function SavingLedgerFilters({
  dateFrom,
  dateTo,
  hasActiveFilters,
  month,
  search,
  year,
  onClear,
  onDateFromChange,
  onDateToChange,
  onMonthChange,
  onSearchChange,
  onYearChange,
}: SavingLedgerFiltersProps) {
  const yearOptions = buildSavingYearOptions();

  return (
    <div className="border-b border-white/8 px-5 py-4 md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block w-full max-w-md">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search saving or note"
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

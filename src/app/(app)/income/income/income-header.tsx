import { IncomeMonthFilter } from "./income-month-filter";

interface IncomeHeaderProps {
  canCreate: boolean;
  selectedMonth: number;
  selectedYear: number;
  onCreate: () => void;
  onMonthChange: (month: number) => void;
}

export function IncomeHeader({
  canCreate,
  selectedMonth,
  selectedYear,
  onCreate,
  onMonthChange,
}: IncomeHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-heading-lg text-text-primary">
            Income
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Review income by the month it is actually scheduled, not when it was created.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          disabled={!canCreate}
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add income
        </button>
      </div>

      <IncomeMonthFilter
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onChange={onMonthChange}
      />
    </header>
  );
}

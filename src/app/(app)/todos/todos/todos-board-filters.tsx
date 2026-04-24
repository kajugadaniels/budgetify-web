import type { TodoFrequency, TodoType } from "@/lib/types/todo.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_META } from "@/constant/todos/priority-meta";
import type {
  TodoBoardCadenceFilter,
  TodoBoardOperationalStateFilter,
  TodoBoardPriorityFilter,
  TodoBoardSortFilter,
  TodoBoardStatusFilter,
  TodoBoardTypeFilter,
} from "./todos-page.types";

const TODO_CADENCE_OPTIONS: Array<{
  label: string;
  value: TodoBoardCadenceFilter;
}> = [
  { label: "One-time", value: "ONCE" },
  { label: "Recurring", value: "RECURRING" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

const TODO_TYPE_OPTIONS: Array<{
  label: string;
  value: TodoType;
}> = [
  { label: "Wishlist", value: "WISHLIST" },
  { label: "Planned spend", value: "PLANNED_SPEND" },
  { label: "Recurring obligation", value: "RECURRING_OBLIGATION" },
];

const TODO_OPERATIONAL_STATE_OPTIONS: Array<{
  label: string;
  value: TodoBoardOperationalStateFilter;
}> = [
  { label: "Overdue", value: "OVERDUE" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Recorded", value: "RECORDED" },
  { label: "Unrecorded", value: "UNRECORDED" },
];

const TODO_SORT_OPTIONS: Array<{
  label: string;
  value: TodoBoardSortFilter;
}> = [
  { label: "Next occurrence", value: "NEXT_OCCURRENCE_ASC" },
  { label: "Newest first", value: "CREATED_AT_DESC" },
];

interface TodosBoardFiltersProps {
  dateFrom: string;
  dateTo: string;
  status: TodoBoardStatusFilter;
  cadence: TodoBoardCadenceFilter;
  hasActiveFilters: boolean;
  hasLinkedExpenseOnly: boolean;
  feeBearingOnly: boolean;
  priority: TodoBoardPriorityFilter;
  operationalState: TodoBoardOperationalStateFilter;
  remainingBudgetLte: string;
  sortBy: TodoBoardSortFilter;
  type: TodoBoardTypeFilter;
  search: string;
  onClear: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onStatusChange: (value: TodoBoardStatusFilter) => void;
  onCadenceChange: (value: TodoBoardCadenceFilter) => void;
  onHasLinkedExpenseOnlyChange: (value: boolean) => void;
  onFeeBearingOnlyChange: (value: boolean) => void;
  onPriorityChange: (value: TodoBoardPriorityFilter) => void;
  onOperationalStateChange: (value: TodoBoardOperationalStateFilter) => void;
  onRemainingBudgetLteChange: (value: string) => void;
  onSortByChange: (value: TodoBoardSortFilter) => void;
  onTypeChange: (value: TodoBoardTypeFilter) => void;
  onSearchChange: (value: string) => void;
}

export function TodosBoardFilters({
  dateFrom,
  dateTo,
  status,
  cadence,
  hasActiveFilters,
  hasLinkedExpenseOnly,
  feeBearingOnly,
  priority,
  operationalState,
  remainingBudgetLte,
  sortBy,
  type,
  search,
  onClear,
  onDateFromChange,
  onDateToChange,
  onStatusChange,
  onCadenceChange,
  onHasLinkedExpenseOnlyChange,
  onFeeBearingOnlyChange,
  onPriorityChange,
  onOperationalStateChange,
  onRemainingBudgetLteChange,
  onSortByChange,
  onTypeChange,
  onSearchChange,
}: TodosBoardFiltersProps) {
  return (
    <div className="border-b border-white/8 px-5 py-4 md:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative block w-full max-w-md">
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search a plan"
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
                value={sortBy}
                onValueChange={(value) =>
                  onSortByChange(value as TodoBoardSortFilter)
                }
              >
                <SelectTrigger className="h-11 min-w-[170px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                  {TODO_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={cadence}
                onValueChange={(value) =>
                  onCadenceChange(value as TodoBoardCadenceFilter)
                }
              >
                <SelectTrigger className="h-11 min-w-[170px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Cadence" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                  <SelectItem value="ALL">All cadence</SelectItem>
                  {TODO_CADENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={type}
                onValueChange={(value) =>
                  onTypeChange(value as TodoBoardTypeFilter)
                }
              >
                <SelectTrigger className="h-11 min-w-[182px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                  <SelectItem value="ALL">All plan types</SelectItem>
                  {TODO_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={priority}
                onValueChange={(value) =>
                  onPriorityChange(value as TodoBoardPriorityFilter)
                }
              >
                <SelectTrigger className="h-11 min-w-[182px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                  <SelectItem value="ALL">All priorities</SelectItem>
                  {Object.entries(PRIORITY_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(value) =>
                  onStatusChange(value as TodoBoardStatusFilter)
                }
              >
                <SelectTrigger className="h-11 min-w-[162px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                  <SelectItem value="ALL">All states</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="RECORDED">Recorded</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="SKIPPED">Skipped</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={operationalState}
                onValueChange={(value) =>
                  onOperationalStateChange(
                    value as TodoBoardOperationalStateFilter,
                  )
                }
              >
                <SelectTrigger className="h-11 min-w-[180px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Occurrence state" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                  <SelectItem value="ALL">All occurrence states</SelectItem>
                  {TODO_OPERATIONAL_STATE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-background-secondary px-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
                Remaining ≤
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={remainingBudgetLte}
                onChange={(event) =>
                  onRemainingBudgetLteChange(event.target.value)
                }
                placeholder="75000"
                className="w-24 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary/42"
              />
            </label>

            <button
              type="button"
              onClick={() =>
                onHasLinkedExpenseOnlyChange(!hasLinkedExpenseOnly)
              }
              className={
                hasLinkedExpenseOnly
                  ? "inline-flex h-11 items-center justify-center rounded-full border border-primary/22 bg-primary/12 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary"
                  : "inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/4 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-text-primary"
              }
            >
              Linked expense
            </button>

            <button
              type="button"
              onClick={() => onFeeBearingOnlyChange(!feeBearingOnly)}
              className={
                feeBearingOnly
                  ? "inline-flex h-11 items-center justify-center rounded-full border border-warning/22 bg-warning/12 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-warning/90"
                  : "inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/4 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-text-primary"
              }
            >
              Fee-bearing
            </button>
          </div>

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

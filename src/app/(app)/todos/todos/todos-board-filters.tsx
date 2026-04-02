import type { TodoFrequency } from "@/lib/types/todo.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_META } from "@/constant/todos/priority-meta";
import type {
  TodoBoardDoneFilter,
  TodoBoardFrequencyFilter,
  TodoBoardPriorityFilter,
} from "./todos-page.types";

const TODO_FREQUENCY_OPTIONS: Array<{
  label: string;
  value: TodoFrequency;
}> = [
  { label: "Once", value: "ONCE" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

interface TodosBoardFiltersProps {
  dateFrom: string;
  dateTo: string;
  done: TodoBoardDoneFilter;
  frequency: TodoBoardFrequencyFilter;
  hasActiveFilters: boolean;
  priority: TodoBoardPriorityFilter;
  search: string;
  onClear: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDoneChange: (value: TodoBoardDoneFilter) => void;
  onFrequencyChange: (value: TodoBoardFrequencyFilter) => void;
  onPriorityChange: (value: TodoBoardPriorityFilter) => void;
  onSearchChange: (value: string) => void;
}

export function TodosBoardFilters({
  dateFrom,
  dateTo,
  done,
  frequency,
  hasActiveFilters,
  priority,
  search,
  onClear,
  onDateFromChange,
  onDateToChange,
  onDoneChange,
  onFrequencyChange,
  onPriorityChange,
  onSearchChange,
}: TodosBoardFiltersProps) {
  return (
    <div className="border-b border-white/8 px-5 py-4 md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block w-full max-w-md">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search wishlist item"
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
              value={frequency}
              onValueChange={(value) =>
                onFrequencyChange(value as TodoBoardFrequencyFilter)
              }
            >
              <SelectTrigger className="h-11 min-w-[162px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                <SelectItem value="ALL">All frequencies</SelectItem>
                {TODO_FREQUENCY_OPTIONS.map((option) => (
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
              value={done}
              onValueChange={(value) => onDoneChange(value as TodoBoardDoneFilter)}
            >
              <SelectTrigger className="h-11 min-w-[162px] rounded-full border-white/10 bg-background-secondary px-4 text-sm text-text-primary hover:bg-background-secondary/90 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                <SelectValue placeholder="Done" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/10 bg-background-secondary text-text-primary">
                <SelectItem value="ALL">All states</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
                <SelectItem value="NOT_DONE">Not done</SelectItem>
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

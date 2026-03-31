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
  TodoBoardPriorityFilter,
} from "./todos-page.types";

interface TodosBoardFiltersProps {
  done: TodoBoardDoneFilter;
  hasActiveFilters: boolean;
  priority: TodoBoardPriorityFilter;
  onClear: () => void;
  onDoneChange: (value: TodoBoardDoneFilter) => void;
  onPriorityChange: (value: TodoBoardPriorityFilter) => void;
}

export function TodosBoardFilters({
  done,
  hasActiveFilters,
  priority,
  onClear,
  onDoneChange,
  onPriorityChange,
}: TodosBoardFiltersProps) {
  return (
    <div className="border-b border-white/8 px-5 py-4 md:px-6">
      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="ml-auto flex min-w-max items-center justify-end gap-3">
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
  );
}

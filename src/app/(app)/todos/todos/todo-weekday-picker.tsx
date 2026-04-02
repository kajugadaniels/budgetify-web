"use client";

import { cn } from "@/lib/utils/cn";
import { TODO_WEEKDAY_OPTIONS } from "./todos.utils";

interface TodoWeekdayPickerProps {
  selectedDays: number[];
  onChange: (nextDays: number[]) => void;
}

export function TodoWeekdayPicker({
  selectedDays,
  onChange,
}: TodoWeekdayPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      {TODO_WEEKDAY_OPTIONS.map((day) => {
        const selected = selectedDays.includes(day.value);

        return (
          <button
            key={day.value}
            type="button"
            aria-pressed={selected}
            onClick={() =>
              onChange(
                selected
                  ? selectedDays.filter((value) => value !== day.value)
                  : [...selectedDays, day.value],
              )
            }
            className={cn(
              "inline-flex items-center justify-center rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all",
              selected
                ? "border-primary bg-primary text-background shadow-[0_12px_28px_rgba(199,191,167,0.18)]"
                : "border-white/8 bg-surface-elevated/75 text-text-secondary hover:text-text-primary",
            )}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}

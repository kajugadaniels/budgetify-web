"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { getScheduleMonthBounds } from "./todos.utils";

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface TodoScheduleCalendarProps {
  endDate: string;
  selectedDates: string[];
  startDate: string;
  onChange: (nextDates: string[]) => void;
}

export function TodoScheduleCalendar({
  endDate,
  selectedDates,
  startDate,
  onChange,
}: TodoScheduleCalendarProps) {
  const { firstMonth, lastMonth } = useMemo(
    () => getScheduleMonthBounds(startDate, endDate),
    [endDate, startDate],
  );
  const [visibleMonth, setVisibleMonth] = useState(firstMonth);

  useEffect(() => {
    setVisibleMonth(firstMonth);
  }, [firstMonth]);

  const cells = useMemo(
    () =>
      buildCalendarCells({
        visibleMonth,
        selectedDates,
        startDate,
        endDate,
      }),
    [endDate, selectedDates, startDate, visibleMonth],
  );

  const canGoBack =
    visibleMonth.getUTCFullYear() > firstMonth.getUTCFullYear() ||
    (visibleMonth.getUTCFullYear() === firstMonth.getUTCFullYear() &&
      visibleMonth.getUTCMonth() > firstMonth.getUTCMonth());
  const canGoForward =
    visibleMonth.getUTCFullYear() < lastMonth.getUTCFullYear() ||
    (visibleMonth.getUTCFullYear() === lastMonth.getUTCFullYear() &&
      visibleMonth.getUTCMonth() < lastMonth.getUTCMonth());

  return (
    <section className="rounded-[20px] border border-white/8 bg-background/34 p-3.5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
            Occurrence calendar
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Tap the dates that should generate expense-ready occurrences.
          </p>
        </div>

        <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
          {selectedDates.length} selected
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            setVisibleMonth(
              new Date(
                Date.UTC(
                  visibleMonth.getUTCFullYear(),
                  visibleMonth.getUTCMonth() - 1,
                  1,
                ),
              ),
            )
          }
          disabled={!canGoBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary disabled:opacity-35"
        >
          ‹
        </button>

        <p className="text-sm font-semibold text-text-primary">
          {visibleMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </p>

        <button
          type="button"
          onClick={() =>
            setVisibleMonth(
              new Date(
                Date.UTC(
                  visibleMonth.getUTCFullYear(),
                  visibleMonth.getUTCMonth() + 1,
                  1,
                ),
              ),
            )
          }
          disabled={!canGoForward}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary disabled:opacity-35"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_HEADERS.map((label) => (
          <span
            key={label}
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary/48"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((cell, index) =>
          cell === null ? (
            <div key={`empty-${index}`} className="aspect-square" />
          ) : (
            <button
              key={cell.iso}
              type="button"
              disabled={cell.disabled}
              onClick={() =>
                onChange(
                  cell.selected
                    ? selectedDates.filter((value) => value !== cell.iso)
                    : [...selectedDates, cell.iso],
                )
              }
              className={cn(
                "aspect-square rounded-2xl border text-xs font-medium transition-all",
                cell.disabled
                  ? "border-white/6 bg-white/[0.02] text-text-secondary/24"
                  : cell.selected
                    ? "border-primary bg-primary text-background shadow-[0_12px_26px_rgba(199,191,167,0.18)]"
                    : "border-white/8 bg-surface-elevated/72 text-text-primary hover:border-primary/22 hover:text-primary",
              )}
            >
              {cell.day}
            </button>
          ),
        )}
      </div>
    </section>
  );
}

function buildCalendarCells(input: {
  endDate: string;
  selectedDates: string[];
  startDate: string;
  visibleMonth: Date;
}): Array<{ day: number; disabled: boolean; iso: string; selected: boolean } | null> {
  const firstDayOfMonth = new Date(
    Date.UTC(input.visibleMonth.getUTCFullYear(), input.visibleMonth.getUTCMonth(), 1),
  );
  const daysInMonth = new Date(
    Date.UTC(
      input.visibleMonth.getUTCFullYear(),
      input.visibleMonth.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();
  const leadingEmptyCells = firstDayOfMonth.getUTCDay();
  const cells: Array<{ day: number; disabled: boolean; iso: string; selected: boolean } | null> = [];
  const startTime = parseDateOnly(input.startDate).getTime();
  const endTime = parseDateOnly(input.endDate).getTime();

  for (let index = 0; index < leadingEmptyCells; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(
      Date.UTC(
        input.visibleMonth.getUTCFullYear(),
        input.visibleMonth.getUTCMonth(),
        day,
      ),
    );
    const iso = formatDateOnly(current);
    const currentTime = current.getTime();

    cells.push({
      day,
      iso,
      disabled: currentTime < startTime || currentTime >= endTime,
      selected: input.selectedDates.includes(iso),
    });
  }

  return cells;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

"use client";

import { useMemo, useState } from "react";
import { rwfCompact } from "@/lib/utils/currency";
import type { DashboardDailyBarDatum } from "./dashboard.utils";

interface DashboardBarChartProps {
  data: DashboardDailyBarDatum[];
  monthLabel: string;
  year: number;
}

function formatFocusDay(day: number, monthLabel: string, year: number): string {
  return `${monthLabel} ${day}, ${year}`;
}

export function DashboardBarChart({
  data,
  monthLabel,
  year,
}: DashboardBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartMeta = useMemo(() => {
    const peak = data.reduce(
      (max, point) => Math.max(max, point.income, point.expense),
      0,
    );

    let defaultIndex = 0;
    let highestTotal = 0;

    data.forEach((point, index) => {
      if (point.total >= highestTotal) {
        highestTotal = point.total;
        defaultIndex = index;
      }
    });

    return {
      activeDays: data.filter((point) => point.hasActivity).length,
      defaultIndex,
      hasData: data.some((point) => point.hasActivity),
      peak: peak || 1,
    };
  }, [data]);

  const activeIndex = hoveredIndex ?? chartMeta.defaultIndex;
  const activeDay = data[activeIndex] ?? data[0];

  return (
    <section className="animate-dashboard-fade motion-reduce:animate-none">
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(199,191,167,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(111,207,151,0.12),transparent_22%),linear-gradient(180deg,rgba(18,22,27,0.96),rgba(11,13,16,0.94))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-6">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/62">
                Daily flow
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-heading-lg text-text-primary md:text-[2rem]">
                Income and expense across each day
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                The chart reads the selected month day by day, pairing income
                and expense so you can spot the spikes instead of reading
                through lists.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-background/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl md:min-w-[320px] md:px-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/62">
                    Focus day
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-heading-sm text-text-primary">
                    {formatFocusDay(activeDay.day, monthLabel, year)}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
                  {chartMeta.hasData
                    ? `${chartMeta.activeDays} active days`
                    : "No activity"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-success/14 bg-success/8 px-3 py-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-success">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Income
                  </div>
                  <p className="mt-3 text-lg font-semibold text-text-primary">
                    {rwfCompact(activeDay.income)}
                  </p>
                </div>

                <div className="rounded-[22px] border border-danger/14 bg-danger/8 px-3 py-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-danger">
                    <span className="h-2 w-2 rounded-full bg-danger" />
                    Expense
                  </div>
                  <p className="mt-3 text-lg font-semibold text-text-primary">
                    {rwfCompact(activeDay.expense)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-5">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-text-secondary">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_18px_rgba(111,207,151,0.55)]" />
                  Income
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger shadow-[0_0_18px_rgba(255,122,122,0.4)]" />
                  Expense
                </span>
              </div>

              <p className="text-xs leading-5 text-text-secondary">
                Hover or focus any day to inspect its exact movement.
              </p>
            </div>

            <div className="relative mt-5">
              <div className="pointer-events-none absolute inset-x-0 bottom-7 top-0">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="absolute inset-x-0 border-t border-dashed border-white/7"
                    style={{ top: `${index * 25}%` }}
                  />
                ))}
              </div>

              <div className="overflow-x-auto pb-2 [scrollbar-width:none]">
                <div className="min-w-max">
                  <div className="flex items-end gap-2.5 sm:gap-3">
                    {data.map((point, index) => {
                      const incomeHeight = point.income
                        ? `${Math.max((point.income / chartMeta.peak) * 100, 10)}%`
                        : "4%";
                      const expenseHeight = point.expense
                        ? `${Math.max((point.expense / chartMeta.peak) * 100, 10)}%`
                        : "4%";
                      const isActive = activeIndex === index;

                      return (
                        <button
                          key={point.day}
                          type="button"
                          aria-label={`${formatFocusDay(point.day, monthLabel, year)} income ${rwfCompact(point.income)} expense ${rwfCompact(point.expense)}`}
                          aria-pressed={isActive}
                          className="group/chart flex w-10 shrink-0 flex-col items-center gap-3 outline-none sm:w-11"
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onFocus={() => setHoveredIndex(index)}
                          onBlur={() => setHoveredIndex(null)}
                        >
                          <div
                            className={`relative flex h-72 w-full items-end justify-center gap-1.5 rounded-[24px] px-2 pb-3 pt-6 transition-all duration-300 ${isActive ? "bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_22px_36px_rgba(0,0,0,0.18)]" : "bg-white/[0.02] hover:bg-white/[0.045]"}`}
                          >
                            <div
                              className={`absolute inset-x-2 bottom-0 top-5 rounded-[20px] border transition-colors duration-300 ${isActive ? "border-primary/22 bg-primary/5" : "border-white/6 bg-background/22"}`}
                            />

                            <span className="relative z-10 flex h-full w-[11px] items-end sm:w-[12px]">
                              <span className="absolute inset-0 rounded-full bg-white/[0.05]" />
                              <span
                                className="animate-dashboard-rise relative w-full origin-bottom rounded-full bg-[linear-gradient(180deg,rgba(111,207,151,0.95),rgba(111,207,151,0.34))] shadow-[0_0_24px_rgba(111,207,151,0.18)] motion-reduce:animate-none"
                                style={{
                                  animationDelay: `${100 + index * 24}ms`,
                                  height: incomeHeight,
                                }}
                              />
                            </span>

                            <span className="relative z-10 flex h-full w-[11px] items-end sm:w-[12px]">
                              <span className="absolute inset-0 rounded-full bg-white/[0.05]" />
                              <span
                                className="animate-dashboard-rise relative w-full origin-bottom rounded-full bg-[linear-gradient(180deg,rgba(255,122,122,0.95),rgba(255,122,122,0.34))] shadow-[0_0_24px_rgba(255,122,122,0.16)] motion-reduce:animate-none"
                                style={{
                                  animationDelay: `${160 + index * 24}ms`,
                                  height: expenseHeight,
                                }}
                              />
                            </span>
                          </div>

                          <span
                            className={`text-[11px] font-medium transition-colors duration-300 ${isActive ? "text-text-primary" : "text-text-secondary/72"}`}
                          >
                            {point.day}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {!chartMeta.hasData ? (
                <p className="mt-4 text-sm leading-6 text-text-secondary">
                  No income or expense entries were recorded for {monthLabel}{" "}
                  {year} yet. The chart stays ready and will animate as soon as
                  the first day is logged.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

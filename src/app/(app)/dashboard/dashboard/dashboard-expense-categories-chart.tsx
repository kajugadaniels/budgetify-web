"use client";

import { useMemo, useState } from "react";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import type { ExpenseCategory } from "@/lib/types/expense.types";
import type { DashboardExpenseCategoryDayDatum } from "./dashboard.utils";

interface DashboardExpenseCategoriesChartProps {
  data: DashboardExpenseCategoryDayDatum[];
  monthLabel: string;
  year: number;
}

interface CategoryTone {
  accent: string;
  chip: string;
  dot: string;
  fill: string;
  panel: string;
}

const CATEGORY_TONES: CategoryTone[] = [
  {
    accent: "text-sky-300",
    chip: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-400",
    fill: "bg-[linear-gradient(180deg,rgba(56,189,248,0.96),rgba(14,165,233,0.58))]",
    panel: "border-sky-400/18 bg-sky-500/8",
  },
  {
    accent: "text-emerald-300",
    chip: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    fill: "bg-[linear-gradient(180deg,rgba(74,222,128,0.96),rgba(22,163,74,0.58))]",
    panel: "border-emerald-400/18 bg-emerald-500/8",
  },
  {
    accent: "text-amber-300",
    chip: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
    fill: "bg-[linear-gradient(180deg,rgba(251,191,36,0.96),rgba(217,119,6,0.6))]",
    panel: "border-amber-400/18 bg-amber-500/8",
  },
  {
    accent: "text-violet-300",
    chip: "border-violet-400/20 bg-violet-500/10 text-violet-300",
    dot: "bg-violet-400",
    fill: "bg-[linear-gradient(180deg,rgba(167,139,250,0.96),rgba(124,58,237,0.58))]",
    panel: "border-violet-400/18 bg-violet-500/8",
  },
  {
    accent: "text-rose-300",
    chip: "border-rose-400/20 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
    fill: "bg-[linear-gradient(180deg,rgba(251,113,133,0.96),rgba(225,29,72,0.58))]",
    panel: "border-rose-400/18 bg-rose-500/8",
  },
  {
    accent: "text-cyan-300",
    chip: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    dot: "bg-cyan-400",
    fill: "bg-[linear-gradient(180deg,rgba(34,211,238,0.96),rgba(8,145,178,0.58))]",
    panel: "border-cyan-400/18 bg-cyan-500/8",
  },
  {
    accent: "text-orange-300",
    chip: "border-orange-400/20 bg-orange-500/10 text-orange-300",
    dot: "bg-orange-400",
    fill: "bg-[linear-gradient(180deg,rgba(251,146,60,0.96),rgba(234,88,12,0.58))]",
    panel: "border-orange-400/18 bg-orange-500/8",
  },
  {
    accent: "text-lime-300",
    chip: "border-lime-400/20 bg-lime-500/10 text-lime-300",
    dot: "bg-lime-400",
    fill: "bg-[linear-gradient(180deg,rgba(163,230,53,0.96),rgba(101,163,13,0.58))]",
    panel: "border-lime-400/18 bg-lime-500/8",
  },
];

function formatFocusDay(day: number, monthLabel: string, year: number): string {
  return `${monthLabel} ${day}, ${year}`;
}

export function DashboardExpenseCategoriesChart({
  data,
  monthLabel,
  year,
}: DashboardExpenseCategoriesChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartMeta = useMemo(() => {
    const totalsByCategory = new Map<
      ExpenseCategory,
      { amount: number; label: string }
    >();
    let peak = 0;
    let defaultIndex = 0;
    let highestTotal = 0;

    data.forEach((point, index) => {
      if (point.total >= highestTotal) {
        highestTotal = point.total;
        defaultIndex = index;
      }

      peak = Math.max(peak, point.total);

      point.segments.forEach((segment) => {
        const current = totalsByCategory.get(segment.category);

        totalsByCategory.set(segment.category, {
          amount: (current?.amount ?? 0) + segment.amount,
          label: segment.label,
        });
      });
    });

    const categories = Array.from(totalsByCategory.entries())
      .map(([category, totals], index) => ({
        amount: totals.amount,
        category,
        label: totals.label,
        tone: CATEGORY_TONES[index % CATEGORY_TONES.length]!,
      }))
      .sort((left, right) => right.amount - left.amount);

    return {
      activeDays: data.filter((point) => point.hasSpending).length,
      categories,
      defaultIndex,
      hasData: data.some((point) => point.hasSpending),
      peak: peak || 1,
    };
  }, [data]);

  const activeIndex = hoveredIndex ?? chartMeta.defaultIndex;
  const activeDay = data[activeIndex] ?? data[0];
  const categoryToneLookup = useMemo(
    () =>
      new Map(
        chartMeta.categories.map((category) => [category.category, category.tone]),
      ),
    [chartMeta.categories],
  );

  return (
    <section className="animate-dashboard-fade motion-reduce:animate-none">
      <div className="glass-panel rounded-[36px] p-5 md:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/62">
                Expense categories
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-heading-lg text-text-primary">
                Daily spending by category
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                Each day stacks the categories you spent on for the selected
                month, so you can see both the total outflow and exactly which
                categories drove it.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
              <div className="rounded-[24px] border border-white/8 bg-background-secondary/54 px-4 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/60">
                    Focus day
                  </p>
                  <p className="mt-2 text-base font-semibold tracking-heading-sm text-text-primary">
                    {activeDay
                      ? formatFocusDay(activeDay.day, monthLabel, year)
                      : `${monthLabel} ${year}`}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-background-secondary/54 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/60">
                  Total spent
                </p>
                <p className="mt-2 text-xl font-semibold tracking-heading-sm text-text-primary">
                  {rwfCompact(activeDay?.total ?? 0)}
                </p>
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  {activeDay?.hasSpending
                    ? `${activeDay.segments.length} categories recorded on this day`
                    : "No expense entries were recorded on this day."}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-background-secondary/54 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/60">
                  Spending days
                </p>
                <p className="mt-2 text-xl font-semibold tracking-heading-sm text-text-primary">
                  {chartMeta.activeDays}
                </p>
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  Days with at least one expense in {monthLabel} {year}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-background-secondary/44 p-4 md:p-5">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-4">
              <div className="flex flex-wrap gap-2.5">
                {chartMeta.categories.map((category) => (
                  <span
                    key={category.category}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${category.tone.chip}`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${category.tone.dot}`} />
                    {category.label}
                    <span className="text-text-secondary/78">
                      {rwfCompact(category.amount)}
                    </span>
                  </span>
                ))}
              </div>

              <p className="text-xs leading-5 text-text-secondary">
                Hover or focus any day to inspect its category mix in full.
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
                      const totalHeight = point.total
                        ? `${Math.max((point.total / chartMeta.peak) * 100, 10)}%`
                        : "4%";
                      const isActive = activeIndex === index;

                      return (
                        <button
                          key={point.day}
                          type="button"
                          aria-label={`${formatFocusDay(point.day, monthLabel, year)} total expense ${rwf(point.total)}`}
                          aria-pressed={isActive}
                          className="group/chart flex w-10 shrink-0 flex-col items-center gap-3 outline-none sm:w-11"
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onFocus={() => setHoveredIndex(index)}
                          onBlur={() => setHoveredIndex(null)}
                        >
                          <div
                            className={`relative flex h-72 w-full items-end justify-center rounded-[24px] border px-2 pb-3 pt-6 transition-colors ${isActive ? "border-white/14 bg-white/[0.05]" : "border-white/6 bg-background/28 hover:bg-white/[0.03]"}`}
                          >
                            <div className="absolute inset-x-2 bottom-3 top-5 rounded-[18px] bg-black/12" />

                            <div
                              className="animate-dashboard-rise relative z-10 flex w-full origin-bottom flex-col justify-end overflow-hidden rounded-[16px] motion-reduce:animate-none"
                              style={{
                                animationDelay: `${120 + index * 22}ms`,
                                height: totalHeight,
                              }}
                            >
                              {point.segments.map((segment) => {
                                const tone =
                                  categoryToneLookup.get(segment.category) ??
                                  CATEGORY_TONES[0];

                                return (
                                  <span
                                    key={segment.category}
                                    className={`block w-full border-t border-black/10 first:border-t-0 ${tone.fill}`}
                                    style={{ flex: `${segment.amount} 1 0%` }}
                                  />
                                );
                              })}
                            </div>
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
                  No expenses were recorded for {monthLabel} {year} yet. As
                  soon as spending is logged, this chart will break each day
                  down by category automatically.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/8 bg-background-secondary/44 p-4 md:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/62">
                  Category split
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                  {activeDay
                    ? formatFocusDay(activeDay.day, monthLabel, year)
                    : `${monthLabel} ${year}`}
                </h3>
              </div>
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                {rwfCompact(activeDay?.total ?? 0)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeDay?.segments.length ? (
                activeDay.segments.map((segment) => {
                  const tone =
                    categoryToneLookup.get(segment.category) ?? CATEGORY_TONES[0];
                  const share = activeDay.total
                    ? (segment.amount / activeDay.total) * 100
                    : 0;

                  return (
                    <div
                      key={segment.category}
                      className={`rounded-[22px] border px-4 py-3 ${tone.panel}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                            <p className={`truncate text-sm font-semibold ${tone.accent}`}>
                              {segment.label}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-text-secondary">
                            {share.toFixed(1)}% of that day&apos;s expense
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-text-primary">
                          {rwf(segment.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[22px] border border-white/8 bg-white/[0.02] px-4 py-5 text-sm leading-6 text-text-secondary md:col-span-2 xl:col-span-3">
                  This day has no recorded spending, so there is no category
                  split to display.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

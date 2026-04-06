"use client";

import Link from "next/link";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import type { DashboardTopSpendingCategoriesSummary } from "./dashboard.utils";

interface DashboardTopSpendingCategoriesProps {
  month: number;
  monthLabel: string;
  summary: DashboardTopSpendingCategoriesSummary;
  year: number;
}

export function DashboardTopSpendingCategories({
  month,
  monthLabel,
  summary,
  year,
}: DashboardTopSpendingCategoriesProps) {
  const rankedItems = summary.items.slice(0, 5);
  const topCategory = rankedItems[0];

  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/62">
            Top spending categories
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
            The categories taking the most money this month
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            This ranks the categories with the highest spend in {monthLabel}{" "}
            {year}, so you can scan where the month is being carried without
            reading the full chart first.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
              Total tracked
            </p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
              {rwfCompact(summary.totalAmount)}
            </p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
              Categories
            </p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
              {summary.items.length}
            </p>
          </div>
        </div>
      </div>

      {topCategory ? (
        <div className="mt-5 grid gap-4 2xl:grid-cols-[minmax(260px,0.84fr)_minmax(0,1.16fr)]">
          <Link
            href={`/expenses?category=${topCategory.category}&month=${month + 1}`}
            className="rounded-[28px] border border-primary/14 bg-[linear-gradient(160deg,rgba(196,164,132,0.12),rgba(255,255,255,0.02))] p-5 transition-colors hover:bg-[linear-gradient(160deg,rgba(196,164,132,0.16),rgba(255,255,255,0.03))]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/72">
              Leading category
            </p>
            <p className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em] text-text-primary">
              {topCategory.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-primary">
              {rwfCompact(topCategory.amount)}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-white/8 bg-background/34 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/58">
                  Share
                </p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {topCategory.share.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-[20px] border border-white/8 bg-background/34 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/58">
                  Entries
                </p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {topCategory.entryCount}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-text-secondary">
              {topCategory.label} alone accounts for {topCategory.share.toFixed(1)}
              % of all expense money recorded in {monthLabel} {year}.
            </p>
          </Link>

          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                Ranked categories
              </p>
              <span className="rounded-full border border-white/10 bg-background/50 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                Top {rankedItems.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {rankedItems.map((item, index) => (
                <Link
                  key={item.category}
                  href={`/expenses?category=${item.category}&month=${month + 1}`}
                  className="block rounded-[20px] border border-white/8 bg-background/30 px-4 py-3 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-text-primary">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-primary">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary">
                            {item.entryCount}{" "}
                            {item.entryCount === 1 ? "entry" : "entries"} •{" "}
                            {item.share.toFixed(1)}% of monthly spend
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(196,164,132,0.92),rgba(158,116,80,0.92))]"
                          style={{ width: `${Math.max(item.share, 5)}%` }}
                        />
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-text-primary">
                      {rwf(item.amount)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.03] px-5 py-6">
          <p className="text-sm font-semibold text-text-primary">
            No category spending yet.
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Once expenses are recorded in {monthLabel} {year}, the top spending
            categories will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

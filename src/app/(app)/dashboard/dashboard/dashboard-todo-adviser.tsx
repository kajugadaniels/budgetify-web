"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import type { DashboardTodoAdviserSummary } from "./dashboard.utils";

interface DashboardTodoAdviserProps {
  summary: DashboardTodoAdviserSummary;
}

export function DashboardTodoAdviser({
  summary,
}: DashboardTodoAdviserProps) {
  const router = useRouter();
  const [showFullTargetAmount, setShowFullTargetAmount] = useState(false);
  const reserveShare =
    summary.targetAmount > 0
      ? Math.min(Math.round((summary.remainingAmount / summary.targetAmount) * 100), 100)
      : 0;
  const previewItems = summary.items.slice(0, 4);
  const visibleTargetAmount = showFullTargetAmount
    ? rwf(summary.targetAmount)
    : rwfCompact(summary.targetAmount);

  if (summary.items.length === 0) {
    return (
      <section className="overflow-hidden rounded-[32px] border border-primary/10 bg-[linear-gradient(145deg,rgba(27,22,17,0.94)_0%,rgba(18,14,11,0.98)_100%)] p-6 md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              Todo adviser
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
              No weekly or monthly reserve needed right now
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              You do not have any open weekly or monthly todos at the moment, so
              there is no suggested reserve to keep aside for recurring plans.
            </p>
          </div>
          <span className="rounded-full border border-success/14 bg-success/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-success">
            Reserve clear
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-primary/12 bg-[linear-gradient(145deg,rgba(29,24,18,0.95)_0%,rgba(17,13,10,0.99)_100%)] p-6 md:p-7">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-warning/10 blur-3xl" />
      </div>

      <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
                Todo adviser
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
                Keep this money aside before you need it
              </h2>
            </div>
            <span className="rounded-full border border-primary/14 bg-primary/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              {summary.items.length} recurring {summary.items.length === 1 ? "todo" : "todos"}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
            These open weekly and monthly todos will still demand cash. Keep{" "}
            <span className="font-semibold text-text-primary">
              {rwf(summary.remainingAmount)}
            </span>{" "}
            reserved so you do not get caught short when the next expense hits.
          </p>

          <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                  Reserve target
                </p>
                <button
                  type="button"
                  onClick={() => setShowFullTargetAmount((current) => !current)}
                  aria-pressed={showFullTargetAmount}
                  className="mt-2 block text-left"
                >
                  <span className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-[-0.05em] text-white">
                    {visibleTargetAmount}
                  </span>
                  <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
                    Click to {showFullTargetAmount ? "collapse" : "expand"}
                  </span>
                </button>
              </div>
              <div className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1.5 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/58">
                  Still untouched
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {reserveShare}% reserved
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/7">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(217,188,104,0.45),rgba(217,188,104,1),rgba(255,225,150,0.7))]"
                style={{ width: `${reserveShare}%` }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] border border-white/6 bg-background/20 px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                  Planned total
                </p>
                <p className="mt-2 text-lg font-semibold text-text-primary">
                  {rwf(summary.targetAmount)}
                </p>
              </div>
              <div className="rounded-[18px] border border-danger/10 bg-danger/[0.06] px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-danger/70">
                  Already used
                </p>
                <p className="mt-2 text-lg font-semibold text-danger">
                  {rwf(summary.usedAmount)}
                </p>
              </div>
              <div className="rounded-[18px] border border-primary/10 bg-primary/[0.08] px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/74">
                  Remaining to keep
                </p>
                <p className="mt-2 text-lg font-semibold text-primary">
                  {rwf(summary.remainingAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
                What needs reserve
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                The recurring todos that will hit most often first.
              </p>
            </div>
            <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Top {previewItems.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[18px] border border-white/7 bg-background/20 px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {item.name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/todos?frequency=${item.frequency}`)
                        }
                        className="rounded-full border border-primary/12 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary/14"
                      >
                        {item.frequency === "WEEKLY" ? "Weekly" : "Monthly"}
                      </button>
                      <span className="text-[11px] text-text-secondary">
                        Keep {rwfCompact(item.remainingAmount)} ready
                      </span>
                      <span className="text-[11px] text-text-secondary/72">
                        {item.remainingOccurrenceCount} upcoming{" "}
                        {item.remainingOccurrenceCount === 1 ? "time" : "times"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary">Used</p>
                    <p className="mt-1 text-sm font-semibold text-danger">
                      {rwfCompact(item.usedAmount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {summary.items.length > previewItems.length ? (
            <p className="mt-4 text-xs leading-5 text-text-secondary">
              {summary.items.length - previewItems.length} more recurring todos
              are also included in the reserve recommendation.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

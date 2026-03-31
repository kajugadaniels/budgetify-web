"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiError } from "@/lib/api/client";
import { listLoans } from "@/lib/api/loans/loans.api";
import type { LoanResponse } from "@/lib/types/loan.types";
import {
  buildDashboardLoanStatusData,
  filterLoansByDateRange,
  formatDashboardDateLabel,
  type DashboardLoanDateRange,
  resolveDashboardLoanDateRange,
} from "./dashboard.utils";

const INPUT_CLASS =
  "h-11 min-w-[156px] rounded-2xl border border-white/10 bg-background-secondary/74 px-4 text-sm text-text-primary transition-colors focus:border-primary/45 focus:outline-none";

interface DashboardLoansChartProps {
  token: string | null;
}

export function DashboardLoansChart({ token }: DashboardLoansChartProps) {
  const [entries, setEntries] = useState<LoanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultRange, setDefaultRange] = useState<DashboardLoanDateRange>({
    from: "",
    to: "",
  });
  const [selectedRange, setSelectedRange] = useState<DashboardLoanDateRange>({
    from: "",
    to: "",
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    const sessionToken = token;
    let ignore = false;

    async function loadLoansOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await listLoans(sessionToken);

        if (!ignore) {
          setEntries(response);

          const nextRange = resolveDashboardLoanDateRange(response) ?? {
            from: "",
            to: "",
          };

          setDefaultRange(nextRange);
          setSelectedRange(nextRange);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "Loan overview could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadLoansOverview();

    return () => {
      ignore = true;
    };
  }, [token]);

  const filteredEntries = useMemo(
    () => filterLoansByDateRange(entries, selectedRange),
    [entries, selectedRange],
  );
  const statusData = useMemo(
    () => buildDashboardLoanStatusData(filteredEntries),
    [filteredEntries],
  );
  const totalLoans = filteredEntries.length;
  const paidLoans = statusData[0]?.value ?? 0;
  const unpaidLoans = statusData[1]?.value ?? 0;
  const peakValue = Math.max(...statusData.map((item) => item.value), 1);
  const hasCustomRange =
    selectedRange.from !== defaultRange.from || selectedRange.to !== defaultRange.to;

  if (loading) {
    return <div className="glass-panel h-[380px] animate-pulse rounded-[36px]" />;
  }

  if (error) {
    return (
      <section className="glass-panel rounded-[36px] p-6">
        <EmptyState
          title="Could not load loans overview"
          description={error}
          action={{
            label: "Refresh",
            onClick: () => window.location.reload(),
          }}
        />
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="glass-panel rounded-[36px] p-6">
        <EmptyState
          title="No loans to chart yet"
          description="Once loans are recorded, this section will show how many have been paid and how many are still open."
        />
      </section>
    );
  }

  return (
    <section className="glass-panel overflow-hidden rounded-[36px] p-5 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/62">
              Loans overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-heading-lg text-text-primary md:text-[2rem]">
              Paid versus open loans
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              This section looks across all recorded loans, independent from the
              monthly dashboard filters, and lets you focus on any date range you
              care about.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end xl:justify-end">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                From
              </span>
              <input
                type="date"
                value={selectedRange.from}
                onChange={(event) =>
                  setSelectedRange((current) => ({
                    ...current,
                    from: event.target.value,
                  }))
                }
                className={INPUT_CLASS}
                min={defaultRange.from || undefined}
                max={selectedRange.to || defaultRange.to || undefined}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                To
              </span>
              <input
                type="date"
                value={selectedRange.to}
                onChange={(event) =>
                  setSelectedRange((current) => ({
                    ...current,
                    to: event.target.value,
                  }))
                }
                className={INPUT_CLASS}
                min={selectedRange.from || defaultRange.from || undefined}
                max={defaultRange.to || undefined}
              />
            </label>

            {hasCustomRange ? (
              <button
                type="button"
                onClick={() => setSelectedRange(defaultRange)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/4 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-text-primary"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="rounded-[32px] border border-white/8 bg-background/32 p-6">
            <EmptyState
              title="No loans in this range"
              description="Try widening the dates to bring settled and open loan counts back into view."
              action={{
                label: "Reset range",
                onClick: () => setSelectedRange(defaultRange),
              }}
            />
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/62">
                Active range
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                {formatDashboardDateLabel(selectedRange.from)} to{" "}
                {formatDashboardDateLabel(selectedRange.to)}
              </h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Total loans"
                  tone="primary"
                  value={totalLoans}
                />
                <MetricCard label="Paid" tone="success" value={paidLoans} />
                <MetricCard
                  label="Not paid"
                  tone="danger"
                  value={unpaidLoans}
                />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(199,191,167,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex h-[280px] items-end gap-4 md:gap-5">
                {statusData.map((item, index) => {
                  const height = `${Math.max((item.value / peakValue) * 100, item.value > 0 ? 18 : 6)}%`;
                  const toneClasses =
                    item.tone === "paid"
                      ? {
                          accent: "text-success",
                          bar: "bg-[linear-gradient(180deg,rgba(111,207,151,0.96),rgba(111,207,151,0.26))] shadow-[0_0_28px_rgba(111,207,151,0.18)]",
                          shell: "border-success/14 bg-success/8",
                        }
                      : {
                          accent: "text-danger",
                          bar: "bg-[linear-gradient(180deg,rgba(255,122,122,0.96),rgba(255,122,122,0.28))] shadow-[0_0_28px_rgba(255,122,122,0.16)]",
                          shell: "border-danger/14 bg-danger/8",
                        };

                  return (
                    <div key={item.label} className="flex flex-1 flex-col">
                      <div
                        className={`relative flex h-[220px] items-end rounded-[28px] border p-4 ${toneClasses.shell}`}
                      >
                        <div className="absolute inset-x-4 bottom-4 top-4 rounded-[22px] border border-white/7 bg-background/24" />
                        <div className="relative z-10 flex h-full w-full items-end">
                          <div
                            className={`animate-dashboard-rise w-full origin-bottom rounded-[20px] motion-reduce:animate-none ${toneClasses.bar}`}
                            style={{
                              animationDelay: `${140 + index * 90}ms`,
                              height,
                            }}
                          />
                        </div>
                        <div className="pointer-events-none absolute left-4 top-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
                            {item.label}
                          </p>
                          <p className={`mt-3 text-3xl font-semibold tracking-heading-md ${toneClasses.accent}`}>
                            {item.value}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 px-1">
                        <p className="text-sm font-semibold text-text-primary">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "danger" | "primary" | "success";
  value: number;
}) {
  const tones = {
    danger: "border-danger/14 bg-danger/8 text-danger",
    primary: "border-primary/14 bg-primary/8 text-primary",
    success: "border-success/14 bg-success/8 text-success",
  } as const;

  return (
    <div className={`rounded-[24px] border p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-heading-md">{value}</p>
    </div>
  );
}

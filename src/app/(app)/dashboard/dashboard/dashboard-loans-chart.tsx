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
  const hasCustomRange =
    selectedRange.from !== defaultRange.from || selectedRange.to !== defaultRange.to;

  if (loading) {
    return <div className="glass-panel h-[340px] animate-pulse rounded-[36px]" />;
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/62">
              Loans overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-heading-lg text-text-primary">
              Paid versus open loans
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              Track how many loans are settled and how many still need payment
              across any date range you choose.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:justify-end">
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
          <div className="rounded-[32px] border border-white/8 bg-background-secondary/38 p-6">
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
          <div className="flex flex-col gap-5">
            <div className="rounded-[32px] border border-white/8 bg-background-secondary/44 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/62">
                Active range
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                {formatDashboardDateLabel(selectedRange.from)} to{" "}
                {formatDashboardDateLabel(selectedRange.to)}
              </h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Total loans" tone="primary" value={totalLoans} />
                <MetricCard label="Paid" tone="success" value={paidLoans} />
                <MetricCard label="Not paid" tone="danger" value={unpaidLoans} />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/8 bg-background-secondary/44 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/62">
                    Status breakdown
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                    Loan status in this range
                  </h3>
                </div>
                <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
                  {totalLoans} {totalLoans === 1 ? "loan" : "loans"}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {statusData.map((item) => {
                  const percentage =
                    totalLoans > 0 ? (item.value / totalLoans) * 100 : 0;
                  const toneClasses =
                    item.tone === "paid"
                      ? {
                          accent: "text-success",
                          dot: "bg-success",
                          panel: "border-success/12 bg-success/6",
                          progress:
                            "bg-[linear-gradient(90deg,rgba(111,207,151,0.96),rgba(111,207,151,0.58))]",
                        }
                      : {
                          accent: "text-danger",
                          dot: "bg-danger",
                          panel: "border-danger/12 bg-danger/6",
                          progress:
                            "bg-[linear-gradient(90deg,rgba(255,122,122,0.96),rgba(255,122,122,0.58))]",
                        };

                  return (
                    <div
                      key={item.label}
                      className={`rounded-[24px] border px-4 py-4 ${toneClasses.panel}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${toneClasses.dot}`} />
                            <p className="text-sm font-semibold text-text-primary">
                              {item.label}
                            </p>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-text-secondary">
                            {item.description}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className={`text-2xl font-semibold tracking-heading-md ${toneClasses.accent}`}>
                            {item.value}
                          </p>
                          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary/68">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 rounded-full bg-white/8">
                        <div
                          className={`h-full rounded-full ${toneClasses.progress}`}
                          style={{
                            width: `${Math.max(percentage, item.value > 0 ? 8 : 0)}%`,
                          }}
                        />
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
    danger: "border-danger/12 bg-danger/6 text-danger",
    primary: "border-primary/12 bg-primary/6 text-primary",
    success: "border-success/12 bg-success/6 text-success",
  } as const;

  return (
    <div className={`rounded-[24px] border px-4 py-4 ${tones[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-2 text-[1.75rem] font-semibold tracking-heading-md">{value}</p>
    </div>
  );
}

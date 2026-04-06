import type { IncomeResponse } from "@/lib/types/income.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";

interface DashboardPendingIncomeCardProps {
  entries: IncomeResponse[];
  monthLabel: string;
  year: number;
}

function formatDashboardIncomeDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardPendingIncomeCard({
  entries,
  monthLabel,
  year,
}: DashboardPendingIncomeCardProps) {
  const pendingEntries = entries
    .filter((entry) => !entry.received)
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime(),
    );
  const receivedEntries = entries.filter((entry) => entry.received);

  const pendingAmount = pendingEntries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0,
  );
  const receivedAmount = receivedEntries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0,
  );
  const expectedAmount = receivedAmount + pendingAmount;
  const collectionRate = expectedAmount > 0 ? (receivedAmount / expectedAmount) * 100 : 0;

  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/62">
            Pending income
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
            Income still expected in {monthLabel} {year}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            This section separates income already marked as received from the
            amount that is still pending for the selected month.
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
            Collection rate
          </p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
            {Math.round(collectionRate)}%
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-1 2xl:grid-cols-[minmax(0,0.92fr)_minmax(280px,1.08fr)]">
        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-3">
            <div className="rounded-[20px] border border-success/10 bg-success/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-success/72">
                Received
              </p>
              <p className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-success">
                {rwfCompact(receivedAmount)}
              </p>
            </div>

            <div className="rounded-[20px] border border-primary/10 bg-primary/6 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/72">
                Pending
              </p>
              <p className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-primary">
                {rwfCompact(pendingAmount)}
              </p>
            </div>

            <div className="rounded-[20px] border border-white/8 bg-background/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                Expected total
              </p>
              <p className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-text-primary">
                {rwfCompact(expectedAmount)}
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,197,94,0.78),rgba(34,197,94,1))]"
              style={{ width: `${Math.min(collectionRate, 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {pendingAmount > 0
              ? `${rwf(pendingAmount)} is still expected for ${monthLabel} ${year}.`
              : `Everything planned for ${monthLabel} ${year} is already marked as received.`}
          </p>
        </div>

        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
              Pending entries
            </p>
            <span className="rounded-full border border-white/10 bg-background/50 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
              {pendingEntries.length} {pendingEntries.length === 1 ? "item" : "items"}
            </span>
          </div>

          {pendingEntries.length > 0 ? (
            <div className="mt-4 space-y-3">
              {pendingEntries.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 rounded-[20px] border border-white/8 bg-background/36 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {entry.label}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Expected on {formatDashboardIncomeDate(entry.date)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-primary">
                    {rwf(Number(entry.amount))}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[22px] border border-success/12 bg-success/5 px-4 py-5">
              <p className="text-sm font-semibold text-success">
                No pending income left.
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                This month is fully collected based on the income entries already
                recorded in Budgetify.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

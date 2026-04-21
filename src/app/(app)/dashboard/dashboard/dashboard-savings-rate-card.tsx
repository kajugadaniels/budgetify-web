import { rwf, rwfCompact } from "@/lib/utils/currency";

interface DashboardSavingsRateCardProps {
  availableMoneyAmount: number;
  expenseAmount: number;
  monthLabel: string;
  year: number;
}

function formatRate(value: number): string {
  return `${Math.round(value)}%`;
}

export function DashboardSavingsRateCard({
  availableMoneyAmount,
  expenseAmount,
  monthLabel,
  year,
}: DashboardSavingsRateCardProps) {
  const spendingRate =
    availableMoneyAmount > 0 ? (expenseAmount / availableMoneyAmount) * 100 : 0;
  const remainingAmount = availableMoneyAmount - expenseAmount;
  const remainingRate =
    availableMoneyAmount > 0 ? (remainingAmount / availableMoneyAmount) * 100 : 0;
  const positiveRemainingRate = Math.max(remainingRate, 0);
  const overspentRate = Math.max(-remainingRate, 0);

  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/62">
            Savings rate
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
            Available money split for {monthLabel} {year}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Based on available money now. This shows how much of the money that
            is still free after savings allocations has already been spent and
            how much is still left to keep.
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
            Available money now
          </p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
            {rwfCompact(availableMoneyAmount)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[26px] border border-danger/10 bg-danger/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-danger/72">
                Spent rate
              </p>
              <p className="mt-2 text-[1.85rem] font-semibold tracking-[-0.05em] text-danger">
                {formatRate(spendingRate)}
              </p>
            </div>
            <p className="text-sm font-medium text-text-secondary">
              {rwf(expenseAmount)}
            </p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(239,68,68,0.72),rgba(239,68,68,1))]"
              style={{ width: `${Math.min(spendingRate, 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            This is the share of available money now already recorded as
            expense in the selected month.
          </p>
        </div>

        <div
          className={`rounded-[26px] border p-4 ${
            remainingAmount >= 0
              ? "border-success/10 bg-success/5"
              : "border-amber-500/12 bg-amber-500/6"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  remainingAmount >= 0 ? "text-success/72" : "text-amber-300/75"
                }`}
              >
                {remainingAmount >= 0 ? "Left to save" : "Overspent"}
              </p>
              <p
                className={`mt-2 text-[1.85rem] font-semibold tracking-[-0.05em] ${
                  remainingAmount >= 0 ? "text-success" : "text-amber-300"
                }`}
              >
                {formatRate(
                  remainingAmount >= 0 ? positiveRemainingRate : overspentRate,
                )}
              </p>
            </div>
            <p className="text-sm font-medium text-text-secondary">
              {rwf(Math.abs(remainingAmount))}
            </p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className={`h-full rounded-full ${
                remainingAmount >= 0
                  ? "bg-[linear-gradient(90deg,rgba(34,197,94,0.72),rgba(34,197,94,1))]"
                  : "bg-[linear-gradient(90deg,rgba(251,191,36,0.72),rgba(251,191,36,1))]"
              }`}
              style={{
                width: `${Math.min(
                  remainingAmount >= 0 ? positiveRemainingRate : overspentRate,
                  100,
                )}%`,
              }}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {remainingAmount >= 0
              ? "This is the part of available money now still left after expenses."
              : "Expenses are above available money now for the selected month, so this shows the overrun."}
          </p>
        </div>
      </div>
    </section>
  );
}

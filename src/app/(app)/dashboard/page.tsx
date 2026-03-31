"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { listExpenses } from "@/lib/api/expenses/expenses.api";
import { listIncome } from "@/lib/api/income/income.api";
import type { ExpenseResponse } from "@/lib/types/expense.types";
import type { IncomeResponse } from "@/lib/types/income.types";
import { rwfCompact } from "@/lib/utils/currency";
import { DashboardBarChart } from "./dashboard/dashboard-bar-chart";
import { DashboardMonthSwitcher } from "./dashboard/dashboard-month-switcher";
import { DashboardSummaryCard } from "./dashboard/dashboard-summary-card";
import {
  buildMonthlyBarChartData,
  CURRENT_YEAR,
  MONTH_OPTIONS,
  filterEntriesByMonth,
  formatDashboardMonthLabel,
  sumExpenseAmounts,
  sumIncomeAmounts,
} from "./dashboard/dashboard.utils";

const CURRENT_MONTH = new Date().getMonth();

export default function DashboardPage() {
  const { token } = useAuth();

  const [income, setIncome] = useState<IncomeResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [incomeResponse, expenseResponse] = await Promise.all([
          listIncome(sessionToken),
          listExpenses(sessionToken),
        ]);

        if (!ignore) {
          setIncome(incomeResponse);
          setExpenses(expenseResponse);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "Dashboard totals could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [token]);

  const monthIncome = useMemo(
    () => filterEntriesByMonth(income, selectedMonth, CURRENT_YEAR),
    [income, selectedMonth],
  );
  const monthExpenses = useMemo(
    () => filterEntriesByMonth(expenses, selectedMonth, CURRENT_YEAR),
    [expenses, selectedMonth],
  );
  const dailyChartData = useMemo(
    () =>
      buildMonthlyBarChartData(
        monthIncome,
        monthExpenses,
        selectedMonth,
        CURRENT_YEAR,
      ),
    [monthExpenses, monthIncome, selectedMonth],
  );

  const totalIncome = sumIncomeAmounts(monthIncome);
  const totalExpenses = sumExpenseAmounts(monthExpenses);
  const totalSaving = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="glass-panel h-[120px] animate-pulse rounded-[32px]" />
          <div className="glass-panel h-[88px] animate-pulse rounded-[28px]" />
          <div className="glass-panel h-[480px] animate-pulse rounded-[36px]" />
          <div className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="glass-panel h-[200px] animate-pulse rounded-[30px]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel rounded-[32px] p-6">
            <EmptyState
              title="Could not load your dashboard"
              description={error}
              action={{
                label: "Refresh",
                onClick: () => window.location.reload(),
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="glass-panel rounded-[32px] p-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-heading-lg text-text-primary">
                Monthly overview
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                Switch between months to see the total income, expenses, and the
                savings left after both are compared.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
              {formatDashboardMonthLabel(selectedMonth)} {CURRENT_YEAR}
            </span>
          </div>
        </section>

        <DashboardMonthSwitcher
          months={MONTH_OPTIONS}
          selectedMonth={selectedMonth}
          onSelect={setSelectedMonth}
        />

        <DashboardBarChart
          key={`${selectedMonth}-${CURRENT_YEAR}`}
          data={dailyChartData}
          monthLabel={formatDashboardMonthLabel(selectedMonth)}
          year={CURRENT_YEAR}
        />

        <section className="grid gap-4 xl:grid-cols-3">
          <DashboardSummaryCard
            label="Total income"
            tone="income"
            value={rwfCompact(totalIncome)}
            description={`Recorded for ${formatDashboardMonthLabel(selectedMonth)} ${CURRENT_YEAR}`}
          />
          <DashboardSummaryCard
            label="Total expense"
            tone="expense"
            value={rwfCompact(totalExpenses)}
            description={`Recorded for ${formatDashboardMonthLabel(selectedMonth)} ${CURRENT_YEAR}`}
          />
          <DashboardSummaryCard
            label="Total saving"
            tone={totalSaving >= 0 ? "saving" : "expense"}
            value={rwfCompact(totalSaving)}
            description="Income minus expense for the selected month"
          />
        </section>
      </div>
    </div>
  );
}

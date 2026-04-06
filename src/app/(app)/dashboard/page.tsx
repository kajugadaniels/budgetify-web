"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { MONTH_OPTIONS } from "@/constant/months";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import {
  listExpenseCategories,
  listExpenses,
} from "@/lib/api/expenses/expenses.api";
import { listIncome } from "@/lib/api/income/income.api";
import { listLoans } from "@/lib/api/loans/loans.api";
import { getMyPartnership } from "@/lib/api/partnerships/partnerships.api";
import { listSavings } from "@/lib/api/savings/savings.api";
import { listTodos } from "@/lib/api/todos/todos.api";
import type {
  ExpenseCategoryOptionResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import type { IncomeResponse } from "@/lib/types/income.types";
import type { LoanResponse } from "@/lib/types/loan.types";
import type { PartnershipResponse } from "@/lib/types/partnership.types";
import type { SavingResponse } from "@/lib/types/saving.types";
import type { TodoResponse } from "@/lib/types/todo.types";
import { rwf, rwfCompact, usd, usdCompact } from "@/lib/utils/currency";
import { DashboardBarChart } from "./dashboard/dashboard-bar-chart";
import { DashboardExpenseCategoriesChart } from "./dashboard/dashboard-expense-categories-chart";
import { DashboardLoansChart } from "./dashboard/dashboard-loans-chart";
import { DashboardMonthComparison } from "./dashboard/dashboard-month-comparison";
import { DashboardMonthSwitcher } from "./dashboard/dashboard-month-switcher";
import { DashboardPartnerActivity } from "./dashboard/dashboard-partner-activity";
import { DashboardPendingIncomeCard } from "./dashboard/dashboard-pending-income-card";
import { DashboardSavingsRateCard } from "./dashboard/dashboard-savings-rate-card";
import { DashboardSummaryCard } from "./dashboard/dashboard-summary-card";
import { DashboardTodoAdviser } from "./dashboard/dashboard-todo-adviser";
import { DashboardTopSpendingCategories } from "./dashboard/dashboard-top-spending-categories";
import { DashboardUpcomingTodoSchedule } from "./dashboard/dashboard-upcoming-todo-schedule";
import {
  buildDashboardMonthComparisonSummary,
  buildDashboardPartnerActivitySummary,
  buildDashboardTodoAdviserSummary,
  buildDailyExpenseCategoryData,
  buildTopSpendingCategoriesSummary,
  buildUpcomingTodoSchedule,
  buildMonthlyBarChartData,
  CURRENT_YEAR,
  filterEntriesByMonth,
  formatDashboardMonthLabel,
  sumExpenseAmounts,
  sumIncomeAmounts,
  sumSavingAmounts,
  sumTodoAmounts,
} from "./dashboard/dashboard.utils";

const CURRENT_MONTH = new Date().getMonth();

export default function DashboardPage() {
  const { token, user } = useAuth();

  const [income, setIncome] = useState<IncomeResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<
    ExpenseCategoryOptionResponse[]
  >([]);
  const [monthlyLoans, setMonthlyLoans] = useState<LoanResponse[]>([]);
  const [allIncome, setAllIncome] = useState<IncomeResponse[]>([]);
  const [allExpenses, setAllExpenses] = useState<ExpenseResponse[]>([]);
  const [allSavings, setAllSavings] = useState<SavingResponse[]>([]);
  const [allTodos, setAllTodos] = useState<TodoResponse[]>([]);
  const [partnership, setPartnership] = useState<PartnershipResponse | null>(null);
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
        const [
          allIncomeResponse,
          allExpenseResponse,
          allSavingResponse,
          expenseCategoryResponse,
          allTodoResponse,
          partnershipResponse,
          incomeResponse,
          expenseResponse,
          monthlyLoanResponse,
        ] = await Promise.all([
          listIncome(sessionToken),
          listExpenses(sessionToken),
          listSavings(sessionToken),
          listExpenseCategories(sessionToken).catch(() => []),
          listTodos(sessionToken),
          getMyPartnership(sessionToken).catch(() => null),
          listIncome(sessionToken, {
            month: selectedMonth + 1,
            year: CURRENT_YEAR,
          }),
          listExpenses(sessionToken, {
            month: selectedMonth + 1,
            year: CURRENT_YEAR,
          }),
          listLoans(sessionToken, {
            month: selectedMonth + 1,
            year: CURRENT_YEAR,
          }).catch(() => []),
        ]);

        if (!ignore) {
          setAllIncome(allIncomeResponse);
          setAllExpenses(allExpenseResponse);
          setAllSavings(allSavingResponse);
          setExpenseCategories(expenseCategoryResponse);
          setAllTodos(allTodoResponse);
          setPartnership(partnershipResponse);
          setIncome(incomeResponse);
          setExpenses(expenseResponse);
          setMonthlyLoans(monthlyLoanResponse);
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
  }, [selectedMonth, token]);

  const dailyChartData = useMemo(
    () => buildMonthlyBarChartData(income, expenses, selectedMonth, CURRENT_YEAR),
    [expenses, income, selectedMonth],
  );
  const dailyExpenseCategoryData = useMemo(
    () =>
      buildDailyExpenseCategoryData(
        expenses,
        expenseCategories,
        selectedMonth,
        CURRENT_YEAR,
      ),
    [expenseCategories, expenses, selectedMonth],
  );
  const topSpendingCategoriesSummary = useMemo(
    () =>
      buildTopSpendingCategoriesSummary(
        expenses,
        expenseCategories,
        selectedMonth,
        CURRENT_YEAR,
      ),
    [expenseCategories, expenses, selectedMonth],
  );
  const todoAdviserSummary = useMemo(
    () => buildDashboardTodoAdviserSummary(allTodos),
    [allTodos],
  );
  const upcomingTodoSchedule = useMemo(
    () => buildUpcomingTodoSchedule(allTodos),
    [allTodos],
  );
  const monthlySavings = useMemo(
    () => filterEntriesByMonth(allSavings, selectedMonth, CURRENT_YEAR),
    [allSavings, selectedMonth],
  );
  const partnerActivitySummary = useMemo(
    () =>
      buildDashboardPartnerActivitySummary({
        currentUser: user,
        expenses,
        income,
        loans: monthlyLoans,
        partnership,
        savings: monthlySavings,
      }),
    [expenses, income, monthlyLoans, monthlySavings, partnership, user],
  );
  const monthComparisonSummary = useMemo(
    () =>
      buildDashboardMonthComparisonSummary({
        expenses: allExpenses,
        income: allIncome,
        month: selectedMonth,
        year: CURRENT_YEAR,
      }),
    [allExpenses, allIncome, selectedMonth],
  );

  const totalIncome = sumIncomeAmounts(income);
  const totalExpenses = sumExpenseAmounts(expenses);
  const monthlyNetFlow = totalIncome - totalExpenses;
  const totalActiveSavings = sumSavingAmounts(allSavings, {
    stillHaveOnly: true,
  });
  const moneyStillHave = sumIncomeAmounts(allIncome) - sumExpenseAmounts(allExpenses);
  const totalPendingTodoAmount = sumTodoAmounts(allTodos, {
    pendingOnly: true,
  });
  const selectedMonthLabel = formatDashboardMonthLabel(selectedMonth);

  if (loading) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <div className="glass-panel h-[168px] animate-pulse rounded-[32px]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="glass-panel h-[170px] animate-pulse rounded-[30px]"
              />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.42fr)_minmax(340px,0.86fr)]">
            <div className="grid gap-4">
              <div className="glass-panel h-[500px] animate-pulse rounded-[36px]" />
              <div className="glass-panel h-[560px] animate-pulse rounded-[36px]" />
              <div className="glass-panel h-[430px] animate-pulse rounded-[36px]" />
              <div className="glass-panel h-[430px] animate-pulse rounded-[36px]" />
            </div>

            <div className="grid gap-4">
              <div className="glass-panel h-[300px] animate-pulse rounded-[36px]" />
              <div className="glass-panel h-[320px] animate-pulse rounded-[36px]" />
              <div className="glass-panel h-[370px] animate-pulse rounded-[36px]" />
              <div className="glass-panel h-[360px] animate-pulse rounded-[36px]" />
              <div className="glass-panel h-[470px] animate-pulse rounded-[36px]" />
              <div className="glass-panel h-[340px] animate-pulse rounded-[36px]" />
            </div>
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
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <section className="glass-panel rounded-[32px] p-5 md:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] xl:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
                Dashboard
              </p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,2.6rem)] font-semibold tracking-heading-lg text-text-primary">
                A tighter view of {selectedMonthLabel}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                Review the month quickly, compare it to the one before it, and
                spot the records that need attention without scrolling through a
                long stack of panels.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-3 md:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                    Active month
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-text-primary">
                    {selectedMonthLabel} {CURRENT_YEAR}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-background/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  Switch month
                </span>
              </div>

              <DashboardMonthSwitcher
                embedded
                months={MONTH_OPTIONS}
                selectedMonth={selectedMonth}
                onSelect={setSelectedMonth}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <DashboardSummaryCard
            label="Total income"
            tone="income"
            compactValue={rwfCompact(totalIncome)}
            fullValue={rwf(totalIncome)}
            description={`Received in ${selectedMonthLabel} ${CURRENT_YEAR}`}
          />
          <DashboardSummaryCard
            label="Total expense"
            tone="expense"
            compactValue={rwfCompact(totalExpenses)}
            fullValue={rwf(totalExpenses)}
            description={`Recorded for ${selectedMonthLabel} ${CURRENT_YEAR}`}
          />
          <DashboardSummaryCard
            label="Net flow this month"
            tone={monthlyNetFlow >= 0 ? "income" : "expense"}
            compactValue={rwfCompact(monthlyNetFlow)}
            fullValue={rwf(monthlyNetFlow)}
            description={`Income minus expense for ${selectedMonthLabel} ${CURRENT_YEAR}`}
          />
          <DashboardSummaryCard
            label="Savings you still have"
            tone="saving"
            compactValue={usdCompact(totalActiveSavings)}
            fullValue={usd(totalActiveSavings)}
            description="All-time USD savings still marked as available"
          />
          <DashboardSummaryCard
            label="Money you still have"
            tone={moneyStillHave >= 0 ? "income" : "expense"}
            compactValue={rwfCompact(moneyStillHave)}
            fullValue={rwf(moneyStillHave)}
            description="All received income minus all recorded expenses"
          />
          <DashboardSummaryCard
            label="Todo amount"
            tone="todo"
            compactValue={rwfCompact(totalPendingTodoAmount)}
            fullValue={rwf(totalPendingTodoAmount)}
            description="All todo prices that are still marked as not done"
          />
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.42fr)_minmax(340px,0.86fr)]">
          <div className="grid gap-4">
            <DashboardBarChart
              key={`${selectedMonth}-${CURRENT_YEAR}`}
              data={dailyChartData}
              monthLabel={selectedMonthLabel}
              year={CURRENT_YEAR}
            />

            <DashboardExpenseCategoriesChart
              data={dailyExpenseCategoryData}
              month={selectedMonth}
              monthLabel={selectedMonthLabel}
              year={CURRENT_YEAR}
            />

            <DashboardPartnerActivity
              monthLabel={selectedMonthLabel}
              summary={partnerActivitySummary}
              year={CURRENT_YEAR}
            />

            <DashboardUpcomingTodoSchedule summary={upcomingTodoSchedule} />
          </div>

          <div className="grid gap-4">
            <DashboardSavingsRateCard
              incomeAmount={totalIncome}
              expenseAmount={totalExpenses}
              monthLabel={selectedMonthLabel}
              year={CURRENT_YEAR}
            />

            <DashboardMonthComparison summary={monthComparisonSummary} />

            <DashboardPendingIncomeCard
              entries={income}
              monthLabel={selectedMonthLabel}
              year={CURRENT_YEAR}
            />

            <DashboardTopSpendingCategories
              month={selectedMonth}
              monthLabel={selectedMonthLabel}
              summary={topSpendingCategoriesSummary}
              year={CURRENT_YEAR}
            />

            <DashboardTodoAdviser summary={todoAdviserSummary} />

            <DashboardLoansChart token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}

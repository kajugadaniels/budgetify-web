"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { listExpenses } from "@/lib/api/expenses/expenses.api";
import { listIncome } from "@/lib/api/income/income.api";
import { listTodos } from "@/lib/api/todos/todos.api";
import type { ExpenseCategory, ExpenseResponse } from "@/lib/types/expense.types";
import type { IncomeResponse } from "@/lib/types/income.types";
import type { TodoPriority, TodoResponse } from "@/lib/types/todo.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";

const EXPENSE_LABELS: Record<ExpenseCategory, string> = {
  FOOD_DINING: "Food and dining",
  TRANSPORT: "Transport",
  HOUSING: "Housing",
  LOAN: "Loan",
  UTILITIES: "Utilities",
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  ENTERTAINMENT: "Entertainment",
  SHOPPING: "Shopping",
  PERSONAL_CARE: "Personal care",
  TRAVEL: "Travel",
  SAVINGS: "Savings",
  OTHER: "Other",
};

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  TOP_PRIORITY: "Top priority",
  PRIORITY: "Priority",
  NOT_PRIORITY: "Not priority",
};

function sortByNewest<T extends { date?: string; updatedAt?: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const leftValue = new Date(left.date ?? left.updatedAt ?? 0).getTime();
    const rightValue = new Date(right.date ?? right.updatedAt ?? 0).getTime();
    return rightValue - leftValue;
  });
}

function isCurrentMonth(value: string): boolean {
  const now = new Date();
  const date = new Date(value);
  return (
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const { token, user } = useAuth();

  const [income, setIncome] = useState<IncomeResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [todos, setTodos] = useState<TodoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialIssue, setPartialIssue] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      setPartialIssue(null);

      const results = await Promise.allSettled([
        listIncome(sessionToken),
        listExpenses(sessionToken),
        listTodos(sessionToken),
      ]);

      if (ignore) return;

      const [incomeResult, expenseResult, todoResult] = results;
      const failures = results.filter((result) => result.status === "rejected");

      if (
        incomeResult.status === "rejected" &&
        expenseResult.status === "rejected" &&
        todoResult.status === "rejected"
      ) {
        setError("Budget overview could not be loaded right now.");
        setLoading(false);
        return;
      }

      if (incomeResult.status === "fulfilled") {
        setIncome(sortByNewest(incomeResult.value));
      }

      if (expenseResult.status === "fulfilled") {
        setExpenses(sortByNewest(expenseResult.value));
      }

      if (todoResult.status === "fulfilled") {
        setTodos(
          [...todoResult.value].sort(
            (left, right) =>
              getPriorityRank(left.priority) - getPriorityRank(right.priority) ||
              new Date(right.updatedAt).getTime() -
                new Date(left.updatedAt).getTime(),
          ),
        );
      }

      if (failures.length > 0) {
        setPartialIssue("Some sections are showing the latest available data only.");
      }

      setLoading(false);
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [token]);

  const monthlyIncome = income
    .filter((entry) => isCurrentMonth(entry.date))
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const monthlyExpenses = expenses
    .filter((entry) => isCurrentMonth(entry.date))
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const monthlyBalance = monthlyIncome - monthlyExpenses;
  const savingsRate =
    monthlyIncome > 0 ? Math.max(0, (monthlyBalance / monthlyIncome) * 100) : 0;
  const plannedWishlist = todos.reduce(
    (sum, entry) => sum + Number(entry.price),
    0,
  );
  const totalSpent = expenses.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0,
  );
  const focusTodo = [...todos].sort(
    (left, right) =>
      getPriorityRank(left.priority) - getPriorityRank(right.priority) ||
      Number(right.price) - Number(left.price),
  )[0];
  const recentActivity = sortByNewest(
    [
      ...income.map((entry) => ({
        id: entry.id,
        label: entry.label,
        category: entry.category,
        date: entry.date,
        amount: Number(entry.amount),
        direction: "in" as const,
      })),
      ...expenses.map((entry) => ({
        id: entry.id,
        label: entry.label,
        category: EXPENSE_LABELS[entry.category],
        date: entry.date,
        amount: Number(entry.amount),
        direction: "out" as const,
      })),
    ].slice(0),
  ).slice(0, 6);
  const expenseByCategory = Object.entries(
    expenses.reduce<Record<string, number>>((current, entry) => {
      const key = EXPENSE_LABELS[entry.category];
      current[key] = (current[key] ?? 0) + Number(entry.amount);
      return current;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  const displayName =
    user?.firstName ?? user?.fullName?.split(" ")[0] ?? user?.email ?? "there";
  const headlineDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="glass-panel h-[300px] animate-pulse rounded-[32px]" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="glass-panel h-[420px] animate-pulse rounded-[32px]" />
            <div className="glass-panel h-[420px] animate-pulse rounded-[32px]" />
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

  const hasAnyData = income.length > 0 || expenses.length > 0 || todos.length > 0;

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
              {headlineDate}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-heading-lg text-text-primary md:text-[2.8rem]">
              {displayName}, here is the month at a glance.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              Budgetify keeps the overview simple: what came in, what went out,
              and what is still competing for attention before you spend again.
            </p>

            {partialIssue ? (
              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-text-secondary">
                {partialIssue}
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
              <BigBalanceCard balance={monthlyBalance} />
              <MetricCard label="Income this month" value={rwfCompact(monthlyIncome)} />
              <MetricCard label="Expenses this month" value={rwfCompact(monthlyExpenses)} />
              <MetricCard
                label="Savings pace"
                value={`${Math.round(savingsRate)}%`}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <QuickLink href="/income" label="Manage income" />
              <QuickLink href="/expenses" label="Review expenses" />
              <QuickLink href="/todos" label="Open wishlist" />
            </div>
          </div>

          <aside className="glass-elevated rounded-[32px] p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
              Current focus
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
              Wishlist pressure
            </h2>

            {focusTodo ? (
              <div className="mt-6 rounded-[28px] border border-white/10 bg-background-secondary/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/60">
                  Next likely purchase
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-heading-sm text-text-primary">
                  {focusTodo.name}
                </h3>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                    {PRIORITY_LABELS[focusTodo.priority]}
                  </span>
                  <span className="text-lg font-semibold text-text-primary">
                    {rwf(Number(focusTodo.price))}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-text-secondary">
                  Planned wishlist total stands at {rwfCompact(plannedWishlist)}.
                </p>
                <Link
                  href="/todos"
                  className="mt-6 inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-text-primary"
                >
                  Review priorities
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-[28px] border border-dashed border-border px-5 py-8 text-sm leading-6 text-text-secondary">
                No wishlist items are competing for attention yet.
              </div>
            )}
          </aside>
        </section>

        {!hasAnyData ? (
          <section className="glass-panel rounded-[32px] p-6">
            <EmptyState
              title="Nothing has been recorded yet"
              description="Start with one income source, one expense, or one planned purchase. The dashboard gets useful quickly once the first few entries exist."
              action={{
                label: "Add income",
                onClick: () => {
                  window.location.href = "/income";
                },
              }}
            />
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="glass-panel rounded-[32px] p-5 md:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
                    Activity
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                    Latest financial movement
                  </h2>
                </div>
                <Link
                  href="/expenses"
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  See all
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <article
                      key={`${item.direction}-${item.id}`}
                      className="glass-subtle rounded-[26px] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-primary">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm text-text-secondary">
                            {item.category} · {formatDate(item.date)}
                          </p>
                        </div>
                        <p
                          className={
                            item.direction === "in"
                              ? "text-sm font-semibold tabular-nums text-success"
                              : "text-sm font-semibold tabular-nums text-danger"
                          }
                        >
                          {item.direction === "in" ? "+" : "-"}
                          {rwf(item.amount)}
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-[26px] border border-dashed border-border px-4 py-6 text-sm leading-6 text-text-secondary">
                    Recent income and expenses will appear here once entries are added.
                  </p>
                )}
              </div>
            </section>

            <section className="glass-panel rounded-[32px] p-5 md:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
                    Spending mix
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                    Where money is leaving fastest
                  </h2>
                </div>
                <Link
                  href="/expenses"
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Open expenses
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {expenseByCategory.length > 0 ? (
                  expenseByCategory.map(([label, amount]) => {
                    const share =
                      totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

                    return (
                      <div
                        key={label}
                        className="glass-subtle rounded-[26px] px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-text-primary">{label}</p>
                          <p className="text-sm font-semibold tabular-nums text-danger">
                            {rwf(amount)}
                          </p>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/6">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(share, 6)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-text-secondary/60">
                          {share}% of recorded spend
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-[26px] border border-dashed border-border px-4 py-6 text-sm leading-6 text-text-secondary">
                    Category trends appear after a few expense entries are recorded.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
    >
      {label}
    </Link>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-subtle rounded-[24px] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/60">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-heading-sm text-text-primary">
        {value}
      </p>
    </div>
  );
}

function BigBalanceCard({ balance }: { balance: number }) {
  return (
    <div className="rounded-[24px] border border-primary/20 bg-primary/10 px-5 py-5">
      <p className="text-xs uppercase tracking-[0.18em] text-primary/70">
        Available to plan
      </p>
      <p className="mt-3 text-[2.1rem] font-semibold tracking-heading-md text-text-primary">
        {rwfCompact(balance)}
      </p>
      <p className="mt-3 max-w-xs text-sm leading-6 text-text-secondary">
        A simple read on whether the month still feels loose or already needs restraint.
      </p>
    </div>
  );
}

function getPriorityRank(priority: TodoPriority): number {
  switch (priority) {
    case "TOP_PRIORITY":
      return 0;
    case "PRIORITY":
      return 1;
    case "NOT_PRIORITY":
      return 2;
  }
}

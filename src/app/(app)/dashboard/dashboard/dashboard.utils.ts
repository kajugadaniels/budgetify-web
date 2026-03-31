import { MONTH_OPTIONS } from "@/constant/months";
import type { ExpenseResponse } from "@/lib/types/expense.types";
import type { IncomeResponse } from "@/lib/types/income.types";

export const CURRENT_YEAR = new Date().getFullYear();

export interface DashboardDailyBarDatum {
  day: number;
  expense: number;
  hasActivity: boolean;
  income: number;
  total: number;
}

export function formatDashboardMonthLabel(month: number): string {
  return MONTH_OPTIONS.find((item) => item.value === month)?.label ?? "Month";
}

export function filterEntriesByMonth<T extends { date: string }>(
  entries: T[],
  month: number,
  year: number,
): T[] {
  return entries.filter((entry) => {
    const date = new Date(entry.date);

    return date.getMonth() === month && date.getFullYear() === year;
  });
}

export function sumIncomeAmounts(entries: IncomeResponse[]): number {
  return entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function buildMonthlyBarChartData(
  incomeEntries: IncomeResponse[],
  expenseEntries: ExpenseResponse[],
  month: number,
  year: number,
): DashboardDailyBarDatum[] {
  const points = Array.from(
    { length: getDaysInMonth(month, year) },
    (_, index): DashboardDailyBarDatum => ({
      day: index + 1,
      expense: 0,
      hasActivity: false,
      income: 0,
      total: 0,
    }),
  );

  incomeEntries.forEach((entry) => {
    const dayIndex = new Date(entry.date).getDate() - 1;

    if (points[dayIndex]) {
      points[dayIndex].income += Number(entry.amount);
    }
  });

  expenseEntries.forEach((entry) => {
    const dayIndex = new Date(entry.date).getDate() - 1;

    if (points[dayIndex]) {
      points[dayIndex].expense += Number(entry.amount);
    }
  });

  return points.map((point) => {
    const total = point.income + point.expense;

    return {
      ...point,
      hasActivity: total > 0,
      total,
    };
  });
}

export function sumExpenseAmounts(entries: ExpenseResponse[]): number {
  return entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
}

import type { ExpenseResponse } from "@/lib/types/expense.types";
import type { IncomeResponse } from "@/lib/types/income.types";

export const CURRENT_YEAR = new Date().getFullYear();

export const MONTH_OPTIONS = [
  { label: "January", value: 0 },
  { label: "February", value: 1 },
  { label: "March", value: 2 },
  { label: "April", value: 3 },
  { label: "May", value: 4 },
  { label: "June", value: 5 },
  { label: "July", value: 6 },
  { label: "August", value: 7 },
  { label: "September", value: 8 },
  { label: "October", value: 9 },
  { label: "November", value: 10 },
  { label: "December", value: 11 },
] as const;

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

export function sumExpenseAmounts(entries: ExpenseResponse[]): number {
  return entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
}

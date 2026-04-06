import { MONTH_OPTIONS } from "@/constant/months";
import type {
  ExpenseCategory,
  ExpenseCategoryOptionResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import type { IncomeResponse } from "@/lib/types/income.types";
import type { LoanResponse } from "@/lib/types/loan.types";
import type { SavingResponse } from "@/lib/types/saving.types";
import type { TodoResponse } from "@/lib/types/todo.types";

export const CURRENT_YEAR = new Date().getFullYear();

export interface DashboardDailyBarDatum {
  day: number;
  expense: number;
  hasActivity: boolean;
  income: number;
  total: number;
}

export interface DashboardExpenseCategorySegmentDatum {
  amount: number;
  category: ExpenseCategory;
  label: string;
}

export interface DashboardExpenseCategoryDayDatum {
  day: number;
  hasSpending: boolean;
  segments: DashboardExpenseCategorySegmentDatum[];
  total: number;
}

export interface DashboardLoanDateRange {
  from: string;
  to: string;
}

export interface DashboardLoanStatusDatum {
  description: string;
  label: string;
  tone: "paid" | "unpaid";
  value: number;
}

export interface DashboardTodoAdviserItem {
  frequency: "WEEKLY" | "MONTHLY";
  id: string;
  name: string;
  remainingOccurrenceCount: number;
  remainingAmount: number;
  targetAmount: number;
  usedAmount: number;
}

export interface DashboardTodoAdviserSummary {
  items: DashboardTodoAdviserItem[];
  remainingAmount: number;
  targetAmount: number;
  usedAmount: number;
}

export interface DashboardUpcomingTodoScheduleItem {
  amount: number;
  frequency: TodoResponse["frequency"];
  id: string;
  name: string;
}

export interface DashboardUpcomingTodoScheduleDay {
  date: string;
  items: DashboardUpcomingTodoScheduleItem[];
  totalAmount: number;
}

export interface DashboardUpcomingTodoScheduleSummary {
  days: DashboardUpcomingTodoScheduleDay[];
  daysWithPlans: number;
  occurrenceCount: number;
  totalAmount: number;
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
  return entries.reduce(
    (sum, entry) => sum + (entry.received ? Number(entry.amount) : 0),
    0,
  );
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
    if (!entry.received) {
      return;
    }

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

export function sumSavingAmounts(
  entries: SavingResponse[],
  options?: { stillHaveOnly?: boolean },
): number {
  return entries.reduce((sum, entry) => {
    if (options?.stillHaveOnly && !entry.stillHave) {
      return sum;
    }

    return sum + Number(entry.amount);
  }, 0);
}

export function sumTodoAmounts(
  entries: TodoResponse[],
  options?: { pendingOnly?: boolean },
): number {
  return entries.reduce((sum, entry) => {
    if (options?.pendingOnly && entry.done) {
      return sum;
    }

    return sum + Number(entry.price);
  }, 0);
}

export function buildDashboardTodoAdviserSummary(
  entries: TodoResponse[],
): DashboardTodoAdviserSummary {
  const items = entries
    .filter(isRecurringAdviserTodo)
    .map((entry) => {
      const targetAmount = Number(entry.price);
      const remainingAmount =
        entry.remainingAmount !== null
          ? Math.max(Number(entry.remainingAmount), 0)
          : targetAmount;
      const usedAmount = Math.max(targetAmount - remainingAmount, 0);
      const remainingOccurrenceCount = Math.max(
        entry.occurrenceDates.length - entry.recordedOccurrenceDates.length,
        0,
      );

      return {
        id: entry.id,
        name: entry.name,
        frequency: entry.frequency,
        remainingOccurrenceCount,
        targetAmount,
        usedAmount,
        remainingAmount,
      } satisfies DashboardTodoAdviserItem;
    })
    .sort(
      (left, right) =>
        right.remainingOccurrenceCount - left.remainingOccurrenceCount ||
        right.remainingAmount - left.remainingAmount,
    );

  return items.reduce<DashboardTodoAdviserSummary>(
    (summary, item) => ({
      items: [...summary.items, item],
      targetAmount: summary.targetAmount + item.targetAmount,
      usedAmount: summary.usedAmount + item.usedAmount,
      remainingAmount: summary.remainingAmount + item.remainingAmount,
    }),
    {
      items: [],
      targetAmount: 0,
      usedAmount: 0,
      remainingAmount: 0,
    },
  );
}

export function buildUpcomingTodoSchedule(
  entries: TodoResponse[],
): DashboardUpcomingTodoScheduleSummary {
  const startDate = getLocalDateOnlyValue(new Date());
  const nextSevenDays = Array.from({ length: 7 }, (_, index) =>
    getLocalDateOnlyValue(addLocalDays(new Date(), index)),
  );
  const dayMap = new Map(
    nextSevenDays.map((date) => [
      date,
      {
        date,
        items: [] as DashboardUpcomingTodoScheduleItem[],
        totalAmount: 0,
      } satisfies DashboardUpcomingTodoScheduleDay,
    ]),
  );

  entries
    .filter((entry) => !entry.done)
    .forEach((entry) => {
      const remainingDates = entry.occurrenceDates
        .filter((date) => !entry.recordedOccurrenceDates.includes(date))
        .sort();

      if (remainingDates.length === 0) {
        return;
      }

      const amount = resolveUpcomingTodoOccurrenceAmount(entry, remainingDates);

      remainingDates.forEach((date) => {
        if (date < startDate) {
          return;
        }

        const day = dayMap.get(date);

        if (!day) {
          return;
        }

        day.items.push({
          amount,
          frequency: entry.frequency,
          id: entry.id,
          name: entry.name,
        });
        day.totalAmount += amount;
      });
    });

  const days = nextSevenDays.map((date) => {
    const day = dayMap.get(date)!;

    return {
      ...day,
      items: [...day.items].sort(
        (left, right) =>
          right.amount - left.amount || left.name.localeCompare(right.name),
      ),
      totalAmount: roundDashboardCurrency(day.totalAmount),
    };
  });

  return {
    days,
    daysWithPlans: days.filter((day) => day.items.length > 0).length,
    occurrenceCount: days.reduce((sum, day) => sum + day.items.length, 0),
    totalAmount: roundDashboardCurrency(
      days.reduce((sum, day) => sum + day.totalAmount, 0),
    ),
  };
}

function isRecurringAdviserTodo(
  entry: TodoResponse,
): entry is TodoResponse & { frequency: "WEEKLY" | "MONTHLY" } {
  return (
    !entry.done &&
    (entry.frequency === "WEEKLY" || entry.frequency === "MONTHLY")
  );
}

export function buildDailyExpenseCategoryData(
  entries: ExpenseResponse[],
  categories: ExpenseCategoryOptionResponse[],
  month: number,
  year: number,
): DashboardExpenseCategoryDayDatum[] {
  const days = getDaysInMonth(month, year);
  const labelLookup = new Map(
    categories.map((category) => [category.value, category.label]),
  );
  const points = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    totals: new Map<ExpenseCategory, number>(),
  }));

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date);

    if (
      entryDate.getMonth() !== month ||
      entryDate.getFullYear() !== year
    ) {
      return;
    }

    const point = points[entryDate.getDate() - 1];

    if (!point) {
      return;
    }

    point.totals.set(
      entry.category,
      (point.totals.get(entry.category) ?? 0) + Number(entry.amount),
    );
  });

  return points.map((point) => {
    const segments = Array.from(point.totals.entries())
      .map(([category, amount]) => ({
        amount,
        category,
        label: labelLookup.get(category) ?? humanizeDashboardCategory(category),
      }))
      .sort((left, right) => right.amount - left.amount);

    const total = segments.reduce((sum, segment) => sum + segment.amount, 0);

    return {
      day: point.day,
      hasSpending: total > 0,
      segments,
      total,
    };
  });
}

export function resolveDashboardLoanDateRange(
  entries: LoanResponse[],
): DashboardLoanDateRange | null {
  if (entries.length === 0) {
    return null;
  }

  const timestamps = entries.map((entry) => new Date(entry.date).getTime());
  const earliest = Math.min(...timestamps);
  const latest = Math.max(...timestamps);

  return {
    from: toDateInputValue(new Date(earliest)),
    to: toDateInputValue(new Date(latest)),
  };
}

export function filterLoansByDateRange(
  entries: LoanResponse[],
  range: DashboardLoanDateRange,
): LoanResponse[] {
  const fromTimestamp = range.from
    ? new Date(`${range.from}T00:00:00.000Z`).getTime()
    : Number.NEGATIVE_INFINITY;
  const toTimestamp = range.to
    ? new Date(`${range.to}T23:59:59.999Z`).getTime()
    : Number.POSITIVE_INFINITY;

  return entries.filter((entry) => {
    const entryTimestamp = new Date(entry.date).getTime();

    return entryTimestamp >= fromTimestamp && entryTimestamp <= toTimestamp;
  });
}

export function buildDashboardLoanStatusData(
  entries: LoanResponse[],
): DashboardLoanStatusDatum[] {
  const paidCount = entries.filter((entry) => entry.paid).length;
  const unpaidCount = entries.length - paidCount;

  return [
    {
      description: `${paidCount} ${paidCount === 1 ? "loan is" : "loans are"} fully cleared`,
      label: "Paid",
      tone: "paid",
      value: paidCount,
    },
    {
      description: `${unpaidCount} ${
        unpaidCount === 1 ? "loan still needs" : "loans still need"
      } settlement`,
      label: "Not paid",
      tone: "unpaid",
      value: unpaidCount,
    },
  ];
}

export function formatDashboardDateLabel(value: string): string {
  if (!value) {
    return "No date";
  }

  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function toDateInputValue(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

function getLocalDateOnlyValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function addLocalDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

function resolveUpcomingTodoOccurrenceAmount(
  entry: TodoResponse,
  remainingDates: string[],
): number {
  if (entry.frequency === "ONCE") {
    return roundDashboardCurrency(Number(entry.price));
  }

  const remainingAmount = entry.remainingAmount ?? entry.price;

  if (remainingDates.length === 0 || remainingAmount <= 0) {
    return 0;
  }

  return roundDashboardCurrency(Number(remainingAmount) / remainingDates.length);
}

function roundDashboardCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function humanizeDashboardCategory(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

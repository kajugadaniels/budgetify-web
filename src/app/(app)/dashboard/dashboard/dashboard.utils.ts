import { MONTH_OPTIONS } from "@/constant/months";
import type {
  ExpenseCategory,
  ExpenseCategoryOptionResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import type { IncomeResponse } from "@/lib/types/income.types";
import type { LoanResponse } from "@/lib/types/loan.types";
import type { PartnershipResponse } from "@/lib/types/partnership.types";
import type { SavingResponse } from "@/lib/types/saving.types";
import type {
  TodoResponse,
  TodoSummaryResponse,
  TodoUpcomingResponse,
} from "@/lib/types/todo.types";
import type { UserProfileResponse } from "@/lib/types/user.types";
import { isLoanSettled } from "../../loans/loans/loans.utils";

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

export interface DashboardPartnerActivityIdentity {
  avatarUrl: string | null;
  email?: string | null;
  firstName: string | null;
  fullName?: string | null;
  id: string;
  lastName: string | null;
}

export interface DashboardPartnerActivityRecord {
  amount: number;
  creator: DashboardPartnerActivityIdentity;
  currency: "RWF" | "USD";
  date: string;
  id: string;
  label: string;
  type: "EXPENSE" | "INCOME" | "LOAN" | "SAVING";
}

export interface DashboardPartnerActivityPersonSummary {
  entryCount: number;
  identity: DashboardPartnerActivityIdentity;
  isCurrentUser: boolean;
  latestActivity: DashboardPartnerActivityRecord | null;
  rwfAmount: number;
  usdAmount: number;
}

export interface DashboardPartnerActivitySummary {
  activePeopleCount: number;
  currentUser: DashboardPartnerActivityPersonSummary | null;
  latestActivities: DashboardPartnerActivityRecord[];
  partner: DashboardPartnerActivityPersonSummary | null;
  totalEntries: number;
  totalRwfAmount: number;
  totalUsdAmount: number;
}

export interface DashboardMonthComparisonMetric {
  currentAmount: number;
  deltaAmount: number;
  deltaPercent: number | null;
  label: string;
  previousAmount: number;
  tone: "positive" | "negative" | "neutral";
  trend: "up" | "down" | "flat";
}

export interface DashboardMonthComparisonSummary {
  currentLabel: string;
  metrics: DashboardMonthComparisonMetric[];
  previousLabel: string;
}

export interface DashboardTopSpendingCategoryItem {
  amount: number;
  category: ExpenseCategory;
  entryCount: number;
  label: string;
  share: number;
}

export interface DashboardTopSpendingCategoriesSummary {
  items: DashboardTopSpendingCategoryItem[];
  topCategory: DashboardTopSpendingCategoryItem | null;
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
  options?: { depositedOnly?: boolean; withdrawnOnly?: boolean },
): number {
  return entries.reduce((sum, entry) => {
    if (options?.depositedOnly) {
      return sum + entry.totalDepositedRwf;
    }

    if (options?.withdrawnOnly) {
      return sum + entry.totalWithdrawnRwf;
    }

    return sum + entry.currentBalanceRwf;
  }, 0);
}

export function sumTodoAmounts(
  entries: TodoResponse[],
  options?: { pendingOnly?: boolean },
): number {
  return entries.reduce((sum, entry) => {
    if (
      options?.pendingOnly &&
      (entry.status === "COMPLETED" ||
        entry.status === "SKIPPED" ||
        entry.status === "ARCHIVED")
    ) {
      return sum;
    }

    return sum + Number(entry.price);
  }, 0);
}

function getOpenTodoOccurrenceDates(
  entry: Pick<TodoResponse, "occurrences" | "occurrenceDates" | "recordedOccurrenceDates">,
): string[] {
  if (entry.occurrences.length > 0) {
    return entry.occurrences
      .filter(
        (occurrence) =>
          occurrence.status === "SCHEDULED" || occurrence.status === "OVERDUE",
      )
      .map((occurrence) => occurrence.occurrenceDate)
      .sort((left, right) => left.localeCompare(right));
  }

  return entry.occurrenceDates
    .filter((date) => !entry.recordedOccurrenceDates.includes(date))
    .sort((left, right) => left.localeCompare(right));
}

export function getOpenTodoPlannedTotal(summary: TodoSummaryResponse | null): number {
  return summary?.openPlannedTotal ?? 0;
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
      const remainingOccurrenceCount = getOpenTodoOccurrenceDates(entry).length;

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
    .filter(
      (entry) =>
        entry.status !== "COMPLETED" &&
        entry.status !== "SKIPPED" &&
        entry.status !== "ARCHIVED",
    )
    .forEach((entry) => {
      const remainingDates = entry.occurrenceDates
        .length > 0 || entry.occurrences.length > 0
        ? getOpenTodoOccurrenceDates(entry)
        : [];

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

export function buildDashboardTodoAdviserSummaryFromUpcoming(
  upcoming: TodoUpcomingResponse | null,
): DashboardTodoAdviserSummary {
  if (!upcoming) {
    return {
      items: [],
      targetAmount: 0,
      usedAmount: 0,
      remainingAmount: 0,
    };
  }

  const items: DashboardTodoAdviserItem[] = upcoming.reserveSummary.items
    .filter(
      (item) => item.frequency === "WEEKLY" || item.frequency === "MONTHLY",
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      frequency: item.frequency as "WEEKLY" | "MONTHLY",
      remainingOccurrenceCount: item.remainingOccurrenceCount,
      targetAmount: item.targetAmount,
      usedAmount: item.usedAmount,
      remainingAmount: item.remainingAmount,
    }));

  return {
    items,
    targetAmount: upcoming.reserveSummary.targetAmount,
    usedAmount: upcoming.reserveSummary.usedAmount,
    remainingAmount: upcoming.reserveSummary.remainingAmount,
  };
}

export function buildUpcomingTodoScheduleFromUpcoming(
  upcoming: TodoUpcomingResponse | null,
): DashboardUpcomingTodoScheduleSummary {
  if (!upcoming) {
    return {
      days: [],
      daysWithPlans: 0,
      occurrenceCount: 0,
      totalAmount: 0,
    };
  }

  return {
    days: upcoming.days.map((day) => ({
      date: day.date,
      totalAmount: roundDashboardCurrency(day.totalAmount),
      items: day.items.map((item) => ({
        id: item.id,
        name: item.name,
        frequency: item.frequency,
        amount: roundDashboardCurrency(item.amount),
      })),
    })),
    daysWithPlans: upcoming.daysWithPlans,
    occurrenceCount: upcoming.occurrenceCount,
    totalAmount: roundDashboardCurrency(upcoming.totalScheduledAmount),
  };
}

export function buildDashboardPartnerActivitySummary(input: {
  currentUser: UserProfileResponse | null;
  expenses: ExpenseResponse[];
  income: IncomeResponse[];
  loans: LoanResponse[];
  partnership: PartnershipResponse | null;
  savings: SavingResponse[];
}): DashboardPartnerActivitySummary {
  const currentUserIdentity = input.currentUser
    ? toDashboardPartnerIdentity(input.currentUser)
    : null;
  const acceptedPartner =
    input.partnership?.status === "ACCEPTED" ? input.partnership.partner : null;
  const partnerIdentity = acceptedPartner
    ? toDashboardPartnerIdentity(acceptedPartner)
    : null;
  const records = [
    ...input.income.map((entry) =>
      toDashboardPartnerActivityRecord({
        amount: Number(entry.amount),
        creator: entry.createdBy,
        currency: "RWF",
        date: entry.date,
        id: entry.id,
        label: entry.label,
        type: "INCOME",
      }),
    ),
    ...input.expenses.map((entry) =>
      toDashboardPartnerActivityRecord({
        amount: Number(entry.amount),
        creator: entry.createdBy,
        currency: "RWF",
        date: entry.date,
        id: entry.id,
        label: entry.label,
        type: "EXPENSE",
      }),
    ),
    ...input.loans.map((entry) =>
      toDashboardPartnerActivityRecord({
        amount: Number(entry.amount),
        creator: entry.createdBy,
        currency: "RWF",
        date: entry.issuedDate,
        id: entry.id,
        label: entry.label,
        type: "LOAN",
      }),
    ),
    ...input.savings.map((entry) =>
      toDashboardPartnerActivityRecord({
        amount: entry.currentBalanceRwf,
        creator: entry.createdBy,
        currency: "RWF",
        date: entry.date,
        id: entry.id,
        label: entry.label,
        type: "SAVING",
      }),
    ),
  ].sort(compareDashboardDatesDesc);

  const people = new Map<string, DashboardPartnerActivityPersonSummary>();

  if (currentUserIdentity) {
    people.set(
      currentUserIdentity.id,
      createDashboardPartnerPersonSummary(currentUserIdentity, true),
    );
  }

  if (partnerIdentity) {
    people.set(
      partnerIdentity.id,
      createDashboardPartnerPersonSummary(partnerIdentity, false),
    );
  }

  records.forEach((record) => {
    const existing = people.get(record.creator.id);

    if (!existing) {
      people.set(
        record.creator.id,
        createDashboardPartnerPersonSummary(record.creator, false),
      );
    }

    const person = people.get(record.creator.id)!;
    person.entryCount += 1;

    if (record.currency === "USD") {
      person.usdAmount += record.amount;
    } else {
      person.rwfAmount += record.amount;
    }

    if (
      !person.latestActivity ||
      compareDashboardDatesDesc(record, person.latestActivity) < 0
    ) {
      person.latestActivity = record;
    }
  });

  const currentUserSummary = currentUserIdentity
    ? (people.get(currentUserIdentity.id) ?? null)
    : null;
  const partnerSummary = partnerIdentity
    ? (people.get(partnerIdentity.id) ?? null)
    : Array.from(people.values()).find(
        (person) => person.identity.id !== currentUserIdentity?.id,
      ) ?? null;
  const summaries = Array.from(people.values());

  return {
    activePeopleCount: summaries.filter((person) => person.entryCount > 0).length,
    currentUser: currentUserSummary,
    latestActivities: records.slice(0, 6),
    partner: partnerSummary,
    totalEntries: records.length,
    totalRwfAmount: summaries.reduce((sum, person) => sum + person.rwfAmount, 0),
    totalUsdAmount: summaries.reduce((sum, person) => sum + person.usdAmount, 0),
  };
}

export function buildDashboardMonthComparisonSummary(input: {
  expenses: ExpenseResponse[];
  income: IncomeResponse[];
  month: number;
  year: number;
}): DashboardMonthComparisonSummary {
  const previousPeriod = getPreviousMonthPeriod(input.month, input.year);
  const currentIncome = sumIncomeAmounts(
    filterEntriesByMonth(input.income, input.month, input.year),
  );
  const previousIncome = sumIncomeAmounts(
    filterEntriesByMonth(
      input.income,
      previousPeriod.month,
      previousPeriod.year,
    ),
  );
  const currentExpenses = sumExpenseAmounts(
    filterEntriesByMonth(input.expenses, input.month, input.year),
  );
  const previousExpenses = sumExpenseAmounts(
    filterEntriesByMonth(
      input.expenses,
      previousPeriod.month,
      previousPeriod.year,
    ),
  );
  const currentNetFlow = currentIncome - currentExpenses;
  const previousNetFlow = previousIncome - previousExpenses;

  return {
    currentLabel: `${formatDashboardMonthLabel(input.month)} ${input.year}`,
    metrics: [
      createDashboardMonthComparisonMetric({
        currentAmount: currentIncome,
        label: "Income",
        higherIsBetter: true,
        previousAmount: previousIncome,
      }),
      createDashboardMonthComparisonMetric({
        currentAmount: currentExpenses,
        label: "Expense",
        higherIsBetter: false,
        previousAmount: previousExpenses,
      }),
      createDashboardMonthComparisonMetric({
        currentAmount: currentNetFlow,
        label: "Net flow",
        higherIsBetter: true,
        previousAmount: previousNetFlow,
      }),
    ],
    previousLabel: `${formatDashboardMonthLabel(previousPeriod.month)} ${previousPeriod.year}`,
  };
}

function isRecurringAdviserTodo(
  entry: TodoResponse,
): entry is TodoResponse & { frequency: "WEEKLY" | "MONTHLY" } {
  return (
    entry.status !== "COMPLETED" &&
    entry.status !== "SKIPPED" &&
    entry.status !== "ARCHIVED" &&
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

export function buildTopSpendingCategoriesSummary(
  entries: ExpenseResponse[],
  categories: ExpenseCategoryOptionResponse[],
  month: number,
  year: number,
): DashboardTopSpendingCategoriesSummary {
  const labelLookup = new Map(
    categories.map((category) => [category.value, category.label]),
  );
  const totals = new Map<
    ExpenseCategory,
    { amount: number; entryCount: number; label: string }
  >();

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date);

    if (
      entryDate.getMonth() !== month ||
      entryDate.getFullYear() !== year
    ) {
      return;
    }

    const current = totals.get(entry.category);

    totals.set(entry.category, {
      amount: (current?.amount ?? 0) + Number(entry.amount),
      entryCount: (current?.entryCount ?? 0) + 1,
      label:
        current?.label ??
        labelLookup.get(entry.category) ??
        humanizeDashboardCategory(entry.category),
    });
  });

  const items = Array.from(totals.entries())
    .map(([category, value]) => ({
      amount: value.amount,
      category,
      entryCount: value.entryCount,
      label: value.label,
      share: 0,
    }))
    .sort((left, right) => right.amount - left.amount);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  items.forEach((item) => {
    item.share = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
  });

  return {
    items,
    topCategory: items[0] ?? null,
    totalAmount,
  };
}

export function resolveDashboardLoanDateRange(
  entries: LoanResponse[],
): DashboardLoanDateRange | null {
  if (entries.length === 0) {
    return null;
  }

  const timestamps = entries.map((entry) => new Date(entry.issuedDate).getTime());
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
    const entryTimestamp = new Date(entry.issuedDate).getTime();

    return entryTimestamp >= fromTimestamp && entryTimestamp <= toTimestamp;
  });
}

export function buildDashboardLoanStatusData(
  entries: LoanResponse[],
): DashboardLoanStatusDatum[] {
  const settledCount = entries.filter((entry) => isLoanSettled(entry.status)).length;
  const activeCount = entries.length - settledCount;

  return [
    {
      description: `${settledCount} ${settledCount === 1 ? "loan is" : "loans are"} fully cleared`,
      label: "Settled",
      tone: "paid",
      value: settledCount,
    },
    {
      description: `${activeCount} ${
        activeCount === 1 ? "loan still needs" : "loans still need"
      } settlement`,
      label: "Open",
      tone: "unpaid",
      value: activeCount,
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

function compareDashboardDatesDesc(
  left: { date: string },
  right: { date: string },
): number {
  return new Date(right.date).getTime() - new Date(left.date).getTime();
}

function createDashboardMonthComparisonMetric(input: {
  currentAmount: number;
  higherIsBetter: boolean;
  label: string;
  previousAmount: number;
}): DashboardMonthComparisonMetric {
  const deltaAmount = input.currentAmount - input.previousAmount;
  const trend =
    deltaAmount > 0 ? "up" : deltaAmount < 0 ? "down" : "flat";
  const tone =
    deltaAmount === 0
      ? "neutral"
      : input.higherIsBetter
        ? deltaAmount > 0
          ? "positive"
          : "negative"
        : deltaAmount < 0
          ? "positive"
          : "negative";

  return {
    currentAmount: input.currentAmount,
    deltaAmount,
    deltaPercent:
      input.previousAmount === 0
        ? null
        : Math.abs(deltaAmount) / Math.abs(input.previousAmount) * 100,
    label: input.label,
    previousAmount: input.previousAmount,
    tone,
    trend,
  };
}

function createDashboardPartnerPersonSummary(
  identity: DashboardPartnerActivityIdentity,
  isCurrentUser: boolean,
): DashboardPartnerActivityPersonSummary {
  return {
    entryCount: 0,
    identity,
    isCurrentUser,
    latestActivity: null,
    rwfAmount: 0,
    usdAmount: 0,
  };
}

function getPreviousMonthPeriod(month: number, year: number): {
  month: number;
  year: number;
} {
  if (month === 0) {
    return {
      month: 11,
      year: year - 1,
    };
  }

  return {
    month: month - 1,
    year,
  };
}

function toDashboardPartnerActivityRecord(input: {
  amount: number;
  creator: DashboardPartnerActivityIdentity;
  currency: "RWF" | "USD";
  date: string;
  id: string;
  label: string;
  type: "EXPENSE" | "INCOME" | "LOAN" | "SAVING";
}): DashboardPartnerActivityRecord {
  return {
    amount: input.amount,
    creator: toDashboardPartnerIdentity(input.creator),
    currency: input.currency,
    date: input.date,
    id: input.id,
    label: input.label,
    type: input.type,
  };
}

function toDashboardPartnerIdentity(
  user: DashboardPartnerActivityIdentity,
): DashboardPartnerActivityIdentity;
function toDashboardPartnerIdentity(
  user: NonNullable<PartnershipResponse["partner"]>,
): DashboardPartnerActivityIdentity;
function toDashboardPartnerIdentity(
  user: UserProfileResponse,
): DashboardPartnerActivityIdentity;
function toDashboardPartnerIdentity(user: {
  avatarUrl: string | null;
  email?: string | null;
  firstName: string | null;
  fullName?: string | null;
  id: string;
  lastName: string | null;
}): DashboardPartnerActivityIdentity {
  return {
    avatarUrl: user.avatarUrl,
    email: user.email ?? null,
    firstName: user.firstName,
    fullName: user.fullName ?? null,
    id: user.id,
    lastName: user.lastName,
  };
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

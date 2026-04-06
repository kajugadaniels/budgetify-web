import { MONTH_OPTIONS } from "@/constant/months";
import type {
  IncomeCategory,
  IncomeCategoryOptionResponse,
  IncomeResponse,
} from "@/lib/types/income.types";
import type {
  IncomeFormValues,
  IncomeLedgerCategoryFilter,
  IncomeLedgerReceivedFilter,
} from "./income-page.types";

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function createEmptyIncomeForm(): IncomeFormValues {
  return {
    label: "",
    amount: "",
    category: "",
    date: getTodayString(),
    received: false,
  };
}

export function createIncomeFormFromCategories(
  categories: IncomeCategoryOptionResponse[],
  month = getCurrentMonthIndex(),
  year = getCurrentYear(),
): IncomeFormValues {
  return {
    label: "",
    amount: "",
    category: categories[0]?.value ?? "",
    date: getMonthDefaultDate(month, year),
    received: false,
  };
}

export function createIncomeFormFromEntry(
  entry: IncomeResponse,
): IncomeFormValues {
  return {
    label: entry.label,
    amount: String(entry.amount),
    category: entry.category,
    date: entry.date.split("T")[0] ?? getTodayString(),
    received: entry.received,
  };
}

export function createIncomeFormForNextMonth(
  entry: IncomeResponse,
): IncomeFormValues {
  return {
    label: entry.label,
    amount: String(entry.amount),
    category: entry.category,
    date: getNextMonthDate(entry.date),
    received: false,
  };
}

export function sortIncomeEntries(entries: IncomeResponse[]): IncomeResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export function formatIncomeDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function isIncomeInMonth(
  value: string,
  month: number,
  year: number,
): boolean {
  const date = new Date(value);

  return (
    date.getUTCMonth() === month && date.getUTCFullYear() === year
  );
}

export function resolveIncomeMonthLabel(month: number): string {
  return MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "Month";
}

function getMonthDefaultDate(month: number, year: number): string {
  const currentMonth = getCurrentMonthIndex();
  const currentYear = getCurrentYear();

  if (month === currentMonth && year === currentYear) {
    return getTodayString();
  }

  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

function getNextMonthDate(value: string): string {
  const sourceDate = new Date(value);

  if (Number.isNaN(sourceDate.getTime())) {
    return getTodayString();
  }

  const sourceYear = sourceDate.getUTCFullYear();
  const sourceMonth = sourceDate.getUTCMonth();
  const sourceDay = sourceDate.getUTCDate();
  const targetYear = sourceMonth === 11 ? sourceYear + 1 : sourceYear;
  const targetMonth = (sourceMonth + 1) % 12;
  const maxTargetDay = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  const targetDay = Math.min(sourceDay, maxTargetDay);

  return [
    targetYear,
    String(targetMonth + 1).padStart(2, "0"),
    String(targetDay).padStart(2, "0"),
  ].join("-");
}

export function resolveIncomeCategoryLabel(
  categories: IncomeCategoryOptionResponse[],
  value: IncomeCategory,
): string {
  return categories.find((category) => category.value === value)?.label ?? value;
}

export function filterIncomeEntries(
  entries: IncomeResponse[],
  filters: {
    category: IncomeLedgerCategoryFilter;
    received: IncomeLedgerReceivedFilter;
  },
): IncomeResponse[] {
  return entries.filter((entry) => {
    const categoryMatches =
      filters.category === "ALL" || entry.category === filters.category;
    const receivedMatches =
      filters.received === "ALL" ||
      (filters.received === "RECEIVED" && entry.received) ||
      (filters.received === "PENDING" && !entry.received);

    return categoryMatches && receivedMatches;
  });
}

export function buildIncomeLedgerCategoryOptions(
  categories: IncomeCategoryOptionResponse[],
  entries: IncomeResponse[],
): IncomeCategoryOptionResponse[] {
  if (categories.length > 0) {
    return categories;
  }

  const seen = new Set<IncomeCategory>();

  return entries.reduce<IncomeCategoryOptionResponse[]>((result, entry) => {
    if (seen.has(entry.category)) {
      return result;
    }

    seen.add(entry.category);
    result.push({
      value: entry.category,
      label: entry.category,
    });

    return result;
  }, []);
}

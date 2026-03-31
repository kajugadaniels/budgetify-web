import { MONTH_OPTIONS } from "@/constant/dashboard/months";
import type {
  IncomeCategory,
  IncomeCategoryOptionResponse,
  IncomeResponse,
} from "@/lib/types/income.types";
import type { IncomeFormValues } from "./income-page.types";

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

export function resolveIncomeCategoryLabel(
  categories: IncomeCategoryOptionResponse[],
  value: IncomeCategory,
): string {
  return categories.find((category) => category.value === value)?.label ?? value;
}

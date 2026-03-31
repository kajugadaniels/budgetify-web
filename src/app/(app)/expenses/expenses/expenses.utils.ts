import { MONTH_OPTIONS } from "@/constant/months";
import type {
  ExpenseCategory,
  ExpenseCategoryOptionResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import type {
  ExpenseFormValues,
  ExpenseLedgerCategoryFilter,
} from "./expenses-page.types";

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function createEmptyExpenseForm(): ExpenseFormValues {
  return {
    label: "",
    amount: "",
    category: "",
    date: getTodayString(),
    note: "",
  };
}

export function createExpenseFormFromCategories(
  categories: ExpenseCategoryOptionResponse[],
  month = getCurrentMonthIndex(),
  year = getCurrentYear(),
): ExpenseFormValues {
  return {
    label: "",
    amount: "",
    category: categories[0]?.value ?? "",
    date: getMonthDefaultDate(month, year),
    note: "",
  };
}

export function createExpenseFormFromEntry(
  entry: ExpenseResponse,
): ExpenseFormValues {
  return {
    label: entry.label,
    amount: String(entry.amount),
    category: entry.category,
    date: entry.date.split("T")[0] ?? getTodayString(),
    note: entry.note ?? "",
  };
}

export function sortExpenseEntries(entries: ExpenseResponse[]): ExpenseResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export function formatExpenseDate(value: string): string {
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

export function resolveExpenseMonthLabel(month: number): string {
  return MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "Month";
}

export function resolveExpenseCategoryLabel(
  categories: ExpenseCategoryOptionResponse[],
  value: ExpenseCategory,
): string {
  return categories.find((category) => category.value === value)?.label ?? value;
}

export function buildExpenseLedgerCategoryOptions(
  categories: ExpenseCategoryOptionResponse[],
  entries: ExpenseResponse[],
): ExpenseCategoryOptionResponse[] {
  if (categories.length > 0) {
    return categories;
  }

  const seen = new Set<ExpenseCategory>();

  return entries.reduce<ExpenseCategoryOptionResponse[]>((result, entry) => {
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

export function filterExpenseEntries(
  entries: ExpenseResponse[],
  category: ExpenseLedgerCategoryFilter,
): ExpenseResponse[] {
  return entries.filter(
    (entry) => category === "ALL" || entry.category === category,
  );
}

export function formatExpenseNote(note: string | null): string {
  const trimmed = note?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : "No note";
}

function getMonthDefaultDate(month: number, year: number): string {
  const currentMonth = getCurrentMonthIndex();
  const currentYear = getCurrentYear();

  if (month === currentMonth && year === currentYear) {
    return getTodayString();
  }

  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

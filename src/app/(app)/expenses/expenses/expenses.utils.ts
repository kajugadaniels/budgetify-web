import type {
  ExpenseCategory,
  ExpenseCategoryOptionResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import type { ExpenseFormValues } from "./expenses-page.types";

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
): ExpenseFormValues {
  return {
    label: "",
    amount: "",
    category: categories[0]?.value ?? "",
    date: getTodayString(),
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
  });
}

export function isCurrentMonth(value: string): boolean {
  const now = new Date();
  const date = new Date(value);

  return (
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  );
}

export function resolveExpenseCategoryLabel(
  categories: ExpenseCategoryOptionResponse[],
  value: ExpenseCategory,
): string {
  return categories.find((category) => category.value === value)?.label ?? value;
}

export function formatExpenseNote(note: string | null): string {
  const trimmed = note?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : "No note";
}

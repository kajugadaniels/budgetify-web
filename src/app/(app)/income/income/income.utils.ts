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
): IncomeFormValues {
  return {
    label: "",
    amount: "",
    category: categories[0]?.value ?? "",
    date: getTodayString(),
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
  });
}

export function isCurrentMonth(value: string): boolean {
  const now = new Date();
  const date = new Date(value);

  return (
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  );
}

export function resolveIncomeCategoryLabel(
  categories: IncomeCategoryOptionResponse[],
  value: IncomeCategory,
): string {
  return categories.find((category) => category.value === value)?.label ?? value;
}

import { MONTH_OPTIONS } from "@/constant/months";
import type { SavingResponse } from "@/lib/types/saving.types";
import type {
  SavingExpenseFormValues,
  SavingFormValues,
} from "./saving-page.types";

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function buildSavingYearOptions(): Array<{
  label: string;
  value: number;
}> {
  const currentYear = getCurrentYear();

  return Array.from({ length: currentYear - 1999 }, (_, index) => {
    const year = currentYear - index;

    return {
      label: String(year),
      value: year,
    };
  });
}

export function createEmptySavingForm(
  month = getCurrentMonthIndex(),
  year = getCurrentYear(),
): SavingFormValues {
  return {
    label: "",
    amount: "",
    date: getMonthDefaultDate(month, year),
    note: "",
  };
}

export function createSavingFormFromEntry(
  entry: SavingResponse,
): SavingFormValues {
  return {
    label: entry.label,
    amount: String(entry.amount),
    date: entry.date.split("T")[0] ?? getTodayString(),
    note: entry.note ?? "",
  };
}

export function createEmptySavingExpenseForm(): SavingExpenseFormValues {
  return {
    amountRwf: "",
    date: getTodayString(),
    note: "",
  };
}

export function createSavingExpenseFormFromEntry(
  entry: SavingResponse,
): SavingExpenseFormValues {
  return {
    amountRwf: "",
    date: entry.date.split("T")[0] ?? getTodayString(),
    note: entry.note ?? "",
  };
}

export function sortSavingEntries(entries: SavingResponse[]): SavingResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export function formatSavingDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function resolveSavingMonthLabel(month: number): string {
  return (
    MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "Month"
  );
}

export function formatSavingNote(note: string | null): string {
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

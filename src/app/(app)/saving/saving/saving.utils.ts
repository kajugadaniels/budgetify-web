import { MONTH_OPTIONS } from "@/constant/months";
import type { SavingResponse } from "@/lib/types/saving.types";
import type {
  SavingDepositFormValues,
  SavingFormValues,
  SavingSourceAllocationValues,
  SavingWithdrawalFormValues,
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
    date: getMonthDefaultDate(month, year),
    note: "",
  };
}

export function createSavingFormFromEntry(
  entry: SavingResponse,
): SavingFormValues {
  return {
    label: entry.label,
    date: entry.date.split("T")[0] ?? getTodayString(),
    note: entry.note ?? "",
  };
}

export function createEmptySourceAllocation(): SavingSourceAllocationValues {
  return {
    incomeId: "",
    amount: "",
    currency: "RWF",
  };
}

export function createEmptySavingDepositForm(): SavingDepositFormValues {
  return {
    amount: "",
    currency: "RWF",
    date: getTodayString(),
    note: "",
    sources: [createEmptySourceAllocation()],
  };
}

export function createSavingDepositFormFromEntry(
  entry: SavingResponse,
): SavingDepositFormValues {
  return {
    amount: "",
    currency: "RWF",
    date: entry.date.split("T")[0] ?? getTodayString(),
    note: entry.note ?? "",
    sources: [createEmptySourceAllocation()],
  };
}

export function createEmptySavingWithdrawalForm(): SavingWithdrawalFormValues {
  return {
    amount: "",
    currency: "RWF",
    date: getTodayString(),
    note: "",
  };
}

export function createSavingWithdrawalFormFromEntry(
  entry: SavingResponse,
): SavingWithdrawalFormValues {
  return {
    amount: "",
    currency: "RWF",
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

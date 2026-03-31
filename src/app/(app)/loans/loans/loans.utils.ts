import { MONTH_OPTIONS } from "@/constant/months";
import type { LoanResponse } from "@/lib/types/loan.types";
import type { LoanFormValues, LoanLedgerPaidFilter } from "./loans-page.types";

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function createEmptyLoanForm(
  month = getCurrentMonthIndex(),
  year = getCurrentYear(),
): LoanFormValues {
  return {
    label: "",
    amount: "",
    date: getMonthDefaultDate(month, year),
    paid: false,
    note: "",
  };
}

export function createLoanFormFromEntry(entry: LoanResponse): LoanFormValues {
  return {
    label: entry.label,
    amount: String(entry.amount),
    date: entry.date.split("T")[0] ?? getTodayString(),
    paid: entry.paid,
    note: entry.note ?? "",
  };
}

export function sortLoanEntries(entries: LoanResponse[]): LoanResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export function formatLoanDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function resolveLoanMonthLabel(month: number): string {
  return MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "Month";
}

export function filterLoanEntries(
  entries: LoanResponse[],
  paid: LoanLedgerPaidFilter,
): LoanResponse[] {
  return entries.filter((entry) => {
    if (paid === "ALL") return true;
    if (paid === "PAID") return entry.paid;
    return !entry.paid;
  });
}

export function formatLoanNote(note: string | null): string {
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

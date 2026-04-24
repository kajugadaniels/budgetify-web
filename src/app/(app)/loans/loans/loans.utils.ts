import { MONTH_OPTIONS } from "@/constant/months";
import type {
  LoanDirection,
  LoanResponse,
  LoanType,
} from "@/lib/types/loan.types";
import type {
  LoanLedgerDirectionFilter,
  LoanFormValues,
  LoanLedgerPaidFilter,
  LoanLedgerTypeFilter,
  LoanSettlementFormValues,
} from "./loans-page.types";

export const LOAN_DIRECTION_OPTIONS: Array<{
  label: string;
  value: LoanDirection;
}> = [
  { label: "Borrowed", value: "BORROWED" },
  { label: "Lent", value: "LENT" },
];

export const LOAN_TYPE_OPTIONS: Array<{
  label: string;
  value: LoanType;
}> = [
  { label: "Personal", value: "PERSONAL" },
  { label: "Business", value: "BUSINESS" },
  { label: "Family", value: "FAMILY" },
  { label: "Friend", value: "FRIEND" },
  { label: "Other", value: "OTHER" },
];

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function buildLoanYearOptions(): Array<{
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

export function createEmptyLoanForm(
  month = getCurrentMonthIndex(),
  year = getCurrentYear(),
): LoanFormValues {
  return {
    label: "",
    direction: "BORROWED",
    type: "OTHER",
    counterpartyName: "",
    counterpartyContact: "",
    amount: "",
    currency: "RWF",
    issuedDate: getMonthDefaultDate(month, year),
    dueDate: "",
    paid: false,
    note: "",
  };
}

export function createLoanFormFromEntry(entry: LoanResponse): LoanFormValues {
  return {
    label: entry.label,
    direction: entry.direction,
    type: entry.type,
    counterpartyName: entry.counterpartyName,
    counterpartyContact: entry.counterpartyContact ?? "",
    amount: String(entry.amount),
    currency: entry.currency,
    issuedDate: entry.issuedDate.split("T")[0] ?? getTodayString(),
    dueDate: entry.dueDate?.split("T")[0] ?? "",
    paid: entry.paid,
    note: entry.note ?? "",
  };
}

export function createEmptyLoanSettlementForm(): LoanSettlementFormValues {
  return {
    date: getTodayString(),
    note: "",
  };
}

export function createLoanSettlementFormFromEntry(
  entry: LoanResponse,
): LoanSettlementFormValues {
  return {
    date: entry.issuedDate.split("T")[0] ?? getTodayString(),
    note: entry.note ?? "",
  };
}

export function sortLoanEntries(entries: LoanResponse[]): LoanResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.issuedDate).getTime() -
      new Date(left.issuedDate).getTime(),
  );
}

export function formatLoanDirection(direction: LoanDirection): string {
  return direction === "BORROWED" ? "Borrowed" : "Lent";
}

export function formatLoanType(type: LoanType): string {
  return LOAN_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "Other";
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
  direction: LoanLedgerDirectionFilter,
  type: LoanLedgerTypeFilter,
): LoanResponse[] {
  return entries.filter((entry) => {
    const matchesPaid =
      paid === "ALL" ? true : paid === "PAID" ? entry.paid : !entry.paid;
    const matchesDirection =
      direction === "ALL" ? true : entry.direction === direction;
    const matchesType = type === "ALL" ? true : entry.type === type;
    return matchesPaid && matchesDirection && matchesType;
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

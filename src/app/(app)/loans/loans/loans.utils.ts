import { MONTH_OPTIONS } from "@/constant/months";
import type {
  LoanBalanceEffect,
  LoanDirection,
  LoanResponse,
  LoanStatus,
  LoanTransactionType,
  LoanType,
} from "@/lib/types/loan.types";
import type {
  LoanLedgerDirectionFilter,
  LoanFormValues,
  LoanLedgerStatusFilter,
  LoanLedgerTypeFilter,
  LoanTransactionFormValues,
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

export const LOAN_STATUS_OPTIONS: Array<{
  label: string;
  value: LoanStatus;
}> = [
  { label: "Active", value: "ACTIVE" },
  { label: "Partially repaid", value: "PARTIALLY_REPAID" },
  { label: "Settled", value: "SETTLED" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Written off", value: "WRITTEN_OFF" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Archived", value: "ARCHIVED" },
];

export const LOAN_TRANSACTION_TYPE_OPTIONS: Array<{
  label: string;
  value: LoanTransactionType;
}> = [
  { label: "Disbursement", value: "DISBURSEMENT" },
  { label: "Repayment", value: "REPAYMENT" },
  { label: "Interest charge", value: "INTEREST_CHARGE" },
  { label: "Interest payment", value: "INTEREST_PAYMENT" },
  { label: "Adjustment", value: "ADJUSTMENT" },
  { label: "Write off", value: "WRITE_OFF" },
  { label: "Reversal", value: "REVERSAL" },
];

export const LOAN_BALANCE_EFFECT_OPTIONS: Array<{
  label: string;
  value: LoanBalanceEffect;
}> = [
  { label: "Increase balance", value: "INCREASE" },
  { label: "Decrease balance", value: "DECREASE" },
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
    status: "ACTIVE",
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
    status: entry.status,
    note: entry.note ?? "",
  };
}

export function createEmptyLoanSettlementForm(): LoanSettlementFormValues {
  return {
    date: getTodayString(),
    note: "",
  };
}

export function createEmptyLoanTransactionForm(): LoanTransactionFormValues {
  return {
    type: "REPAYMENT",
    amount: "",
    principalAmount: "",
    interestAmount: "",
    currency: "RWF",
    balanceEffect: "DECREASE",
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

export function formatLoanStatus(status: LoanStatus): string {
  return (
    LOAN_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    "Active"
  );
}

export function formatLoanTransactionType(type: LoanTransactionType): string {
  return (
    LOAN_TRANSACTION_TYPE_OPTIONS.find((option) => option.value === type)
      ?.label ?? "Transaction"
  );
}

export function formatLoanBalanceEffect(effect: LoanBalanceEffect): string {
  return effect === "INCREASE" ? "Increase" : "Decrease";
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
  status: LoanLedgerStatusFilter,
  direction: LoanLedgerDirectionFilter,
  type: LoanLedgerTypeFilter,
): LoanResponse[] {
  return entries.filter((entry) => {
    const matchesStatus = status === "ALL" ? true : entry.status === status;
    const matchesDirection =
      direction === "ALL" ? true : entry.direction === direction;
    const matchesType = type === "ALL" ? true : entry.type === type;
    return matchesStatus && matchesDirection && matchesType;
  });
}

export function isLoanSettled(status: LoanStatus): boolean {
  return status === "SETTLED";
}

export function isLoanTerminalStatus(status: LoanStatus): boolean {
  return (
    status === "CANCELLED" ||
    status === "WRITTEN_OFF" ||
    status === "ARCHIVED"
  );
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

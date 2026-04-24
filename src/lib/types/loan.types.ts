import type { CreatedBySummary } from "./created-by.types";
import type { Currency } from "./currency.types";
import type { ExpenseResponse } from "./expense.types";

export type LoanDirection = "BORROWED" | "LENT";
export type LoanType =
  | "PERSONAL"
  | "BUSINESS"
  | "FAMILY"
  | "FRIEND"
  | "OTHER";
export type LoanStatus =
  | "ACTIVE"
  | "PARTIALLY_REPAID"
  | "SETTLED"
  | "OVERDUE"
  | "WRITTEN_OFF"
  | "CANCELLED"
  | "ARCHIVED";

export interface LoanResponse {
  id: string;
  label: string;
  direction: LoanDirection;
  type: LoanType;
  counterpartyName: string;
  counterpartyContact: string | null;
  amount: number;
  currency: Currency;
  amountRwf: number;
  issuedDate: string;
  dueDate: string | null;
  status: LoanStatus;
  note: string | null;
  createdBy: CreatedBySummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanRequest {
  label: string;
  direction: LoanDirection;
  type: LoanType;
  counterpartyName: string;
  counterpartyContact?: string;
  amount: number;
  currency: Currency;
  issuedDate: string;
  dueDate?: string;
  status?: LoanStatus;
  note?: string;
}

export interface UpdateLoanRequest {
  label?: string;
  direction?: LoanDirection;
  type?: LoanType;
  counterpartyName?: string;
  counterpartyContact?: string;
  amount?: number;
  currency?: Currency;
  issuedDate?: string;
  dueDate?: string;
  status?: LoanStatus;
  note?: string;
}

export interface SendLoanToExpenseRequest {
  date: string;
  note?: string;
}

export interface LoanSettlementResponse {
  loan: LoanResponse;
  expense: ExpenseResponse;
}

export interface ListLoansParams {
  month?: number;
  year?: number;
  status?: LoanStatus;
  direction?: LoanDirection;
  type?: LoanType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

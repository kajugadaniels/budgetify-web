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
  paid: boolean;
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
  paid: boolean;
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
  paid?: boolean;
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
  paid?: boolean;
  direction?: LoanDirection;
  type?: LoanType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

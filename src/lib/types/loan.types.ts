import type { ExpenseResponse } from "./expense.types";

export interface LoanResponse {
  id: string;
  label: string;
  amount: number;
  date: string;
  paid: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanRequest {
  label: string;
  amount: number;
  date: string;
  paid: boolean;
  note?: string;
}

export interface UpdateLoanRequest {
  label?: string;
  amount?: number;
  date?: string;
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
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

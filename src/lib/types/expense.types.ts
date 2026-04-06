import type { CreatedBySummary } from "./created-by.types";

export type ExpenseCategory =
  | "FOOD_DINING"
  | "TRANSPORT"
  | "HOUSING"
  | "LOAN"
  | "UTILITIES"
  | "HEALTHCARE"
  | "EDUCATION"
  | "ENTERTAINMENT"
  | "SHOPPING"
  | "PERSONAL_CARE"
  | "TRAVEL"
  | "SAVINGS"
  | "OTHER";

export interface ExpenseCategoryOptionResponse {
  value: ExpenseCategory;
  label: string;
}

export interface ExpenseResponse {
  id: string;
  label: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note: string | null;
  createdBy: CreatedBySummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  label: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

export interface UpdateExpenseRequest {
  label?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: string;
  note?: string;
}

export interface ListExpensesParams {
  month?: number;
  year?: number;
  category?: ExpenseCategory;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export type ExpenseCategory =
  | "FOOD_DINING"
  | "TRANSPORT"
  | "HOUSING"
  | "UTILITIES"
  | "HEALTHCARE"
  | "EDUCATION"
  | "ENTERTAINMENT"
  | "SHOPPING"
  | "PERSONAL_CARE"
  | "TRAVEL"
  | "SAVINGS"
  | "OTHER";

export interface ExpenseResponse {
  id: string;
  label: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note: string | null;
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

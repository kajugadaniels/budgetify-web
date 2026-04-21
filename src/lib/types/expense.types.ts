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

export type ExpenseCurrency = "RWF" | "USD";

export type ExpensePaymentMethod =
  | "CASH"
  | "BANK"
  | "MOBILE_MONEY"
  | "CARD"
  | "OTHER";

export type ExpenseMobileMoneyChannel = "MERCHANT_CODE" | "P2P_TRANSFER";

export type ExpenseMobileMoneyProvider = "MTN_RWANDA" | "OTHER";

export type ExpenseMobileMoneyNetwork = "ON_NET" | "OFF_NET";

export interface ExpenseCategoryOptionResponse {
  value: ExpenseCategory;
  label: string;
}

export interface ExpenseResponse {
  id: string;
  label: string;
  amount: number;
  currency: ExpenseCurrency;
  amountRwf: number;
  feeAmount: number;
  feeAmountRwf: number;
  totalAmountRwf: number;
  paymentMethod: ExpensePaymentMethod;
  mobileMoneyChannel: ExpenseMobileMoneyChannel | null;
  mobileMoneyProvider: ExpenseMobileMoneyProvider | null;
  mobileMoneyNetwork: ExpenseMobileMoneyNetwork | null;
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
  currency?: ExpenseCurrency;
  category: ExpenseCategory;
  paymentMethod?: ExpensePaymentMethod;
  mobileMoneyChannel?: ExpenseMobileMoneyChannel;
  mobileMoneyProvider?: ExpenseMobileMoneyProvider;
  mobileMoneyNetwork?: ExpenseMobileMoneyNetwork;
  date: string;
  note?: string;
}

export interface UpdateExpenseRequest {
  label?: string;
  amount?: number;
  currency?: ExpenseCurrency;
  category?: ExpenseCategory;
  paymentMethod?: ExpensePaymentMethod;
  mobileMoneyChannel?: ExpenseMobileMoneyChannel;
  mobileMoneyProvider?: ExpenseMobileMoneyProvider;
  mobileMoneyNetwork?: ExpenseMobileMoneyNetwork;
  date?: string;
  note?: string;
}

export interface MobileMoneyQuoteRequest {
  amount: number;
  currency?: ExpenseCurrency;
  mobileMoneyProvider: ExpenseMobileMoneyProvider;
  mobileMoneyChannel: ExpenseMobileMoneyChannel;
  mobileMoneyNetwork?: ExpenseMobileMoneyNetwork;
}

export interface MobileMoneyQuoteResponse {
  amount: number;
  currency: ExpenseCurrency;
  amountRwf: number;
  feeAmount: number;
  feeAmountRwf: number;
  totalAmountRwf: number;
  mobileMoneyProvider: ExpenseMobileMoneyProvider;
  mobileMoneyChannel: ExpenseMobileMoneyChannel;
  mobileMoneyNetwork: ExpenseMobileMoneyNetwork | null;
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

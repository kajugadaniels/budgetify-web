import type { CreatedBySummary } from "./created-by.types";
import type { Currency } from "./currency.types";

export type IncomeCategory =
  | "SALARY"
  | "FREELANCE"
  | "DIVIDENDS"
  | "RENTAL"
  | "SIDE_HUSTLE"
  | "OTHER";

export interface IncomeCategoryOptionResponse {
  value: IncomeCategory;
  label: string;
}

export interface IncomeResponse {
  id: string;
  label: string;
  amount: number;
  currency: Currency;
  amountRwf: number;
  category: IncomeCategory;
  date: string;
  received: boolean;
  createdBy: CreatedBySummary;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeSummaryResponse {
  totalIncomeRwf: number;
  receivedIncomeRwf: number;
  pendingIncomeRwf: number;
  totalExpensesRwf: number;
  totalSavingsBalanceRwf: number;
  availableMoneyNowRwf: number;
  totalIncomeCount: number;
  receivedIncomeCount: number;
  pendingIncomeCount: number;
}

export interface IncomeSavingAllocationResponse {
  id: string;
  savingId: string;
  savingLabel: string;
  transactionId: string;
  transactionDate: string;
  amount: number;
  currency: Currency;
  amountRwf: number;
  note: string | null;
}

export interface IncomeDetailResponse extends IncomeResponse {
  allocatedToSavingsRwf: number;
  remainingAvailableRwf: number;
  allocationCount: number;
  savingAllocations: IncomeSavingAllocationResponse[];
}

export interface CreateIncomeRequest {
  label: string;
  amount: number;
  currency?: Currency;
  category: IncomeCategory;
  date: string;
  received: boolean;
}

export interface UpdateIncomeRequest {
  label?: string;
  amount?: number;
  currency?: Currency;
  category?: IncomeCategory;
  date?: string;
  received?: boolean;
}

export interface ListIncomeParams {
  month?: number;
  year?: number;
  category?: IncomeCategory;
  received?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

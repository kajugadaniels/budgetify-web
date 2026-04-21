import type { CreatedBySummary } from "./created-by.types";
import type { Currency } from "./currency.types";

export interface SavingResponse {
  id: string;
  label: string;
  amount: number;
  currency: Currency;
  amountRwf: number;
  targetAmount: number | null;
  targetCurrency: Currency | null;
  targetAmountRwf: number | null;
  startDate: string | null;
  endDate: string | null;
  timeframeDays: number | null;
  targetProgressPercentage: number | null;
  timeframeProgressPercentage: number | null;
  totalDepositedRwf: number;
  totalWithdrawnRwf: number;
  currentBalanceRwf: number;
  date: string;
  note: string | null;
  stillHave: boolean;
  createdBy: CreatedBySummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingRequest {
  label: string;
  amount?: number;
  currency?: Currency;
  targetAmount?: number;
  targetCurrency?: Currency;
  startDate?: string;
  endDate?: string;
  date: string;
  note?: string;
  stillHave?: boolean;
}

export interface UpdateSavingRequest {
  label?: string;
  amount?: number;
  currency?: Currency;
  targetAmount?: number | null;
  targetCurrency?: Currency | null;
  startDate?: string | null;
  endDate?: string | null;
  date?: string;
  note?: string;
  stillHave?: boolean;
}

export interface CreateSavingDepositIncomeSourceRequest {
  incomeId: string;
  amount: number;
  currency?: Currency;
}

export interface CreateSavingDepositRequest {
  amount: number;
  currency?: Currency;
  date: string;
  note?: string;
  incomeSources: CreateSavingDepositIncomeSourceRequest[];
}

export interface CreateSavingWithdrawalRequest {
  amount: number;
  currency?: Currency;
  date: string;
  note?: string;
}

export type SavingTransactionType = "DEPOSIT" | "WITHDRAWAL" | "ADJUSTMENT";

export interface SavingTransactionIncomeSourceResponse {
  id: string;
  incomeId: string;
  incomeLabel: string;
  incomeCategory: string;
  amount: number;
  currency: Currency;
  amountRwf: number;
}

export interface SavingTransactionResponse {
  id: string;
  type: SavingTransactionType;
  amount: number;
  currency: Currency;
  amountRwf: number;
  date: string;
  note: string | null;
  isReversal: boolean;
  isReversed: boolean;
  reversalOfTransactionId: string | null;
  reversedByTransactionId: string | null;
  incomeSources: SavingTransactionIncomeSourceResponse[];
  createdAt: string;
}

export interface ListSavingsParams {
  month?: number;
  year?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

import type { CreatedBySummary } from "./created-by.types";
import type { Currency } from "./currency.types";
import type { ExpenseResponse } from "./expense.types";
import type { IncomeResponse } from "./income.types";

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
export type LoanTransactionType =
  | "DISBURSEMENT"
  | "REPAYMENT"
  | "INTEREST_CHARGE"
  | "INTEREST_PAYMENT"
  | "ADJUSTMENT"
  | "WRITE_OFF"
  | "REVERSAL";
export type LoanBalanceEffect = "INCREASE" | "DECREASE";

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
  originalPrincipal: number;
  originalPrincipalRwf: number;
  principalRepaid: number;
  principalRepaidRwf: number;
  principalOutstanding: number;
  principalOutstandingRwf: number;
  interestCharged: number;
  interestChargedRwf: number;
  interestPaid: number;
  interestPaidRwf: number;
  interestOutstanding: number;
  interestOutstandingRwf: number;
  totalOutstanding: number;
  totalOutstandingRwf: number;
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
  label?: string;
  note?: string;
}

export interface LoanSettlementResponse {
  loan: LoanResponse;
  expense: ExpenseResponse;
}

export interface LoanTransactionResponse {
  id: string;
  loanId: string;
  type: LoanTransactionType;
  balanceEffect: LoanBalanceEffect;
  amount: number;
  currency: Currency;
  amountRwf: number;
  principalAmount: number;
  principalAmountRwf: number;
  interestAmount: number;
  interestAmountRwf: number;
  date: string;
  note: string | null;
  reversalOfTransactionId: string | null;
  linkedExpense: {
    id: string;
    label: string;
    amount: number;
    currency: Currency;
    amountRwf: number;
    totalAmountRwf: number;
    category: "LOAN";
    date: string;
  } | null;
  linkedIncome: {
    id: string;
    label: string;
    amount: number;
    currency: Currency;
    amountRwf: number;
    category: "LOAN_RECOVERY";
    received: boolean;
    date: string;
  } | null;
  recordedBy: CreatedBySummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanTransactionRequest {
  type: LoanTransactionType;
  amount: number;
  principalAmount?: number;
  interestAmount?: number;
  currency: Currency;
  balanceEffect?: LoanBalanceEffect;
  date: string;
  note?: string;
  reversalOfTransactionId?: string;
}

export interface LinkLoanTransactionFinancialRecordRequest {
  date: string;
  label?: string;
  note?: string;
}

export interface LoanIncomeFlowResponse {
  loan: LoanResponse;
  income: IncomeResponse;
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

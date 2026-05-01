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
export type LoanRepaymentAllocation = "INTEREST_FIRST" | "PRINCIPAL_FIRST";
export type LoanOperationalFilter =
  | "DUE_SOON"
  | "OVERDUE"
  | "OUTSTANDING"
  | "HAS_LINKED_EXPENSE"
  | "HAS_LINKED_INCOME"
  | "UNLINKED_ELIGIBLE"
  | "HAS_INTEREST";
export type LoanSortOption =
  | "ISSUED_DESC"
  | "ISSUED_ASC"
  | "DUE_ASC"
  | "DUE_DESC"
  | "OUTSTANDING_DESC"
  | "OUTSTANDING_ASC"
  | "COUNTERPARTY_ASC"
  | "LATEST_ACTIVITY_DESC";

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
  repaymentAllocation: LoanRepaymentAllocation;
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
  repaymentAllocation?: LoanRepaymentAllocation;
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
  dueDate?: string | null;
  status?: LoanStatus;
  repaymentAllocation?: LoanRepaymentAllocation;
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
  isReversed: boolean;
  reversedByTransactionId: string | null;
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

export interface LoanDirectionExposure {
  direction: LoanDirection;
  loanCount: number;
  originalPrincipalRwf: number;
  principalOutstandingRwf: number;
  interestOutstandingRwf: number;
  totalOutstandingRwf: number;
}

export interface LoanStatusBreakdown {
  status: LoanStatus;
  loanCount: number;
  totalOutstandingRwf: number;
}

export interface LoanSummaryResponse {
  totalLoanCount: number;
  activeLoanCount: number;
  settledLoanCount: number;
  overdueLoanCount: number;
  borrowedOutstandingRwf: number;
  lentOutstandingRwf: number;
  interestPayableOutstandingRwf: number;
  interestReceivableOutstandingRwf: number;
  repaymentsThisPeriodRwf: number;
  interestEarnedThisPeriodRwf: number;
  interestPaidThisPeriodRwf: number;
  linkedExpenseCount: number;
  linkedIncomeCount: number;
  reversedTransactionCount: number;
  exposureByDirection: LoanDirectionExposure[];
  statusBreakdown: LoanStatusBreakdown[];
  latestTransaction: {
    id: string;
    loanLabel: string;
    amountRwf: number;
    date: string;
  } | null;
}

export interface LoanAuditResponse {
  periodStartDate: string | null;
  periodEndDate: string | null;
  loanCount: number;
  transactionCount: number;
  reversedTransactionCount: number;
  originalPrincipalRwf: number;
  principalRepaidRwf: number;
  principalOutstandingRwf: number;
  interestChargedRwf: number;
  interestPaidRwf: number;
  interestOutstandingRwf: number;
  totalOutstandingRwf: number;
  linkedExpenseCount: number;
  linkedIncomeCount: number;
  unlinkedEligibleTransactionCount: number;
  exposureByDirection: LoanDirectionExposure[];
  statusBreakdown: LoanStatusBreakdown[];
}

export interface LoanAgingResponse {
  asOfDate: string;
  overdueLoanCount: number;
  overdueOutstandingRwf: number;
  buckets: Array<{
    bucket: string;
    loanCount: number;
    principalOutstandingRwf: number;
    interestOutstandingRwf: number;
    totalOutstandingRwf: number;
  }>;
  byDirection: Array<{
    direction: LoanDirection;
    overdueLoanCount: number;
    overdueOutstandingRwf: number;
    buckets: LoanAgingResponse["buckets"];
  }>;
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
}

export interface LinkLoanTransactionFinancialRecordRequest {
  date: string;
  label?: string;
  note?: string;
}

export interface ReverseLoanTransactionRequest {
  date: string;
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
  operationalFilter?: LoanOperationalFilter;
  sortBy?: LoanSortOption;
  minOutstandingRwf?: number;
  maxOutstandingRwf?: number;
  page?: number;
  limit?: number;
}

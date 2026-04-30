import type {
  LoanBalanceEffect,
  LoanTransactionType,
  LoanDirection,
  LoanRepaymentAllocation,
  LoanResponse,
  LoanStatus,
  LoanType,
} from "@/lib/types/loan.types";

export type LoanLedgerStatusFilter = "ALL" | LoanStatus;
export type LoanLedgerDirectionFilter = "ALL" | LoanDirection;
export type LoanLedgerTypeFilter = "ALL" | LoanType;

export interface LoanFormValues {
  label: string;
  direction: LoanDirection;
  type: LoanType;
  counterpartyName: string;
  counterpartyContact: string;
  amount: string;
  currency: "RWF" | "USD";
  issuedDate: string;
  dueDate: string;
  status: LoanStatus;
  repaymentAllocation: LoanRepaymentAllocation;
  note: string;
}

export interface LoanSettlementFormValues {
  date: string;
  label: string;
  note: string;
}

export interface LoanTransactionFormValues {
  type: LoanTransactionType;
  amount: string;
  principalAmount: string;
  interestAmount: string;
  currency: "RWF" | "USD";
  balanceEffect: LoanBalanceEffect;
  date: string;
  note: string;
}

export interface LoanTransactionFinancialFlowFormValues {
  date: string;
  label: string;
  note: string;
}

export type LoanFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: LoanResponse }
  | null;

export type LoanSettlementDialogState =
  | { entry: LoanResponse }
  | null;

export type LoanTransactionsDialogState =
  | { entry: LoanResponse }
  | null;

export type LoanTransactionFinancialFlowDialogState =
  | {
      entry: LoanResponse;
      transactionId: string;
      target: "expense" | "income";
    }
  | null;

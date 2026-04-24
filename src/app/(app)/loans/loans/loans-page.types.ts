import type {
  LoanDirection,
  LoanResponse,
  LoanType,
} from "@/lib/types/loan.types";

export type LoanLedgerPaidFilter = "ALL" | "PAID" | "UNPAID";
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
  paid: boolean;
  note: string;
}

export interface LoanSettlementFormValues {
  date: string;
  note: string;
}

export type LoanFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: LoanResponse }
  | null;

export type LoanSettlementDialogState =
  | { entry: LoanResponse }
  | null;

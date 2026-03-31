import type { LoanResponse } from "@/lib/types/loan.types";

export type LoanLedgerPaidFilter = "ALL" | "PAID" | "UNPAID";

export interface LoanFormValues {
  label: string;
  amount: string;
  date: string;
  paid: boolean;
  note: string;
}

export type LoanFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: LoanResponse }
  | null;

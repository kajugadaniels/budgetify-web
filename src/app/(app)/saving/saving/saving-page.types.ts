import type { SavingResponse } from "@/lib/types/saving.types";

export interface SavingFormValues {
  label: string;
  amount: string;
  date: string;
  note: string;
}

export interface SavingExpenseFormValues {
  amountRwf: string;
  date: string;
  note: string;
}

export type SavingFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: SavingResponse }
  | null;

export type SavingExpenseDialogState =
  | { entry: SavingResponse }
  | null;

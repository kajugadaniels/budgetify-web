import type { Currency } from "@/lib/types/currency.types";
import type {
  SavingResponse,
  SavingTransactionResponse,
} from "@/lib/types/saving.types";

export interface SavingFormValues {
  label: string;
  date: string;
  note: string;
}

export interface SavingSourceAllocationValues {
  incomeId: string;
  amount: string;
  currency: Currency;
}

export interface SavingDepositFormValues {
  amount: string;
  currency: Currency;
  date: string;
  note: string;
  sources: SavingSourceAllocationValues[];
}

export interface SavingWithdrawalFormValues {
  amount: string;
  currency: Currency;
  date: string;
  note: string;
}

export type SavingFormDialogState =
  | { mode: "create" | "edit"; entry?: SavingResponse }
  | null;

export type SavingDepositDialogState =
  | { entry: SavingResponse }
  | null;

export type SavingWithdrawalDialogState =
  | { entry: SavingResponse }
  | null;

export type SavingHistoryDialogState =
  | {
      entry: SavingResponse;
      transactions: SavingTransactionResponse[];
      loading: boolean;
    }
  | null;

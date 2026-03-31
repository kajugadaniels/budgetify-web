import type {
  IncomeCategory,
  IncomeResponse,
} from "@/lib/types/income.types";

export type IncomeLedgerCategoryFilter = IncomeCategory | "ALL";
export type IncomeLedgerReceivedFilter = "ALL" | "RECEIVED" | "PENDING";

export interface IncomeFormValues {
  label: string;
  amount: string;
  category: IncomeCategory | "";
  date: string;
  received: boolean;
}

export type IncomeFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: IncomeResponse }
  | null;

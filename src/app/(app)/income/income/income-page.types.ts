import type {
  IncomeCategory,
  IncomeResponse,
} from "@/lib/types/income.types";

export interface IncomeFormValues {
  label: string;
  amount: string;
  category: IncomeCategory | "";
  date: string;
}

export type IncomeFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: IncomeResponse }
  | null;

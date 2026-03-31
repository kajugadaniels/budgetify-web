import type {
  ExpenseCategory,
  ExpenseResponse,
} from "@/lib/types/expense.types";

export type ExpenseLedgerCategoryFilter = ExpenseCategory | "ALL";

export interface ExpenseFormValues {
  label: string;
  amount: string;
  category: ExpenseCategory | "";
  date: string;
  note: string;
}

export type ExpenseFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: ExpenseResponse }
  | null;

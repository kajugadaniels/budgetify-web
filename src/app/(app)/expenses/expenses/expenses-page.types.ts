import type {
  ExpenseCategory,
  ExpenseCurrency,
  ExpenseMobileMoneyChannel,
  ExpenseMobileMoneyNetwork,
  ExpenseMobileMoneyProvider,
  ExpensePaymentMethod,
  ExpenseSummaryResponse,
  MobileMoneyQuoteResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";

export type ExpenseLedgerCategoryFilter = ExpenseCategory | "ALL";

export interface ExpenseFormValues {
  label: string;
  amount: string;
  currency: ExpenseCurrency;
  category: ExpenseCategory | "";
  paymentMethod: ExpensePaymentMethod;
  mobileMoneyChannel: ExpenseMobileMoneyChannel;
  mobileMoneyProvider: ExpenseMobileMoneyProvider;
  mobileMoneyNetwork: ExpenseMobileMoneyNetwork;
  date: string;
  note: string;
}

export interface ExpenseQuoteState {
  loading: boolean;
  error: string | null;
  data: MobileMoneyQuoteResponse | null;
}

export interface ExpenseSummaryState {
  loading: boolean;
  error: string | null;
  data: ExpenseSummaryResponse | null;
}

export type ExpenseFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: ExpenseResponse }
  | null;

export type ExpenseDetailsDialogState =
  | { entry: ExpenseResponse }
  | null;

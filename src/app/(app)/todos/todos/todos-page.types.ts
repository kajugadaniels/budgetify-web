import type {
  ExpenseCategory,
  ExpenseMobileMoneyChannel,
  ExpenseMobileMoneyNetwork,
  ExpensePaymentMethod,
} from "@/lib/types/expense.types";
import type {
  TodoFrequency,
  TodoPriority,
  TodoResponse,
} from "@/lib/types/todo.types";

export type TodoBoardPriorityFilter = TodoPriority | "ALL";
export type TodoBoardFrequencyFilter = TodoFrequency | "ALL";
export type TodoBoardDoneFilter = "ALL" | "DONE" | "NOT_DONE";

export interface TodoFormValues {
  name: string;
  price: string;
  priority: TodoPriority;
  done: boolean;
  frequency: TodoFrequency;
  startDate: string;
  endDate: string;
  frequencyDays: number[];
  occurrenceDates: string[];
}

export interface TodoExpenseFormValues {
  amount: string;
  category: ExpenseCategory | "";
  paymentMethod: ExpensePaymentMethod | "";
  mobileMoneyChannel: ExpenseMobileMoneyChannel | "";
  mobileMoneyNetwork: ExpenseMobileMoneyNetwork | "";
  date: string;
}

export type TodoGalleryState = {
  todoId: string;
  index: number;
} | null;

export type TodoExpenseDialogState =
  | { entry: TodoResponse }
  | null;

import type {
  ExpenseCategory,
  ExpenseMobileMoneyChannel,
  ExpenseMobileMoneyNetwork,
  ExpensePaymentMethod,
} from "@/lib/types/expense.types";
import type {
  TodoCadenceFilter,
  TodoFrequency,
  TodoOperationalStateFilter,
  TodoPriority,
  TodoResponse,
  TodoSortBy,
  TodoStatus,
  TodoType,
} from "@/lib/types/todo.types";

export type TodoBoardPriorityFilter = TodoPriority | "ALL";
export type TodoBoardCadenceFilter =
  | TodoCadenceFilter
  | TodoFrequency
  | "ALL";
export type TodoBoardStatusFilter = TodoStatus | "ALL";
export type TodoBoardTypeFilter = TodoType | "ALL";
export type TodoBoardOperationalStateFilter =
  | TodoOperationalStateFilter
  | "ALL";
export type TodoBoardSortFilter = TodoSortBy;

export interface TodoFormValues {
  name: string;
  price: string;
  type: TodoType;
  priority: TodoPriority;
  status: TodoStatus;
  frequency: TodoFrequency;
  defaultExpenseCategory: ExpenseCategory | "";
  defaultPaymentMethod: ExpensePaymentMethod | "";
  defaultMobileMoneyChannel: ExpenseMobileMoneyChannel | "";
  defaultMobileMoneyNetwork: ExpenseMobileMoneyNetwork | "";
  payee: string;
  expenseNote: string;
  responsibleUserId: string;
  startDate: string;
  endDate: string;
  frequencyDays: number[];
  occurrenceDates: string[];
}

export interface TodoExpenseFormValues {
  label: string;
  amount: string;
  category: ExpenseCategory | "";
  paymentMethod: ExpensePaymentMethod | "";
  mobileMoneyChannel: ExpenseMobileMoneyChannel | "";
  mobileMoneyNetwork: ExpenseMobileMoneyNetwork | "";
  date: string;
  note: string;
}

export interface TodoResponsibleUserOption {
  id: string;
  label: string;
}

export type TodoGalleryState = {
  todoId: string;
  index: number;
} | null;

export type TodoExpenseDialogState =
  | { entry: TodoResponse }
  | null;

import type { ExpenseCategory } from "@/lib/types/expense.types";
import type {
  TodoFrequency,
  TodoPriority,
  TodoResponse,
} from "@/lib/types/todo.types";

export type TodoBoardPriorityFilter = TodoPriority | "ALL";
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
  date: string;
}

export type TodoFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: TodoResponse }
  | null;

export type TodoGalleryState = {
  todoId: string;
  index: number;
} | null;

export type TodoExpenseDialogState =
  | { entry: TodoResponse }
  | null;

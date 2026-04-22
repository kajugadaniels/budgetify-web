import type { CreatedBySummary } from "./created-by.types";
import type {
  ExpenseCategory,
  ExpenseMobileMoneyChannel,
  ExpenseMobileMoneyNetwork,
  ExpensePaymentMethod,
} from "./expense.types";

export type TodoPriority = "TOP_PRIORITY" | "PRIORITY" | "NOT_PRIORITY";
export type TodoFrequency = "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface TodoImageResponse {
  id: string;
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoResponse {
  id: string;
  name: string;
  price: number;
  priority: TodoPriority;
  done: boolean;
  frequency: TodoFrequency;
  startDate: string | null;
  endDate: string | null;
  frequencyDays: number[];
  occurrenceDates: string[];
  recordedOccurrenceDates: string[];
  remainingAmount: number | null;
  recordingCount: number;
  recordings: TodoRecordingResponse[];
  coverImageUrl: string | null;
  imageCount: number;
  images: TodoImageResponse[];
  createdBy: CreatedBySummary;
  createdAt: string;
  updatedAt: string;
}

export interface TodoRecordingResponse {
  id: string;
  todoId: string;
  expenseId: string | null;
  occurrenceDate: string;
  baseAmount: number;
  feeAmount: number;
  totalChargedAmount: number;
  paymentMethod: ExpensePaymentMethod;
  mobileMoneyChannel: ExpenseMobileMoneyChannel | null;
  mobileMoneyNetwork: ExpenseMobileMoneyNetwork | null;
  recordedAt: string;
  recordedBy: CreatedBySummary;
  expense: TodoRecordingExpenseSummary | null;
}

export interface TodoRecordingExpenseSummary {
  id: string;
  label: string;
  category: ExpenseCategory;
  date: string;
  totalAmountRwf: number;
  feeAmountRwf: number;
}

export interface CreateTodoRecordingRequest {
  expenseId: string;
  occurrenceDate: string;
}

export interface CreateTodoRequest {
  name: string;
  price: number;
  priority: TodoPriority;
  done: boolean;
  frequency: TodoFrequency;
  startDate: string;
  endDate?: string;
  frequencyDays?: number[];
  occurrenceDates?: string[];
}

export interface UpdateTodoRequest {
  name?: string;
  price?: number;
  priority?: TodoPriority;
  done?: boolean;
  frequency?: TodoFrequency;
  startDate?: string;
  endDate?: string;
  frequencyDays?: number[];
  occurrenceDates?: string[];
  deductAmount?: number;
  recordedOccurrenceDate?: string;
  primaryImageId?: string;
}

export interface ListTodosParams {
  frequency?: TodoFrequency;
  priority?: TodoPriority;
  done?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

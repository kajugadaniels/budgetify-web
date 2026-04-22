import type { CreatedBySummary } from "./created-by.types";
import type {
  ExpenseCategory,
  ExpenseMobileMoneyChannel,
  ExpenseMobileMoneyNetwork,
  ExpensePaymentMethod,
} from "./expense.types";

export type TodoPriority = "TOP_PRIORITY" | "PRIORITY" | "NOT_PRIORITY";
export type TodoFrequency = "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type TodoStatus =
  | "ACTIVE"
  | "RECORDED"
  | "COMPLETED"
  | "SKIPPED"
  | "ARCHIVED";

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
  status: TodoStatus;
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

export interface TodoSummaryLatestTodo {
  id: string;
  name: string;
  createdAt: string;
}

export interface TodoSummaryResponse {
  totalCount: number;
  openCount: number;
  completedCount: number;
  recurringCount: number;
  topPriorityCount: number;
  withImagesCount: number;
  completionPercentage: number;
  imageCoveragePercentage: number;
  plannedTotal: number;
  openPlannedTotal: number;
  remainingRecurringBudgetTotal: number;
  recordedCount: number;
  recordedTotalAmount: number;
  overdueCount: number;
  next7DaysScheduledAmount: number;
  next30DaysScheduledAmount: number;
  latestTodo: TodoSummaryLatestTodo | null;
}

export interface TodoUpcomingItem {
  id: string;
  name: string;
  frequency: TodoFrequency;
  amount: number;
}

export interface TodoUpcomingDay {
  date: string;
  itemCount: number;
  totalAmount: number;
  items: TodoUpcomingItem[];
}

export interface TodoReserveItem {
  id: string;
  name: string;
  frequency: TodoFrequency;
  targetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  remainingOccurrenceCount: number;
}

export interface TodoReserveSummary {
  targetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  items: TodoReserveItem[];
}

export interface TodoUpcomingResponse {
  windowDays: number;
  daysWithPlans: number;
  occurrenceCount: number;
  totalScheduledAmount: number;
  overdueCount: number;
  reserveSummary: TodoReserveSummary;
  days: TodoUpcomingDay[];
}

export interface CreateTodoRecordingRequest {
  expenseId: string;
  occurrenceDate: string;
}

export interface CreateTodoRequest {
  name: string;
  price: number;
  priority: TodoPriority;
  status: TodoStatus;
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
  status?: TodoStatus;
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
  status?: TodoStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface TodoUpcomingParams
  extends Omit<ListTodosParams, "page" | "limit"> {
  days?: number;
}

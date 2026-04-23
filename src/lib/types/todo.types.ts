import type { CreatedBySummary } from "./created-by.types";
import type {
  CreateExpenseRequest,
  ExpenseCategory,
  ExpenseMobileMoneyChannel,
  ExpenseMobileMoneyNetwork,
  ExpensePaymentMethod,
} from "./expense.types";

export type TodoPriority = "TOP_PRIORITY" | "PRIORITY" | "NOT_PRIORITY";
export type TodoType =
  | "WISHLIST"
  | "PLANNED_SPEND"
  | "RECURRING_OBLIGATION";
export type TodoFrequency = "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type TodoStatus =
  | "ACTIVE"
  | "RECORDED"
  | "COMPLETED"
  | "SKIPPED"
  | "ARCHIVED";
export type TodoOccurrenceStatus =
  | "SCHEDULED"
  | "RECORDED"
  | "SKIPPED"
  | "OVERDUE"
  | "COMPLETED";
export type TodoRecordingExpenseSource = "GENERATED" | "LINKED_EXISTING";

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
  type: TodoType;
  priority: TodoPriority;
  status: TodoStatus;
  frequency: TodoFrequency;
  defaultExpenseCategory: ExpenseCategory | null;
  defaultPaymentMethod: ExpensePaymentMethod | null;
  defaultMobileMoneyChannel: ExpenseMobileMoneyChannel | null;
  defaultMobileMoneyNetwork: ExpenseMobileMoneyNetwork | null;
  payee: string | null;
  expenseNote: string | null;
  startDate: string | null;
  endDate: string | null;
  frequencyDays: number[];
  occurrenceDates: string[];
  recordedOccurrenceDates: string[];
  occurrences: TodoOccurrenceResponse[];
  remainingAmount: number | null;
  recordingCount: number;
  recordings: TodoRecordingResponse[];
  coverImageUrl: string | null;
  imageCount: number;
  images: TodoImageResponse[];
  createdBy: CreatedBySummary;
  responsibleUser: CreatedBySummary;
  createdAt: string;
  updatedAt: string;
}

export interface TodoOccurrenceResponse {
  id: string;
  occurrenceDate: string;
  status: TodoOccurrenceStatus;
  recordingId: string | null;
  expenseId: string | null;
}

export interface TodoRecordingResponse {
  id: string;
  todoId: string;
  expenseId: string | null;
  occurrenceDate: string;
  plannedAmount: number;
  baseAmount: number;
  feeAmount: number;
  totalChargedAmount: number;
  varianceAmount: number;
  expenseSource: TodoRecordingExpenseSource;
  paymentMethod: ExpensePaymentMethod;
  mobileMoneyChannel: ExpenseMobileMoneyChannel | null;
  mobileMoneyNetwork: ExpenseMobileMoneyNetwork | null;
  recordedAt: string;
  recordedBy: CreatedBySummary;
  reversedAt: string | null;
  reversalReason: string | null;
  reversedBy: CreatedBySummary | null;
  todo: TodoRecordingTodoSummary;
  expense: TodoRecordingExpenseSummary | null;
}

export interface TodoRecordingTodoSummary {
  id: string;
  name: string;
  type: TodoType;
  frequency: TodoFrequency;
  status: TodoStatus;
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

export interface TodoFrequencyCompletionMetric {
  frequency: TodoFrequency;
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
}

export interface TodoRecurringBudgetBurnDown {
  targetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  usagePercentage: number;
}

export interface TodoTypeBreakdownMetric {
  type: TodoType;
  totalCount: number;
  openCount: number;
  plannedTotal: number;
  remainingTotal: number;
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
  totalRemainingAmount: number;
  recordedCount: number;
  recordedBaseTotalAmount: number;
  recordedFeeTotalAmount: number;
  recordedTotalAmount: number;
  recordedVarianceTotalAmount: number;
  feeBearingRecordingCount: number;
  overdueCount: number;
  overdueOccurrenceCount: number;
  dueNext7DaysCount: number;
  next7DaysScheduledAmount: number;
  dueNext30DaysCount: number;
  next30DaysScheduledAmount: number;
  recurringBudgetBurnDown: TodoRecurringBudgetBurnDown;
  completionByFrequency: TodoFrequencyCompletionMetric[];
  typeBreakdown: TodoTypeBreakdownMetric[];
  latestTodo: TodoSummaryLatestTodo | null;
}

export interface TodoAuditResponse {
  periodStartDate: string | null;
  periodEndDate: string | null;
  todoCount: number;
  openTodoCount: number;
  recurringTodoCount: number;
  totalPlannedAmount: number;
  totalRemainingAmount: number;
  recordingCount: number;
  totalRecordedBaseAmount: number;
  totalRecordedFeeAmount: number;
  totalRecordedChargedAmount: number;
  totalRecordedVarianceAmount: number;
  feeBearingRecordingCount: number;
  overdueTodoCount: number;
  overdueOccurrenceCount: number;
  dueThisWeekCount: number;
  dueThisWeekAmount: number;
  dueThisMonthCount: number;
  dueThisMonthAmount: number;
  completionPercentage: number;
  recurringBudgetBurnDown: TodoRecurringBudgetBurnDown;
  completionByFrequency: TodoFrequencyCompletionMetric[];
  typeBreakdown: TodoTypeBreakdownMetric[];
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

export interface CreateTodoExpenseRequest extends CreateExpenseRequest {
  occurrenceDate?: string;
}

export interface ReverseTodoRecordingRequest {
  reason?: string;
}

export interface CreateTodoRequest {
  name: string;
  price: number;
  type: TodoType;
  priority: TodoPriority;
  status: TodoStatus;
  frequency: TodoFrequency;
  defaultExpenseCategory?: ExpenseCategory;
  defaultPaymentMethod?: ExpensePaymentMethod;
  defaultMobileMoneyChannel?: ExpenseMobileMoneyChannel;
  defaultMobileMoneyNetwork?: ExpenseMobileMoneyNetwork;
  payee?: string;
  expenseNote?: string;
  responsibleUserId?: string;
  startDate: string;
  endDate?: string;
  frequencyDays?: number[];
  occurrenceDates?: string[];
}

export interface UpdateTodoRequest {
  name?: string;
  price?: number;
  type?: TodoType;
  priority?: TodoPriority;
  status?: TodoStatus;
  frequency?: TodoFrequency;
  defaultExpenseCategory?: ExpenseCategory | null;
  defaultPaymentMethod?: ExpensePaymentMethod | null;
  defaultMobileMoneyChannel?: ExpenseMobileMoneyChannel | null;
  defaultMobileMoneyNetwork?: ExpenseMobileMoneyNetwork | null;
  payee?: string | null;
  expenseNote?: string | null;
  responsibleUserId?: string | null;
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
  type?: TodoType;
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

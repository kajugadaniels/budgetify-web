import {
  ALLOWED_TODO_IMAGE_MIME_TYPES,
  MAX_TODO_IMAGE_SIZE_BYTES,
} from "@/constant/todos/upload";
import { getUserDisplayName } from "@/lib/utils/user-display";
import type { CreatedBySummary } from "@/lib/types/created-by.types";
import type {
  ExpenseCategory,
  ExpenseCategoryOptionResponse,
} from "@/lib/types/expense.types";
import type {
  TodoFrequency,
  TodoOccurrenceResponse,
  TodoOccurrenceStatus,
  TodoResponse,
  TodoStatus,
  TodoType,
} from "@/lib/types/todo.types";
import type {
  TodoBoardStatusFilter,
  TodoBoardPriorityFilter,
  TodoBoardTypeFilter,
  TodoExpenseFormValues,
  TodoFormValues,
} from "./todos-page.types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const TODO_WEEKDAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

export function createEmptyTodoForm(): TodoFormValues {
  const startDate = getTodayDateValue();

  return {
    name: "",
    price: "",
    type: "WISHLIST",
    priority: "TOP_PRIORITY",
    status: "ACTIVE",
    frequency: "ONCE",
    defaultExpenseCategory: "",
    defaultPaymentMethod: "",
    defaultMobileMoneyChannel: "",
    defaultMobileMoneyNetwork: "",
    payee: "",
    expenseNote: "",
    responsibleUserId: "",
    startDate,
    endDate: computeTodoEndDate(startDate, "ONCE"),
    frequencyDays: [],
    occurrenceDates: [startDate],
  };
}

export function createTodoFormFromEntry(entry: TodoResponse): TodoFormValues {
  const fallbackOccurrenceDate = sortDateValues(entry.occurrenceDates)[0];
  const startDate =
    entry.startDate ?? fallbackOccurrenceDate ?? getTodayDateValue();
  const endDate =
    entry.endDate ?? computeTodoEndDate(startDate, entry.frequency);

  return {
    name: entry.name,
    price: String(entry.price),
    type: entry.type,
    priority: entry.priority,
    status: entry.status,
    frequency: entry.frequency,
    defaultExpenseCategory: entry.defaultExpenseCategory ?? "",
    defaultPaymentMethod: entry.defaultPaymentMethod ?? "",
    defaultMobileMoneyChannel: entry.defaultMobileMoneyChannel ?? "",
    defaultMobileMoneyNetwork: entry.defaultMobileMoneyNetwork ?? "",
    payee: entry.payee ?? "",
    expenseNote: entry.expenseNote ?? "",
    responsibleUserId: entry.responsibleUser.id,
    startDate,
    endDate,
    frequencyDays: entry.frequencyDays,
    occurrenceDates:
      entry.occurrenceDates.length > 0 ? sortDateValues(entry.occurrenceDates) : [startDate],
  };
}

export function applyTodoFormPatch(
  current: TodoFormValues,
  next: Partial<TodoFormValues>,
): TodoFormValues {
  const frequency = next.frequency ?? current.frequency;
  const type = next.type ?? current.type;
  const normalizedFrequency =
    type === "RECURRING_OBLIGATION"
      ? frequency === "ONCE"
        ? "MONTHLY"
        : frequency
      : "ONCE";
  const startDate = next.startDate ?? current.startDate;
  const endDate = computeTodoEndDate(startDate, normalizedFrequency);
  const frequencyDays =
    next.frequencyDays ?? current.frequencyDays;
  const nextOccurrenceDatesInput =
    next.occurrenceDates ?? current.occurrenceDates;
  const occurrenceDates = buildTodoOccurrenceDates({
    frequency: normalizedFrequency,
    startDate,
    endDate,
    frequencyDays,
    occurrenceDates: nextOccurrenceDatesInput,
  });
  const defaultPaymentMethod =
    next.defaultPaymentMethod ?? current.defaultPaymentMethod;
  let defaultMobileMoneyChannel =
    next.defaultMobileMoneyChannel ?? current.defaultMobileMoneyChannel;
  let defaultMobileMoneyNetwork =
    next.defaultMobileMoneyNetwork ?? current.defaultMobileMoneyNetwork;

  if (defaultPaymentMethod !== "MOBILE_MONEY") {
    defaultMobileMoneyChannel = "";
    defaultMobileMoneyNetwork = "";
  } else if (defaultMobileMoneyChannel !== "P2P_TRANSFER") {
    defaultMobileMoneyNetwork = "";
  }

  return {
    ...current,
    ...next,
    type,
    frequency: normalizedFrequency,
    defaultPaymentMethod,
    defaultMobileMoneyChannel,
    defaultMobileMoneyNetwork,
    startDate,
    endDate,
    frequencyDays:
      normalizedFrequency === "WEEKLY"
        ? sortNumberValues(frequencyDays)
        : [],
    occurrenceDates,
  };
}

export function createEmptyTodoExpenseForm(): TodoExpenseFormValues {
  return {
    label: "",
    amount: "",
    category: "",
    paymentMethod: "",
    mobileMoneyChannel: "",
    mobileMoneyNetwork: "",
    date: getTodayDateValue(),
    note: "",
  };
}

export function createTodoExpenseFormFromEntry(
  entry: TodoResponse,
  categories: ExpenseCategoryOptionResponse[],
): TodoExpenseFormValues {
  const remainingOccurrenceDates = getRemainingOccurrenceDates(entry);
  const defaultDate =
    isRecurringTodo(entry) && remainingOccurrenceDates.length > 0
      ? remainingOccurrenceDates[0]
      : getTodayDateValue();

  return {
    label: entry.payee?.trim() || entry.name,
    amount: String(getSuggestedTodoExpenseAmount(entry)),
    category: resolveDefaultTodoExpenseCategory(
      categories,
      entry.defaultExpenseCategory,
    ),
    paymentMethod: entry.defaultPaymentMethod ?? "",
    mobileMoneyChannel:
      entry.defaultPaymentMethod === "MOBILE_MONEY"
        ? entry.defaultMobileMoneyChannel ?? ""
        : "",
    mobileMoneyNetwork:
      entry.defaultPaymentMethod === "MOBILE_MONEY" &&
      entry.defaultMobileMoneyChannel === "P2P_TRANSFER"
        ? entry.defaultMobileMoneyNetwork ?? ""
        : "",
    date: defaultDate,
    note: entry.expenseNote ?? "",
  };
}

export function applyTodoExpenseFormPatch(
  current: TodoExpenseFormValues,
  next: Partial<TodoExpenseFormValues>,
): TodoExpenseFormValues {
  const merged = { ...current, ...next };

  if (merged.paymentMethod !== "MOBILE_MONEY") {
    merged.mobileMoneyChannel = "";
    merged.mobileMoneyNetwork = "";
  } else if (merged.mobileMoneyChannel !== "P2P_TRANSFER") {
    merged.mobileMoneyNetwork = "";
  }

  return merged;
}

export function sortTodos(entries: TodoResponse[]): TodoResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function formatTodoDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTodoSlideLabel(index: number, total: number): string {
  return `${index + 1} of ${total}`;
}

export function formatTodoFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.round(bytes / 1024)} KB`;
}

export function validateTodoUploadFile(file: File): string | null {
  if (
    !ALLOWED_TODO_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_TODO_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return "Only JPEG, PNG, and WebP images are supported.";
  }

  if (file.size > MAX_TODO_IMAGE_SIZE_BYTES) {
    return "Each image must be 10MB or smaller.";
  }

  return null;
}

export function filterTodos(
  entries: TodoResponse[],
  filters: {
    type: TodoBoardTypeFilter;
    priority: TodoBoardPriorityFilter;
    status: TodoBoardStatusFilter;
  },
): TodoResponse[] {
  return entries.filter((entry) => {
    const typeMatches = filters.type === "ALL" || entry.type === filters.type;
    const priorityMatches =
      filters.priority === "ALL" || entry.priority === filters.priority;
    const statusMatches =
      filters.status === "ALL" || entry.status === filters.status;

    return typeMatches && priorityMatches && statusMatches;
  });
}

export function computeTodoEndDate(
  startDate: string,
  frequency: TodoFrequency,
): string {
  const parsedStart = parseDateOnly(startDate);

  switch (frequency) {
    case "WEEKLY":
      return formatDateOnly(addDays(parsedStart, 7));
    case "MONTHLY": {
      const next = new Date(parsedStart);
      next.setUTCMonth(next.getUTCMonth() + 1);
      return formatDateOnly(next);
    }
    case "YEARLY": {
      const next = new Date(parsedStart);
      next.setUTCFullYear(next.getUTCFullYear() + 1);
      return formatDateOnly(next);
    }
    case "ONCE":
    default:
      return formatDateOnly(parsedStart);
  }
}

export function buildTodoOccurrenceDates(input: {
  endDate: string;
  frequency: TodoFrequency;
  frequencyDays: number[];
  occurrenceDates: string[];
  startDate: string;
}): string[] {
  const startDate = parseDateOnly(input.startDate);
  const endDate = parseDateOnly(input.endDate);

  if (input.frequency === "ONCE") {
    return [formatDateOnly(startDate)];
  }

  if (input.frequency === "WEEKLY") {
    const weekdays = sortNumberValues(input.frequencyDays).filter(
      (value) => value >= 0 && value <= 6,
    );
    const dates: string[] = [];

    for (
      let cursor = new Date(startDate);
      cursor.getTime() < endDate.getTime();
      cursor = addDays(cursor, 1)
    ) {
      if (weekdays.includes(cursor.getUTCDay())) {
        dates.push(formatDateOnly(cursor));
      }
    }

    return dates;
  }

  return sortDateValues(
    input.occurrenceDates.filter((value) => {
      const current = parseDateOnly(value).getTime();
      return current >= startDate.getTime() && current < endDate.getTime();
    }),
  );
}

export function isRecurringTodo(
  entry: Pick<TodoResponse, "frequency" | "type">,
): boolean {
  return (
    entry.type === "RECURRING_OBLIGATION" && entry.frequency !== "ONCE"
  );
}

export function getRemainingOccurrenceDates(
  entry: Pick<TodoResponse, "occurrences" | "occurrenceDates" | "recordedOccurrenceDates">,
): string[] {
  if (entry.occurrences.length > 0) {
    return sortDateValues(
      entry.occurrences
        .filter((occurrence) => isOpenTodoOccurrenceStatus(occurrence.status))
        .map((occurrence) => occurrence.occurrenceDate),
    );
  }

  return entry.occurrenceDates.filter(
    (date) => !entry.recordedOccurrenceDates.includes(date),
  );
}

export function getSuggestedTodoExpenseAmount(
  entry: Pick<
    TodoResponse,
    | "type"
    | "frequency"
    | "price"
    | "remainingAmount"
    | "occurrences"
    | "occurrenceDates"
    | "recordedOccurrenceDates"
  >,
): number {
  if (!isRecurringTodo(entry)) {
    return roundCurrency(entry.price);
  }

  const remainingAmount = entry.remainingAmount ?? entry.price;
  const remainingOccurrences = getRemainingOccurrenceDates(entry).length;

  if (remainingOccurrences <= 0 || remainingAmount <= 0) {
    return 0;
  }

  return roundCurrency(remainingAmount / remainingOccurrences);
}

export function canRecordTodoExpense(
  entry: Pick<
    TodoResponse,
    | "status"
    | "type"
    | "frequency"
    | "remainingAmount"
    | "occurrences"
    | "occurrenceDates"
    | "recordedOccurrenceDates"
  >,
): boolean {
  if (
    entry.status === "COMPLETED" ||
    entry.status === "SKIPPED" ||
    entry.status === "ARCHIVED"
  ) {
    return false;
  }

  if (!isRecurringTodo(entry)) {
    return entry.status !== "RECORDED";
  }

  return (
    (entry.remainingAmount ?? 0) > 0 &&
    getRemainingOccurrenceDates(entry).length > 0
  );
}

export function formatTodoFrequencyLabel(
  frequency: TodoFrequency,
): string {
  switch (frequency) {
    case "WEEKLY":
      return "Weekly";
    case "MONTHLY":
      return "Monthly";
    case "YEARLY":
      return "Yearly";
    case "ONCE":
    default:
      return "Once";
  }
}

export function resolveTodoTypeLabel(type: TodoType): string {
  switch (type) {
    case "PLANNED_SPEND":
      return "Planned spend";
    case "RECURRING_OBLIGATION":
      return "Recurring obligation";
    case "WISHLIST":
    default:
      return "Wishlist";
  }
}

export function resolveTodoTypeDescription(type: TodoType): string {
  switch (type) {
    case "PLANNED_SPEND":
      return "A one-off operational purchase you expect to make.";
    case "RECURRING_OBLIGATION":
      return "A repeating financial commitment that should stay on schedule.";
    case "WISHLIST":
    default:
      return "An aspirational item you want to track without treating it as an obligation yet.";
  }
}

export function formatTodoResponsibleUserLabel(
  user: CreatedBySummary,
  currentUserId?: string,
): string {
  const label = getUserDisplayName(user, "Workspace user");

  return currentUserId && user.id === currentUserId ? `${label} (You)` : label;
}

export function isOperationalTodoType(
  type: TodoType,
): boolean {
  return type === "PLANNED_SPEND" || type === "RECURRING_OBLIGATION";
}

export function resolveTodoAmountLabel(
  entry: Pick<TodoResponse, "type">,
): string {
  switch (entry.type) {
    case "PLANNED_SPEND":
      return "Planned spend";
    case "RECURRING_OBLIGATION":
      return "Cycle budget";
    case "WISHLIST":
    default:
      return "Wishlist price";
  }
}

export function formatTodoScheduleSummary(entry: Pick<
  TodoResponse,
  | "type"
  | "frequency"
  | "occurrences"
  | "occurrenceDates"
  | "recordedOccurrenceDates"
  | "startDate"
  | "endDate"
>): string {
  if (!isRecurringTodo(entry)) {
    return entry.startDate ? `One-time on ${formatTodoDate(entry.startDate)}` : "One-time";
  }

  const totalOccurrences =
    entry.occurrences.length > 0 ? entry.occurrences.length : entry.occurrenceDates.length;
  const remainingCount = getRemainingOccurrenceDates(entry).length;
  const overdueCount = getOverdueTodoOccurrences(entry).length;
  const recordedCount = getRecordedTodoOccurrences(entry).length;
  const statusBits = [`${totalOccurrences} planned`, `${remainingCount} open`];

  if (overdueCount > 0) {
    statusBits.push(`${overdueCount} overdue`);
  } else if (recordedCount > 0) {
    statusBits.push(`${recordedCount} recorded`);
  }

  return statusBits.join(" · ");
}

export function resolveTodoStatusLabel(status: TodoStatus): string {
  switch (status) {
    case "RECORDED":
      return "Recorded";
    case "COMPLETED":
      return "Completed";
    case "SKIPPED":
      return "Skipped";
    case "ARCHIVED":
      return "Archived";
    case "ACTIVE":
    default:
      return "Active";
  }
}

export function isClosedTodoStatus(status: TodoStatus): boolean {
  return (
    status === "COMPLETED" ||
    status === "SKIPPED" ||
    status === "ARCHIVED"
  );
}

export function getTrackedTodoOccurrences(
  entry: Pick<TodoResponse, "occurrences">,
): TodoOccurrenceResponse[] {
  return [...entry.occurrences].sort((left, right) =>
    left.occurrenceDate.localeCompare(right.occurrenceDate),
  );
}

export function getRecordedTodoOccurrences(
  entry: Pick<TodoResponse, "occurrences">,
): TodoOccurrenceResponse[] {
  return getTrackedTodoOccurrences(entry).filter(
    (occurrence) => occurrence.status === "RECORDED",
  );
}

export function getOverdueTodoOccurrences(
  entry: Pick<TodoResponse, "occurrences">,
): TodoOccurrenceResponse[] {
  return getTrackedTodoOccurrences(entry).filter(
    (occurrence) => occurrence.status === "OVERDUE",
  );
}

export function resolveTodoOccurrenceStatusLabel(
  status: TodoOccurrenceStatus,
): string {
  switch (status) {
    case "RECORDED":
      return "Recorded";
    case "SKIPPED":
      return "Skipped";
    case "OVERDUE":
      return "Overdue";
    case "COMPLETED":
      return "Completed";
    case "SCHEDULED":
    default:
      return "Scheduled";
  }
}

export function isOpenTodoOccurrenceStatus(
  status: TodoOccurrenceStatus,
): boolean {
  return status === "SCHEDULED" || status === "OVERDUE";
}

export function getTodayDateValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function getScheduleMonthBounds(
  startDate: string,
  endDate: string,
): { firstMonth: Date; lastMonth: Date } {
  const start = parseDateOnly(startDate);
  const end = addDays(parseDateOnly(endDate), -1);

  return {
    firstMonth: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)),
    lastMonth: new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1)),
  };
}

function resolveDefaultTodoExpenseCategory(
  categories: ExpenseCategoryOptionResponse[],
  preferredCategory?: ExpenseCategory | null,
): TodoExpenseFormValues["category"] {
  if (categories.length === 0) {
    return "";
  }

  if (
    preferredCategory &&
    categories.some((category) => category.value === preferredCategory)
  ) {
    return preferredCategory;
  }

  const shoppingCategory = categories.find(
    (category) => category.value === "SHOPPING",
  );

  if (shoppingCategory) {
    return shoppingCategory.value;
  }

  const otherCategory = categories.find(
    (category) => category.value === "OTHER",
  );

  return otherCategory?.value ?? categories[0]?.value ?? "";
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function sortNumberValues(values: number[]): number[] {
  return [...new Set(values)].sort((left, right) => left - right);
}

function sortDateValues(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

import {
  ALLOWED_TODO_IMAGE_MIME_TYPES,
  MAX_TODO_IMAGE_SIZE_BYTES,
} from "@/constant/todos/upload";
import type { ExpenseCategoryOptionResponse } from "@/lib/types/expense.types";
import type {
  TodoFrequency,
  TodoResponse,
} from "@/lib/types/todo.types";
import type {
  TodoBoardDoneFilter,
  TodoBoardPriorityFilter,
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
    priority: "TOP_PRIORITY",
    done: false,
    frequency: "ONCE",
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
    priority: entry.priority,
    done: entry.done,
    frequency: entry.frequency,
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
  const startDate = next.startDate ?? current.startDate;
  const endDate = computeTodoEndDate(startDate, frequency);
  const frequencyDays =
    next.frequencyDays ?? current.frequencyDays;
  const nextOccurrenceDatesInput =
    next.occurrenceDates ?? current.occurrenceDates;
  const occurrenceDates = buildTodoOccurrenceDates({
    frequency,
    startDate,
    endDate,
    frequencyDays,
    occurrenceDates: nextOccurrenceDatesInput,
  });

  return {
    ...current,
    ...next,
    frequency,
    startDate,
    endDate,
    frequencyDays:
      frequency === "WEEKLY"
        ? sortNumberValues(frequencyDays)
        : [],
    occurrenceDates,
  };
}

export function createEmptyTodoExpenseForm(): TodoExpenseFormValues {
  return {
    amount: "",
    category: "",
    date: getTodayDateValue(),
  };
}

export function createTodoExpenseFormFromEntry(
  entry: TodoResponse,
  categories: ExpenseCategoryOptionResponse[],
): TodoExpenseFormValues {
  const defaultDate =
    isRecurringTodo(entry) && getRemainingOccurrenceDates(entry).length > 0
      ? getRemainingOccurrenceDates(entry)[0]
      : entry.startDate ?? getTodayDateValue();

  return {
    amount: String(getSuggestedTodoExpenseAmount(entry)),
    category: resolveDefaultTodoExpenseCategory(categories),
    date: defaultDate,
  };
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
    priority: TodoBoardPriorityFilter;
    done: TodoBoardDoneFilter;
  },
): TodoResponse[] {
  return entries.filter((entry) => {
    const priorityMatches =
      filters.priority === "ALL" || entry.priority === filters.priority;
    const doneMatches =
      filters.done === "ALL" ||
      (filters.done === "DONE" && entry.done) ||
      (filters.done === "NOT_DONE" && !entry.done);

    return priorityMatches && doneMatches;
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
  entry: Pick<TodoResponse, "frequency">,
): boolean {
  return entry.frequency !== "ONCE";
}

export function getRemainingOccurrenceDates(
  entry: Pick<TodoResponse, "occurrenceDates" | "recordedOccurrenceDates">,
): string[] {
  return entry.occurrenceDates.filter(
    (date) => !entry.recordedOccurrenceDates.includes(date),
  );
}

export function getSuggestedTodoExpenseAmount(
  entry: Pick<
    TodoResponse,
    "frequency" | "price" | "remainingAmount" | "occurrenceDates" | "recordedOccurrenceDates"
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
    "done" | "frequency" | "remainingAmount" | "occurrenceDates" | "recordedOccurrenceDates"
  >,
): boolean {
  if (entry.done) {
    return false;
  }

  if (!isRecurringTodo(entry)) {
    return true;
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

export function formatTodoScheduleSummary(entry: Pick<
  TodoResponse,
  "frequency" | "occurrenceDates" | "recordedOccurrenceDates" | "startDate" | "endDate"
>): string {
  if (!isRecurringTodo(entry)) {
    return entry.startDate ? `One-time on ${formatTodoDate(entry.startDate)}` : "One-time";
  }

  const remainingCount = getRemainingOccurrenceDates(entry).length;
  return `${entry.occurrenceDates.length} planned · ${remainingCount} left`;
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
): TodoExpenseFormValues["category"] {
  if (categories.length === 0) {
    return "";
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

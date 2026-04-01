import {
  ALLOWED_TODO_IMAGE_MIME_TYPES,
  MAX_TODO_IMAGE_SIZE_BYTES,
} from "@/constant/todos/upload";
import type { ExpenseCategoryOptionResponse } from "@/lib/types/expense.types";
import type { TodoResponse } from "@/lib/types/todo.types";
import type {
  TodoBoardDoneFilter,
  TodoBoardPriorityFilter,
  TodoExpenseFormValues,
  TodoFormValues,
} from "./todos-page.types";

export function createEmptyTodoForm(): TodoFormValues {
  return {
    name: "",
    price: "",
    priority: "TOP_PRIORITY",
    done: false,
  };
}

export function createTodoFormFromEntry(entry: TodoResponse): TodoFormValues {
  return {
    name: entry.name,
    price: String(entry.price),
    priority: entry.priority,
    done: entry.done,
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
  return {
    amount: String(entry.price),
    category: resolveDefaultTodoExpenseCategory(categories),
    date: getTodayDateValue(),
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
  if (!ALLOWED_TODO_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_TODO_IMAGE_MIME_TYPES)[number])) {
    return "Only JPEG, PNG, and WebP images are supported.";
  }

  if (file.size > MAX_TODO_IMAGE_SIZE_BYTES) {
    return "Each image must be 10MB or smaller.";
  }

  return null;
}

function getTodayDateValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
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

  const otherCategory = categories.find((category) => category.value === "OTHER");

  return otherCategory?.value ?? categories[0]?.value ?? "";
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

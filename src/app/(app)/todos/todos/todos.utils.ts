import type { TodoPriority, TodoResponse } from "@/lib/types/todo.types";
import type { TodoFormValues } from "./todos-page.types";
import {
  ALLOWED_TODO_IMAGE_MIME_TYPES,
  MAX_TODO_IMAGE_SIZE_BYTES,
} from "./todos.constants";

export function createEmptyTodoForm(): TodoFormValues {
  return {
    name: "",
    price: "",
    priority: "TOP_PRIORITY",
  };
}

export function createTodoFormFromEntry(entry: TodoResponse): TodoFormValues {
  return {
    name: entry.name,
    price: String(entry.price),
    priority: entry.priority,
  };
}

export function getPriorityRank(priority: TodoPriority): number {
  switch (priority) {
    case "TOP_PRIORITY":
      return 0;
    case "PRIORITY":
      return 1;
    case "NOT_PRIORITY":
      return 2;
  }
}

export function sortTodos(entries: TodoResponse[]): TodoResponse[] {
  return [...entries].sort(
    (left, right) =>
      getPriorityRank(left.priority) - getPriorityRank(right.priority) ||
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export function groupTodosByPriority(entries: TodoResponse[]): Record<TodoPriority, TodoResponse[]> {
  return {
    TOP_PRIORITY: entries.filter((entry) => entry.priority === "TOP_PRIORITY"),
    PRIORITY: entries.filter((entry) => entry.priority === "PRIORITY"),
    NOT_PRIORITY: entries.filter((entry) => entry.priority === "NOT_PRIORITY"),
  };
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

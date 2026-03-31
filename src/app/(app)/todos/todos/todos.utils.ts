import {
  ALLOWED_TODO_IMAGE_MIME_TYPES,
  MAX_TODO_IMAGE_SIZE_BYTES,
} from "@/constant/todos/upload";
import type { TodoResponse } from "@/lib/types/todo.types";
import type { TodoFormValues } from "./todos-page.types";

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

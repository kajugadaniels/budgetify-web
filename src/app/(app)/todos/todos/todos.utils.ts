import type { TodoPriority, TodoResponse } from "@/lib/types/todo.types";
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

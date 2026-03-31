import type { TodoPriority, TodoResponse } from "@/lib/types/todo.types";

export interface TodoFormValues {
  name: string;
  price: string;
  priority: TodoPriority;
  done: boolean;
}

export type TodoFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: TodoResponse }
  | null;

export type TodoGalleryState = {
  todoId: string;
  index: number;
} | null;

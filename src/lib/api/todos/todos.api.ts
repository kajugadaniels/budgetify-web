import { apiFetch } from "../client";
import { TODOS_ROUTES } from "./todos.routes";
import type {
  CreateTodoRequest,
  TodoResponse,
  UpdateTodoRequest,
} from "../../types/todo.types";

export async function listTodos(token: string): Promise<TodoResponse[]> {
  return apiFetch<TodoResponse[]>(TODOS_ROUTES.list, { token });
}

export async function createTodo(
  token: string,
  body: CreateTodoRequest,
): Promise<TodoResponse> {
  return apiFetch<TodoResponse>(TODOS_ROUTES.create, {
    method: "POST",
    token,
    body,
  });
}

export async function updateTodo(
  token: string,
  id: string,
  body: UpdateTodoRequest,
): Promise<TodoResponse> {
  return apiFetch<TodoResponse>(TODOS_ROUTES.byId(id), {
    method: "PATCH",
    token,
    body,
  });
}

export async function deleteTodo(token: string, id: string): Promise<void> {
  return apiFetch<void>(TODOS_ROUTES.byId(id), {
    method: "DELETE",
    token,
  });
}

export async function deleteTodoImage(
  token: string,
  todoId: string,
  imageId: string,
): Promise<void> {
  return apiFetch<void>(TODOS_ROUTES.imageById(todoId, imageId), {
    method: "DELETE",
    token,
  });
}

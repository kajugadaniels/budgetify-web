import { apiFetch } from "../client";
import { TODOS_ROUTES } from "./todos.routes";
import type {
  CreateTodoRequest,
  TodoResponse,
  UpdateTodoRequest,
} from "../../types/todo.types";

function buildTodoMultipartBody(
  body: CreateTodoRequest | UpdateTodoRequest,
  images: File[] = [],
): FormData {
  const formData = new FormData();

  if (body.name !== undefined) {
    formData.append("name", body.name);
  }

  if (body.price !== undefined) {
    formData.append("price", String(body.price));
  }

  if (body.priority !== undefined) {
    formData.append("priority", body.priority);
  }

  if ("primaryImageId" in body && body.primaryImageId !== undefined) {
    formData.append("primaryImageId", body.primaryImageId);
  }

  for (const image of images) {
    formData.append("images", image);
  }

  return formData;
}

export async function listTodos(token: string): Promise<TodoResponse[]> {
  return apiFetch<TodoResponse[]>(TODOS_ROUTES.list, { token });
}

export async function createTodo(
  token: string,
  body: CreateTodoRequest,
  images: File[],
): Promise<TodoResponse> {
  return apiFetch<TodoResponse>(TODOS_ROUTES.create, {
    method: "POST",
    token,
    body: buildTodoMultipartBody(body, images),
  });
}

export async function updateTodo(
  token: string,
  id: string,
  body: UpdateTodoRequest,
  images: File[] = [],
): Promise<TodoResponse> {
  return apiFetch<TodoResponse>(TODOS_ROUTES.byId(id), {
    method: "PATCH",
    token,
    body: buildTodoMultipartBody(body, images),
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

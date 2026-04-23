import { apiFetch } from "../client";
import { collectPaginatedItems } from "../pagination";
import { TODOS_ROUTES } from "./todos.routes";
import type {
  TodoAuditResponse,
  CreateTodoRecordingRequest,
  CreateTodoExpenseRequest,
  CreateTodoRequest,
  ListTodosParams,
  TodoRecordingResponse,
  TodoResponse,
  TodoSummaryResponse,
  TodoUpcomingParams,
  TodoUpcomingResponse,
  UpdateTodoRequest,
} from "../../types/todo.types";
import type { PaginatedResponse } from "../../types/pagination.types";

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

  if ("type" in body && body.type !== undefined) {
    formData.append("type", body.type);
  }

  if (body.priority !== undefined) {
    formData.append("priority", body.priority);
  }

  if ("status" in body && body.status !== undefined) {
    formData.append("status", body.status);
  }

  if ("frequency" in body && body.frequency !== undefined) {
    formData.append("frequency", body.frequency);
  }

  if (
    "defaultExpenseCategory" in body &&
    body.defaultExpenseCategory !== undefined
  ) {
    formData.append(
      "defaultExpenseCategory",
      body.defaultExpenseCategory ?? "",
    );
  }

  if (
    "defaultPaymentMethod" in body &&
    body.defaultPaymentMethod !== undefined
  ) {
    formData.append("defaultPaymentMethod", body.defaultPaymentMethod ?? "");
  }

  if (
    "defaultMobileMoneyChannel" in body &&
    body.defaultMobileMoneyChannel !== undefined
  ) {
    formData.append(
      "defaultMobileMoneyChannel",
      body.defaultMobileMoneyChannel ?? "",
    );
  }

  if (
    "defaultMobileMoneyNetwork" in body &&
    body.defaultMobileMoneyNetwork !== undefined
  ) {
    formData.append(
      "defaultMobileMoneyNetwork",
      body.defaultMobileMoneyNetwork ?? "",
    );
  }

  if ("payee" in body && body.payee !== undefined) {
    formData.append("payee", body.payee ?? "");
  }

  if ("expenseNote" in body && body.expenseNote !== undefined) {
    formData.append("expenseNote", body.expenseNote ?? "");
  }

  if ("responsibleUserId" in body && body.responsibleUserId !== undefined) {
    formData.append("responsibleUserId", body.responsibleUserId ?? "");
  }

  if ("startDate" in body && body.startDate !== undefined) {
    formData.append("startDate", body.startDate);
  }

  if ("endDate" in body && body.endDate !== undefined) {
    formData.append("endDate", body.endDate);
  }

  if ("frequencyDays" in body && body.frequencyDays !== undefined) {
    for (const day of body.frequencyDays) {
      formData.append("frequencyDays", String(day));
    }
  }

  if ("occurrenceDates" in body && body.occurrenceDates !== undefined) {
    for (const occurrenceDate of body.occurrenceDates) {
      formData.append("occurrenceDates", occurrenceDate);
    }
  }

  if ("primaryImageId" in body && body.primaryImageId !== undefined) {
    formData.append("primaryImageId", body.primaryImageId);
  }

  if ("deductAmount" in body && body.deductAmount !== undefined) {
    formData.append("deductAmount", String(body.deductAmount));
  }

  if (
    "recordedOccurrenceDate" in body &&
    body.recordedOccurrenceDate !== undefined
  ) {
    formData.append("recordedOccurrenceDate", body.recordedOccurrenceDate);
  }

  for (const image of images) {
    formData.append("images", image);
  }

  return formData;
}

export async function listTodosPage(
  token: string,
  params?: ListTodosParams,
): Promise<PaginatedResponse<TodoResponse>> {
  return apiFetch<PaginatedResponse<TodoResponse>>(TODOS_ROUTES.list(params), {
    token,
  });
}

export async function listTodos(
  token: string,
  params?: Omit<ListTodosParams, "page" | "limit">,
): Promise<TodoResponse[]> {
  return collectPaginatedItems((pagination) =>
    listTodosPage(token, { ...params, ...pagination }),
  );
}

export async function getTodoSummary(
  token: string,
  params?: Omit<ListTodosParams, "page" | "limit">,
): Promise<TodoSummaryResponse> {
  return apiFetch<TodoSummaryResponse>(TODOS_ROUTES.summary(params), {
    token,
  });
}

export async function getTodoAudit(
  token: string,
  params?: Omit<ListTodosParams, "page" | "limit">,
): Promise<TodoAuditResponse> {
  return apiFetch<TodoAuditResponse>(TODOS_ROUTES.audit(params), {
    token,
  });
}

export async function getTodoUpcoming(
  token: string,
  params?: TodoUpcomingParams,
): Promise<TodoUpcomingResponse> {
  return apiFetch<TodoUpcomingResponse>(TODOS_ROUTES.upcoming(params), {
    token,
  });
}

export async function getTodo(
  token: string,
  id: string,
): Promise<TodoResponse> {
  return apiFetch<TodoResponse>(TODOS_ROUTES.byId(id), {
    token,
  });
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

export async function listTodoRecordings(
  token: string,
  params?: Omit<ListTodosParams, "page" | "limit">,
): Promise<TodoRecordingResponse[]> {
  return apiFetch<TodoRecordingResponse[]>(
    TODOS_ROUTES.recordingsIndex(params),
    {
      token,
    },
  );
}

export async function listTodoRecordingsForTodo(
  token: string,
  todoId: string,
): Promise<TodoRecordingResponse[]> {
  return apiFetch<TodoRecordingResponse[]>(
    TODOS_ROUTES.recordingsByTodo(todoId),
    {
      token,
    },
  );
}

export async function listTodoRecordingsByTodo(
  token: string,
  todoId: string,
): Promise<TodoRecordingResponse[]> {
  return listTodoRecordingsForTodo(token, todoId);
}

export async function createTodoRecording(
  token: string,
  todoId: string,
  body: CreateTodoRecordingRequest,
): Promise<TodoRecordingResponse> {
  return apiFetch<TodoRecordingResponse>(TODOS_ROUTES.recordingsByTodo(todoId), {
    method: "POST",
    token,
    body,
  });
}

export async function recordTodoExpense(
  token: string,
  todoId: string,
  body: CreateTodoExpenseRequest,
): Promise<TodoRecordingResponse> {
  return apiFetch<TodoRecordingResponse>(TODOS_ROUTES.recordExpense(todoId), {
    method: "POST",
    token,
    body,
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

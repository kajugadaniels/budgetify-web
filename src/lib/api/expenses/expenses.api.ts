import { apiFetch } from "../client";
import { EXPENSES_ROUTES } from "./expenses.routes";
import type {
  CreateExpenseRequest,
  ExpenseResponse,
  UpdateExpenseRequest,
} from "../../types/expense.types";

export async function listExpenses(token: string): Promise<ExpenseResponse[]> {
  return apiFetch<ExpenseResponse[]>(EXPENSES_ROUTES.list, { token });
}

export async function createExpense(
  token: string,
  body: CreateExpenseRequest,
): Promise<ExpenseResponse> {
  return apiFetch<ExpenseResponse>(EXPENSES_ROUTES.create, {
    method: "POST",
    token,
    body,
  });
}

export async function updateExpense(
  token: string,
  id: string,
  body: UpdateExpenseRequest,
): Promise<ExpenseResponse> {
  return apiFetch<ExpenseResponse>(EXPENSES_ROUTES.byId(id), {
    method: "PATCH",
    token,
    body,
  });
}

export async function deleteExpense(
  token: string,
  id: string,
): Promise<void> {
  return apiFetch<void>(EXPENSES_ROUTES.byId(id), {
    method: "DELETE",
    token,
  });
}

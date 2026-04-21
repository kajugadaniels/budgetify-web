import { apiFetch } from "../client";
import { collectPaginatedItems } from "../pagination";
import { EXPENSES_ROUTES } from "./expenses.routes";
import type {
  CreateExpenseRequest,
  ExpenseAuditResponse,
  ExpenseCategoryOptionResponse,
  ExpenseSummaryResponse,
  ListExpensesParams,
  MobileMoneyQuoteRequest,
  MobileMoneyQuoteResponse,
  ExpenseResponse,
  UpdateExpenseRequest,
} from "../../types/expense.types";
import type { PaginatedResponse } from "../../types/pagination.types";

export async function listExpenseCategories(
  token: string,
): Promise<ExpenseCategoryOptionResponse[]> {
  return apiFetch<ExpenseCategoryOptionResponse[]>(EXPENSES_ROUTES.categories, {
    token,
  });
}

export async function getExpenseSummary(
  token: string,
  params?: {
    month?: number;
    year?: number;
    dateFrom?: string;
    dateTo?: string;
  },
): Promise<ExpenseSummaryResponse> {
  return apiFetch<ExpenseSummaryResponse>(EXPENSES_ROUTES.summary(params), {
    token,
  });
}

export async function getExpenseAudit(
  token: string,
  params?: {
    month?: number;
    year?: number;
    dateFrom?: string;
    dateTo?: string;
  },
): Promise<ExpenseAuditResponse> {
  return apiFetch<ExpenseAuditResponse>(EXPENSES_ROUTES.audit(params), {
    token,
  });
}

export async function listExpensesPage(
  token: string,
  params?: ListExpensesParams,
): Promise<PaginatedResponse<ExpenseResponse>> {
  return apiFetch<PaginatedResponse<ExpenseResponse>>(EXPENSES_ROUTES.list(params), {
    token,
  });
}

export async function listExpenses(
  token: string,
  params?: Omit<ListExpensesParams, "page" | "limit">,
): Promise<ExpenseResponse[]> {
  return collectPaginatedItems((pagination) =>
    listExpensesPage(token, { ...params, ...pagination }),
  );
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

export async function quoteMobileMoneyExpense(
  token: string,
  body: MobileMoneyQuoteRequest,
): Promise<MobileMoneyQuoteResponse> {
  return apiFetch<MobileMoneyQuoteResponse>(EXPENSES_ROUTES.mobileMoneyQuote, {
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

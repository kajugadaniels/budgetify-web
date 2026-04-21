import { apiFetch } from "../client";
import { collectPaginatedItems } from "../pagination";
import { INCOME_ROUTES } from "./income.routes";
import type {
  CreateIncomeRequest,
  IncomeCategoryOptionResponse,
  ListIncomeParams,
  IncomeResponse,
  IncomeSummaryResponse,
  UpdateIncomeRequest,
} from "../../types/income.types";
import type { PaginatedResponse } from "../../types/pagination.types";

export async function listIncomeCategories(
  token: string,
): Promise<IncomeCategoryOptionResponse[]> {
  return apiFetch<IncomeCategoryOptionResponse[]>(INCOME_ROUTES.categories, {
    token,
  });
}

export async function listIncomePage(
  token: string,
  params?: ListIncomeParams,
): Promise<PaginatedResponse<IncomeResponse>> {
  return apiFetch<PaginatedResponse<IncomeResponse>>(INCOME_ROUTES.list(params), {
    token,
  });
}

export async function listIncome(
  token: string,
  params?: Omit<ListIncomeParams, "page" | "limit">,
): Promise<IncomeResponse[]> {
  return collectPaginatedItems((pagination) =>
    listIncomePage(token, { ...params, ...pagination }),
  );
}

export async function getIncomeSummary(
  token: string,
  params?: Pick<ListIncomeParams, "month" | "year" | "dateFrom" | "dateTo">,
): Promise<IncomeSummaryResponse> {
  return apiFetch<IncomeSummaryResponse>(INCOME_ROUTES.summary(params), {
    token,
  });
}

export async function createIncome(
  token: string,
  body: CreateIncomeRequest,
): Promise<IncomeResponse> {
  return apiFetch<IncomeResponse>(INCOME_ROUTES.create, {
    method: "POST",
    token,
    body,
  });
}

export async function updateIncome(
  token: string,
  id: string,
  body: UpdateIncomeRequest,
): Promise<IncomeResponse> {
  return apiFetch<IncomeResponse>(INCOME_ROUTES.byId(id), {
    method: "PATCH",
    token,
    body,
  });
}

export async function deleteIncome(
  token: string,
  id: string,
): Promise<void> {
  return apiFetch<void>(INCOME_ROUTES.byId(id), {
    method: "DELETE",
    token,
  });
}

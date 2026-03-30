import { apiFetch } from "../client";
import { INCOME_ROUTES } from "./income.routes";
import type {
  CreateIncomeRequest,
  IncomeResponse,
  UpdateIncomeRequest,
} from "../../types/income.types";

export async function listIncome(token: string): Promise<IncomeResponse[]> {
  return apiFetch<IncomeResponse[]>(INCOME_ROUTES.list, { token });
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

import { apiFetch } from "../client";
import { collectPaginatedItems } from "../pagination";
import type {
  CreateSavingRequest,
  ListSavingsParams,
  SavingResponse,
  UpdateSavingRequest,
} from "../../types/saving.types";
import type { PaginatedResponse } from "../../types/pagination.types";
import { SAVINGS_ROUTES } from "./savings.routes";

export async function listSavingsPage(
  token: string,
  params?: ListSavingsParams,
): Promise<PaginatedResponse<SavingResponse>> {
  return apiFetch<PaginatedResponse<SavingResponse>>(SAVINGS_ROUTES.list(params), {
    token,
  });
}

export async function listSavings(
  token: string,
  params?: Omit<ListSavingsParams, "page" | "limit">,
): Promise<SavingResponse[]> {
  return collectPaginatedItems((pagination) =>
    listSavingsPage(token, { ...params, ...pagination }),
  );
}

export async function createSaving(
  token: string,
  body: CreateSavingRequest,
): Promise<SavingResponse> {
  return apiFetch<SavingResponse>(SAVINGS_ROUTES.create, {
    method: "POST",
    token,
    body,
  });
}

export async function updateSaving(
  token: string,
  id: string,
  body: UpdateSavingRequest,
): Promise<SavingResponse> {
  return apiFetch<SavingResponse>(SAVINGS_ROUTES.byId(id), {
    method: "PATCH",
    token,
    body,
  });
}

export async function deleteSaving(token: string, id: string): Promise<void> {
  return apiFetch<void>(SAVINGS_ROUTES.byId(id), {
    method: "DELETE",
    token,
  });
}

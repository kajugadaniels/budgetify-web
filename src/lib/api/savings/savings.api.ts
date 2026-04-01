import { apiFetch } from "../client";
import type {
  CreateSavingRequest,
  SavingResponse,
  UpdateSavingRequest,
} from "../../types/saving.types";
import { SAVINGS_ROUTES } from "./savings.routes";

export async function listSavings(
  token: string,
  params?: { month?: number; year?: number },
): Promise<SavingResponse[]> {
  return apiFetch<SavingResponse[]>(SAVINGS_ROUTES.list(params), { token });
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

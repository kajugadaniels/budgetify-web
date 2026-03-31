import { apiFetch } from "../client";
import type {
  CreateLoanRequest,
  LoanResponse,
  UpdateLoanRequest,
} from "../../types/loan.types";
import { LOANS_ROUTES } from "./loans.routes";

export async function listLoans(
  token: string,
  params?: { month?: number; year?: number },
): Promise<LoanResponse[]> {
  return apiFetch<LoanResponse[]>(LOANS_ROUTES.list(params), { token });
}

export async function createLoan(
  token: string,
  body: CreateLoanRequest,
): Promise<LoanResponse> {
  return apiFetch<LoanResponse>(LOANS_ROUTES.create, {
    method: "POST",
    token,
    body,
  });
}

export async function updateLoan(
  token: string,
  id: string,
  body: UpdateLoanRequest,
): Promise<LoanResponse> {
  return apiFetch<LoanResponse>(LOANS_ROUTES.byId(id), {
    method: "PATCH",
    token,
    body,
  });
}

export async function deleteLoan(token: string, id: string): Promise<void> {
  return apiFetch<void>(LOANS_ROUTES.byId(id), {
    method: "DELETE",
    token,
  });
}

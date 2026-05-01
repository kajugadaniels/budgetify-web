import { apiFetch } from "../client";
import { collectPaginatedItems } from "../pagination";
import type {
  CreateLoanTransactionRequest,
  CreateLoanRequest,
  LinkLoanTransactionFinancialRecordRequest,
  ListLoansParams,
  LoanSettlementResponse,
  LoanResponse,
  LoanTransactionResponse,
  ReverseLoanTransactionRequest,
  SendLoanToExpenseRequest,
  UpdateLoanRequest,
} from "../../types/loan.types";
import type { PaginatedResponse } from "../../types/pagination.types";
import { LOANS_ROUTES } from "./loans.routes";

export async function listLoansPage(
  token: string,
  params?: ListLoansParams,
): Promise<PaginatedResponse<LoanResponse>> {
  return apiFetch<PaginatedResponse<LoanResponse>>(LOANS_ROUTES.list(params), {
    token,
  });
}

export async function listLoans(
  token: string,
  params?: Omit<ListLoansParams, "page" | "limit">,
): Promise<LoanResponse[]> {
  return collectPaginatedItems((pagination) =>
    listLoansPage(token, { ...params, ...pagination }),
  );
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

export async function sendLoanToExpense(
  token: string,
  id: string,
  body: SendLoanToExpenseRequest,
): Promise<LoanSettlementResponse> {
  return apiFetch<LoanSettlementResponse>(LOANS_ROUTES.sendToExpense(id), {
    method: "POST",
    token,
    body,
  });
}

export async function listLoanTransactions(
  token: string,
  id: string,
): Promise<LoanTransactionResponse[]> {
  return apiFetch<LoanTransactionResponse[]>(LOANS_ROUTES.transactions(id), {
    token,
  });
}

export async function createLoanTransaction(
  token: string,
  id: string,
  body: CreateLoanTransactionRequest,
): Promise<LoanTransactionResponse> {
  return apiFetch<LoanTransactionResponse>(LOANS_ROUTES.transactions(id), {
    method: "POST",
    token,
    body,
  });
}

export async function sendLoanTransactionToExpense(
  token: string,
  loanId: string,
  transactionId: string,
  body: LinkLoanTransactionFinancialRecordRequest,
): Promise<LoanTransactionResponse> {
  return apiFetch<LoanTransactionResponse>(
    LOANS_ROUTES.transactionToExpense(loanId, transactionId),
    {
      method: "POST",
      token,
      body,
    },
  );
}

export async function sendLoanTransactionToIncome(
  token: string,
  loanId: string,
  transactionId: string,
  body: LinkLoanTransactionFinancialRecordRequest,
): Promise<LoanTransactionResponse> {
  return apiFetch<LoanTransactionResponse>(
    LOANS_ROUTES.transactionToIncome(loanId, transactionId),
    {
      method: "POST",
      token,
      body,
    },
  );
}

export async function reverseLoanTransaction(
  token: string,
  loanId: string,
  transactionId: string,
  body: ReverseLoanTransactionRequest,
): Promise<LoanTransactionResponse> {
  return apiFetch<LoanTransactionResponse>(
    LOANS_ROUTES.reverseTransaction(loanId, transactionId),
    {
      method: "POST",
      token,
      body,
    },
  );
}

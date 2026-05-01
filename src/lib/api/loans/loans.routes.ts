const BASE = "/api/v1/loans";

type LoanRouteParams = {
  month?: number;
  year?: number;
  status?: "ACTIVE" | "PARTIALLY_REPAID" | "SETTLED" | "OVERDUE" | "WRITTEN_OFF" | "CANCELLED" | "ARCHIVED";
  direction?: "BORROWED" | "LENT";
  type?: "PERSONAL" | "BUSINESS" | "FAMILY" | "FRIEND" | "OTHER";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  operationalFilter?:
    | "DUE_SOON"
    | "OVERDUE"
    | "OUTSTANDING"
    | "HAS_LINKED_EXPENSE"
    | "HAS_LINKED_INCOME"
    | "UNLINKED_ELIGIBLE"
    | "HAS_INTEREST";
  sortBy?:
    | "ISSUED_DESC"
    | "ISSUED_ASC"
    | "DUE_ASC"
    | "DUE_DESC"
    | "OUTSTANDING_DESC"
    | "OUTSTANDING_ASC"
    | "COUNTERPARTY_ASC"
    | "LATEST_ACTIVITY_DESC";
  minOutstandingRwf?: number;
  maxOutstandingRwf?: number;
  page?: number;
  limit?: number;
};

function buildLoanQuery(params?: LoanRouteParams): string {
  const searchParams = new URLSearchParams();

  if (params?.month !== undefined) {
    searchParams.set("month", String(params.month));
  }

  if (params?.year !== undefined) {
    searchParams.set("year", String(params.year));
  }

  if (params?.status !== undefined) {
    searchParams.set("status", params.status);
  }

  if (params?.direction !== undefined) {
    searchParams.set("direction", params.direction);
  }

  if (params?.type !== undefined) {
    searchParams.set("type", params.type);
  }

  if (params?.search !== undefined) {
    searchParams.set("search", params.search);
  }

  if (params?.dateFrom !== undefined) {
    searchParams.set("dateFrom", params.dateFrom);
  }

  if (params?.dateTo !== undefined) {
    searchParams.set("dateTo", params.dateTo);
  }

  if (params?.operationalFilter !== undefined) {
    searchParams.set("operationalFilter", params.operationalFilter);
  }

  if (params?.sortBy !== undefined) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params?.minOutstandingRwf !== undefined) {
    searchParams.set("minOutstandingRwf", String(params.minOutstandingRwf));
  }

  if (params?.maxOutstandingRwf !== undefined) {
    searchParams.set("maxOutstandingRwf", String(params.maxOutstandingRwf));
  }

  if (params?.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  return searchParams.toString();
}

export const LOANS_ROUTES = {
  list: (params?: LoanRouteParams) => {
    const query = buildLoanQuery(params);
    return query.length > 0 ? `${BASE}?${query}` : BASE;
  },
  create: BASE,
  summary: (params?: Omit<LoanRouteParams, "page" | "limit">) => {
    const query = buildLoanQuery(params);
    return query ? `${BASE}/summary?${query}` : `${BASE}/summary`;
  },
  audit: (params?: Omit<LoanRouteParams, "page" | "limit">) => {
    const query = buildLoanQuery(params);
    return query ? `${BASE}/audit?${query}` : `${BASE}/audit`;
  },
  aging: (params?: Omit<LoanRouteParams, "page" | "limit">) => {
    const query = buildLoanQuery(params);
    return query ? `${BASE}/aging?${query}` : `${BASE}/aging`;
  },
  transactionsIndex: (params?: Omit<LoanRouteParams, "page" | "limit">) => {
    const query = buildLoanQuery(params);
    return query ? `${BASE}/transactions?${query}` : `${BASE}/transactions`;
  },
  byId: (id: string) => `${BASE}/${id}`,
  transactions: (id: string) => `${BASE}/${id}/transactions`,
  reverseTransaction: (loanId: string, transactionId: string) =>
    `${BASE}/${loanId}/transactions/${transactionId}/reverse`,
  transactionToExpense: (loanId: string, transactionId: string) =>
    `${BASE}/${loanId}/transactions/${transactionId}/send-to-expense`,
  transactionToIncome: (loanId: string, transactionId: string) =>
    `${BASE}/${loanId}/transactions/${transactionId}/send-to-income`,
  sendToExpense: (id: string) => `${BASE}/${id}/send-to-expense`,
} as const;

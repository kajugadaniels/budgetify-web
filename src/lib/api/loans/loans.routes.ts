const BASE = "/api/v1/loans";

export const LOANS_ROUTES = {
  list: (params?: {
    month?: number;
    year?: number;
    status?: "ACTIVE" | "PARTIALLY_REPAID" | "SETTLED" | "OVERDUE" | "WRITTEN_OFF" | "CANCELLED" | "ARCHIVED";
    direction?: "BORROWED" | "LENT";
    type?: "PERSONAL" | "BUSINESS" | "FAMILY" | "FRIEND" | "OTHER";
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
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

    if (params?.page !== undefined) {
      searchParams.set("page", String(params.page));
    }

    if (params?.limit !== undefined) {
      searchParams.set("limit", String(params.limit));
    }

    const query = searchParams.toString();
    return query.length > 0 ? `${BASE}?${query}` : BASE;
  },
  create: BASE,
  byId: (id: string) => `${BASE}/${id}`,
  transactions: (id: string) => `${BASE}/${id}/transactions`,
  transactionToExpense: (loanId: string, transactionId: string) =>
    `${BASE}/${loanId}/transactions/${transactionId}/send-to-expense`,
  transactionToIncome: (loanId: string, transactionId: string) =>
    `${BASE}/${loanId}/transactions/${transactionId}/send-to-income`,
  sendToExpense: (id: string) => `${BASE}/${id}/send-to-expense`,
} as const;

const BASE = "/api/v1/savings";

export const SAVINGS_ROUTES = {
  list: (params?: {
    month?: number;
    year?: number;
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
  deposits: (id: string) => `${BASE}/${id}/deposits`,
  withdrawals: (id: string) => `${BASE}/${id}/withdrawals`,
  transactions: (id: string) => `${BASE}/${id}/transactions`,
} as const;

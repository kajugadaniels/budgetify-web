const BASE = "/api/v1/income";

export const INCOME_ROUTES = {
  categories: `${BASE}/categories`,
  summary: (params?: {
    month?: number;
    year?: number;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const searchParams = new URLSearchParams();

    if (params?.month !== undefined) {
      searchParams.set("month", String(params.month));
    }

    if (params?.year !== undefined) {
      searchParams.set("year", String(params.year));
    }

    if (params?.dateFrom !== undefined) {
      searchParams.set("dateFrom", params.dateFrom);
    }

    if (params?.dateTo !== undefined) {
      searchParams.set("dateTo", params.dateTo);
    }

    const query = searchParams.toString();
    return query.length > 0 ? `${BASE}/summary?${query}` : `${BASE}/summary`;
  },
  list:   (params?: {
    month?: number;
    year?: number;
    category?: string;
    received?: boolean;
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

    if (params?.category !== undefined) {
      searchParams.set("category", String(params.category));
    }

    if (params?.received !== undefined) {
      searchParams.set("received", String(params.received));
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
  byId:   (id: string) => `${BASE}/${id}`,
} as const;

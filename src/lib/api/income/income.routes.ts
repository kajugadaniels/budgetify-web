const BASE = "/api/v1/income";

export const INCOME_ROUTES = {
  categories: `${BASE}/categories`,
  list:   (params?: {
    month?: number;
    year?: number;
    category?: string;
    received?: boolean;
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

const BASE = "/api/v1/expenses";

export const EXPENSES_ROUTES = {
  categories: `${BASE}/categories`,
  list:   (params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams();

    if (params?.month !== undefined) {
      searchParams.set("month", String(params.month));
    }

    if (params?.year !== undefined) {
      searchParams.set("year", String(params.year));
    }

    const query = searchParams.toString();
    return query.length > 0 ? `${BASE}?${query}` : BASE;
  },
  create: BASE,
  byId:   (id: string) => `${BASE}/${id}`,
} as const;

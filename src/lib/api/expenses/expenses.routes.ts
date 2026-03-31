const BASE = "/api/v1/expenses";

export const EXPENSES_ROUTES = {
  categories: `${BASE}/categories`,
  list:   BASE,
  create: BASE,
  byId:   (id: string) => `${BASE}/${id}`,
} as const;

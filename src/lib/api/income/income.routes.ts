const BASE = "/api/v1/income";

export const INCOME_ROUTES = {
  categories: `${BASE}/categories`,
  list:   BASE,
  create: BASE,
  byId:   (id: string) => `${BASE}/${id}`,
} as const;

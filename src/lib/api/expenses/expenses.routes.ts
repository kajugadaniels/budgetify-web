const BASE = "/api/v1/expenses";

export const EXPENSES_ROUTES = {
  list:   BASE,
  create: BASE,
  byId:   (id: string) => `${BASE}/${id}`,
} as const;

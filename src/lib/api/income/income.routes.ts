const BASE = "/api/v1/income";

export const INCOME_ROUTES = {
  list:   BASE,
  create: BASE,
  byId:   (id: string) => `${BASE}/${id}`,
} as const;

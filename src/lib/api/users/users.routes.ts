const BASE = "/api/v1/users";

export const USERS_ROUTES = {
  me:       `${BASE}/me`,
  updateMe: `${BASE}/me`,
} as const;

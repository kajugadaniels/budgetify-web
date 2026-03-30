const BASE = "/api/v1/auth";

export const AUTH_ROUTES = {
  google:        `${BASE}/google`,
  emailInitiate: `${BASE}/email/initiate`,
  emailVerify:   `${BASE}/email/verify`,
  refresh:       `${BASE}/refresh`,
  logout:        `${BASE}/logout`,
  me:            `${BASE}/me`,
} as const;

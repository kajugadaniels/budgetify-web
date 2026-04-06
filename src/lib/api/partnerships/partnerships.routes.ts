const BASE = "/api/v1/partnerships";

export const PARTNERSHIPS_ROUTES = {
  accept: `${BASE}/accept`,
  invite: `${BASE}/invite`,
  inviteInfo: (token: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set("token", token);
    return `${BASE}/invite-info?${searchParams.toString()}`;
  },
  mine: `${BASE}/mine`,
} as const;

"use client";

// TODO (Step 5): Implement with full session management.
// Will expose: user, token, isAuthenticated, login(), logout().
export function useAuth() {
  return {
    user: null,
    token: null as string | null,
    isAuthenticated: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    login: async (_tokens: { accessToken: string; refreshToken: string }) => {},
    logout: async () => {},
  };
}

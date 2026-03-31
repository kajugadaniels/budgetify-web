"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { logout as apiLogout } from "@/lib/api/auth/auth.api";
import type { AuthResponse } from "@/lib/types/auth.types";
import type { UserProfileResponse } from "@/lib/types/user.types";

// ── Storage keys ─────────────────────────────────────────────────────────────

const ACCESS_KEY = "budgetify_access_token";
const REFRESH_KEY = "budgetify_refresh_token";
const USER_KEY = "budgetify_user";

// ── Context types ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: UserProfileResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (auth: AuthResponse) => void;
  updateUser: (user: UserProfileResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  });

  const [user, setUserState] = useState<UserProfileResponse | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as UserProfileResponse;
    } catch {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  const updateUser = useCallback((nextUser: UserProfileResponse) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUserState(nextUser);
  }, []);

  const login = useCallback((auth: AuthResponse) => {
    localStorage.setItem(ACCESS_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_KEY, auth.refreshToken);
    setToken(auth.accessToken);
    updateUser(auth.user);
  }, [updateUser]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (refreshToken) {
      try {
        await apiLogout({ refreshToken });
      } catch {
        // Best-effort — clear local state regardless of API response
      }
    }
    if (typeof window !== "undefined") {
      window.google?.accounts?.id.disableAutoSelect?.();
    }
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Internal hook (used by useAuth wrapper) ───────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}

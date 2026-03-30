import { apiFetch } from "../client";
import { AUTH_ROUTES } from "./auth.routes";
import type {
  AuthResponse,
  EmailInitiateRequest,
  EmailInitiateResponse,
  EmailVerifyRequest,
  GoogleAuthRequest,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
} from "../../types/auth.types";

export async function googleAuth(body: GoogleAuthRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(AUTH_ROUTES.google, { method: "POST", body });
}

export async function initiateEmailAuth(
  body: EmailInitiateRequest,
): Promise<EmailInitiateResponse> {
  return apiFetch<EmailInitiateResponse>(AUTH_ROUTES.emailInitiate, {
    method: "POST",
    body,
  });
}

export async function verifyEmailOtp(
  body: EmailVerifyRequest,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(AUTH_ROUTES.emailVerify, {
    method: "POST",
    body,
  });
}

export async function refreshTokens(
  body: RefreshTokenRequest,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(AUTH_ROUTES.refresh, { method: "POST", body });
}

export async function logout(body: LogoutRequest): Promise<LogoutResponse> {
  return apiFetch<LogoutResponse>(AUTH_ROUTES.logout, { method: "POST", body });
}

export async function getMe(token: string): Promise<AuthResponse["user"]> {
  return apiFetch<AuthResponse["user"]>(AUTH_ROUTES.me, { token });
}

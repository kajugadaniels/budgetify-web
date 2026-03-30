import type { UserProfileResponse } from "./user.types";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserProfileResponse;
}

export type EmailAuthAction = "login" | "register";

export interface EmailInitiateResponse {
  action: EmailAuthAction;
  maskedEmail: string;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ── Request types ────────────────────────────────────────────────────────────

export interface GoogleAuthRequest {
  idToken: string;
}

export interface EmailInitiateRequest {
  email: string;
}

export interface EmailVerifyRequest {
  email: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

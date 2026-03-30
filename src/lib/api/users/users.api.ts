import { apiFetch } from "../client";
import { USERS_ROUTES } from "./users.routes";
import type {
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "../../types/user.types";

export async function getProfile(token: string): Promise<UserProfileResponse> {
  return apiFetch<UserProfileResponse>(USERS_ROUTES.me, { token });
}

export async function updateProfile(
  token: string,
  body: UpdateUserProfileRequest,
): Promise<UserProfileResponse> {
  return apiFetch<UserProfileResponse>(USERS_ROUTES.updateMe, {
    method: "PATCH",
    token,
    body,
  });
}

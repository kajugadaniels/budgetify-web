import {
  ALLOWED_PROFILE_AVATAR_MIME_TYPES,
  MAX_PROFILE_AVATAR_SIZE_BYTES,
} from "@/constant/profile/avatar-upload";
import type { UserProfileResponse } from "@/lib/types/user.types";

export function formatProfileDate(
  value: string | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function getProfileDisplayName(profile: UserProfileResponse): string {
  return (
    profile.fullName ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.email
  );
}

export function getProfileInitial(displayName: string): string {
  return displayName[0]?.toUpperCase() ?? "B";
}

export function formatProfileFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.round(bytes / 1024)} KB`;
}

export function validateProfileAvatarFile(file: File): string | null {
  if (
    !ALLOWED_PROFILE_AVATAR_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_PROFILE_AVATAR_MIME_TYPES)[number],
    )
  ) {
    return "Only JPEG, PNG, and WebP profile images are supported.";
  }

  if (file.size > MAX_PROFILE_AVATAR_SIZE_BYTES) {
    return "Your profile image must be 5MB or smaller.";
  }

  return null;
}

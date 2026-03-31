import type { UserStatus } from "@/lib/types/user.types";

export const STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE: "border-success/24 bg-success/12 text-success",
  SUSPENDED: "border-danger/24 bg-danger/12 text-danger",
  DISABLED: "border-white/10 bg-white/[0.05] text-text-secondary",
};

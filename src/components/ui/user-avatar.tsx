import Image from "next/image";
import { getUserDisplayName, getUserInitial } from "@/lib/utils/user-display";

interface UserAvatarProps {
  avatarUrl?: string | null;
  className?: string;
  email?: string | null;
  firstName?: string | null;
  fullName?: string | null;
  lastName?: string | null;
  sizeClassName?: string;
}

export function UserAvatar({
  avatarUrl,
  className = "",
  email,
  firstName,
  fullName,
  lastName,
  sizeClassName = "h-9 w-9",
}: UserAvatarProps) {
  const displayName = getUserDisplayName({
    email,
    firstName,
    fullName,
    lastName,
  });

  if (avatarUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-full ${sizeClassName} ${className}`.trim()}
      >
        <Image
          src={avatarUrl}
          alt={displayName}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={displayName}
      className={`flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-text-primary ${sizeClassName} ${className}`.trim()}
    >
      {getUserInitial(displayName)}
    </div>
  );
}

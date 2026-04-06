import type { CreatedBySummary } from "@/lib/types/created-by.types";
import { getUserDisplayName } from "@/lib/utils/user-display";
import { UserAvatar } from "./user-avatar";

interface CreatedByPillProps {
  creator: CreatedBySummary;
}

export function CreatedByPill({ creator }: CreatedByPillProps) {
  const displayName = getUserDisplayName(creator, "Partner");

  return (
    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1">
      <UserAvatar
        avatarUrl={creator.avatarUrl}
        firstName={creator.firstName}
        lastName={creator.lastName}
        sizeClassName="h-5 w-5"
      />
      <span className="text-[11px] font-medium text-text-secondary">
        Added by <span className="text-text-primary">{displayName}</span>
      </span>
    </div>
  );
}

import { STATUS_STYLES } from "@/constant/profile/status-styles";
import type { UserStatus } from "@/lib/types/user.types";

interface ProfileHeaderProps {
  displayName: string;
  email: string;
  isEmailVerified: boolean;
  status: UserStatus;
}

export function ProfileHeader({
  displayName,
  email,
  isEmailVerified,
  status,
}: ProfileHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(199,191,167,0.2),transparent_30%),linear-gradient(180deg,rgba(23,28,34,0.95),rgba(11,13,16,0.94))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)] md:p-8">
      <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute -right-16 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-primary/12 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/64">
            Profile
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-heading-lg text-text-primary md:text-[2.4rem]">
            {displayName}
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{email}</p>
          <p className="mt-5 max-w-xl text-sm leading-6 text-text-secondary">
            Keep the account identity crisp and current. Update your name,
            upload a portrait, and let the session stay visually in sync.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] ${STATUS_STYLES[status]}`}
          >
            {status.toLowerCase()}
          </span>
          <span
            className={
              isEmailVerified
                ? "rounded-full border border-success/24 bg-success/12 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-success"
                : "rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary"
            }
          >
            {isEmailVerified ? "Email verified" : "Email pending"}
          </span>
        </div>
      </div>
    </section>
  );
}

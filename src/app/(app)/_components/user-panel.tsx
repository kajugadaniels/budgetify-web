"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function UserPanel() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    toast.info("You've been signed out.");
    router.push("/login");
  }

  const displayName =
    user?.fullName ?? user?.firstName ?? user?.email ?? "Account";
  const initial = displayName[0]?.toUpperCase() ?? "B";

  return (
    <div className="flex items-center gap-3 px-1">
      {/* Avatar */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30 shrink-0">
        <span className="text-primary text-sm font-semibold">{initial}</span>
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">
          {displayName}
        </p>
        {user?.email && (
          <p className="text-text-secondary text-xs truncate">{user.email}</p>
        )}
      </div>

      {/* Sign-out button */}
      <button
        onClick={handleLogout}
        title="Sign out"
        className="text-text-secondary hover:text-danger transition-colors shrink-0"
      >
        <SignOutIcon />
      </button>
    </div>
  );
}

function SignOutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

/**
 * Redirects unauthenticated users to /login.
 *
 * During SSR the auth state is always null (no localStorage on the server), so
 * the spinner is rendered on both server and client until the effect fires.
 * suppressHydrationWarning suppresses the expected server/client mismatch for
 * the spinner's wrapper while the client resolves auth state.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // router.replace is not a setState call — this satisfies react-hooks/set-state-in-effect
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      // suppressHydrationWarning: server always renders the spinner (isAuthenticated=false
      // during SSR) but an authenticated client replaces it immediately after hydration.
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        suppressHydrationWarning
      >
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

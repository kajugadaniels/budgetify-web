"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { initiateEmailAuth } from "@/lib/api/auth/auth.api";
import { GoogleSignInButton } from "./google-sign-in-button";

interface LoginPageClientProps {
  googleClientId: string;
}

export function LoginPageClient({ googleClientId }: LoginPageClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await initiateEmailAuth({ email: trimmed });
      sessionStorage.setItem("budgetify_otp_email", trimmed);
      router.push("/verify");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="glass-panel mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
          <span className="text-2xl font-bold tracking-tight text-primary">B</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-heading-md text-text-primary">
          Budgetify
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your finances, simplified
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8">
        <h2 className="mb-1 text-xl font-semibold tracking-heading-sm text-text-primary">
          Sign in
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          Continue with Google or request a one-time email code
        </p>

        <div className="mb-6">
          <GoogleSignInButton clientId={googleClientId} />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-secondary/60">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alice@example.com"
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 transition-colors focus:border-primary/60 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Sending code…" : "Continue with email"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-text-secondary/40">
          By continuing, you agree to our Terms of Service
          <br />
          and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

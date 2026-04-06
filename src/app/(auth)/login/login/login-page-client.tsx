"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { initiateEmailAuth } from "@/lib/api/auth/auth.api";
import { GoogleSignInButton } from "./google-sign-in-button";

interface LoginPageClientProps {
  googleClientId: string;
}

export function LoginPageClient({ googleClientId }: LoginPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectPath = searchParams.get("redirect");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await initiateEmailAuth({ email: trimmed });
      sessionStorage.setItem("budgetify_otp_email", trimmed);
      if (redirectPath?.startsWith("/")) {
        sessionStorage.setItem("budgetify_auth_redirect", redirectPath);
      } else {
        sessionStorage.removeItem("budgetify_auth_redirect");
      }
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
      <div className="mb-7 text-center">
        <div className="glass-panel mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[20px]">
          <span className="text-2xl font-bold tracking-tight text-primary">
            B
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-heading-md text-text-primary">
          Budgetify
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Choose the sign-in option that fits you best
        </p>
      </div>

      <div className="glass-panel rounded-[30px] p-7 md:p-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
            Secure access
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-heading-sm text-text-primary">
            Sign in
          </h2>
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

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary/55">
            Another option
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton
          clientId={googleClientId}
          redirectPath={redirectPath}
        />

        <p className="mt-6 text-center text-xs leading-relaxed text-text-secondary/40">
          By continuing, you agree to our Terms of Service
          <br />
          and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

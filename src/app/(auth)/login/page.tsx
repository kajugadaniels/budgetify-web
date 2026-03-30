"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initiateEmailAuth } from "@/lib/api/auth/auth.api";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await initiateEmailAuth({ email: trimmed });
      sessionStorage.setItem("budgetify_otp_email", trimmed);
      router.push("/verify");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand mark */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-panel mb-4">
          <span className="text-primary text-2xl font-bold tracking-tight">B</span>
        </div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-heading-md">
          Budgetify
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Your finances, simplified
        </p>
      </div>

      {/* Card */}
      <div className="glass-panel rounded-3xl p-8">
        <h2 className="text-xl font-semibold text-text-primary tracking-heading-sm mb-1">
          Sign in
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          Enter your email to receive a one-time code
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@example.com"
              className="w-full rounded-xl bg-surface-elevated border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary/40 text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-xl bg-primary text-background font-semibold py-3 text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Sending code…" : "Continue with email"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-secondary/60 text-xs">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google — placeholder until OAuth is wired */}
        <button
          type="button"
          disabled
          title="Google sign-in coming soon"
          className="w-full rounded-xl glass-subtle px-4 py-3 text-sm text-text-secondary flex items-center justify-center gap-2.5 cursor-not-allowed opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-center text-xs text-text-secondary/40 mt-6 leading-relaxed">
          By continuing, you agree to our Terms of Service
          <br />
          and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

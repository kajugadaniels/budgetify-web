"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initiateEmailAuth, verifyEmailOtp } from "@/lib/api/auth/auth.api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_S = 60;

export default function VerifyPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pull the email that was stored by the login page
  useEffect(() => {
    const stored = sessionStorage.getItem("budgetify_otp_email");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setEmail(stored);
    inputRefs.current[0]?.focus();
  }, [router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submitOtp = useCallback(
    async (otp: string) => {
      if (loading || otp.length !== OTP_LENGTH) return;
      setLoading(true);
      try {
        const auth = await verifyEmailOtp({ email, otp });
        login(auth);
        sessionStorage.removeItem("budgetify_otp_email");
        const nextPath = sessionStorage.getItem("budgetify_auth_redirect");
        sessionStorage.removeItem("budgetify_auth_redirect");
        router.push(
          nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard",
        );
      } catch (err) {
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Verification failed. Please try again.",
        );
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [email, loading, login, router, toast],
  );

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when last box is filled
    if (digit && index === OTP_LENGTH - 1 && next.every((d) => d)) {
      submitOtp(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    if (pasted.length === OTP_LENGTH) submitOtp(pasted);
  }

  async function handleResend() {
    if (cooldown > 0) return;
    try {
      await initiateEmailAuth({ email });
      toast.success("A new code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_S);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to resend code.",
      );
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
      </div>

      {/* Card */}
      <div className="glass-panel rounded-3xl p-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-text-secondary text-sm hover:text-text-primary transition-colors mb-6"
        >
          ← Back
        </Link>

        <h2 className="text-xl font-semibold text-text-primary tracking-heading-sm mb-1">
          Check your email
        </h2>
        <p className="text-text-secondary text-sm mb-1">
          We sent a 6-digit code to
        </p>
        <p className="text-primary text-sm font-medium mb-6">{email}</p>

        {/* OTP digit inputs */}
        <div
          className="flex gap-2.5 justify-center mb-6"
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              aria-label={`Digit ${i + 1}`}
              className="w-11 rounded-xl bg-surface-elevated border border-border text-center text-lg font-semibold text-text-primary focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-40"
              style={{ height: "52px" }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => submitOtp(digits.join(""))}
          disabled={loading || digits.some((d) => !d)}
          className="w-full rounded-xl bg-primary text-background font-semibold py-3 text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {loading ? "Verifying…" : "Verify code"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}

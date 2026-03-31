"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { googleAuth } from "@/lib/api/auth/auth.api";
import { ApiError } from "@/lib/api/client";

interface GoogleSignInButtonProps {
  clientId: string;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdConfiguration {
  auto_select?: boolean;
  callback: (response: GoogleCredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
  client_id: string;
  context?: "signin" | "signup" | "use";
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
  ux_mode?: "popup" | "redirect";
}

interface GoogleButtonConfiguration {
  logo_alignment?: "center" | "left";
  shape?: "circle" | "pill" | "rectangular" | "square";
  size?: "large" | "medium" | "small";
  text?: "continue_with" | "signin_with" | "signup_with";
  theme?: "filled_black" | "filled_blue" | "outline";
  width?: number;
}

interface GoogleIdClient {
  disableAutoSelect: () => void;
  initialize: (options: GoogleIdConfiguration) => void;
  prompt: () => void;
  renderButton: (
    parent: HTMLElement,
    options: GoogleButtonConfiguration,
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdClient;
      };
    };
  }
}

export function GoogleSignInButton({ clientId }: GoogleSignInButtonProps) {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const buttonRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      const idToken = response.credential;

      if (!idToken) {
        toast.error("Google did not return an ID token. Please try again.");
        return;
      }

      setBusy(true);

      try {
        const auth = await googleAuth({ idToken });
        login(auth);
        sessionStorage.removeItem("budgetify_otp_email");
        toast.success("Signed in with Google.");
        router.replace("/dashboard");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Google sign-in could not be completed right now.",
        );
      } finally {
        setBusy(false);
      }
    },
    [login, router, toast],
  );

  useEffect(() => {
    if (
      !clientId ||
      !scriptReady ||
      initializedRef.current ||
      !buttonRef.current ||
      !window.google?.accounts?.id
    ) {
      return;
    }

    const googleId = window.google.accounts.id;

    googleId.initialize({
      client_id: clientId,
      callback: (response) => {
        void handleGoogleCredential(response);
      },
      context: "signin",
      ux_mode: "popup",
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
      use_fedcm_for_prompt: true,
    });

    buttonRef.current.innerHTML = "";

    googleId.renderButton(buttonRef.current, {
      theme: "outline",
      text: "continue_with",
      shape: "pill",
      size: "large",
      logo_alignment: "left",
      width: Math.max(buttonRef.current.clientWidth, 280),
    });

    initializedRef.current = true;
  }, [clientId, handleGoogleCredential, scriptReady]);

  const isUnavailable = !clientId || scriptError;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setScriptError(true)}
      />

      <div className="relative overflow-hidden rounded-[22px] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {isUnavailable ? (
          <div className="rounded-xl border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
            Google sign-in is unavailable. Check the client ID configuration.
          </div>
        ) : (
          <div className="relative">
            {!scriptReady ? (
              <div className="h-11 animate-pulse rounded-full bg-white/[0.06]" />
            ) : (
              <div ref={buttonRef} className="min-h-[44px] w-full" />
            )}

            {busy ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/72 backdrop-blur-sm">
                <span className="text-sm font-medium text-text-primary">
                  Signing in with Google...
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
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

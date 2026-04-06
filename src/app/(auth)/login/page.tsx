import { Suspense } from "react";
import { LoginPageClient } from "./login/login-page-client";

export default function LoginPage() {
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
    process.env.NEXT_GOOGLE_CLIENT_ID ??
    "";

  return (
    <Suspense fallback={<div className="w-full max-w-md" />}>
      <LoginPageClient googleClientId={googleClientId} />
    </Suspense>
  );
}

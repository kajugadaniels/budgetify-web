import { redirect } from "next/navigation";

// Root redirects to the app shell.
// Once auth is wired (Step 5) this will check the session and redirect
// unauthenticated visitors to /login instead.
export default function Home() {
  redirect("/dashboard");
}

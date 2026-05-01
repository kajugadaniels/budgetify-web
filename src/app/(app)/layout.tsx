import { AuthGuard } from "./_components/auth-guard";
import { AppHeader } from "./_components/app-header";
import { Sidebar } from "./_components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-dvh bg-background">
        <Sidebar />
        <AppHeader />

        <main className="min-h-dvh pt-14 md:pl-[260px] md:pt-0">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}

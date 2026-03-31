import { AuthGuard } from "./_components/auth-guard";
import { AppHeader } from "./_components/app-header";
import { BottomNav } from "./_components/bottom_nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-dvh bg-background">
        <AppHeader />

        <main className="min-h-dvh pb-44 pt-14 sm:pb-48 md:pb-40 lg:pt-0">
          {children}
        </main>

        <BottomNav />
      </div>
    </AuthGuard>
  );
}

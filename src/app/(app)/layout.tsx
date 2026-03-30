import { AuthGuard } from "./_components/auth-guard";
import { Sidebar } from "./_components/sidebar";
import { AppHeader } from "./_components/app-header";
import { BottomTabBar } from "./_components/bottom-tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Desktop sidebar — fixed, 240px wide */}
        <Sidebar />

        {/* Mobile top header — fixed, 56px tall */}
        <AppHeader />

        {/* Page content */}
        <main className="md:ml-60 pt-14 md:pt-0 pb-16 md:pb-0 min-h-screen">
          {children}
        </main>

        {/* Mobile bottom tab bar — fixed, 64px tall */}
        <BottomTabBar />
      </div>
    </AuthGuard>
  );
}

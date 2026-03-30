// App shell layout — sidebar (desktop) + bottom tab bar (mobile).
// Implemented fully in Step 6.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {children}
    </div>
  );
}

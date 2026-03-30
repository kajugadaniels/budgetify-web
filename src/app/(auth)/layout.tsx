// Auth layout — centered glass card on the dark background, no navigation.
// Implemented fully in Step 5.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {children}
    </div>
  );
}

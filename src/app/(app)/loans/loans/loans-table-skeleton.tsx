export function LoansTableSkeleton() {
  return (
    <div className="px-5 pb-5 md:px-6">
      <div className="space-y-3 pt-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="glass-subtle h-16 animate-pulse rounded-[22px]"
          />
        ))}
      </div>
    </div>
  );
}

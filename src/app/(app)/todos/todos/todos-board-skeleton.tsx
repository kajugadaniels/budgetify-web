export function TodosBoardSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="glass-subtle h-[360px] animate-pulse rounded-[28px]"
        />
      ))}
    </div>
  );
}

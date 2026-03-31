interface LoansHeaderProps {
  onCreate: () => void;
}

export function LoansHeader({ onCreate }: LoansHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-heading-lg text-text-primary">
          Loans
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Track borrowed money by the month it was recorded and keep payment status visible.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        Add loan
      </button>
    </header>
  );
}

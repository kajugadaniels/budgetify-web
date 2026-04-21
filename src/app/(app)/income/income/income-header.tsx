interface IncomeHeaderProps {
  canCreate: boolean;
  onCreate: () => void;
}

export function IncomeHeader({ canCreate, onCreate }: IncomeHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-heading-lg text-text-primary">
          Income
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Track planned income, confirm when cash is actually received, and see what is still free after expenses and savings allocations.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        disabled={!canCreate}
        className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add income
      </button>
    </header>
  );
}

interface ExpensesHeaderProps {
  canCreate: boolean;
  onCreate: () => void;
}

export function ExpensesHeader({
  canCreate,
  onCreate,
}: ExpensesHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold tracking-heading-lg text-text-primary">
        Expenses
      </h1>

      <button
        type="button"
        onClick={onCreate}
        disabled={!canCreate}
        className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add expense
      </button>
    </header>
  );
}

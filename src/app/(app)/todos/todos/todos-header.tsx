interface TodosHeaderProps {
  onCreate: () => void;
}

export function TodosHeader({ onCreate }: TodosHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold tracking-heading-lg text-text-primary">
        Plans
      </h1>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        Add plan
      </button>
    </header>
  );
}

interface SavingHeaderProps {
  onCreate: () => void;
}

export function SavingHeader({ onCreate }: SavingHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-heading-lg text-text-primary">
          Saving
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Track every USD saving entry by recorded month and keep your reserve
          growth visible.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        Add saving
      </button>
    </header>
  );
}

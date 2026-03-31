interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center mb-4">
        <span className="text-text-secondary/30 text-3xl leading-none">○</span>
      </div>
      <h3 className="text-text-primary font-semibold text-base mb-1">{title}</h3>
      <p className="text-text-secondary text-sm mb-6 max-w-xs leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

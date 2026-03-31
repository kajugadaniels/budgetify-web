"use client";

import { Dialog } from "./dialog";

interface ConfirmDeleteDialogProps {
  /** Lowercase singular noun — e.g. "income entry", "expense", "item" */
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({
  label,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog onClose={onCancel}>
      <h2 className="text-lg font-semibold text-text-primary tracking-heading-sm mb-2">
        Delete {label}
      </h2>
      <p className="text-text-secondary text-sm mb-6 leading-relaxed">
        This action cannot be undone. The {label} will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-danger/15 border border-danger/30 text-danger px-4 py-2.5 text-sm font-semibold hover:bg-danger/25 transition-all"
        >
          Delete
        </button>
      </div>
    </Dialog>
  );
}

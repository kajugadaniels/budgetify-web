"use client";

import { Dialog } from "./dialog";

interface ConfirmActionDialogProps {
  actionLabel: string;
  confirmLabel: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmActionDialog({
  actionLabel,
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  title,
}: ConfirmActionDialogProps) {
  return (
    <Dialog onClose={onCancel}>
      <h2 className="mb-2 text-lg font-semibold tracking-heading-sm text-text-primary">
        {title}
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl border border-danger/30 bg-danger/15 px-4 py-2.5 text-sm font-semibold text-danger transition-all hover:bg-danger/25"
        >
          {confirmLabel || actionLabel}
        </button>
      </div>
    </Dialog>
  );
}

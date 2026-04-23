"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { TodoRecordingResponse } from "@/lib/types/todo.types";
import { rwf } from "@/lib/utils/currency";

interface TodoRecordingReversalDialogProps {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  recording: TodoRecordingResponse;
  saving: boolean;
  todoName: string;
}

export function TodoRecordingReversalDialog({
  onCancel,
  onConfirm,
  recording,
  saving,
  todoName,
}: TodoRecordingReversalDialogProps) {
  const [reason, setReason] = useState("");

  return (
    <Dialog onClose={saving ? () => undefined : onCancel} className="sm:max-w-lg">
      <div className="space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/20 bg-danger/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            Reverse recording
          </div>
          <h2 className="mt-3 text-lg font-semibold tracking-heading-sm text-text-primary">
            Reopen this todo recording?
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            This will remove the recording from the todo&apos;s active history and
            restore its budget and occurrence.
          </p>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-background/40 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/58">
            Recording
          </p>
          <div className="mt-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
            <p>
              <span className="text-text-primary">Todo:</span> {todoName}
            </p>
            <p>
              <span className="text-text-primary">Occurrence:</span>{" "}
              {recording.occurrenceDate}
            </p>
            <p>
              <span className="text-text-primary">Charged:</span>{" "}
              {rwf(recording.totalChargedAmount)}
            </p>
            <p>
              <span className="text-text-primary">Payment:</span>{" "}
              {recording.paymentMethod.replaceAll("_", " ")}
            </p>
          </div>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-surface-elevated/70 p-4 text-sm leading-6 text-text-secondary">
          {recording.expenseSource === "GENERATED" ? (
            <p>
              The expense was created from this todo flow, so reversing will
              also remove that generated expense from the active expenses ledger.
            </p>
          ) : (
            <p>
              The expense already existed before it was linked here, so
              reversing will keep the expense in the ledger and only remove its
              active effect on this todo.
            </p>
          )}
        </div>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/58">
            Reason
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional note for the audit trail"
            maxLength={500}
            className="min-h-[120px] w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={saving}
            className="rounded-full border border-danger/28 bg-danger/12 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/18 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Reversing..." : "Reverse recording"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

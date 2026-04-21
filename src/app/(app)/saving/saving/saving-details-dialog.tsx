"use client";

import { Dialog } from "@/components/ui/dialog";
import type { SavingResponse } from "@/lib/types/saving.types";
import { rwf } from "@/lib/utils/currency";
import {
  formatSavingDate,
  formatSavingNote,
  formatSavingTimeframe,
} from "./saving.utils";

interface SavingDetailsDialogProps {
  entry: SavingResponse;
  onClose: () => void;
}

export function SavingDetailsDialog({
  entry,
  onClose,
}: SavingDetailsDialogProps) {
  return (
    <Dialog onClose={onClose} className="sm:max-w-3xl">
      <div className="mb-6 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          Saving details
        </p>
        <div>
          <h2 className="text-2xl font-semibold tracking-heading-md text-text-primary">
            {entry.label}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Created {formatSavingDate(entry.createdAt)} · Recorded{" "}
            {formatSavingDate(entry.date)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard
          label="Current balance"
          value={rwf(entry.currentBalanceRwf)}
          detail={entry.stillHave ? "Money still inside this bucket" : "Bucket currently empty"}
        />
        <DetailCard
          label="Target amount"
          value={entry.targetAmountRwf ? rwf(entry.targetAmountRwf) : "No target"}
          detail={
            entry.targetProgressPercentage !== null
              ? `${Math.round(entry.targetProgressPercentage)}% of target reached`
              : "No target progress yet"
          }
        />
        <DetailCard
          label="Timeframe"
          value={formatSavingTimeframe(entry)}
          detail={
            entry.startDate && entry.endDate
              ? `${formatSavingDate(entry.startDate)} to ${formatSavingDate(entry.endDate)}`
              : "No timeframe"
          }
        />
        <DetailCard
          label="Time progress"
          value={
            entry.timeframeProgressPercentage !== null
              ? `${Math.round(entry.timeframeProgressPercentage)}%`
              : "No timeframe progress"
          }
          detail="Elapsed share of the planned timeframe"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <DetailCard
          label="Total deposited"
          value={rwf(entry.totalDepositedRwf)}
          detail="All money moved into this bucket"
        />
        <DetailCard
          label="Total withdrawn"
          value={rwf(entry.totalWithdrawnRwf)}
          detail="All money moved back out"
        />
      </div>

      <div className="mt-4 rounded-[24px] border border-white/8 bg-surface-elevated/60 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/60">
          Note
        </p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {formatSavingNote(entry.note)}
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}

function DetailCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-surface-elevated/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary/60">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-text-primary">{value}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{detail}</p>
    </div>
  );
}

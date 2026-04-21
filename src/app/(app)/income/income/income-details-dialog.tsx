"use client";

import { Dialog } from "@/components/ui/dialog";
import type { IncomeDetailResponse, IncomeResponse } from "@/lib/types/income.types";
import { rwf } from "@/lib/utils/currency";
import {
  formatIncomeDate,
  resolveIncomeAllocationLabel,
  resolveIncomeAvailabilityLabel,
  resolveIncomeCashStateHint,
  resolveIncomeCashStateLabel,
  resolveIncomeCategoryLabel,
} from "./income.utils";
import type { IncomeCategoryOptionResponse } from "@/lib/types/income.types";

interface IncomeDetailsDialogProps {
  categories: IncomeCategoryOptionResponse[];
  detail: IncomeDetailResponse | null;
  entry: IncomeResponse;
  highlightAllocationId?: string | null;
  loading: boolean;
  reversingAllocationId: string | null;
  onClose: () => void;
  onReverseAllocation: (
    entry: IncomeResponse,
    allocation: IncomeDetailResponse["savingAllocations"][number],
  ) => void;
}

export function IncomeDetailsDialog({
  categories,
  detail,
  entry,
  highlightAllocationId,
  loading,
  reversingAllocationId,
  onClose,
  onReverseAllocation,
}: IncomeDetailsDialogProps) {
  const source = detail ?? entry;
  const allocated = detail?.allocatedToSavingsRwf ?? 0;
  const remaining = detail?.remainingAvailableRwf ?? source.amountRwf;
  const allocationLabel = resolveIncomeAllocationLabel(source.allocationStatus);
  const availabilityLabel = resolveIncomeAvailabilityLabel(
    source.received,
    source.allocationStatus,
  );
  const cashStateLabel = resolveIncomeCashStateLabel(source.received);
  const cashStateHint = resolveIncomeCashStateHint(source.received);

  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
            Income details
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
            {source.label}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {resolveIncomeCategoryLabel(categories, source.category)} · Recorded{" "}
            {formatIncomeDate(source.date)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-text-secondary">
              {cashStateLabel}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                source.allocationStatus === "FULLY_ALLOCATED"
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : source.allocationStatus === "PARTIALLY_ALLOCATED"
                    ? "border-warning/20 bg-warning/10 text-warning"
                    : "border-success/20 bg-success/10 text-success"
              }`}
            >
              {allocationLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Close dialog"
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6 text-sm text-text-secondary">
          Loading income allocations...
        </div>
      ) : (
        <div className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Recorded amount"
              value={rwf(source.amountRwf)}
              hint="Total income recorded for this row."
            />
            <StatCard
              label="Parked in savings"
              value={rwf(allocated)}
              hint="Portion already linked to saving buckets."
            />
            <StatCard
              label="Still free"
              value={rwf(remaining)}
              hint="Amount still available for spending or saving."
            />
          </section>

          <section className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
                  Cash state
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {cashStateLabel}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                  source.received
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-primary/20 bg-primary/10 text-primary"
                }`}
              >
                {availabilityLabel}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {cashStateHint}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <InlineSummary
                label="Allocated now"
                value={rwf(allocated)}
              />
              <InlineSummary
                label="Free right now"
                value={rwf(remaining)}
              />
            </div>
          </section>

          <section className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
                  Saving allocations
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  {detail?.allocationCount ?? 0} allocation
                  {(detail?.allocationCount ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {detail && detail.savingAllocations.length > 0 ? (
              <div className="mt-4 space-y-3">
                {detail.savingAllocations.map((allocation) => (
                  <div
                    key={allocation.id}
                    className={`rounded-[18px] border px-4 py-3 ${
                      highlightAllocationId === allocation.id
                        ? "border-primary/35 bg-primary/8"
                        : "border-white/8 bg-surface-elevated/60"
                    }`}
                  >
                    {highlightAllocationId === allocation.id ? (
                      <div className="mb-3 flex justify-start">
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                          Reverse this allocation to unblock the income
                        </span>
                      </div>
                    ) : null}
                    {allocation.isReversed ? (
                      <div className="mb-3 flex justify-start">
                        <span className="rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
                          Reversed allocation
                        </span>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {allocation.savingLabel}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          Deposited {formatIncomeDate(allocation.transactionDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          {rwf(allocation.amountRwf)}
                        </p>
                        <p className="mt-1 text-[11px] text-text-secondary">
                          moved from this income
                        </p>
                      </div>
                    </div>
                    {allocation.note ? (
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {allocation.note}
                      </p>
                    ) : null}

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onReverseAllocation(entry, allocation)}
                        disabled={
                          reversingAllocationId === allocation.id ||
                          allocation.isReversed
                        }
                        className="rounded-full border border-danger/25 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/16 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {allocation.isReversed
                          ? "Already reversed"
                          : reversingAllocationId === allocation.id
                          ? "Reversing..."
                          : "Reverse allocation"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-text-secondary">
                No part of this income has been linked to a saving bucket yet. The full amount is still free.
              </p>
            )}
          </section>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-text-primary">{value}</p>
      <p className="mt-2 text-xs leading-5 text-text-secondary">{hint}</p>
    </div>
  );
}

function InlineSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-surface-elevated/60 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

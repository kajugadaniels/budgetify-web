"use client";

import { Dialog } from "@/components/ui/dialog";
import type { IncomeDetailResponse, IncomeResponse } from "@/lib/types/income.types";
import { rwf } from "@/lib/utils/currency";
import {
  formatIncomeDate,
  resolveIncomeCategoryLabel,
} from "./income.utils";
import type { IncomeCategoryOptionResponse } from "@/lib/types/income.types";

interface IncomeDetailsDialogProps {
  categories: IncomeCategoryOptionResponse[];
  detail: IncomeDetailResponse | null;
  entry: IncomeResponse;
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
  loading,
  reversingAllocationId,
  onClose,
  onReverseAllocation,
}: IncomeDetailsDialogProps) {
  const source = detail ?? entry;
  const allocated = detail?.allocatedToSavingsRwf ?? 0;
  const remaining = detail?.remainingAvailableRwf ?? source.amountRwf;

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
            <StatCard label="Income amount" value={rwf(source.amountRwf)} />
            <StatCard label="Moved to savings" value={rwf(allocated)} />
            <StatCard label="Still free" value={rwf(remaining)} />
          </section>

          <section className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
                  Cash state
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {source.received ? "Received cash" : "Scheduled only"}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                  source.received
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-primary/20 bg-primary/10 text-primary"
                }`}
              >
                {source.received ? "Available to allocate" : "Not in hand yet"}
              </span>
            </div>
            {!source.received ? (
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                This income is still scheduled. It should only count as money you have after it is marked received.
              </p>
            ) : null}
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
                    className="rounded-[18px] border border-white/8 bg-surface-elevated/60 px-4 py-3"
                  >
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
                      <p className="text-sm font-semibold text-primary">
                        {rwf(allocation.amountRwf)}
                      </p>
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
                        disabled={reversingAllocationId === allocation.id}
                        className="rounded-full border border-danger/25 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/16 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {reversingAllocationId === allocation.id
                          ? "Reversing..."
                          : "Reverse allocation"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-text-secondary">
                No part of this income has been linked to a saving bucket yet.
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}

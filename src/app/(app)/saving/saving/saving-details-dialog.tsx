"use client";

import { Dialog } from "@/components/ui/dialog";
import type { SavingResponse } from "@/lib/types/saving.types";
import { cn } from "@/lib/utils/cn";
import { rwf } from "@/lib/utils/currency";
import {
  formatSavingDate,
  formatSavingNote,
  formatSavingTimeframe,
} from "./saving.utils";

const EYEBROW_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/60";

interface SavingDetailsDialogProps {
  entry: SavingResponse;
  onClose: () => void;
  onDeposit: (entry: SavingResponse) => void;
  onEdit: (entry: SavingResponse) => void;
  onViewHistory: (entry: SavingResponse) => void;
  onWithdraw: (entry: SavingResponse) => void;
}

export function SavingDetailsDialog({
  entry,
  onClose,
  onDeposit,
  onEdit,
  onViewHistory,
  onWithdraw,
}: SavingDetailsDialogProps) {
  const targetProgress =
    entry.targetProgressPercentage !== null
      ? Math.round(entry.targetProgressPercentage)
      : null;
  const timeProgress =
    entry.timeframeProgressPercentage !== null
      ? Math.round(entry.timeframeProgressPercentage)
      : null;
  const netMovement = entry.totalDepositedRwf - entry.totalWithdrawnRwf;
  const hasNote = Boolean(entry.note && entry.note.trim().length > 0);

  return (
    <Dialog onClose={onClose} className="sm:max-w-xl p-4 sm:p-5">
      <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(199,191,167,0.16),transparent_72%)]" />

        <div className="relative z-10 mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Saving details
            </div>
            <h2 className="mt-3 truncate text-xl font-semibold tracking-heading-md text-text-primary sm:text-[1.35rem]">
              {entry.label}
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-text-secondary">
              Created {formatSavingDate(entry.createdAt)} · Recorded{" "}
              {formatSavingDate(entry.date)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="relative z-10 space-y-4">
          <HeroBalanceCard
            currentBalance={entry.currentBalanceRwf}
            currency={entry.currency}
            stillHave={entry.stillHave}
          />

          <section className="grid gap-2.5 rounded-[22px] border border-white/8 bg-background/36 p-3 sm:grid-cols-3 sm:p-4">
            <FlowStat
              label="Deposited"
              value={rwf(entry.totalDepositedRwf)}
              tone="success"
            />
            <FlowStat
              label="Withdrawn"
              value={rwf(entry.totalWithdrawnRwf)}
              tone="danger"
            />
            <FlowStat
              label="Net movement"
              value={`${netMovement >= 0 ? "+" : ""}${rwf(netMovement)}`}
              tone={netMovement >= 0 ? "primary" : "danger"}
            />
          </section>

          <ProgressCard
            label="Target progress"
            valueLabel={
              entry.targetAmountRwf !== null
                ? rwf(entry.targetAmountRwf)
                : "No target set"
            }
            progress={targetProgress}
            empty={entry.targetAmountRwf === null}
            emptyHint="Set a target to track how close you are to your goal."
          />

          <ProgressCard
            label="Timeframe progress"
            valueLabel={formatSavingTimeframe(entry)}
            progress={timeProgress}
            empty={!entry.startDate || !entry.endDate}
            emptyHint="Set a start and end date to follow the elapsed share."
            rangeLabel={
              entry.startDate && entry.endDate
                ? `${formatSavingDate(entry.startDate)} → ${formatSavingDate(entry.endDate)}`
                : null
            }
            daysLabel={
              entry.timeframeDays !== null
                ? `${entry.timeframeDays} day${entry.timeframeDays === 1 ? "" : "s"}`
                : null
            }
          />

          {hasNote ? (
            <section className="rounded-[22px] border border-white/8 bg-background/36 p-4">
              <p className={EYEBROW_CLASS}>Note</p>
              <p className="mt-2.5 text-sm leading-6 text-text-primary/95">
                {formatSavingNote(entry.note)}
              </p>
            </section>
          ) : null}

          <section className="rounded-[22px] border border-white/8 bg-background/36 p-4">
            <p className={EYEBROW_CLASS}>Actions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDeposit(entry)}
                className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/16"
              >
                Add money
              </button>
              <button
                type="button"
                onClick={() => onWithdraw(entry)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Withdraw
              </button>
              <button
                type="button"
                onClick={() => onViewHistory(entry)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                History
              </button>
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Edit
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 sm:min-w-[140px]"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      </div>
    </Dialog>
  );
}

function HeroBalanceCard({
  currentBalance,
  currency,
  stillHave,
}: {
  currentBalance: number;
  currency: string;
  stillHave: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-primary/15 bg-[linear-gradient(135deg,rgba(199,191,167,0.14)_0%,rgba(199,191,167,0.05)_45%,rgba(15,19,24,0.6)_100%)] p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-12 h-44 w-44 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-success/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={EYEBROW_CLASS}>Current balance</p>
          <p className="mt-3 text-[2rem] font-semibold leading-none tracking-heading-lg text-text-primary tabular-nums sm:text-[2.25rem]">
            {rwf(currentBalance)}
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            Stored in {currency}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
            stillHave
              ? "border-success/25 bg-success/10 text-success"
              : "border-danger/25 bg-danger/10 text-danger",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              stillHave ? "bg-success" : "bg-danger",
            )}
          />
          {stillHave ? "Active" : "Emptied"}
        </span>
      </div>
    </section>
  );
}

function FlowStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger" | "primary";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : "text-primary";

  return (
    <div className="rounded-[18px] border border-white/8 bg-surface-elevated/70 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 line-clamp-2 text-sm font-semibold tabular-nums",
          toneClass,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressCard({
  label,
  valueLabel,
  progress,
  empty,
  emptyHint,
  rangeLabel,
  daysLabel,
}: {
  label: string;
  valueLabel: string;
  progress: number | null;
  empty: boolean;
  emptyHint: string;
  rangeLabel?: string | null;
  daysLabel?: string | null;
}) {
  return (
    <section className="rounded-[22px] border border-white/8 bg-background/36 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={EYEBROW_CLASS}>{label}</p>
        {progress !== null ? (
          <p className="text-sm font-semibold text-text-primary tabular-nums">
            {progress}%
          </p>
        ) : null}
      </div>

      <p className="mt-2 text-base font-semibold text-text-primary">
        {valueLabel}
      </p>

      {empty ? (
        <p className="mt-3 text-xs leading-5 text-text-secondary/80">
          {emptyHint}
        </p>
      ) : (
        <>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/85 to-primary transition-all duration-500 ease-out"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
          {(rangeLabel || daysLabel) && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-secondary/80">
              {rangeLabel ? <span>{rangeLabel}</span> : <span />}
              {daysLabel ? (
                <span className="font-semibold tabular-nums text-text-secondary">
                  {daysLabel}
                </span>
              ) : null}
            </div>
          )}
        </>
      )}
    </section>
  );
}

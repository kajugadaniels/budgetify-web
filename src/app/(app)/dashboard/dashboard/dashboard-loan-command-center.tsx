"use client";

import Link from "next/link";
import type {
  LoanAgingResponse,
  LoanAuditResponse,
  LoanResponse,
  LoanSummaryResponse,
} from "@/lib/types/loan.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import { formatLoanDate } from "../../loans/loans/loans.utils";

interface DashboardLoanCommandCenterProps {
  aging: LoanAgingResponse | null;
  audit: LoanAuditResponse | null;
  dueSoonLoans: LoanResponse[];
  summary: LoanSummaryResponse | null;
  unlinkedLoans: LoanResponse[];
}

const EMPTY_SUMMARY = {
  borrowedOutstandingRwf: 0,
  interestPayableOutstandingRwf: 0,
  interestReceivableOutstandingRwf: 0,
  lentOutstandingRwf: 0,
  overdueLoanCount: 0,
  totalLoanCount: 0,
};

export function DashboardLoanCommandCenter({
  aging,
  audit,
  dueSoonLoans,
  summary,
  unlinkedLoans,
}: DashboardLoanCommandCenterProps) {
  const safeSummary = summary ?? EMPTY_SUMMARY;
  const totalOutstanding =
    safeSummary.borrowedOutstandingRwf + safeSummary.lentOutstandingRwf;
  const interestExposure =
    safeSummary.interestPayableOutstandingRwf +
    safeSummary.interestReceivableOutstandingRwf;
  const actionCount = audit?.unlinkedEligibleTransactionCount ?? 0;
  const overdueOutstanding = aging?.overdueOutstandingRwf ?? 0;
  const primaryAction =
    actionCount > 0
      ? {
          href: buildLoansHref({
            operationalFilter: "UNLINKED_ELIGIBLE",
            sortBy: "LATEST_ACTIVITY_DESC",
          }),
          label: "Link financial records",
        }
      : safeSummary.overdueLoanCount > 0
        ? {
            href: buildLoansHref({
              operationalFilter: "OVERDUE",
              sortBy: "DUE_ASC",
            }),
            label: "Review overdue loans",
          }
        : {
            href: buildLoansHref({
              operationalFilter: "DUE_SOON",
              sortBy: "DUE_ASC",
            }),
            label: "Review due soon",
          };

  return (
    <section className="glass-panel overflow-hidden rounded-[36px]">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="relative p-5 md:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/62">
                  Loan command center
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-heading-lg text-text-primary">
                  Exposure, deadlines, and records that need action
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  This turns loans into an operating view: what you owe, what is
                  collectible, what is overdue, and which loan transactions still
                  need to be linked to income or expense records.
                </p>
              </div>

              <Link
                href={primaryAction.href}
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-primary/18 bg-primary/12 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary/18"
              >
                {primaryAction.label}
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile
                href={buildLoansHref({
                  operationalFilter: "OUTSTANDING",
                  sortBy: "OUTSTANDING_DESC",
                })}
                label="Total exposure"
                tone="primary"
                value={rwfCompact(totalOutstanding)}
                detail={rwf(totalOutstanding)}
              />
              <MetricTile
                href={buildLoansHref({
                  direction: "BORROWED",
                  operationalFilter: "OUTSTANDING",
                  sortBy: "OUTSTANDING_DESC",
                })}
                label="You owe"
                tone="danger"
                value={rwfCompact(safeSummary.borrowedOutstandingRwf)}
                detail="Borrowed outstanding"
              />
              <MetricTile
                href={buildLoansHref({
                  direction: "LENT",
                  operationalFilter: "OUTSTANDING",
                  sortBy: "OUTSTANDING_DESC",
                })}
                label="Collectible"
                tone="success"
                value={rwfCompact(safeSummary.lentOutstandingRwf)}
                detail="Lent outstanding"
              />
              <MetricTile
                href={buildLoansHref({
                  operationalFilter: "HAS_INTEREST",
                  sortBy: "OUTSTANDING_DESC",
                })}
                label="Interest exposure"
                tone="amber"
                value={rwfCompact(interestExposure)}
                detail={`${rwfCompact(safeSummary.interestReceivableOutstandingRwf)} receivable`}
              />
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <ActionPanel
                href={buildLoansHref({
                  operationalFilter: "OVERDUE",
                  sortBy: "DUE_ASC",
                })}
                label="Overdue"
                metric={safeSummary.overdueLoanCount}
                supporting={rwfCompact(overdueOutstanding)}
                tone="danger"
              />
              <ActionPanel
                href={buildLoansHref({
                  operationalFilter: "DUE_SOON",
                  sortBy: "DUE_ASC",
                })}
                label="Due in 7 days"
                metric={dueSoonLoans.length}
                supporting="Upcoming deadlines"
                tone="primary"
              />
              <ActionPanel
                href={buildLoansHref({
                  operationalFilter: "UNLINKED_ELIGIBLE",
                  sortBy: "LATEST_ACTIVITY_DESC",
                })}
                label="Needs linking"
                metric={actionCount}
                supporting="Expense or income records"
                tone="amber"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 bg-background-secondary/36 p-5 md:p-6 xl:border-l xl:border-t-0">
          <div className="grid gap-5">
            <LoanActionList
              emptyText="No loan deadlines are due in the next 7 days."
              items={dueSoonLoans}
              title="Upcoming loan deadlines"
              viewAllHref={buildLoansHref({
                operationalFilter: "DUE_SOON",
                sortBy: "DUE_ASC",
              })}
            />
            <LoanActionList
              emptyText="Every eligible loan transaction is already linked."
              items={unlinkedLoans}
              title="Transactions needing financial records"
              viewAllHref={buildLoansHref({
                operationalFilter: "UNLINKED_ELIGIBLE",
                sortBy: "LATEST_ACTIVITY_DESC",
              })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricTile({
  detail,
  href,
  label,
  tone,
  value,
}: {
  detail: string;
  href: string;
  label: string;
  tone: "amber" | "danger" | "primary" | "success";
  value: string;
}) {
  const tones = {
    amber: "border-amber-400/12 bg-amber-400/7 text-amber-300",
    danger: "border-danger/12 bg-danger/7 text-danger",
    primary: "border-primary/12 bg-primary/7 text-primary",
    success: "border-success/12 bg-success/7 text-success",
  } as const;

  return (
    <Link
      href={href}
      className={`rounded-[24px] border p-4 transition-colors hover:bg-white/[0.055] ${tones[tone]}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-heading-md">{value}</p>
      <p className="mt-2 text-xs leading-5 text-text-secondary">{detail}</p>
    </Link>
  );
}

function ActionPanel({
  href,
  label,
  metric,
  supporting,
  tone,
}: {
  href: string;
  label: string;
  metric: number;
  supporting: string;
  tone: "amber" | "danger" | "primary";
}) {
  const tones = {
    amber: "border-amber-400/12 bg-amber-400/7 text-amber-300",
    danger: "border-danger/12 bg-danger/7 text-danger",
    primary: "border-primary/12 bg-primary/7 text-primary",
  } as const;

  return (
    <Link
      href={href}
      className={`rounded-[24px] border p-4 transition-colors hover:bg-white/[0.055] ${tones[tone]}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-heading-md">{metric}</p>
        <span className="rounded-full border border-white/10 bg-background/42 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Open
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-text-secondary">{supporting}</p>
    </Link>
  );
}

function LoanActionList({
  emptyText,
  items,
  title,
  viewAllHref,
}: {
  emptyText: string;
  items: LoanResponse[];
  title: string;
  viewAllHref: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-background/28 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/66">
          {title}
        </p>
        <Link
          href={viewAllHref}
          className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-primary"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-[20px] border border-white/8 bg-white/[0.025] px-4 py-3 text-sm leading-6 text-text-secondary">
            {emptyText}
          </p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={buildLoansHref({
                search: item.counterpartyName,
                sortBy: "LATEST_ACTIVITY_DESC",
              })}
              className="block rounded-[20px] border border-white/8 bg-white/[0.025] px-4 py-3 transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {item.counterpartyName} ·{" "}
                    {item.dueDate ? formatLoanDate(item.dueDate) : "No due date"}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-primary">
                  {rwfCompact(item.totalOutstandingRwf)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function buildLoansHref(params: Record<string, string>): string {
  const searchParams = new URLSearchParams(params);

  return `/loans?${searchParams.toString()}`;
}

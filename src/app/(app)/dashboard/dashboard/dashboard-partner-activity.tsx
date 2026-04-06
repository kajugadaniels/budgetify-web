import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { rwfCompact, usdCompact } from "@/lib/utils/currency";
import { getUserDisplayName } from "@/lib/utils/user-display";
import type {
  DashboardPartnerActivityPersonSummary,
  DashboardPartnerActivityRecord,
  DashboardPartnerActivitySummary,
} from "./dashboard.utils";

interface DashboardPartnerActivityProps {
  monthLabel: string;
  summary: DashboardPartnerActivitySummary;
  year: number;
}

const ACTIVITY_TYPE_STYLES: Record<
  DashboardPartnerActivityRecord["type"],
  { label: string; tone: string }
> = {
  EXPENSE: {
    label: "Expense",
    tone: "border-danger/18 bg-danger/10 text-danger",
  },
  INCOME: {
    label: "Income",
    tone: "border-success/18 bg-success/10 text-success",
  },
  LOAN: {
    label: "Loan",
    tone: "border-amber-400/18 bg-amber-400/10 text-amber-300",
  },
  SAVING: {
    label: "Saving",
    tone: "border-sky-400/18 bg-sky-400/10 text-sky-300",
  },
};

function formatActivityAmount(activity: DashboardPartnerActivityRecord): string {
  return activity.currency === "USD"
    ? usdCompact(activity.amount)
    : rwfCompact(activity.amount);
}

function formatActivityDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function getActivityDisplayName(person: DashboardPartnerActivityPersonSummary): string {
  if (person.isCurrentUser) {
    return "You";
  }

  return getUserDisplayName(person.identity, "Partner");
}

function PersonCard({
  emptyCopy,
  monthLabel,
  person,
  title,
  year,
}: {
  emptyCopy: string;
  monthLabel: string;
  person: DashboardPartnerActivityPersonSummary | null;
  title: string;
  year: number;
}) {
  if (!person) {
    return (
      <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
          {title}
        </p>
        <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-text-primary">
          No partner yet
        </p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{emptyCopy}</p>
      </div>
    );
  }

  const displayName = getActivityDisplayName(person);
  const secondaryName = person.isCurrentUser
    ? getUserDisplayName(person.identity, "Budgetify user")
    : null;

  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={person.identity.avatarUrl}
            email={person.identity.email}
            firstName={person.identity.firstName}
            fullName={person.identity.fullName}
            lastName={person.identity.lastName}
            sizeClassName="h-11 w-11"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
              {title}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-text-primary">
              {displayName}
            </p>
            {secondaryName ? (
              <p className="mt-1 text-xs text-text-secondary">{secondaryName}</p>
            ) : null}
          </div>
        </div>

        <span className="rounded-full border border-white/8 bg-background/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          {person.entryCount} {person.entryCount === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-white/8 bg-background/35 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
            RWF logged
          </p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-text-primary">
            {rwfCompact(person.rwfAmount)}
          </p>
        </div>

        <div className="rounded-[20px] border border-white/8 bg-background/35 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
            USD saved
          </p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-text-primary">
            {usdCompact(person.usdAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/8 bg-background/28 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
          Latest activity
        </p>
        {person.latestActivity ? (
          <>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {person.latestActivity.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {ACTIVITY_TYPE_STYLES[person.latestActivity.type].label} on{" "}
              {formatActivityDate(person.latestActivity.date)} in {monthLabel} {year}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            No finance item added in {monthLabel} {year} yet.
          </p>
        )}
      </div>
    </div>
  );
}

export function DashboardPartnerActivity({
  monthLabel,
  summary,
  year,
}: DashboardPartnerActivityProps) {
  const partnerEntryCount = summary.partner?.entryCount ?? 0;

  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/62">
            Partner activity
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
            See who moved the month forward
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Shared records stay visible by person, so you can quickly see what
            you logged, what your partner handled, and the latest movement
            inside the shared workspace.
          </p>
        </div>

        <Link
          href="/partners"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-primary transition-colors hover:bg-white/[0.08]"
        >
          Manage partners
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
            Shared records
          </p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
            {summary.totalEntries}
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
            You added
          </p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
            {summary.currentUser?.entryCount ?? 0}
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
            Partner added
          </p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
            {partnerEntryCount}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="grid gap-4 md:grid-cols-2">
          <PersonCard
            title="Your side"
            person={summary.currentUser}
            monthLabel={monthLabel}
            year={year}
            emptyCopy={`You have not added a finance item in ${monthLabel} ${year} yet.`}
          />
          <PersonCard
            title="Partner side"
            person={summary.partner}
            monthLabel={monthLabel}
            year={year}
            emptyCopy="Once you connect a partner, their monthly activity will appear here as well."
          />
        </div>

        <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary/58">
                Latest shared activity
              </p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
                {summary.activePeopleCount > 1
                  ? "Both partners are active"
                  : "One side is carrying the month"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                Totals
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {rwfCompact(summary.totalRwfAmount)}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {usdCompact(summary.totalUsdAmount)} in savings
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {summary.latestActivities.length > 0 ? (
              summary.latestActivities.map((activity) => {
                const creatorName = getUserDisplayName(activity.creator, "Partner");
                const style = ACTIVITY_TYPE_STYLES[activity.type];

                return (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="rounded-[20px] border border-white/8 bg-background/28 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${style.tone}`}
                          >
                            {style.label}
                          </span>
                          <span className="text-[11px] text-text-secondary">
                            {formatActivityDate(activity.date)}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-sm font-semibold text-text-primary">
                          {activity.label}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          Added by {creatorName}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-text-primary">
                        {formatActivityAmount(activity)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[20px] border border-white/8 bg-background/28 px-4 py-4 text-sm leading-6 text-text-secondary">
                No partner activity has been recorded in {monthLabel} {year} yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

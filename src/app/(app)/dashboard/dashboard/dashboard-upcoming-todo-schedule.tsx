import { rwf, rwfCompact } from "@/lib/utils/currency";
import type {
  DashboardUpcomingTodoScheduleDay,
  DashboardUpcomingTodoScheduleItem,
  DashboardUpcomingTodoScheduleSummary,
} from "./dashboard.utils";

interface DashboardUpcomingTodoScheduleProps {
  summary: DashboardUpcomingTodoScheduleSummary;
}

function formatUpcomingDayLabel(value: string): {
  day: string;
  weekday: string;
} {
  const date = new Date(`${value}T00:00:00`);

  return {
    day: date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    }),
    weekday: date.toLocaleDateString("en-US", {
      weekday: "short",
    }),
  };
}

function formatTodoFrequency(frequency: DashboardUpcomingTodoScheduleItem["frequency"]): string {
  switch (frequency) {
    case "WEEKLY":
      return "Weekly";
    case "MONTHLY":
      return "Monthly";
    case "YEARLY":
      return "Yearly";
    case "ONCE":
    default:
      return "Once";
  }
}

function isToday(value: string): boolean {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  const today = new Date(now.getTime() - offset).toISOString().slice(0, 10);
  return value === today;
}

function DayCard({ day }: { day: DashboardUpcomingTodoScheduleDay }) {
  const label = formatUpcomingDayLabel(day.date);

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
              {label.weekday}
            </p>
            {isToday(day.date) ? (
              <span className="rounded-full border border-primary/16 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Today
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-text-primary">
            {label.day}
          </p>
        </div>
        <p className="text-sm font-semibold text-primary">
          {day.items.length > 0 ? rwfCompact(day.totalAmount) : "Free"}
        </p>
      </div>

      {day.items.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {day.items.map((item) => (
            <div
              key={`${day.date}-${item.id}`}
              className="rounded-[18px] border border-white/8 bg-background/36 px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {item.name}
                </p>
                <p className="shrink-0 text-sm font-semibold text-text-primary">
                  {rwf(item.amount)}
                </p>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {formatTodoFrequency(item.frequency)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[18px] border border-white/8 bg-background/28 px-3 py-4 text-sm text-text-secondary">
          Nothing planned.
        </div>
      )}
    </div>
  );
}

export function DashboardUpcomingTodoSchedule({
  summary,
}: DashboardUpcomingTodoScheduleProps) {
  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/62">
            Upcoming todo schedule
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
            What needs money in the next 7 days
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            This is built from todo occurrence dates that are still not recorded
            in expense, so you can see what is coming before it arrives.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
              Needed total
            </p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
              {rwfCompact(summary.totalAmount)}
            </p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
              Planned items
            </p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
              {summary.occurrenceCount}
            </p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
              Active days
            </p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-text-primary">
              {summary.daysWithPlans}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {summary.days.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </section>
  );
}

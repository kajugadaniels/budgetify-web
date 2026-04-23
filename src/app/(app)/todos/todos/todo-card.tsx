import { PRIORITY_META } from "@/constant/todos/priority-meta";
import { CreatedByPill } from "@/components/ui/created-by-pill";
import type { TodoResponse } from "@/lib/types/todo.types";
import { rwf } from "@/lib/utils/currency";
import { TodoImageCarousel } from "./todo-image-carousel";
import {
  canRecordTodoExpense,
  formatTodoResponsibleUserLabel,
  formatTodoFrequencyLabel,
  formatTodoScheduleSummary,
  getOverdueTodoOccurrences,
  getRecordedTodoOccurrences,
  isRecurringTodo,
  isClosedTodoStatus,
  resolveTodoAmountLabel,
  resolveTodoStatusLabel,
  resolveTodoTypeLabel,
} from "./todos.utils";

interface TodoCardProps {
  busyDone: boolean;
  busyRecordExpense: boolean;
  entry: TodoResponse;
  onDelete: (entry: TodoResponse) => void;
  onEdit: (entry: TodoResponse) => void;
  onOpenExpense: (expenseId: string) => void;
  onOpenGallery: (todoId: string, index: number) => void;
  onRecordExpense: (entry: TodoResponse) => void;
  onToggleDone: (entry: TodoResponse) => void;
}

export function TodoCard({
  busyDone,
  busyRecordExpense,
  entry,
  onDelete,
  onEdit,
  onOpenExpense,
  onOpenGallery,
  onRecordExpense,
  onToggleDone,
}: TodoCardProps) {
  const meta = PRIORITY_META[entry.priority];
  const recurring = isRecurringTodo(entry);
  const canRecord = canRecordTodoExpense(entry);
  const latestRecording = entry.recordings[0] ?? null;
  const overdueOccurrences = getOverdueTodoOccurrences(entry);
  const recordedOccurrences = getRecordedTodoOccurrences(entry);
  const remainingShare =
    recurring && entry.remainingAmount !== null && entry.price > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((entry.remainingAmount / entry.price) * 100)),
        )
      : 0;

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(199,191,167,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-3 shadow-[0_24px_44px_rgba(0,0,0,0.22)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

      <TodoImageCarousel
        images={entry.images}
        emptyDescription="Add an image to give this plan item presence."
        emptyTitle="No image yet"
        heightClass="h-52"
        onImageClick={(index) => onOpenGallery(entry.id, index)}
      />

      <div className="mt-3 rounded-[24px] border border-white/8 bg-background/42 p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.chipClass}`}
              >
                {meta.label}
              </span>
              <span className="inline-flex rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                {resolveTodoTypeLabel(entry.type)}
              </span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                {formatTodoFrequencyLabel(entry.frequency)}
              </span>
              <button
                type="button"
                onClick={() => onToggleDone(entry)}
                disabled={busyDone}
                className={
                  busyDone
                    ? "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-secondary opacity-70"
                    : isClosedTodoStatus(entry.status)
                      ? "inline-flex rounded-full border border-success/30 bg-success/16 px-2.5 py-1 text-[11px] font-medium text-success transition-all hover:bg-success/22"
                      : "inline-flex rounded-full border border-danger/28 bg-danger/10 px-2.5 py-1 text-[11px] font-medium text-danger transition-all hover:bg-danger/16"
                }
              >
                {busyDone
                  ? "Updating..."
                  : isClosedTodoStatus(entry.status)
                    ? "Reopen"
                    : entry.status === "RECORDED"
                      ? "Mark completed"
                      : "Mark completed"}
              </button>
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                {resolveTodoStatusLabel(entry.status)}
              </span>
              {entry.recordingCount > 0 ? (
                <span className="inline-flex rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {entry.recordingCount} recorded
                </span>
              ) : null}
              {recurring && overdueOccurrences.length > 0 ? (
                <span className="inline-flex rounded-full border border-danger/24 bg-danger/10 px-2.5 py-1 text-[11px] font-medium text-danger">
                  {overdueOccurrences.length} overdue
                </span>
              ) : recurring && recordedOccurrences.length > 0 ? (
                <span className="inline-flex rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {recordedOccurrences.length} occurrence{recordedOccurrences.length === 1 ? "" : "s"} recorded
                </span>
              ) : null}
            </div>
            <p className="mt-3 truncate text-lg font-semibold tracking-heading-sm text-text-primary">
              {entry.name}
            </p>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              {formatTodoScheduleSummary(entry)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <CreatedByPill creator={entry.createdBy} />
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1">
                <span className="text-[11px] font-medium text-text-secondary">
                  Responsible{" "}
                  <span className="text-text-primary">
                    {formatTodoResponsibleUserLabel(entry.responsibleUser)}
                  </span>
                </span>
              </div>
              {entry.payee ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1">
                  <span className="text-[11px] font-medium text-text-secondary">
                    Payee <span className="text-text-primary">{entry.payee}</span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 rounded-[20px] px-4 py-3 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/65">
              {resolveTodoAmountLabel(entry)}
            </p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {rwf(Number(entry.price))}
            </p>
          </div>
        </div>

        {recurring ? (
          <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.03] px-3.5 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                Remaining budget
              </p>
              <span className="text-xs font-medium text-text-primary">
                {rwf(Number(entry.remainingAmount ?? 0))}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(199,191,167,0.42),rgba(199,191,167,1),rgba(228,192,99,0.64))]"
                style={{ width: `${remainingShare}%` }}
              />
            </div>
          </div>
        ) : null}

        {latestRecording ? (
          <div className="mt-4 rounded-[18px] border border-primary/12 bg-primary/6 px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                  Latest recording
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {rwf(latestRecording.totalChargedAmount)} charged on{" "}
                  {latestRecording.occurrenceDate}
                </p>
              </div>
              <div className="text-right text-xs text-text-secondary">
                <p>{latestRecording.paymentMethod.replaceAll("_", " ")}</p>
                <p>
                  {latestRecording.feeAmount > 0
                    ? `Fee ${rwf(latestRecording.feeAmount)}`
                    : "No fee"}
                </p>
                {latestRecording.expense ? (
                  <button
                    type="button"
                    onClick={() => onOpenExpense(latestRecording.expense!.id)}
                    className="mt-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/16"
                  >
                    Open expense
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-white/8 pt-4">
          <button
            type="button"
            onClick={() => onRecordExpense(entry)}
            disabled={busyRecordExpense || !canRecord}
            className={
              busyRecordExpense || !canRecord
                ? "rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-text-secondary opacity-70"
                : "rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/16"
            }
          >
            {busyRecordExpense
              ? "Recording..."
              : !canRecord
                ? recurring
                  ? "No budget left"
                  : isClosedTodoStatus(entry.status)
                    ? "Closed"
                    : "Recorded"
                : "Record expense"}
          </button>
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="rounded-full border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-medium text-text-secondary transition-all hover:border-white/16 hover:text-text-primary"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            className="rounded-full border border-danger/28 bg-danger/10 px-3.5 py-2 text-xs font-medium text-danger transition-all hover:bg-danger/16"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

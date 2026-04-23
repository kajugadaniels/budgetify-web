import type { TodoResponse } from "@/lib/types/todo.types";
import { EmptyState } from "@/components/ui/empty-state";
import { TodoCard } from "./todo-card";

interface TodoPriorityLaneProps {
  busyDoneId: string | null;
  busyRecordExpenseId: string | null;
  busyReverseRecordingId: string | null;
  entries: TodoResponse[];
  onDelete: (entry: TodoResponse) => void;
  onEdit: (entry: TodoResponse) => void;
  onOpenExpense: (expenseId: string) => void;
  onOpenGallery: (todoId: string, index: number) => void;
  onRecordExpense: (entry: TodoResponse) => void;
  onReverseRecording: (entry: TodoResponse, recordingId: string) => void;
  onToggleDone: (entry: TodoResponse) => void;
}

export function TodoPriorityLane({
  busyDoneId,
  busyRecordExpenseId,
  busyReverseRecordingId,
  entries,
  onDelete,
  onEdit,
  onOpenExpense,
  onOpenGallery,
  onRecordExpense,
  onReverseRecording,
  onToggleDone,
}: TodoPriorityLaneProps) {
  return (
    <section>
      {entries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <TodoCard
              key={entry.id}
              busyDone={busyDoneId === entry.id}
              busyRecordExpense={busyRecordExpenseId === entry.id}
              busyReverseRecordingId={busyReverseRecordingId}
              entry={entry}
              onDelete={onDelete}
              onEdit={onEdit}
              onOpenExpense={onOpenExpense}
              onOpenGallery={onOpenGallery}
              onRecordExpense={onRecordExpense}
              onReverseRecording={onReverseRecording}
              onToggleDone={onToggleDone}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/8 bg-surface-elevated/65 p-4">
          <EmptyState
            title="No plans yet"
            description="Add a wishlist item, a planned spend, or a recurring obligation and it will appear here in the order you created it."
          />
        </div>
      )}
    </section>
  );
}

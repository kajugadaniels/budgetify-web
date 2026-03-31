import type { TodoResponse } from "@/lib/types/todo.types";
import { TodoPriorityLane } from "./todo-priority-lane";

interface TodosBoardProps {
  busyDoneId: string | null;
  entries: TodoResponse[];
  onDelete: (entry: TodoResponse) => void;
  onEdit: (entry: TodoResponse) => void;
  onOpenGallery: (todoId: string, index: number) => void;
  onToggleDone: (entry: TodoResponse) => void;
}

export function TodosBoard({
  busyDoneId,
  entries,
  onDelete,
  onEdit,
  onOpenGallery,
  onToggleDone,
}: TodosBoardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/8 bg-background-secondary/60 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/60">
            Newest first
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Ordered by the date each wishlist item was created
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
          {entries.length} items
        </span>
      </div>

      <TodoPriorityLane
        busyDoneId={busyDoneId}
        entries={entries}
        onDelete={onDelete}
        onEdit={onEdit}
        onOpenGallery={onOpenGallery}
        onToggleDone={onToggleDone}
      />
    </div>
  );
}

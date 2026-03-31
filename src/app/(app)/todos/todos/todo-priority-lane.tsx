import type { TodoPriority, TodoResponse } from "@/lib/types/todo.types";
import { rwfCompact } from "@/lib/utils/currency";
import { EmptyState } from "@/components/ui/empty-state";
import { PRIORITY_META } from "./todos.constants";
import { TodoCard } from "./todo-card";

interface TodoPriorityLaneProps {
  entries: TodoResponse[];
  priority: TodoPriority;
  onDelete: (entry: TodoResponse) => void;
  onEdit: (entry: TodoResponse) => void;
  onOpenGallery: (todoId: string, index: number) => void;
}

export function TodoPriorityLane({
  entries,
  priority,
  onDelete,
  onEdit,
  onOpenGallery,
}: TodoPriorityLaneProps) {
  const meta = PRIORITY_META[priority];
  const total = entries.reduce((sum, entry) => sum + Number(entry.price), 0);

  return (
    <section className="rounded-[28px] border border-white/8 bg-background-secondary/60 p-4">
      <div
        className={`rounded-[22px] bg-gradient-to-r px-4 py-4 ${meta.railClass}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-heading-sm text-text-primary">
              {meta.label}
            </h3>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {meta.description}
            </p>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            {rwfCompact(total)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <TodoCard
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              onEdit={onEdit}
              onOpenGallery={onOpenGallery}
            />
          ))
        ) : (
          <div className="rounded-[22px] border border-white/8 bg-surface-elevated/65 p-4">
            <EmptyState
              title={`No ${meta.label.toLowerCase()} items`}
              description="Keep this lane empty until a purchase truly deserves space here."
            />
          </div>
        )}
      </div>
    </section>
  );
}

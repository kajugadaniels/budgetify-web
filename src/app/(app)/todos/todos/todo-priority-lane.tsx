import type { TodoResponse } from "@/lib/types/todo.types";
import { EmptyState } from "@/components/ui/empty-state";
import { TodoCard } from "./todo-card";

interface TodoPriorityLaneProps {
  entries: TodoResponse[];
  onDelete: (entry: TodoResponse) => void;
  onEdit: (entry: TodoResponse) => void;
  onOpenGallery: (todoId: string, index: number) => void;
}

export function TodoPriorityLane({
  entries,
  onDelete,
  onEdit,
  onOpenGallery,
}: TodoPriorityLaneProps) {
  return (
    <section>
      {entries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <TodoCard
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              onEdit={onEdit}
              onOpenGallery={onOpenGallery}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/8 bg-surface-elevated/65 p-4">
          <EmptyState
            title="No wishlist items yet"
            description="Add the things you want to buy and they will appear here in the order you created them."
          />
        </div>
      )}
    </section>
  );
}

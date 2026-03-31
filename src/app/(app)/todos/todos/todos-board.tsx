import type { TodoPriority, TodoResponse } from "@/lib/types/todo.types";
import { TodoPriorityLane } from "./todo-priority-lane";

interface TodosBoardProps {
  groupedEntries: Record<TodoPriority, TodoResponse[]>;
  onDelete: (entry: TodoResponse) => void;
  onEdit: (entry: TodoResponse) => void;
  onOpenGallery: (todoId: string, index: number) => void;
}

export function TodosBoard({
  groupedEntries,
  onDelete,
  onEdit,
  onOpenGallery,
}: TodosBoardProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {(Object.keys(groupedEntries) as TodoPriority[]).map((priority) => (
        <TodoPriorityLane
          key={priority}
          priority={priority}
          entries={groupedEntries[priority]}
          onDelete={onDelete}
          onEdit={onEdit}
          onOpenGallery={onOpenGallery}
        />
      ))}
    </div>
  );
}

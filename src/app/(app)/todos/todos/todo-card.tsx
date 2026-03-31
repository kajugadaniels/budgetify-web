import type { TodoResponse } from "@/lib/types/todo.types";
import { rwf } from "@/lib/utils/currency";
import { TodoImageCarousel } from "./todo-image-carousel";
import { PRIORITY_META } from "./todos.constants";
import { formatTodoDate } from "./todos.utils";

interface TodoCardProps {
  entry: TodoResponse;
  onDelete: (entry: TodoResponse) => void;
  onEdit: (entry: TodoResponse) => void;
  onOpenGallery: (todoId: string, index: number) => void;
}

export function TodoCard({
  entry,
  onDelete,
  onEdit,
  onOpenGallery,
}: TodoCardProps) {
  const meta = PRIORITY_META[entry.priority];

  return (
    <article className="glass-subtle rounded-[26px] p-3 md:p-4">
      <TodoImageCarousel
        images={entry.images}
        emptyDescription="Open edit to manage synced images when this item has them."
        emptyTitle="No preview image"
        heightClass="h-44"
        onImageClick={(index) => onOpenGallery(entry.id, index)}
      />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-primary">
            {entry.name}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Updated {formatTodoDate(entry.updatedAt)}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.chipClass}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-text-primary">
            {rwf(Number(entry.price))}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/60">
            {entry.imageCount} {entry.imageCount === 1 ? "image" : "images"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            className="rounded-full border border-danger/25 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/16"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

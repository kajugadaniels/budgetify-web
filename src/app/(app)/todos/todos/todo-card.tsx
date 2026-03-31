import type { TodoResponse } from "@/lib/types/todo.types";
import { rwf } from "@/lib/utils/currency";
import { TodoImageCarousel } from "./todo-image-carousel";
import { PRIORITY_META } from "./todos.constants";

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
    <article className="overflow-hidden rounded-[28px] border border-white/8 bg-background-secondary/72 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <TodoImageCarousel
        images={entry.images}
        emptyDescription="Open edit to manage synced images when this item has them."
        emptyTitle="No preview image"
        heightClass="h-48"
        onImageClick={(index) => onOpenGallery(entry.id, index)}
      />

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-text-primary md:text-lg">
            {entry.name}
          </p>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {rwf(Number(entry.price))}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.chipClass}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/8 pt-4">
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
    </article>
  );
}

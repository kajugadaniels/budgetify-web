import { PRIORITY_META } from "@/constant/todos/priority-meta";
import type { TodoResponse } from "@/lib/types/todo.types";
import { rwf } from "@/lib/utils/currency";
import { TodoImageCarousel } from "./todo-image-carousel";

interface TodoCardProps {
  busyDone: boolean;
  entry: TodoResponse;
  onDelete: (entry: TodoResponse) => void;
  onEdit: (entry: TodoResponse) => void;
  onOpenGallery: (todoId: string, index: number) => void;
  onToggleDone: (entry: TodoResponse) => void;
}

export function TodoCard({
  busyDone,
  entry,
  onDelete,
  onEdit,
  onOpenGallery,
  onToggleDone,
}: TodoCardProps) {
  const meta = PRIORITY_META[entry.priority];

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(199,191,167,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-3 shadow-[0_24px_44px_rgba(0,0,0,0.22)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

      <TodoImageCarousel
        images={entry.images}
        emptyDescription="Add a product image to give this wishlist item presence."
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
              <button
                type="button"
                onClick={() => onToggleDone(entry)}
                disabled={busyDone}
                className={
                  busyDone
                    ? "inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-secondary opacity-70"
                    : entry.done
                      ? "inline-flex rounded-full border border-success/30 bg-success/16 px-2.5 py-1 text-[11px] font-medium text-success transition-all hover:bg-success/22"
                      : "inline-flex rounded-full border border-danger/28 bg-danger/10 px-2.5 py-1 text-[11px] font-medium text-danger transition-all hover:bg-danger/16"
                }
              >
                {busyDone ? "Updating..." : entry.done ? "Done" : "Not done"}
              </button>
            </div>
            <p className="mt-3 truncate text-lg font-semibold tracking-heading-sm text-text-primary">
              {entry.name}
            </p>
          </div>

          <div className="shrink-0 rounded-[20px] px-4 py-3 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/65">
              Price
            </p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {rwf(Number(entry.price))}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/8 pt-4">
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

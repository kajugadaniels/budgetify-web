"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { TodoResponse } from "@/lib/types/todo.types";
import { TodoImageCarousel } from "./todo-image-carousel";
import { formatTodoDate, formatTodoSlideLabel } from "./todos.utils";

interface TodoGalleryDialogProps {
  entry: TodoResponse;
  initialIndex: number;
  onClose: () => void;
}

function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  if (index < 0) return 0;
  if (index >= total) return total - 1;
  return index;
}

export function TodoGalleryDialog({
  entry,
  initialIndex,
  onClose,
}: TodoGalleryDialogProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const resolvedIndex = clampIndex(activeIndex, entry.images.length);
  const selectedImage = entry.images[resolvedIndex];

  return (
    <Dialog onClose={onClose} className="sm:max-w-5xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
            Todo gallery
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
            {entry.name}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Close
        </button>
      </div>

      <TodoImageCarousel
        images={entry.images}
        currentIndex={resolvedIndex}
        onIndexChange={setActiveIndex}
        heightClass="h-[50vh] min-h-[320px]"
      />

      {selectedImage ? (
        <div className="mt-5 flex flex-col gap-3 rounded-[24px] border border-white/8 bg-background-secondary/70 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {formatTodoSlideLabel(resolvedIndex, entry.images.length)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Synced {formatTodoDate(selectedImage.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
              {selectedImage.format.toUpperCase()}
            </span>
            {selectedImage.isPrimary ? (
              <span className="rounded-full border border-primary/25 bg-primary/14 px-2.5 py-1 text-[11px] font-medium text-primary">
                Cover image
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}

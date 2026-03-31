"use client";

import { useState } from "react";
import type { TodoImageResponse } from "@/lib/types/todo.types";
import { cn } from "@/lib/utils/cn";
import { formatTodoSlideLabel } from "./todos.utils";

interface TodoImageCarouselProps {
  images: TodoImageResponse[];
  className?: string;
  currentIndex?: number;
  emptyDescription?: string;
  emptyTitle?: string;
  heightClass?: string;
  onImageClick?: (index: number) => void;
  onIndexChange?: (index: number) => void;
}

function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  if (index < 0) return 0;
  if (index >= total) return total - 1;
  return index;
}

export function TodoImageCarousel({
  images,
  className,
  currentIndex,
  emptyDescription = "No synced images yet",
  emptyTitle = "No images",
  heightClass = "h-56",
  onImageClick,
  onIndexChange,
}: TodoImageCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const hasImages = images.length > 0;
  const resolvedIndex = clampIndex(
    currentIndex ?? internalIndex,
    images.length,
  );

  function setIndex(index: number) {
    const nextIndex = clampIndex(index, images.length);

    if (currentIndex === undefined) {
      setInternalIndex(nextIndex);
    }

    onIndexChange?.(nextIndex);
  }

  if (!hasImages) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-[24px] border border-white/8 bg-surface-elevated text-center",
          heightClass,
          className,
        )}
      >
        <div className="px-6">
          <p className="text-sm font-semibold text-text-primary">{emptyTitle}</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/8 bg-surface-elevated",
        heightClass,
        className,
      )}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${resolvedIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onImageClick?.(index)}
            className="relative h-full min-w-full bg-cover bg-center text-left"
            style={{ backgroundImage: `url(${image.imageUrl})` }}
            aria-label={`Open image ${index + 1}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <span className="rounded-full border border-white/10 bg-background/55 px-2.5 py-1 text-[11px] font-medium text-text-primary backdrop-blur-sm">
          {formatTodoSlideLabel(resolvedIndex, images.length)}
        </span>
        {images[resolvedIndex]?.isPrimary ? (
          <span className="rounded-full border border-primary/25 bg-primary/14 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur-sm">
            Cover
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setIndex(resolvedIndex - 1)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-background/60 text-text-primary backdrop-blur-sm transition-colors hover:bg-background/80"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex(resolvedIndex + 1)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-background/60 text-text-primary backdrop-blur-sm transition-colors hover:bg-background/80"
            aria-label="Next image"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === resolvedIndex
                    ? "w-7 bg-primary"
                    : "w-1.5 bg-white/35 hover:bg-white/55",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

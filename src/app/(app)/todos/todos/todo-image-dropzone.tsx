"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { MAX_TODO_IMAGES } from "./todos.constants";
import { formatTodoFileSize } from "./todos.utils";

interface TodoImageDropzoneProps {
  files: File[];
  mode: "create" | "edit";
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function TodoImageDropzone({
  files,
  mode,
  onAddFiles,
  onRemoveFile,
}: TodoImageDropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.previewUrl);
      }
    };
  }, [previews]);

  function handleFiles(nextFiles: FileList | null) {
    if (!nextFiles) return;
    onAddFiles(Array.from(nextFiles));
  }

  return (
    <section className="rounded-[24px] border border-white/8 bg-background-secondary/70 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/60">
            {mode === "create" ? "Upload images" : "Add more images"}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {mode === "create"
              ? "Drop product images here before you create the item. A new wishlist item needs at least one image."
              : "Append more images to this wishlist item, then save once to upload them."}
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
          {files.length} / {MAX_TODO_IMAGES}
        </span>
      </div>

      <label
        htmlFor={inputId}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[164px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed px-6 py-7 text-center transition-all",
          isDragging
            ? "border-primary bg-primary/8"
            : "border-white/12 bg-surface-elevated/80 hover:border-primary/35 hover:bg-surface-elevated",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl text-primary">
          +
        </div>
        <p className="mt-4 text-sm font-semibold text-text-primary">
          Drop JPEG, PNG, or WebP images here
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
          Click to browse, or drag files straight into the dropzone. Up to 6
          images, 10MB each.
        </p>
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />

      {previews.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {previews.map((preview, index) => (
            <article
              key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
              className="overflow-hidden rounded-[22px] border border-white/8 bg-surface-elevated/85"
            >
              <div
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${preview.previewUrl})` }}
              />
              <div className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {preview.file.name}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {formatTodoFileSize(preview.file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/18"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

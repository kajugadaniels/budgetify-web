"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { MAX_TODO_IMAGES } from "@/constant/todos/upload";
import { cn } from "@/lib/utils/cn";
import { formatTodoFileSize } from "./todos.utils";

interface TodoImageDropzoneProps {
  embedded?: boolean;
  files: File[];
  mode: "create" | "edit";
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function TodoImageDropzone({
  embedded = false,
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
    <div className={cn("flex h-full flex-col", !embedded && "rounded-[22px] border border-white/8 bg-background-secondary/60 p-3.5")}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
            {mode === "create" ? "Images" : "Add images"}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Optional. JPEG, PNG, or WebP.
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
          "flex min-h-[136px] flex-1 cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-4 py-5 text-center transition-all",
          isDragging
            ? "border-primary bg-primary/8"
            : "border-white/12 bg-surface-elevated/80 hover:border-primary/35 hover:bg-surface-elevated",
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-primary">
          +
        </div>
        <p className="mt-3 text-sm font-semibold text-text-primary">
          Drop images here
        </p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-text-secondary">
          Click to browse or drag files in.
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
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <article
              key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
              className="overflow-hidden rounded-[16px] border border-white/8 bg-surface-elevated/85"
            >
              <div
                className="relative aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: `url(${preview.previewUrl})` }}
              >
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  aria-label={`Remove ${preview.file.name}`}
                  className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-danger/30 bg-danger/85 text-[11px] font-medium text-white transition-colors hover:bg-danger"
                >
                  ×
                </button>
              </div>
              <div className="px-2.5 py-2">
                <p className="truncate text-[11px] font-medium text-text-primary">
                  {preview.file.name}
                </p>
                <p className="mt-0.5 text-[10px] text-text-secondary">
                  {formatTodoFileSize(preview.file.size)}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

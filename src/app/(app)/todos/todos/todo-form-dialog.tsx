"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { TodoResponse } from "@/lib/types/todo.types";
import { cn } from "@/lib/utils/cn";
import { TodoImageCarousel } from "./todo-image-carousel";
import { PRIORITY_META } from "./todos.constants";
import type { TodoFormValues } from "./todos-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

interface TodoFormDialogProps {
  editingEntry: TodoResponse | null;
  form: TodoFormValues;
  imageBusyKey: string | null;
  mode: "create" | "edit";
  saving: boolean;
  onChange: (next: Partial<TodoFormValues>) => void;
  onClose: () => void;
  onDeleteImage: (imageId: string) => void;
  onOpenGallery: (index: number) => void;
  onSetCover: (imageId: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function TodoFormDialog({
  editingEntry,
  form,
  imageBusyKey,
  mode,
  saving,
  onChange,
  onClose,
  onDeleteImage,
  onOpenGallery,
  onSetCover,
  onSubmit,
}: TodoFormDialogProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = editingEntry?.images ?? [];
  const resolvedImageIndex =
    images.length > 0 ? Math.min(activeImageIndex, images.length - 1) : 0;
  const selectedImage = images[resolvedImageIndex];

  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          {mode === "edit" ? "Edit item" : "New item"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
          {mode === "edit" ? "Update wishlist item" : "Add wishlist item"}
        </h2>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Item name">
          <input
            type="text"
            value={form.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className={INPUT_CLASS}
            placeholder="MacBook Air"
            maxLength={120}
            required
          />
        </Field>

        <Field label="Planned price">
          <input
            type="number"
            value={form.price}
            onChange={(event) => onChange({ price: event.target.value })}
            className={INPUT_CLASS}
            placeholder="1750000"
            min={1}
            required
          />
        </Field>

        <Field label="Priority">
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRIORITY_META).map(([value, meta]) => {
              const selected = form.priority === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({ priority: value as TodoFormValues["priority"] })
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                    selected
                      ? "border-primary bg-primary text-background"
                      : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border text-[10px]",
                      selected
                        ? "border-background/20 bg-background/15 text-background"
                        : "border-white/10 bg-white/6 text-transparent",
                    )}
                  >
                    ✓
                  </span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </Field>

        {mode === "edit" ? (
          <section className="rounded-[24px] border border-white/8 bg-background-secondary/70 p-4">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/60">
                Synced images
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Swipe through existing product images, open them large, choose the
                cover, or remove extras.
              </p>
            </div>

            <TodoImageCarousel
              images={images}
              currentIndex={resolvedImageIndex}
              emptyDescription="This item has no synced images yet."
              emptyTitle="No synced images"
              heightClass="h-52"
              onImageClick={onOpenGallery}
              onIndexChange={setActiveImageIndex}
            />

            {selectedImage ? (
              <div className="mt-4 flex flex-col gap-3 rounded-[20px] border border-white/8 bg-surface-elevated/85 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {selectedImage.isPrimary ? "Current cover image" : "Selected image"}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {selectedImage.format.toUpperCase()} file ready for cover actions
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSetCover(selectedImage.id)}
                    disabled={
                      imageBusyKey !== null || selectedImage.isPrimary
                    }
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Set cover
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteImage(selectedImage.id)}
                    disabled={imageBusyKey !== null}
                    className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/18 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Save changes"
                : "Add item"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

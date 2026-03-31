"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { TodoResponse } from "@/lib/types/todo.types";
import { cn } from "@/lib/utils/cn";
import { TodoImageCarousel } from "./todo-image-carousel";
import { TodoImageDropzone } from "./todo-image-dropzone";
import { PRIORITY_META } from "./todos.constants";
import type { TodoFormValues } from "./todos-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

interface TodoFormDialogProps {
  editingEntry: TodoResponse | null;
  form: TodoFormValues;
  imageBusyKey: string | null;
  mode: "create" | "edit";
  pendingImages: File[];
  saving: boolean;
  onAddPendingImages: (files: File[]) => void;
  onChange: (next: Partial<TodoFormValues>) => void;
  onClose: () => void;
  onDeleteImage: (imageId: string) => void;
  onOpenGallery: (index: number) => void;
  onRemovePendingImage: (index: number) => void;
  onSetCover: (imageId: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function TodoFormDialog({
  editingEntry,
  form,
  imageBusyKey,
  mode,
  pendingImages,
  saving,
  onAddPendingImages,
  onChange,
  onClose,
  onDeleteImage,
  onOpenGallery,
  onRemovePendingImage,
  onSetCover,
  onSubmit,
}: TodoFormDialogProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [step, setStep] = useState<0 | 1>(0);
  const images = editingEntry?.images ?? [];
  const resolvedImageIndex =
    images.length > 0 ? Math.min(activeImageIndex, images.length - 1) : 0;
  const selectedImage = images[resolvedImageIndex];
  const canContinue =
    form.name.trim().length > 0 &&
    form.price.trim().length > 0 &&
    Number(form.price) > 0;
  const stepItems = useMemo(
    () => [
      {
        index: 0 as const,
        eyebrow: "Step 1",
        title: "Details",
        description: "Name, amount, and priority for the item.",
      },
      {
        index: 1 as const,
        eyebrow: "Step 2",
        title: "Images",
        description:
          mode === "create"
            ? "Add the product images required for creation."
            : "Upload more images and manage the ones already synced.",
      },
    ],
    [mode],
  );

  return (
    <Dialog onClose={onClose} className="sm:max-w-5xl">
      <form className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]" onSubmit={onSubmit}>
        <aside className="rounded-[28px] border border-white/8 bg-background-secondary/70 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
            {mode === "edit" ? "Edit item" : "New item"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
            {mode === "edit" ? "Update wishlist item" : "Add wishlist item"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Move through two short steps: capture the purchase details first,
            then handle the images before saving.
          </p>

          <div className="mt-6 space-y-3">
            {stepItems.map((item) => {
              const active = step === item.index;
              const complete = step > item.index;

              return (
                <button
                  key={item.index}
                  type="button"
                  onClick={() => setStep(item.index)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[22px] border px-4 py-4 text-left transition-all",
                    active
                      ? "border-primary/35 bg-primary/10"
                      : "border-white/8 bg-white/3 hover:border-white/14",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      active || complete
                        ? "border-primary/30 bg-primary text-background"
                        : "border-white/10 bg-white/5 text-text-secondary",
                    )}
                  >
                    {complete ? "✓" : item.index + 1}
                  </span>

                  <span className="block min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/60">
                      {item.eyebrow}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-text-primary">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-text-secondary">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-[28px] border border-white/8 bg-background-secondary/70 p-5 md:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
                {stepItems[step].eyebrow}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
                {stepItems[step].title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                {stepItems[step].description}
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
              {step + 1} / 2
            </span>
          </div>

          {step === 0 ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
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
              </div>

              <div className="rounded-[24px] border border-white/8 bg-surface-elevated/85 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/60">
                  Quick preview
                </p>
                <div className="mt-4 rounded-[22px] border border-white/8 bg-background/45 p-4">
                  <p className="truncate text-lg font-semibold text-text-primary">
                    {form.name.trim() || "Untitled wishlist item"}
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Priority: {PRIORITY_META[form.priority].label}
                  </p>
                  <p className="mt-5 text-2xl font-semibold tracking-heading-sm text-text-primary">
                    {form.price.trim().length > 0 ? `RWF ${form.price}` : "RWF 0"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <TodoImageDropzone
                files={pendingImages}
                mode={mode}
                onAddFiles={onAddPendingImages}
                onRemoveFile={onRemovePendingImage}
              />

              {mode === "edit" ? (
                <section className="rounded-[24px] border border-white/8 bg-surface-elevated/55 p-4">
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/60">
                      Synced images
                    </p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      Swipe through existing product images, open them large,
                      choose the cover, or remove extras.
                    </p>
                  </div>

                  <TodoImageCarousel
                    images={images}
                    currentIndex={resolvedImageIndex}
                    emptyDescription="This item has no synced images yet."
                    emptyTitle="No synced images"
                    heightClass="h-56"
                    onImageClick={onOpenGallery}
                    onIndexChange={setActiveImageIndex}
                  />

                  {selectedImage ? (
                    <div className="mt-4 flex flex-col gap-3 rounded-[20px] border border-white/8 bg-background/40 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {selectedImage.isPrimary
                            ? "Current cover image"
                            : "Selected image"}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {selectedImage.format.toUpperCase()} file ready for cover
                          actions
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSetCover(selectedImage.id)}
                          disabled={imageBusyKey !== null || selectedImage.isPrimary}
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
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Cancel
              </button>
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Back
                </button>
              ) : null}
            </div>

            {step === 0 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={!canContinue}
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Continue to images
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving || (mode === "create" && pendingImages.length === 0)}
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save changes"
                    : "Add item"}
              </button>
            )}
          </div>
        </section>
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

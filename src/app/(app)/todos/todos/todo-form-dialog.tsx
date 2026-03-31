"use client";

import { useState } from "react";
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

  const stepDescription =
    step === 0
      ? "Start with the name, planned price, and priority."
      : mode === "create"
        ? "Add the product images required before creating this item."
        : "Upload more images and manage the ones already synced.";

  return (
    <Dialog onClose={onClose} className="sm:w-[70vw] sm:max-w-[70vw]">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              {mode === "edit" ? "Edit item" : "New item"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
              {mode === "edit" ? "Update wishlist item" : "Add wishlist item"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              {stepDescription}
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-text-secondary">
            {step + 1} / 2
          </span>
        </div>

        <div className="flex gap-2 rounded-[22px] border border-white/8 bg-background-secondary/60 p-1.5">
          <StepButton
            active={step === 0}
            title="Details"
            eyebrow="Step 1"
            onClick={() => setStep(0)}
          />
          <StepButton
            active={step === 1}
            disabled={!canContinue}
            title="Images"
            eyebrow="Step 2"
            onClick={() => {
              if (canContinue) {
                setStep(1);
              }
            }}
          />
        </div>

        <section className="rounded-[28px] border border-white/8 bg-background-secondary/70 p-5 md:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              {step === 0 ? "Step 1" : "Step 2"}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
              {step === 0 ? "Item details" : "Images"}
            </h3>
          </div>

          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Item name" className="md:col-span-2">
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

              <Field label="Selected priority">
                <div className="flex h-full items-center rounded-2xl border border-white/8 bg-surface-elevated px-4 py-3 text-sm font-medium text-text-primary">
                  {PRIORITY_META[form.priority].label}
                </div>
              </Field>

              <Field label="Priority" className="md:col-span-2">
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
                      Review the images already attached, open them large, set the
                      cover, or remove extras.
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

interface StepButtonProps {
  active: boolean;
  disabled?: boolean;
  eyebrow: string;
  onClick: () => void;
  title: string;
}

function StepButton({
  active,
  disabled = false,
  eyebrow,
  onClick,
  title,
}: StepButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 rounded-[18px] px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45",
        active ? "bg-primary text-background" : "text-text-secondary hover:text-text-primary",
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.22em]",
          active ? "text-background/70" : "text-text-secondary/60",
        )}
      >
        {eyebrow}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold",
          active ? "text-background" : "text-text-primary",
        )}
      >
        {title}
      </p>
    </button>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

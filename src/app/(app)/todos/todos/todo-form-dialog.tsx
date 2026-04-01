"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { PRIORITY_META } from "@/constant/todos/priority-meta";
import type { TodoResponse } from "@/lib/types/todo.types";
import { cn } from "@/lib/utils/cn";
import { TodoImageCarousel } from "./todo-image-carousel";
import { TodoImageDropzone } from "./todo-image-dropzone";
import type { TodoFormValues } from "./todos-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

const DONE_STATE_OPTIONS = [
  { value: false, label: "Not done" },
  { value: true, label: "Done" },
] as const;

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
  const savedImagesCount = images.length;

  return (
    <Dialog onClose={onClose} className="sm:max-w-2xl p-4 sm:p-5">
      <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(199,191,167,0.14),transparent_72%)]" />

        <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {mode === "edit" ? "Edit todo" : "New todo"}
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-heading-md text-text-primary sm:text-[1.35rem]">
              {mode === "edit" ? "Update wishlist item" : "Add wishlist item"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <form
          className="relative z-10 space-y-4"
          onSubmit={(event) => {
            if (step === 0) {
              event.preventDefault();
              if (canContinue) {
                setStep(1);
              }
              return;
            }

            onSubmit(event);
          }}
        >
          <div className="flex gap-2 rounded-[20px] border border-white/8 bg-background/32 p-1">
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

          {step === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Item name" className="sm:col-span-2">
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

              <Field label="Planned price" className="sm:col-span-2">
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

              <Field label="Priority" className="sm:col-span-2">
                <div className="">
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
                          "inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                          selected
                            ? meta.selectedClass
                            : "border-border bg-surface-elevated/70 text-text-secondary hover:text-text-primary",
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

              <Field label="Progress" className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  {DONE_STATE_OPTIONS.map((option) => {
                    const selected = form.done === option.value;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChange({ done: option.value })}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                          selected
                            ? option.value
                              ? "border-success bg-success text-background"
                              : "border-danger bg-danger text-background"
                            : "border-border bg-surface-elevated/70 text-text-secondary hover:text-text-primary",
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
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          ) : (
            <div className="space-y-4">
              <section className="rounded-[22px] border border-white/8 bg-surface-elevated/55 p-3.5 sm:p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
                      Image workspace
                    </p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                      Keep uploads and saved visuals in one compact area.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                      Pending {pendingImages.length}
                    </span>
                    {mode === "edit" ? (
                      <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                        Saved {savedImagesCount}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className={cn("grid gap-3", mode === "edit" && "lg:grid-cols-2")}>
                  <div className="flex min-h-[260px] flex-col rounded-[18px] border border-white/8 bg-background/34 p-3">
                    <TodoImageDropzone
                      embedded
                      files={pendingImages}
                      mode={mode}
                      onAddFiles={onAddPendingImages}
                      onRemoveFile={onRemovePendingImage}
                    />
                  </div>

                  {mode === "edit" ? (
                    <div className="flex min-h-[260px] flex-col rounded-[18px] border border-white/8 bg-background/34 p-3">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
                            Saved images
                          </p>
                          <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Cover and cleanup controls stay here.
                          </p>
                        </div>

                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                          {savedImagesCount}
                        </span>
                      </div>

                      <TodoImageCarousel
                        images={images}
                        currentIndex={resolvedImageIndex}
                        emptyDescription="This item has no synced images yet."
                        emptyTitle="No synced images"
                        heightClass="h-[136px]"
                        onImageClick={onOpenGallery}
                        onIndexChange={setActiveImageIndex}
                      />

                      {selectedImage ? (
                        <div className="mt-3 flex flex-col gap-2 rounded-[16px] border border-white/8 bg-background/40 p-2.5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-primary">
                              {selectedImage.isPrimary
                                ? "Current cover image"
                                : "Selected image"}
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-text-secondary">
                              {selectedImage.format.toUpperCase()} asset ready for actions.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
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
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:min-w-[120px]"
              >
                Cancel
              </button>
            </div>

            {step === 0 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={!canContinue}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[150px]"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[160px]"
              >
                {saving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save changes"
                    : "Add item"}
              </button>
            )}
          </div>
        </form>
      </div>
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
        "flex-1 rounded-[16px] px-3.5 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45",
        active
          ? "bg-primary text-background shadow-[0_10px_30px_rgba(199,191,167,0.2)]"
          : "text-text-secondary hover:text-text-primary",
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

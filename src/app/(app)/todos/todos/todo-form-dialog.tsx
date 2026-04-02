"use client";

import { useState } from "react";
import { PRIORITY_META } from "@/constant/todos/priority-meta";
import type { TodoResponse } from "@/lib/types/todo.types";
import { cn } from "@/lib/utils/cn";
import { TodoImageCarousel } from "./todo-image-carousel";
import { TodoImageDropzone } from "./todo-image-dropzone";
import { TodoScheduleCalendar } from "./todo-schedule-calendar";
import { TodoWeekdayPicker } from "./todo-weekday-picker";
import type { TodoFormValues } from "./todos-page.types";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

const FREQUENCY_OPTIONS = [
  { value: "ONCE", label: "Once" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
] as const;

const DONE_STATE_OPTIONS = [
  { value: false, label: "Not done" },
  { value: true, label: "Done" },
] as const;

const STEP_META = [
  {
    step: 0 as const,
    eyebrow: "Step 1",
    title: "Core",
    description: "Name, amount, and state.",
  },
  {
    step: 1 as const,
    eyebrow: "Step 2",
    title: "Schedule",
    description: "Frequency and dates.",
  },
  {
    step: 2 as const,
    eyebrow: "Step 3",
    title: "Images",
    description: "Optional visuals and submit.",
  },
] as const;

interface TodoFormWizardProps {
  editingEntry: TodoResponse | null;
  form: TodoFormValues;
  imageBusyKey: string | null;
  mode: "create" | "edit";
  pendingImages: File[];
  saving: boolean;
  onAddPendingImages: (files: File[]) => void;
  onBack: () => void;
  onChange: (next: Partial<TodoFormValues>) => void;
  onDeleteImage: (imageId: string) => void;
  onOpenGallery: (index: number) => void;
  onRemovePendingImage: (index: number) => void;
  onSetCover: (imageId: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function TodoFormWizard({
  editingEntry,
  form,
  imageBusyKey,
  mode,
  pendingImages,
  saving,
  onAddPendingImages,
  onBack,
  onChange,
  onDeleteImage,
  onOpenGallery,
  onRemovePendingImage,
  onSetCover,
  onSubmit,
}: TodoFormWizardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const images = editingEntry?.images ?? [];
  const resolvedImageIndex =
    images.length > 0 ? Math.min(activeImageIndex, images.length - 1) : 0;
  const selectedImage = images[resolvedImageIndex];
  const scheduleReady =
    form.frequency === "ONCE"
      ? true
      : form.frequency === "WEEKLY"
        ? form.frequencyDays.length > 0 && form.occurrenceDates.length > 0
        : form.occurrenceDates.length > 0;
  const basicsReady =
    form.name.trim().length > 0 &&
    form.price.trim().length > 0 &&
    Number(form.price) > 0;
  const canSubmit = basicsReady && scheduleReady;
  const savedImagesCount = images.length;

  function canVisitStep(nextStep: 0 | 1 | 2): boolean {
    if (nextStep === 0) {
      return true;
    }

    if (nextStep === 1) {
      return basicsReady;
    }

    return basicsReady && scheduleReady;
  }

  function handleStepChange(nextStep: 0 | 1 | 2) {
    if (canVisitStep(nextStep)) {
      setStep(nextStep);
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl">
      <form
        className="overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] sm:p-5"
        onSubmit={(event) => {
          if (step === 0) {
            event.preventDefault();
            if (basicsReady) {
              setStep(1);
            }
            return;
          }

          if (step === 1) {
            event.preventDefault();
            if (canSubmit) {
              setStep(2);
            }
            return;
          }

          onSubmit(event);
        }}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                <span aria-hidden="true">←</span>
                Back to todos
              </button>

              <h1 className="mt-3 text-[1.4rem] font-semibold tracking-[-0.045em] text-text-primary">
                {mode === "edit" ? "Edit wishlist item" : "Add wishlist item"}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {STEP_META[step].description}
              </p>
            </div>

            <span className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {step + 1} of 3
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {STEP_META.map((item) => (
              <StepButton
                key={item.step}
                active={step === item.step}
                available={canVisitStep(item.step)}
                description={item.description}
                eyebrow={item.eyebrow}
                title={item.title}
                onClick={() => handleStepChange(item.step)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3 pb-28 sm:pb-32">
          {step === 0 ? (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
              <section className="rounded-[22px] border border-white/8 bg-background/24 p-4">
                <div className="grid gap-3">
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
                </div>
              </section>

              <section className="rounded-[22px] border border-white/8 bg-background/24 p-4">
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
                            onChange({
                              priority: value as TodoFormValues["priority"],
                            })
                          }
                          className={cn(
                            "inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
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

                <Field label="Progress" className="mt-3">
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
                            "inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
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
              </section>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3">
              <section className="rounded-[22px] border border-white/8 bg-background/24 p-4">
                <Field label="Schedule">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {FREQUENCY_OPTIONS.map((option) => {
                      const selected = form.frequency === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            onChange({
                              frequency: option.value,
                              frequencyDays:
                                option.value === "WEEKLY"
                                  ? form.frequencyDays
                                  : [],
                              occurrenceDates:
                                option.value === "ONCE"
                                  ? [form.startDate]
                                  : option.value === "WEEKLY"
                                    ? form.occurrenceDates
                                    : [],
                            })
                          }
                          className={cn(
                            "inline-flex items-center justify-center rounded-2xl border px-3 py-2 text-sm font-medium transition-all",
                            selected
                              ? "border-primary bg-primary text-background shadow-[0_12px_28px_rgba(199,191,167,0.18)]"
                              : "border-border bg-surface-elevated/70 text-text-secondary hover:text-text-primary",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Starts on">
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        onChange({ startDate: event.target.value })
                      }
                      className={INPUT_CLASS}
                      required
                    />
                  </Field>

                  <Field label="Ends on">
                    <input
                      type="date"
                      value={form.endDate}
                      readOnly
                      className={`${INPUT_CLASS} cursor-not-allowed opacity-70`}
                    />
                  </Field>
                </div>
              </section>

              {form.frequency === "WEEKLY" ? (
                <section className="rounded-[22px] border border-white/8 bg-background/24 p-4">
                  <Field label="Weekdays">
                    <TodoWeekdayPicker
                      selectedDays={form.frequencyDays}
                      onChange={(nextDays) =>
                        onChange({ frequencyDays: nextDays })
                      }
                    />
                  </Field>
                </section>
              ) : null}

              {form.frequency === "MONTHLY" || form.frequency === "YEARLY" ? (
                <section className="rounded-[22px] border border-white/8 bg-background/24 p-4">
                  <Field label="Occurrence dates">
                    <TodoScheduleCalendar
                      endDate={form.endDate}
                      selectedDates={form.occurrenceDates}
                      startDate={form.startDate}
                      onChange={(nextDates) =>
                        onChange({ occurrenceDates: nextDates })
                      }
                    />
                  </Field>
                </section>
              ) : null}

              <section className="rounded-[22px] border border-white/8 bg-background/24 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                      Planned occurrences
                    </p>
                    <p className="mt-1 text-sm text-text-primary">
                      {form.frequency === "ONCE"
                        ? "One expense-ready occurrence"
                        : `${form.occurrenceDates.length} occurrence${form.occurrenceDates.length === 1 ? "" : "s"} planned`}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                    {form.occurrenceDates.length}
                  </span>
                </div>
              </section>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-3">
              <section className="grid gap-2 sm:grid-cols-3">
                <MiniStat label="Item" value={form.name.trim() || "Untitled"} />
                <MiniStat
                  label="Frequency"
                  value={
                    FREQUENCY_OPTIONS.find(
                      (option) => option.value === form.frequency,
                    )?.label ?? "Once"
                  }
                />
                <MiniStat
                  label={mode === "edit" ? "Saved" : "Pending"}
                  value={
                    mode === "edit"
                      ? String(savedImagesCount)
                      : String(pendingImages.length)
                  }
                />
              </section>

              <section className="rounded-[22px] border border-white/8 bg-background/24 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
                      Image workspace
                    </p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                      Images are optional.
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

                <div className="flex h-[360px] flex-col gap-3 overflow-y-auto pr-1">
                  <div className="flex h-[180px] flex-none flex-col rounded-[18px] border border-white/8 bg-background/34 p-3">
                    <TodoImageDropzone
                      embedded
                      files={pendingImages}
                      mode={mode}
                      onAddFiles={onAddPendingImages}
                      onRemoveFile={onRemovePendingImage}
                    />
                  </div>

                  {mode === "edit" ? (
                    <div className="flex h-[180px] flex-none flex-col rounded-[18px] border border-white/8 bg-background/34 p-3">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
                            Saved images
                          </p>
                          <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Manage the current cover here.
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
                        heightClass="h-[86px]"
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
                              {selectedImage.format.toUpperCase()} asset ready
                              for actions.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
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
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 z-20 -mx-4 mt-2 border-t border-white/8 bg-[linear-gradient(180deg,rgba(15,15,15,0.14),rgba(15,15,15,0.94))] px-4 py-3 backdrop-blur-xl sm:-mx-5 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:min-w-[130px]"
              >
                Cancel
              </button>

              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => (current - 1) as 0 | 1 | 2)}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:min-w-[130px]"
                >
                  Previous
                </button>
              ) : null}
            </div>

            {step < 2 ? (
              <button
                type="submit"
                disabled={step === 0 ? !basicsReady : !canSubmit}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[150px]"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving || !canSubmit}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[170px]"
              >
                {saving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save changes"
                    : "Add item"}
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

interface StepButtonProps {
  active: boolean;
  available: boolean;
  description: string;
  eyebrow: string;
  onClick: () => void;
  title: string;
}

function StepButton({
  active,
  available,
  description,
  eyebrow,
  onClick,
  title,
}: StepButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!available}
      className={cn(
        "w-full rounded-[18px] border px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45",
        active
          ? "border-primary/18 bg-primary/10 text-text-primary"
          : "border-white/8 bg-background/24 text-text-secondary hover:text-text-primary",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.2em]",
          active ? "text-primary" : "text-text-secondary/56",
        )}
      >
        {eyebrow}
      </p>
      <p className="mt-1 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[11px] leading-5 text-text-secondary">
        {description}
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-background/24 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/54">
        {label}
      </p>
      <p className="mt-1.5 truncate text-sm font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

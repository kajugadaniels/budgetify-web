"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { MAX_TODO_IMAGES } from "@/constant/todos/upload";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createTodo,
  deleteTodoImage,
  getTodo,
  updateTodo,
} from "@/lib/api/todos/todos.api";
import type { CreateTodoRequest, TodoResponse } from "@/lib/types/todo.types";
import { TodoFormWizard } from "./todo-form-dialog";
import { TodoGalleryDialog } from "./todo-gallery-dialog";
import type { TodoFormValues } from "./todos-page.types";
import {
  applyTodoFormPatch,
  createEmptyTodoForm,
  createTodoFormFromEntry,
  validateTodoUploadFile,
} from "./todos.utils";

interface TodoFormPageProps {
  mode: "create" | "edit";
}

export function TodoFormPage({ mode }: TodoFormPageProps) {
  const { token } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const params = useParams<{ todoId: string }>();
  const todoId =
    mode === "edit" ? normaliseRouteParam(params.todoId) : null;

  const [editingEntry, setEditingEntry] = useState<TodoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [imageBusyKey, setImageBusyKey] = useState<string | null>(null);
  const [loadingEntry, setLoadingEntry] = useState(mode === "edit");
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TodoFormValues>(() => createEmptyTodoForm());
  const [initialisedEntryId, setInitialisedEntryId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (mode !== "edit") {
      setLoadingEntry(false);
      return;
    }

    const currentTodoId = todoId;

    if (!token || !currentTodoId) {
      return;
    }

    let ignore = false;

    async function loadTodoEntry(requestTodoId: string) {
      setLoadingEntry(true);
      setError(null);

      try {
        const response = await getTodo(
          token as string,
          requestTodoId as string,
        );

        if (!ignore) {
          setEditingEntry(response);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "This wishlist item could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoadingEntry(false);
        }
      }
    }

    void loadTodoEntry(currentTodoId);

    return () => {
      ignore = true;
    };
  }, [mode, retryKey, token, todoId]);

  useEffect(() => {
    if (
      mode === "edit" &&
      editingEntry &&
      initialisedEntryId !== editingEntry.id
    ) {
      setForm(createTodoFormFromEntry(editingEntry));
      setPendingImages([]);
      setInitialisedEntryId(editingEntry.id);
    }
  }, [editingEntry, initialisedEntryId, mode]);

  function handleBack() {
    router.push("/todos");
  }

  function updateForm(next: Partial<TodoFormValues>) {
    setForm((current) => applyTodoFormPatch(current, next));
  }

  function handleAddPendingImages(files: File[]) {
    if (files.length === 0) return;

    const nextFiles: File[] = [];
    const errors: string[] = [];
    const remainingSlots = Math.max(MAX_TODO_IMAGES - pendingImages.length, 0);

    if (remainingSlots === 0) {
      toast.error(`You can attach up to ${MAX_TODO_IMAGES} images per save.`);
      return;
    }

    for (const file of files) {
      const validationError = validateTodoUploadFile(file);

      if (validationError) {
        errors.push(validationError);
        continue;
      }

      if (nextFiles.length >= remainingSlots) {
        errors.push(`You can attach up to ${MAX_TODO_IMAGES} images per save.`);
        break;
      }

      nextFiles.push(file);
    }

    if (nextFiles.length > 0) {
      setPendingImages((current) => [...current, ...nextFiles]);
    }

    if (errors.length > 0) {
      toast.error(errors[0] ?? "Some images could not be added.");
    }
  }

  function handleRemovePendingImage(index: number) {
    setPendingImages((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) return;

    const price = Number(form.price);

    if (!form.name.trim() || Number.isNaN(price) || price <= 0) {
      toast.error("Enter a name and a price greater than zero.");
      return;
    }

    if (form.frequency === "WEEKLY" && form.frequencyDays.length === 0) {
      toast.error("Select at least one weekday for this recurring todo.");
      return;
    }

    if (form.frequency !== "ONCE" && form.occurrenceDates.length === 0) {
      toast.error("Select at least one occurrence for this recurring todo.");
      return;
    }

    const payload: CreateTodoRequest = {
      name: form.name.trim(),
      price,
      priority: form.priority,
      done: form.done,
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate,
      frequencyDays: form.frequencyDays,
      occurrenceDates: form.occurrenceDates,
    };

    setSaving(true);

    try {
      if (mode === "edit" && todoId) {
        await updateTodo(token, todoId, payload, pendingImages);
        toast.success("Wishlist item updated.");
      } else {
        await createTodo(token, payload, pendingImages);
        toast.success("Wishlist item added.");
      }

      router.push("/todos");
    } catch (saveError) {
      toast.error(
        saveError instanceof ApiError
          ? saveError.message
          : "Wishlist item could not be saved right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSetCover(imageId: string) {
    if (!token || !editingEntry) return;

    setImageBusyKey(`cover:${imageId}`);

    try {
      const updatedTodo = await updateTodo(token, editingEntry.id, {
        primaryImageId: imageId,
      });
      setEditingEntry(updatedTodo);
      toast.success("Cover image updated.");
    } catch (imageError) {
      toast.error(
        imageError instanceof ApiError
          ? imageError.message
          : "Cover image could not be updated.",
      );
    } finally {
      setImageBusyKey(null);
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!token || !editingEntry) return;

    setImageBusyKey(`delete:${imageId}`);

    try {
      await deleteTodoImage(token, editingEntry.id, imageId);
      const refreshedTodo = await getTodo(token, editingEntry.id);
      setEditingEntry(refreshedTodo);
      toast.info("Image removed from wishlist item.");
    } catch (imageError) {
      toast.error(
        imageError instanceof ApiError
          ? imageError.message
          : "Image could not be removed.",
      );
    } finally {
      setImageBusyKey(null);
    }
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {mode === "edit" && !todoId ? (
          <EmptyState
            title="Todo not found"
            description="This edit route is missing the wishlist item id."
            action={{ label: "Back to todos", onClick: handleBack }}
          />
        ) : loadingEntry ? (
          <TodoFormPageSkeleton />
        ) : error ? (
          <EmptyState
            title="Could not open the wishlist item"
            description={error}
            action={{
              label: "Try again",
              onClick: () => setRetryKey((current) => current + 1),
            }}
          />
        ) : (
          <TodoFormWizard
            editingEntry={editingEntry}
            form={form}
            imageBusyKey={imageBusyKey}
            mode={mode}
            pendingImages={pendingImages}
            saving={saving}
            onAddPendingImages={handleAddPendingImages}
            onBack={handleBack}
            onChange={updateForm}
            onDeleteImage={handleDeleteImage}
            onOpenGallery={setGalleryIndex}
            onRemovePendingImage={handleRemovePendingImage}
            onSetCover={handleSetCover}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {galleryIndex !== null &&
      editingEntry &&
      editingEntry.images.length > 0 ? (
        <TodoGalleryDialog
          key={`${editingEntry.id}:${galleryIndex}`}
          entry={editingEntry}
          initialIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
        />
      ) : null}
    </div>
  );
}

function TodoFormPageSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
        <div className="h-9 w-32 rounded-full bg-white/8" />
        <div className="mt-5 h-8 w-44 rounded-2xl bg-white/10" />
        <div className="mt-3 h-16 rounded-3xl bg-white/6" />
        <div className="mt-6 space-y-2">
          <div className="h-20 rounded-[22px] bg-white/6" />
          <div className="h-20 rounded-[22px] bg-white/6" />
          <div className="h-20 rounded-[22px] bg-white/6" />
        </div>
      </div>

      <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
        <div className="h-16 rounded-[24px] bg-white/6" />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="h-28 rounded-[24px] bg-white/6" />
          <div className="h-28 rounded-[24px] bg-white/6" />
        </div>
        <div className="mt-4 h-52 rounded-[24px] bg-white/6" />
      </div>
    </div>
  );
}

function normaliseRouteParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

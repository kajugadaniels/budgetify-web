"use client";

import { useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createTodo,
  deleteTodo,
  deleteTodoImage,
  listTodos,
  updateTodo,
} from "@/lib/api/todos/todos.api";
import type { CreateTodoRequest, TodoResponse } from "@/lib/types/todo.types";
import { rwfCompact } from "@/lib/utils/currency";
import { TodoFormDialog } from "./todos/todo-form-dialog";
import { TodoGalleryDialog } from "./todos/todo-gallery-dialog";
import { TodosBoard } from "./todos/todos-board";
import { TodosBoardSkeleton } from "./todos/todos-board-skeleton";
import { TodosHeader } from "./todos/todos-header";
import type {
  TodoFormDialogState,
  TodoFormValues,
  TodoGalleryState,
} from "./todos/todos-page.types";
import { TodosSummaryCard } from "./todos/todos-summary-card";
import {
  createEmptyTodoForm,
  createTodoFormFromEntry,
  groupTodosByPriority,
  sortTodos,
} from "./todos/todos.utils";

export default function TodosPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [entries, setEntries] = useState<TodoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageBusyKey, setImageBusyKey] = useState<string | null>(null);
  const [formDialog, setFormDialog] = useState<TodoFormDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<TodoResponse | null>(null);
  const [galleryTarget, setGalleryTarget] = useState<TodoGalleryState>(null);
  const [form, setForm] = useState<TodoFormValues>(() => createEmptyTodoForm());

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadTodosPage() {
      setLoading(true);
      setError(null);

      try {
        const response = await listTodos(sessionToken);

        if (!ignore) {
          setEntries(sortTodos(response));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "Wishlist items could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadTodosPage();

    return () => {
      ignore = true;
    };
  }, [token]);

  const editingEntry =
    formDialog?.mode === "edit"
      ? entries.find((entry) => entry.id === formDialog.entry.id) ?? null
      : null;

  const galleryEntry =
    galleryTarget !== null
      ? entries.find((entry) => entry.id === galleryTarget.todoId) ?? null
      : null;

  const plannedTotal = entries.reduce((sum, entry) => sum + Number(entry.price), 0);
  const topPriorityCount = entries.filter(
    (entry) => entry.priority === "TOP_PRIORITY",
  ).length;
  const withImagesCount = entries.filter((entry) => entry.imageCount > 0).length;
  const groupedEntries = groupTodosByPriority(entries);

  function openCreateDialog() {
    setForm(createEmptyTodoForm());
    setFormDialog({ mode: "create" });
  }

  function openEditDialog(entry: TodoResponse) {
    setForm(createTodoFormFromEntry(entry));
    setFormDialog({ mode: "edit", entry });
  }

  function closeFormDialog() {
    setFormDialog(null);
    setForm(createEmptyTodoForm());
  }

  function updateForm(next: Partial<TodoFormValues>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function openGallery(todoId: string, index: number) {
    setGalleryTarget({ todoId, index });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !formDialog) return;

    const price = Number(form.price);
    if (!form.name.trim() || Number.isNaN(price) || price <= 0) {
      toast.error("Enter a name and a price greater than zero.");
      return;
    }

    const payload: CreateTodoRequest = {
      name: form.name.trim(),
      price,
      priority: form.priority,
    };

    setSaving(true);

    try {
      if (formDialog.mode === "edit") {
        const updated = await updateTodo(token, formDialog.entry.id, payload);
        setEntries((current) =>
          sortTodos(
            current.map((entry) => (entry.id === updated.id ? updated : entry)),
          ),
        );
        toast.success("Wishlist item updated.");
      } else {
        const created = await createTodo(token, payload);
        setEntries((current) => sortTodos([created, ...current]));
        toast.success("Wishlist item added.");
      }

      closeFormDialog();
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

  async function handleDelete() {
    if (!token || !deleteTarget) return;

    try {
      await deleteTodo(token, deleteTarget.id);
      setEntries((current) =>
        current.filter((entry) => entry.id !== deleteTarget.id),
      );
      toast.success("Wishlist item deleted.");

      if (
        formDialog?.mode === "edit" &&
        formDialog.entry.id === deleteTarget.id
      ) {
        closeFormDialog();
      }

      if (galleryTarget?.todoId === deleteTarget.id) {
        setGalleryTarget(null);
      }

      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof ApiError
          ? deleteError.message
          : "Wishlist item could not be deleted right now.",
      );
    }
  }

  async function handleSetCover(imageId: string) {
    if (!token || !editingEntry) return;

    setImageBusyKey(`cover:${imageId}`);

    try {
      const updated = await updateTodo(token, editingEntry.id, {
        primaryImageId: imageId,
      });

      setEntries((current) =>
        sortTodos(
          current.map((entry) => (entry.id === updated.id ? updated : entry)),
        ),
      );
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
      const refreshed = await listTodos(token);
      setEntries(sortTodos(refreshed));
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <TodosHeader onCreate={openCreateDialog} />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
          <div className="glass-panel rounded-[32px] p-6 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              Planned wishlist value
            </p>
            <p className="mt-4 text-[2.6rem] font-semibold tracking-heading-lg text-text-primary">
              {rwfCompact(plannedTotal)}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span>
                {entries.length} {entries.length === 1 ? "item" : "items"} kept in
                your purchase pipeline
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <TodosSummaryCard
              eyebrow="Top priority"
              value={String(topPriorityCount)}
              detail={
                topPriorityCount > 0
                  ? "Items worth protecting room for first"
                  : "No urgent wishlist items yet"
              }
            />
            <TodosSummaryCard
              eyebrow="With images"
              value={String(withImagesCount)}
              detail={
                withImagesCount > 0
                  ? "Products with visuals already attached"
                  : "No synced product images yet"
              }
            />
          </div>
        </section>

        <section className="glass-panel rounded-[32px] p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
                Wishlist board
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                Future purchases, grouped by intent
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {entries.length} {entries.length === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="mt-6">
            {loading ? (
              <TodosBoardSkeleton />
            ) : error ? (
              <EmptyState
                title="Could not load the wishlist"
                description={error}
                action={{
                  label: "Refresh",
                  onClick: () => window.location.reload(),
                }}
              />
            ) : entries.length === 0 ? (
              <EmptyState
                title="No wishlist items yet"
                description="Add the products or goals you want to save for, then keep the top lane brutally selective."
                action={{
                  label: "Add item",
                  onClick: openCreateDialog,
                }}
              />
            ) : (
              <TodosBoard
                groupedEntries={groupedEntries}
                onDelete={setDeleteTarget}
                onEdit={openEditDialog}
                onOpenGallery={openGallery}
              />
            )}
          </div>
        </section>
      </div>

      {formDialog ? (
        <TodoFormDialog
          key={formDialog.mode === "edit" ? formDialog.entry.id : "create"}
          editingEntry={editingEntry}
          form={form}
          imageBusyKey={imageBusyKey}
          mode={formDialog.mode}
          saving={saving}
          onChange={updateForm}
          onClose={closeFormDialog}
          onDeleteImage={handleDeleteImage}
          onOpenGallery={(index) => {
            if (editingEntry) {
              openGallery(editingEntry.id, index);
            }
          }}
          onSetCover={handleSetCover}
          onSubmit={handleSubmit}
        />
      ) : null}

      {galleryTarget && galleryEntry && galleryEntry.images.length > 0 ? (
        <TodoGalleryDialog
          key={`${galleryTarget.todoId}:${galleryTarget.index}`}
          entry={galleryEntry}
          initialIndex={galleryTarget.index}
          onClose={() => setGalleryTarget(null)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteDialog
          label="wishlist item"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

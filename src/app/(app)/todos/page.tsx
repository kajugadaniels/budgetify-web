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
import type {
  CreateTodoRequest,
  TodoPriority,
  TodoResponse,
} from "@/lib/types/todo.types";
import { cn } from "@/lib/utils/cn";
import { rwf, rwfCompact } from "@/lib/utils/currency";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

const PRIORITY_META: Record<
  TodoPriority,
  {
    label: string;
    description: string;
    chipClass: string;
    railClass: string;
  }
> = {
  TOP_PRIORITY: {
    label: "Top priority",
    description: "Items that are closest to becoming real purchases.",
    chipClass: "bg-primary/14 text-primary",
    railClass: "from-primary/20 via-primary/8 to-transparent",
  },
  PRIORITY: {
    label: "Priority",
    description: "Worth planning for once the critical items are stable.",
    chipClass: "bg-success/14 text-success",
    railClass: "from-success/18 via-success/8 to-transparent",
  },
  NOT_PRIORITY: {
    label: "Not priority",
    description: "Still interesting, but not worth immediate financial pressure.",
    chipClass: "bg-white/8 text-text-secondary",
    railClass: "from-white/10 via-white/4 to-transparent",
  },
};

interface TodoFormValues {
  name: string;
  price: string;
  priority: TodoPriority;
}

function getDefaultForm(): TodoFormValues {
  return {
    name: "",
    price: "",
    priority: "TOP_PRIORITY",
  };
}

function toFormValues(entry: TodoResponse): TodoFormValues {
  return {
    name: entry.name,
    price: String(entry.price),
    priority: entry.priority,
  };
}

function getPriorityRank(priority: TodoPriority): number {
  switch (priority) {
    case "TOP_PRIORITY":
      return 0;
    case "PRIORITY":
      return 1;
    case "NOT_PRIORITY":
      return 2;
  }
}

function sortTodos(entries: TodoResponse[]): TodoResponse[] {
  return [...entries].sort(
    (left, right) =>
      getPriorityRank(left.priority) - getPriorityRank(right.priority) ||
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TodosPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [entries, setEntries] = useState<TodoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageBusyKey, setImageBusyKey] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TodoResponse | null>(null);
  const [form, setForm] = useState<TodoFormValues>(() => getDefaultForm());

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
    mode === "edit" && editingId
      ? entries.find((entry) => entry.id === editingId) ?? null
      : null;

  const plannedTotal = entries.reduce((sum, entry) => sum + Number(entry.price), 0);
  const topPriorityCount = entries.filter(
    (entry) => entry.priority === "TOP_PRIORITY",
  ).length;
  const withImagesCount = entries.filter((entry) => entry.imageCount > 0).length;

  function resetComposer() {
    setMode("create");
    setEditingId(null);
    setForm(getDefaultForm());
  }

  function startEditing(entry: TodoResponse) {
    setMode("edit");
    setEditingId(entry.id);
    setForm(toFormValues(entry));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) return;

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
      if (mode === "edit" && editingId) {
        const updated = await updateTodo(token, editingId, payload);
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

      resetComposer();
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
      setDeleteTarget(null);

      if (editingId === deleteTarget.id) {
        resetComposer();
      }
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

  const groupedEntries: Record<TodoPriority, TodoResponse[]> = {
    TOP_PRIORITY: entries.filter((entry) => entry.priority === "TOP_PRIORITY"),
    PRIORITY: entries.filter((entry) => entry.priority === "PRIORITY"),
    NOT_PRIORITY: entries.filter((entry) => entry.priority === "NOT_PRIORITY"),
  };

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <section className="glass-elevated rounded-[32px] p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
                    Composer
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-heading-md text-text-primary">
                    {mode === "edit" ? "Refine the shortlist" : "Add a wishlist item"}
                  </h1>
                </div>

                {mode === "edit" ? (
                  <button
                    type="button"
                    onClick={resetComposer}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    New item
                  </button>
                ) : null}
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <Field label="Item name">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
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
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                    placeholder="1750000"
                    min={1}
                    required
                  />
                </Field>

                <Field label="Priority">
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value as TodoPriority,
                      }))
                    }
                    className={cn(INPUT_CLASS, "cursor-pointer")}
                  >
                    {Object.entries(PRIORITY_META).map(([value, meta]) => (
                      <option key={value} value={value}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetComposer}
                    className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Add item"}
                  </button>
                </div>
              </form>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-background-secondary/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/60">
                  Synced images
                </p>
                {editingEntry ? (
                  editingEntry.images.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {editingEntry.images.map((image) => (
                        <article
                          key={image.id}
                          className="glass-subtle rounded-[24px] overflow-hidden"
                        >
                          <div
                            className="h-24 bg-cover bg-center"
                            style={{ backgroundImage: `url(${image.imageUrl})` }}
                          />
                          <div className="flex items-center justify-between gap-3 p-3">
                            <span className="text-xs text-text-secondary">
                              {image.isPrimary ? "Current cover" : image.format.toUpperCase()}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSetCover(image.id)}
                                disabled={imageBusyKey !== null || image.isPrimary}
                                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
                              >
                                Cover
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(image.id)}
                                disabled={imageBusyKey !== null}
                                className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/18 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-text-secondary">
                      This item has no synced images yet. When images exist, you can
                      choose the cover and remove extras here.
                    </p>
                  )
                ) : (
                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    Open an existing item to curate any images already attached to it.
                  </p>
                )}
              </div>
            </section>

            <section className="glass-panel rounded-[32px] p-5 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
                Planning snapshot
              </p>
              <div className="mt-5 grid gap-3">
                <MetricCard label="Planned total" value={rwfCompact(plannedTotal)} />
                <MetricCard
                  label="Top priority items"
                  value={String(topPriorityCount)}
                />
                <MetricCard
                  label="Items with images"
                  value={String(withImagesCount)}
                />
              </div>
            </section>
          </div>

          <section className="glass-panel rounded-[32px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
              Wishlist board
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-heading-lg text-text-primary">
              Spend intention, sorted by pressure.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              Keep future purchases visible, but force them to compete. The board
              works best when only a few items stay in the top lane.
            </p>

            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              {(Object.keys(PRIORITY_META) as TodoPriority[]).map((priority) => (
                <PriorityLane
                  key={priority}
                  priority={priority}
                  entries={groupedEntries[priority]}
                  onEdit={startEditing}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </section>
        </div>

        {loading ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="glass-panel h-[280px] animate-pulse rounded-[32px]"
              />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <section className="glass-panel rounded-[32px] p-6">
            <EmptyState
              title="Could not load the wishlist"
              description={error}
              action={{
                label: "Refresh",
                onClick: () => window.location.reload(),
              }}
            />
          </section>
        ) : null}
      </div>

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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-subtle rounded-[24px] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/60">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-heading-sm text-text-primary">
        {value}
      </p>
    </div>
  );
}

function PriorityLane({
  priority,
  entries,
  onEdit,
  onDelete,
}: {
  priority: TodoPriority;
  entries: TodoResponse[];
  onEdit: (entry: TodoResponse) => void;
  onDelete: (entry: TodoResponse) => void;
}) {
  const total = entries.reduce((sum, entry) => sum + Number(entry.price), 0);
  const meta = PRIORITY_META[priority];

  return (
    <section className="rounded-[28px] border border-white/8 bg-background-secondary/60 p-4">
      <div
        className={`rounded-[22px] bg-gradient-to-r px-4 py-4 ${meta.railClass}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-heading-sm text-text-primary">
              {meta.label}
            </h3>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {meta.description}
            </p>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            {rwfCompact(total)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <article key={entry.id} className="glass-subtle rounded-[24px] p-3">
              <div
                className={
                  entry.coverImageUrl
                    ? "h-28 rounded-[18px] bg-cover bg-center"
                    : "h-28 rounded-[18px] border border-border bg-surface-elevated"
                }
                style={
                  entry.coverImageUrl
                    ? { backgroundImage: `url(${entry.coverImageUrl})` }
                    : undefined
                }
              />

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-text-primary">
                    {entry.name}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Updated {formatDate(entry.updatedAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.chipClass}`}
                >
                  {meta.label}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-text-primary">
                    {rwf(Number(entry.price))}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/60">
                    {entry.imageCount} {entry.imageCount === 1 ? "image" : "images"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <IconButton label="Edit wishlist item" onClick={() => onEdit(entry)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    label="Delete wishlist item"
                    onClick={() => onDelete(entry)}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-border px-4 py-8 text-sm leading-6 text-text-secondary">
            Nothing is sitting in this lane right now.
          </div>
        )}
      </div>
    </section>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:text-text-primary"
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

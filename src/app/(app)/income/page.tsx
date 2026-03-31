"use client";

import { useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createIncome,
  deleteIncome,
  listIncome,
  updateIncome,
} from "@/lib/api/income/income.api";
import type {
  CreateIncomeRequest,
  IncomeCategory,
  IncomeResponse,
} from "@/lib/types/income.types";
import { cn } from "@/lib/utils/cn";
import { rwf, rwfCompact } from "@/lib/utils/currency";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

const INCOME_CATEGORIES: Array<{ value: IncomeCategory; label: string }> = [
  { value: "SALARY", label: "Salary" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "DIVIDENDS", label: "Dividends" },
  { value: "RENTAL", label: "Rental" },
  { value: "SIDE_HUSTLE", label: "Side hustle" },
  { value: "OTHER", label: "Other" },
];

interface IncomeFormValues {
  label: string;
  amount: string;
  category: IncomeCategory;
  date: string;
}

function getDefaultForm(): IncomeFormValues {
  return {
    label: "",
    amount: "",
    category: "SALARY",
    date: getTodayString(),
  };
}

function toFormValues(entry: IncomeResponse): IncomeFormValues {
  return {
    label: entry.label,
    amount: String(entry.amount),
    category: entry.category,
    date: entry.date.split("T")[0] ?? getTodayString(),
  };
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function sortIncomeEntries(entries: IncomeResponse[]): IncomeResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isCurrentMonth(value: string): boolean {
  const now = new Date();
  const date = new Date(value);
  return (
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  );
}

export default function IncomePage() {
  const { token } = useAuth();
  const toast = useToast();

  const [entries, setEntries] = useState<IncomeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IncomeResponse | null>(null);
  const [form, setForm] = useState<IncomeFormValues>(() => getDefaultForm());

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadIncome() {
      setLoading(true);
      setError(null);

      try {
        const response = await listIncome(sessionToken);
        if (!ignore) {
          setEntries(sortIncomeEntries(response));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "Income could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadIncome();

    return () => {
      ignore = true;
    };
  }, [token]);

  const totalIncome = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const monthlyIncome = entries
    .filter((entry) => isCurrentMonth(entry.date))
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const strongestCategory = INCOME_CATEGORIES.find(
    ({ value }) =>
      value ===
      [...entries]
        .sort((left, right) => Number(right.amount) - Number(left.amount))[0]
        ?.category,
  );

  function resetComposer() {
    setMode("create");
    setEditingId(null);
    setForm(getDefaultForm());
  }

  function startEditing(entry: IncomeResponse) {
    setMode("edit");
    setEditingId(entry.id);
    setForm(toFormValues(entry));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) return;

    const amount = Number(form.amount);
    if (!form.label.trim() || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a label and an amount greater than zero.");
      return;
    }

    const payload: CreateIncomeRequest = {
      label: form.label.trim(),
      amount,
      category: form.category,
      date: form.date,
    };

    setSaving(true);

    try {
      if (mode === "edit" && editingId) {
        const updated = await updateIncome(token, editingId, payload);
        setEntries((current) =>
          sortIncomeEntries(
            current.map((entry) => (entry.id === updated.id ? updated : entry)),
          ),
        );
        toast.success("Income entry updated.");
      } else {
        const created = await createIncome(token, payload);
        setEntries((current) => sortIncomeEntries([created, ...current]));
        toast.success("Income entry added.");
      }

      resetComposer();
    } catch (saveError) {
      toast.error(
        saveError instanceof ApiError
          ? saveError.message
          : "Income could not be saved right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;

    try {
      await deleteIncome(token, deleteTarget.id);
      setEntries((current) =>
        current.filter((entry) => entry.id !== deleteTarget.id),
      );
      toast.success("Income entry deleted.");
      setDeleteTarget(null);

      if (editingId === deleteTarget.id) {
        resetComposer();
      }
    } catch (deleteError) {
      toast.error(
        deleteError instanceof ApiError
          ? deleteError.message
          : "Income could not be deleted right now.",
      );
    }
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <section className="glass-panel rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Cash Inflow
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-heading-lg text-text-primary md:text-[2.6rem]">
                  Income that keeps the month moving.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                  Log every source once, then keep the running picture clear.
                  This view favors the essentials: total inflow, what landed this
                  month, and where the strongest contribution is coming from.
                </p>
              </div>

              <button
                type="button"
                onClick={resetComposer}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Add income
              </button>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <MetricCard label="Total recorded" value={rwfCompact(totalIncome)} />
              <MetricCard label="This month" value={rwfCompact(monthlyIncome)} />
              <MetricCard
                label="Biggest source"
                value={strongestCategory?.label ?? "No entries yet"}
              />
            </div>
          </section>

          <section className="glass-elevated rounded-[32px] p-5 md:p-6 xl:sticky xl:top-6 xl:self-start">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
                  Composer
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                  {mode === "edit" ? "Refine this entry" : "Add new income"}
                </h2>
              </div>

              {mode === "edit" ? (
                <button
                  type="button"
                  onClick={resetComposer}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  New entry
                </button>
              ) : null}
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Field label="Label">
                <input
                  type="text"
                  value={form.label}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                  placeholder="Monthly salary"
                  className={INPUT_CLASS}
                  maxLength={120}
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount">
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="450000"
                    min={1}
                    className={INPUT_CLASS}
                    required
                  />
                </Field>

                <Field label="Date">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                    required
                  />
                </Field>
              </div>

              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as IncomeCategory,
                    }))
                  }
                  className={cn(INPUT_CLASS, "cursor-pointer")}
                >
                  {INCOME_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
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
                  {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Add income"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <section className="glass-panel rounded-[32px] p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
                Recorded entries
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                Every inflow, newest first
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          </div>

          <div className="mt-6">
            {loading ? (
              <ListSkeleton />
            ) : error ? (
              <EmptyState
                title="Could not load income"
                description={error}
                action={{
                  label: "Refresh",
                  onClick: () => window.location.reload(),
                }}
              />
            ) : entries.length === 0 ? (
              <EmptyState
                title="No income recorded yet"
                description="Start with the income you trust most, then build the rest of the month around it."
                action={{
                  label: "Add income",
                  onClick: resetComposer,
                }}
              />
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <IncomeEntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={() => startEditing(entry)}
                    onDelete={() => setDeleteTarget(entry)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {deleteTarget ? (
        <ConfirmDeleteDialog
          label="income entry"
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

function IncomeEntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: IncomeResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const categoryLabel =
    INCOME_CATEGORIES.find((category) => category.value === entry.category)?.label ??
    entry.category;

  return (
    <article className="glass-subtle rounded-[28px] p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-text-primary">
              {entry.label}
            </h3>
            <span className="rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-medium text-primary">
              {categoryLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Added for {formatDate(entry.date)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p className="text-lg font-semibold tabular-nums text-success">
            {rwf(Number(entry.amount))}
          </p>
          <div className="flex items-center gap-2">
            <IconButton label="Edit income entry" onClick={onEdit}>
              <EditIcon />
            </IconButton>
            <IconButton label="Delete income entry" onClick={onDelete}>
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </article>
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

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="glass-subtle h-24 animate-pulse rounded-[28px]"
        />
      ))}
    </div>
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

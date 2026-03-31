"use client";

import { useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from "@/lib/api/expenses/expenses.api";
import type {
  CreateExpenseRequest,
  ExpenseCategory,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import { cn } from "@/lib/utils/cn";
import { rwf, rwfCompact } from "@/lib/utils/currency";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 focus:border-primary/60 focus:outline-none transition-colors";

const EXPENSE_CATEGORIES: Array<{ value: ExpenseCategory; label: string }> = [
  { value: "FOOD_DINING", label: "Food and dining" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "HOUSING", label: "Housing" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "EDUCATION", label: "Education" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "PERSONAL_CARE", label: "Personal care" },
  { value: "TRAVEL", label: "Travel" },
  { value: "SAVINGS", label: "Savings" },
  { value: "OTHER", label: "Other" },
];

interface ExpenseFormValues {
  label: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
  note: string;
}

function getDefaultForm(): ExpenseFormValues {
  return {
    label: "",
    amount: "",
    category: "FOOD_DINING",
    date: getTodayString(),
    note: "",
  };
}

function toFormValues(entry: ExpenseResponse): ExpenseFormValues {
  return {
    label: entry.label,
    amount: String(entry.amount),
    category: entry.category,
    date: entry.date.split("T")[0] ?? getTodayString(),
    note: entry.note ?? "",
  };
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function sortExpenses(entries: ExpenseResponse[]): ExpenseResponse[] {
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

export default function ExpensesPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [entries, setEntries] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseResponse | null>(null);
  const [form, setForm] = useState<ExpenseFormValues>(() => getDefaultForm());

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadExpenses() {
      setLoading(true);
      setError(null);

      try {
        const response = await listExpenses(sessionToken);
        if (!ignore) {
          setEntries(sortExpenses(response));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "Expenses could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadExpenses();

    return () => {
      ignore = true;
    };
  }, [token]);

  const totalSpent = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const monthlySpend = entries
    .filter((entry) => isCurrentMonth(entry.date))
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const largestExpense = [...entries].sort(
    (left, right) => Number(right.amount) - Number(left.amount),
  )[0];

  function resetComposer() {
    setMode("create");
    setEditingId(null);
    setForm(getDefaultForm());
  }

  function startEditing(entry: ExpenseResponse) {
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

    const payload: CreateExpenseRequest = {
      label: form.label.trim(),
      amount,
      category: form.category,
      date: form.date,
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };

    setSaving(true);

    try {
      if (mode === "edit" && editingId) {
        const updated = await updateExpense(token, editingId, payload);
        setEntries((current) =>
          sortExpenses(
            current.map((entry) => (entry.id === updated.id ? updated : entry)),
          ),
        );
        toast.success("Expense updated.");
      } else {
        const created = await createExpense(token, payload);
        setEntries((current) => sortExpenses([created, ...current]));
        toast.success("Expense added.");
      }

      resetComposer();
    } catch (saveError) {
      toast.error(
        saveError instanceof ApiError
          ? saveError.message
          : "Expense could not be saved right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;

    try {
      await deleteExpense(token, deleteTarget.id);
      setEntries((current) =>
        current.filter((entry) => entry.id !== deleteTarget.id),
      );
      toast.success("Expense deleted.");
      setDeleteTarget(null);

      if (editingId === deleteTarget.id) {
        resetComposer();
      }
    } catch (deleteError) {
      toast.error(
        deleteError instanceof ApiError
          ? deleteError.message
          : "Expense could not be deleted right now.",
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
                  Spending
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-heading-lg text-text-primary md:text-[2.6rem]">
                  Expenses that deserve clear scrutiny.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                  Keep the outflow honest. Record what left the account, where it
                  went, and the notes worth remembering when the month needs a
                  harder review.
                </p>
              </div>

              <button
                type="button"
                onClick={resetComposer}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Add expense
              </button>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <MetricCard label="Total spent" value={rwfCompact(totalSpent)} />
              <MetricCard label="This month" value={rwfCompact(monthlySpend)} />
              <MetricCard
                label="Largest item"
                value={largestExpense ? rwfCompact(Number(largestExpense.amount)) : "No entries yet"}
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
                  {mode === "edit" ? "Adjust this expense" : "Capture a new expense"}
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
                  placeholder="Rent for April"
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
                    placeholder="150000"
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
                      category: event.target.value as ExpenseCategory,
                    }))
                  }
                  className={cn(INPUT_CLASS, "cursor-pointer")}
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Note">
                <textarea
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Optional context for this expense"
                  className={cn(INPUT_CLASS, "min-h-[112px] resize-none")}
                  maxLength={500}
                />
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
                  {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Add expense"}
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
                Outflow with the context attached
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {entries.length} {entries.length === 1 ? "expense" : "expenses"}
            </p>
          </div>

          <div className="mt-6">
            {loading ? (
              <ListSkeleton />
            ) : error ? (
              <EmptyState
                title="Could not load expenses"
                description={error}
                action={{
                  label: "Refresh",
                  onClick: () => window.location.reload(),
                }}
              />
            ) : entries.length === 0 ? (
              <EmptyState
                title="No expenses recorded yet"
                description="Start with the recurring costs first, then add the smaller entries that shape the real month."
                action={{
                  label: "Add expense",
                  onClick: resetComposer,
                }}
              />
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <ExpenseEntryCard
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
          label="expense entry"
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

function ExpenseEntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: ExpenseResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const categoryLabel =
    EXPENSE_CATEGORIES.find((category) => category.value === entry.category)?.label ??
    entry.category;

  return (
    <article className="glass-subtle rounded-[28px] p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-text-primary">
              {entry.label}
            </h3>
            <span className="rounded-full bg-danger/12 px-2.5 py-1 text-[11px] font-medium text-danger">
              {categoryLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Logged for {formatDate(entry.date)}
          </p>
          {entry.note ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary/85">
              {entry.note}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p className="text-lg font-semibold tabular-nums text-danger">
            {rwf(Number(entry.amount))}
          </p>
          <div className="flex items-center gap-2">
            <IconButton label="Edit expense entry" onClick={onEdit}>
              <EditIcon />
            </IconButton>
            <IconButton label="Delete expense entry" onClick={onDelete}>
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
          className="glass-subtle h-28 animate-pulse rounded-[28px]"
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

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
  listExpenseCategories,
  listExpenses,
  updateExpense,
} from "@/lib/api/expenses/expenses.api";
import type {
  CreateExpenseRequest,
  ExpenseCategoryOptionResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import { ExpenseFormDialog } from "./expenses/expense-form-dialog";
import { ExpensesHeader } from "./expenses/expenses-header";
import type {
  ExpenseFormDialogState,
  ExpenseFormValues,
} from "./expenses/expenses-page.types";
import { ExpensesSummaryCard } from "./expenses/expenses-summary-card";
import { ExpensesTable } from "./expenses/expenses-table";
import { ExpensesTableSkeleton } from "./expenses/expenses-table-skeleton";
import {
  createEmptyExpenseForm,
  createExpenseFormFromCategories,
  createExpenseFormFromEntry,
  formatExpenseDate,
  isCurrentMonth,
  resolveExpenseCategoryLabel,
  sortExpenseEntries,
} from "./expenses/expenses.utils";

export default function ExpensesPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [entries, setEntries] = useState<ExpenseResponse[]>([]);
  const [categories, setCategories] = useState<ExpenseCategoryOptionResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formDialog, setFormDialog] = useState<ExpenseFormDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseResponse | null>(null);
  const [form, setForm] = useState<ExpenseFormValues>(() =>
    createEmptyExpenseForm(),
  );

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadExpensesPage() {
      setLoading(true);
      setError(null);
      setCategoriesError(null);

      const [expensesResult, categoryResult] = await Promise.allSettled([
        listExpenses(sessionToken),
        listExpenseCategories(sessionToken),
      ]);

      if (ignore) return;

      if (expensesResult.status === "fulfilled") {
        setEntries(sortExpenseEntries(expensesResult.value));
      } else {
        setError(
          expensesResult.reason instanceof ApiError
            ? expensesResult.reason.message
            : "Expenses could not be loaded right now.",
        );
      }

      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value);
      } else {
        setCategoriesError(
          categoryResult.reason instanceof ApiError
            ? categoryResult.reason.message
            : "Expense categories are unavailable right now.",
        );
      }

      setLoading(false);
    }

    void loadExpensesPage();

    return () => {
      ignore = true;
    };
  }, [token]);

  const totalSpent = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const monthlySpend = entries
    .filter((entry) => isCurrentMonth(entry.date))
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const mostRecentEntry = entries[0];
  const largestExpense = [...entries].sort(
    (left, right) => Number(right.amount) - Number(left.amount),
  )[0];
  const canManageCategories = categories.length > 0;

  function openCreateDialog() {
    if (!canManageCategories) {
      toast.error(categoriesError ?? "Expense categories are unavailable right now.");
      return;
    }

    setForm(createExpenseFormFromCategories(categories));
    setFormDialog({ mode: "create" });
  }

  function openEditDialog(entry: ExpenseResponse) {
    if (!canManageCategories) {
      toast.error(categoriesError ?? "Expense categories are unavailable right now.");
      return;
    }

    setForm(createExpenseFormFromEntry(entry));
    setFormDialog({ mode: "edit", entry });
  }

  function closeFormDialog() {
    setFormDialog(null);
    setForm(createEmptyExpenseForm());
  }

  function updateForm(next: Partial<ExpenseFormValues>) {
    setForm((current) => ({ ...current, ...next }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !formDialog) return;

    const amount = Number(form.amount);
    if (!form.label.trim() || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a label and an amount greater than zero.");
      return;
    }

    if (!form.category) {
      toast.error("Select an expense category.");
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
      if (formDialog.mode === "edit") {
        const updated = await updateExpense(token, formDialog.entry.id, payload);
        setEntries((current) =>
          sortExpenseEntries(
            current.map((entry) => (entry.id === updated.id ? updated : entry)),
          ),
        );
        toast.success("Expense updated.");
      } else {
        const created = await createExpense(token, payload);
        setEntries((current) => sortExpenseEntries([created, ...current]));
        toast.success("Expense added.");
      }

      closeFormDialog();
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

      if (
        formDialog?.mode === "edit" &&
        formDialog.entry.id === deleteTarget.id
      ) {
        closeFormDialog();
      }

      setDeleteTarget(null);
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
        <ExpensesHeader canCreate={canManageCategories} onCreate={openCreateDialog} />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
          <div className="glass-panel rounded-[32px] p-6 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              Recorded spending
            </p>
            <p className="mt-4 text-[2.6rem] font-semibold tracking-heading-lg text-text-primary">
              {rwfCompact(totalSpent)}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" />
              <span>
                {entries.length} {entries.length === 1 ? "entry" : "entries"} across
                your recorded outflow
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <ExpensesSummaryCard
              eyebrow="This month"
              value={rwfCompact(monthlySpend)}
              detail={
                mostRecentEntry
                  ? `Most recent on ${formatExpenseDate(mostRecentEntry.date)}`
                  : "No expenses recorded yet"
              }
            />
            <ExpensesSummaryCard
              eyebrow="Largest expense"
              value={
                largestExpense
                  ? resolveExpenseCategoryLabel(categories, largestExpense.category)
                  : "No entries yet"
              }
              detail={
                largestExpense
                  ? `${largestExpense.label} · ${rwf(Number(largestExpense.amount))}`
                  : "Add expenses to reveal your biggest category"
              }
            />
          </div>
        </section>

        <section className="glass-panel overflow-hidden rounded-[32px]">
          <div className="flex flex-col gap-2 px-5 pb-2 pt-5 md:flex-row md:items-end md:justify-between md:px-6 md:pt-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
                Expense ledger
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                Every outgoing entry in one calm view
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {entries.length} {entries.length === 1 ? "expense" : "expenses"}
            </p>
          </div>

          {loading ? (
            <ExpensesTableSkeleton />
          ) : error ? (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <EmptyState
                title="Could not load expenses"
                description={error}
                action={{
                  label: "Refresh",
                  onClick: () => window.location.reload(),
                }}
              />
            </div>
          ) : entries.length === 0 ? (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <EmptyState
                title="No expenses recorded yet"
                description="Start with the recurring costs, then add the smaller entries that shape the real month."
                action={{
                  label: "Add expense",
                  onClick: openCreateDialog,
                }}
              />
            </div>
          ) : (
            <ExpensesTable
              categories={categories}
              canEdit={canManageCategories}
              entries={entries}
              onDelete={setDeleteTarget}
              onEdit={openEditDialog}
            />
          )}
        </section>
      </div>

      {formDialog ? (
        <ExpenseFormDialog
          categories={categories}
          form={form}
          mode={formDialog.mode}
          saving={saving}
          onClose={closeFormDialog}
          onSubmit={handleSubmit}
          onChange={updateForm}
        />
      ) : null}

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

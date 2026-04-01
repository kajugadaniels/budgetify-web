"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createExpense,
  deleteExpense,
  listExpenseCategories,
  listExpenses,
  listExpensesPage,
  updateExpense,
} from "@/lib/api/expenses/expenses.api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/pagination";
import type {
  CreateExpenseRequest,
  ExpenseCategoryOptionResponse,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import { ExpenseFormDialog } from "./expenses/expense-form-dialog";
import { ExpensesLedgerFilters } from "./expenses/expenses-ledger-filters";
import { ExpensesHeader } from "./expenses/expenses-header";
import type {
  ExpenseFormDialogState,
  ExpenseFormValues,
  ExpenseLedgerCategoryFilter,
} from "./expenses/expenses-page.types";
import { ExpensesSummaryCard } from "./expenses/expenses-summary-card";
import { ExpensesTable } from "./expenses/expenses-table";
import { ExpensesTableSkeleton } from "./expenses/expenses-table-skeleton";
import {
  buildExpenseLedgerCategoryOptions,
  createEmptyExpenseForm,
  createExpenseFormFromCategories,
  createExpenseFormFromEntry,
  formatExpenseDate,
  getCurrentMonthIndex,
  getCurrentYear,
  resolveExpenseMonthLabel,
  resolveExpenseCategoryLabel,
  sortExpenseEntries,
} from "./expenses/expenses.utils";

export default function ExpensesPage() {
  const { token } = useAuth();
  const toast = useToast();
  const searchParams = useSearchParams();

  const [entries, setEntries] = useState<ExpenseResponse[]>([]);
  const [pageEntries, setPageEntries] = useState<ExpenseResponse[]>([]);
  const [categories, setCategories] = useState<ExpenseCategoryOptionResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [formDialog, setFormDialog] = useState<ExpenseFormDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseResponse | null>(null);
  const [form, setForm] = useState<ExpenseFormValues>(() =>
    createEmptyExpenseForm(),
  );
  const defaultMonth = resolveExpenseMonthSearchParam(searchParams.get("month"));
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseLedgerCategoryFilter>(() =>
      resolveExpenseCategorySearchParam(searchParams.get("category")),
    );
  const selectedYear = getCurrentYear();

  useEffect(() => {
    setSelectedMonth(resolveExpenseMonthSearchParam(searchParams.get("month")));
    setSelectedCategory(
      resolveExpenseCategorySearchParam(searchParams.get("category")),
    );
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadExpenseCategories() {
      setCategoriesError(null);

      try {
        const response = await listExpenseCategories(sessionToken);

        if (!ignore) {
          setCategories(response);
        }
      } catch (loadError) {
        if (!ignore) {
          setCategoriesError(
            loadError instanceof ApiError
              ? loadError.message
              : "Expense categories are unavailable right now.",
          );
        }
      }
    }

    void loadExpenseCategories();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadExpenseEntries() {
      setLoading(true);
      setError(null);

      try {
        const [summaryResponse, pageResponse] = await Promise.all([
          listExpenses(sessionToken, {
            month: selectedMonth + 1,
            year: selectedYear,
          }),
          listExpensesPage(sessionToken, {
            month: selectedMonth + 1,
            year: selectedYear,
            category:
              selectedCategory === "ALL" ? undefined : selectedCategory,
            page: currentPage,
            limit: DEFAULT_PAGE_SIZE,
          }),
        ]);

        if (!ignore) {
          setEntries(sortExpenseEntries(summaryResponse));

          if (pageResponse.meta.totalPages < currentPage) {
            setCurrentPage(pageResponse.meta.totalPages);
            return;
          }

          setPageEntries(sortExpenseEntries(pageResponse.items));
          setTotalItems(pageResponse.meta.totalItems);
          setTotalPages(pageResponse.meta.totalPages);
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

    void loadExpenseEntries();

    return () => {
      ignore = true;
    };
  }, [
    currentPage,
    refreshKey,
    selectedCategory,
    selectedMonth,
    selectedYear,
    token,
  ]);

  const totalSpent = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const selectedMonthLabel = resolveExpenseMonthLabel(selectedMonth);
  const ledgerCategoryOptions = buildExpenseLedgerCategoryOptions(
    categories,
    entries,
  );
  const hasActiveLedgerFilters =
    selectedMonth !== defaultMonth || selectedCategory !== "ALL";
  const mostRecentEntry = entries[0];
  const largestExpense = [...entries].sort(
    (left, right) => Number(right.amount) - Number(left.amount),
  )[0];
  const canManageCategories = categories.length > 0;

  function triggerRefresh() {
    setRefreshKey((current) => current + 1);
  }

  function openCreateDialog() {
    if (!canManageCategories) {
      toast.error(categoriesError ?? "Expense categories are unavailable right now.");
      return;
    }

    setForm(createExpenseFormFromCategories(categories, selectedMonth, selectedYear));
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
        await updateExpense(token, formDialog.entry.id, payload);
        toast.success("Expense updated.");
        triggerRefresh();
      } else {
        await createExpense(token, payload);
        toast.success("Expense added.");

        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          triggerRefresh();
        }
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

      if (pageEntries.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        triggerRefresh();
      }

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
              {selectedMonthLabel} {selectedYear}
            </p>
            <p className="mt-4 text-[2.6rem] font-semibold tracking-heading-lg text-text-primary">
              {rwfCompact(totalSpent)}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" />
              <span>
                {entries.length} {entries.length === 1 ? "entry" : "entries"} dated
                inside {selectedMonthLabel}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <ExpensesSummaryCard
              eyebrow="Selected month"
              value={rwfCompact(totalSpent)}
              detail={
                mostRecentEntry
                  ? `Most recent on ${formatExpenseDate(mostRecentEntry.date)}`
                  : `No expenses dated in ${selectedMonthLabel} ${selectedYear}`
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
                {selectedMonthLabel} {selectedYear} expenses
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {totalItems}
              {hasActiveLedgerFilters ? ` of ${entries.length}` : ""}{" "}
              {totalItems === 1 ? "expense" : "expenses"}
            </p>
          </div>

          <ExpensesLedgerFilters
            category={selectedCategory}
            categoryOptions={ledgerCategoryOptions}
            hasActiveFilters={hasActiveLedgerFilters}
            month={selectedMonth}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSelectedMonth(defaultMonth);
              setSelectedCategory("ALL");
              setCurrentPage(1);
            }}
            onMonthChange={(value) => {
              setSelectedMonth(value);
              setCurrentPage(1);
            }}
          />

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
          ) : totalItems === 0 ? (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <EmptyState
                title="No ledger matches"
                description="Try another month or category to reveal more expense rows."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setSelectedMonth(defaultMonth);
                    setSelectedCategory("ALL");
                    setCurrentPage(1);
                  },
                }}
              />
            </div>
          ) : (
            <ExpensesTable
              categories={categories}
              canEdit={canManageCategories}
              entries={pageEntries}
              onDelete={setDeleteTarget}
              onEdit={openEditDialog}
            />
          )}

          <PaginationControls
            currentPage={currentPage}
            pageSize={DEFAULT_PAGE_SIZE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="expense"
            onPageChange={setCurrentPage}
          />
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

const VALID_EXPENSE_CATEGORIES = new Set<string>([
  "FOOD_DINING",
  "TRANSPORT",
  "HOUSING",
  "LOAN",
  "UTILITIES",
  "HEALTHCARE",
  "EDUCATION",
  "ENTERTAINMENT",
  "SHOPPING",
  "PERSONAL_CARE",
  "TRAVEL",
  "SAVINGS",
  "OTHER",
]);

function resolveExpenseMonthSearchParam(value: string | null): number {
  const fallback = getCurrentMonthIndex();

  if (!value) {
    return fallback;
  }

  const month = Number(value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return fallback;
  }

  return month - 1;
}

function resolveExpenseCategorySearchParam(
  value: string | null,
): ExpenseLedgerCategoryFilter {
  if (!value || value === "ALL") {
    return "ALL";
  }

  return VALID_EXPENSE_CATEGORIES.has(value)
    ? (value as ExpenseLedgerCategoryFilter)
    : "ALL";
}

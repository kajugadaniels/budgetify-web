"use client";

import { useDeferredValue, useEffect, useState } from "react";
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
  quoteMobileMoneyExpense,
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
  ExpenseQuoteState,
  ExpenseLedgerCategoryFilter,
} from "./expenses/expenses-page.types";
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
  isMobileMoneyExpense,
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
  const [quote, setQuote] = useState<ExpenseQuoteState>({
    loading: false,
    error: null,
    data: null,
  });
  const defaultMonth = resolveExpenseMonthSearchParam(searchParams.get("month"));
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseLedgerCategoryFilter>(() =>
      resolveExpenseCategorySearchParam(searchParams.get("category")),
    );
  const [searchInput, setSearchInput] = useState("");
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const selectedYear = getCurrentYear();
  const deferredSearch = useDeferredValue(searchInput);
  const appliedSearch =
    deferredSearch.trim().length >= 3 ? deferredSearch.trim() : undefined;
  const hasExplicitDateFilter =
    selectedDateFrom.length > 0 || selectedDateTo.length > 0;

  useEffect(() => {
    setSelectedMonth(resolveExpenseMonthSearchParam(searchParams.get("month")));
    setSelectedCategory(
      resolveExpenseCategorySearchParam(searchParams.get("category")),
    );
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, selectedDateFrom, selectedDateTo]);

  useEffect(() => {
    if (!token || !formDialog || !isMobileMoneyExpense(form.paymentMethod)) {
      setQuote({ loading: false, error: null, data: null });
      return;
    }

    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setQuote({ loading: false, error: null, data: null });
      return;
    }

    let ignore = false;
    setQuote((current) => ({ ...current, loading: true, error: null }));

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await quoteMobileMoneyExpense(token, {
          amount,
          currency: form.currency,
          mobileMoneyProvider: form.mobileMoneyProvider,
          mobileMoneyChannel: form.mobileMoneyChannel,
          ...(form.mobileMoneyChannel === "P2P_TRANSFER"
            ? { mobileMoneyNetwork: form.mobileMoneyNetwork }
            : {}),
        });

        if (!ignore) {
          setQuote({ loading: false, error: null, data: response });
        }
      } catch (quoteError) {
        if (!ignore) {
          setQuote({
            loading: false,
            error:
              quoteError instanceof ApiError
                ? quoteError.message
                : "Could not calculate mobile money charges right now.",
            data: null,
          });
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    form.amount,
    form.currency,
    form.mobileMoneyChannel,
    form.mobileMoneyNetwork,
    form.mobileMoneyProvider,
    form.paymentMethod,
    formDialog,
    token,
  ]);

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
        const filters = {
          month: hasExplicitDateFilter ? undefined : selectedMonth + 1,
          year: hasExplicitDateFilter ? undefined : selectedYear,
          category:
            selectedCategory === "ALL" ? undefined : selectedCategory,
          search: appliedSearch,
          dateFrom: selectedDateFrom || undefined,
          dateTo: selectedDateTo || undefined,
        };

        const [summaryResponse, pageResponse] = await Promise.all([
          listExpenses(sessionToken, filters),
          listExpensesPage(sessionToken, {
            ...filters,
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
    appliedSearch,
    hasExplicitDateFilter,
    refreshKey,
    selectedDateFrom,
    selectedDateTo,
    selectedCategory,
    selectedMonth,
    selectedYear,
    token,
  ]);

  const totalSpent = entries.reduce(
    (sum, entry) => sum + Number(entry.totalAmountRwf),
    0,
  );
  const selectedMonthLabel = resolveExpenseMonthLabel(selectedMonth);
  const ledgerCategoryOptions = buildExpenseLedgerCategoryOptions(
    categories,
    entries,
  );
  const hasActiveLedgerFilters =
    selectedMonth !== defaultMonth ||
    selectedCategory !== "ALL" ||
    appliedSearch !== undefined ||
    hasExplicitDateFilter;
  const mostRecentEntry = entries[0];
  const largestExpense = [...entries].sort(
    (left, right) =>
      Number(right.totalAmountRwf) - Number(left.totalAmountRwf),
  )[0];
  const canManageCategories = categories.length > 0;
  const averageExpense = entries.length > 0 ? totalSpent / entries.length : 0;
  const largestExpenseShare =
    totalSpent > 0 && largestExpense
      ? Math.round((Number(largestExpense.totalAmountRwf) / totalSpent) * 100)
      : 0;

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
    setQuote({ loading: false, error: null, data: null });
  }

  function updateForm(next: Partial<ExpenseFormValues>) {
    setForm((current) => {
      const merged = { ...current, ...next };

      if (next.paymentMethod && next.paymentMethod !== "MOBILE_MONEY") {
        merged.mobileMoneyChannel = "MERCHANT_CODE";
        merged.mobileMoneyProvider = "MTN_RWANDA";
        merged.mobileMoneyNetwork = "ON_NET";
      }

      if (next.mobileMoneyChannel === "MERCHANT_CODE") {
        merged.mobileMoneyNetwork = "ON_NET";
      }

      return merged;
    });
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
      currency: form.currency,
      category: form.category,
      paymentMethod: form.paymentMethod,
      ...(form.paymentMethod === "MOBILE_MONEY"
        ? {
            mobileMoneyChannel: form.mobileMoneyChannel,
            mobileMoneyProvider: form.mobileMoneyProvider,
            ...(form.mobileMoneyChannel === "P2P_TRANSFER"
              ? { mobileMoneyNetwork: form.mobileMoneyNetwork }
              : {}),
          }
        : {}),
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

        <section className="animate-dashboard-rise">
          <div className="group relative overflow-hidden rounded-[28px] border border-danger/12 bg-[linear-gradient(145deg,rgba(28,18,20,0.94)_0%,rgba(16,11,14,0.98)_100%)] px-4 py-4 shadow-[0_18px_56px_rgba(28,8,12,0.26)] md:px-5">
            <div className="pointer-events-none absolute inset-0">
              <div className="motion-safe:animate-income-drift absolute -right-8 top-0 h-28 w-28 rounded-full bg-danger/14 blur-3xl" />
              <div className="motion-safe:animate-income-sweep absolute inset-y-0 left-[-28%] w-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-60 blur-lg" />
            </div>

            <div className="relative z-10 grid gap-3 lg:grid-cols-[minmax(0,1.16fr)_280px]">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-danger/15 bg-danger/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-danger/80">
                      <span className="motion-safe:animate-income-glow h-1.5 w-1.5 rounded-full bg-danger" />
                      Expenses
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                      {selectedMonthLabel} {selectedYear}
                    </p>
                  </div>

                  <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/54">
                      Ledger
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {entries.length} {entries.length === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[clamp(1.85rem,3.5vw,2.9rem)] font-semibold leading-none tracking-[-0.055em] text-white transition-transform duration-500 ease-out group-hover:translate-x-1">
                      {rwfCompact(totalSpent)}
                    </p>
                    <div className="mt-2 h-1.5 w-[min(220px,52vw)] overflow-hidden rounded-full bg-white/6">
                      <div
                        className="motion-safe:animate-income-sweep h-full rounded-full bg-[linear-gradient(90deg,rgba(255,122,122,0.52),rgba(228,192,99,1),rgba(255,122,122,0.52))] bg-[length:200%_100%]"
                        style={{ width: `${largestExpenseShare}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-danger/14 bg-danger/8 px-2.5 py-1 text-[11px] font-medium text-danger/82">
                      {largestExpenseShare}% largest share
                    </span>
                    <span className="rounded-full border border-warning/14 bg-warning/8 px-2.5 py-1 text-[11px] font-medium text-warning/88">
                      {rwfCompact(averageExpense)} average
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                      Latest
                    </p>
                    <span className="h-1.5 w-1.5 rounded-full bg-danger/80" />
                  </div>
                  <p className="mt-2 text-base font-semibold tracking-[-0.04em] text-text-primary">
                    {mostRecentEntry
                      ? formatExpenseDate(mostRecentEntry.date)
                      : "No entries yet"}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                    {mostRecentEntry
                      ? mostRecentEntry.label
                      : `No expenses dated in ${selectedMonthLabel}.`}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                      Peak category
                    </p>
                    <span className="text-[11px] font-medium text-warning/82">
                      {largestExpenseShare}%
                    </span>
                  </div>
                  <p className="mt-2 text-base font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                    {largestExpense
                      ? resolveExpenseCategoryLabel(categories, largestExpense.category)
                      : "No entries yet"}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                    {largestExpense
                      ? `${largestExpense.label} · ${rwf(Number(largestExpense.totalAmountRwf))}`
                      : "Add expenses to reveal the biggest category."}
                  </p>
                </div>
              </div>
            </div>
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
            dateFrom={selectedDateFrom}
            dateTo={selectedDateTo}
            hasActiveFilters={hasActiveLedgerFilters}
            month={selectedMonth}
            search={searchInput}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSelectedMonth(defaultMonth);
              setSelectedCategory("ALL");
              setSearchInput("");
              setSelectedDateFrom("");
              setSelectedDateTo("");
              setCurrentPage(1);
            }}
            onDateFromChange={setSelectedDateFrom}
            onDateToChange={setSelectedDateTo}
            onMonthChange={(value) => {
              setSelectedMonth(value);
              setCurrentPage(1);
            }}
            onSearchChange={setSearchInput}
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
                description="Try another search, date range, month, or category to reveal more expense rows."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setSelectedMonth(defaultMonth);
                    setSelectedCategory("ALL");
                    setSearchInput("");
                    setSelectedDateFrom("");
                    setSelectedDateTo("");
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
          quote={quote.data}
          quoteError={quote.error}
          quoteLoading={quote.loading}
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

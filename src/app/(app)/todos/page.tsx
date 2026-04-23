"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  listExpenseCategories,
  quoteMobileMoneyExpense,
} from "@/lib/api/expenses/expenses.api";
import {
  deleteTodo,
  getTodoSummary,
  listTodosPage,
  recordTodoExpense,
  updateTodo,
} from "@/lib/api/todos/todos.api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/pagination";
import type {
  ExpenseCategoryOptionResponse,
  MobileMoneyQuoteResponse,
} from "@/lib/types/expense.types";
import type { TodoResponse, TodoSummaryResponse } from "@/lib/types/todo.types";
import { rwfCompact } from "@/lib/utils/currency";
import { TodoExpenseDialog } from "./todos/todo-expense-dialog";
import { TodoGalleryDialog } from "./todos/todo-gallery-dialog";
import { TodosBoard } from "./todos/todos-board";
import { TodosBoardFilters } from "./todos/todos-board-filters";
import { TodosBoardSkeleton } from "./todos/todos-board-skeleton";
import { TodosHeader } from "./todos/todos-header";
import type {
  TodoBoardFrequencyFilter,
  TodoBoardPriorityFilter,
  TodoBoardStatusFilter,
  TodoExpenseDialogState,
  TodoExpenseFormValues,
  TodoGalleryState,
} from "./todos/todos-page.types";
import {
  canRecordTodoExpense,
  createEmptyTodoExpenseForm,
  createTodoExpenseFormFromEntry,
  formatTodoDate,
  resolveTodoStatusLabel,
  sortTodos,
} from "./todos/todos.utils";

function resolveFrequencyFilterFromSearchParam(
  value: string | null,
): TodoBoardFrequencyFilter {
  return value === "ONCE" ||
    value === "WEEKLY" ||
    value === "MONTHLY" ||
    value === "YEARLY"
    ? value
    : "ALL";
}

export default function TodosPage() {
  const { token } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pageEntries, setPageEntries] = useState<TodoResponse[]>([]);
  const [summary, setSummary] = useState<TodoSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingExpense, setRecordingExpense] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);
  const [recordExpenseBusyId, setRecordExpenseBusyId] = useState<string | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expenseDialog, setExpenseDialog] =
    useState<TodoExpenseDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<TodoResponse | null>(null);
  const [galleryTarget, setGalleryTarget] = useState<TodoGalleryState>(null);
  const [expenseForm, setExpenseForm] = useState<TodoExpenseFormValues>(() =>
    createEmptyTodoExpenseForm(),
  );
  const [expenseCategories, setExpenseCategories] = useState<
    ExpenseCategoryOptionResponse[]
  >([]);
  const [expenseQuote, setExpenseQuote] = useState<{
    loading: boolean;
    error: string | null;
    data: MobileMoneyQuoteResponse | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });
  const [expenseCategoriesError, setExpenseCategoriesError] =
    useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] =
    useState<TodoBoardPriorityFilter>("ALL");
  const [selectedFrequency, setSelectedFrequency] =
    useState<TodoBoardFrequencyFilter>(() =>
      resolveFrequencyFilterFromSearchParam(searchParams.get("frequency")),
    );
  const [selectedStatus, setSelectedStatus] =
    useState<TodoBoardStatusFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const appliedSearch =
    deferredSearch.trim().length >= 3 ? deferredSearch.trim() : undefined;
  const hasExplicitDateFilter =
    selectedDateFrom.length > 0 || selectedDateTo.length > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, selectedDateFrom, selectedDateTo, selectedFrequency]);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadTodosPage() {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          frequency:
            selectedFrequency === "ALL" ? undefined : selectedFrequency,
          priority:
            selectedPriority === "ALL" ? undefined : selectedPriority,
          status:
            selectedStatus === "ALL" ? undefined : selectedStatus,
          search: appliedSearch,
          dateFrom: selectedDateFrom || undefined,
          dateTo: selectedDateTo || undefined,
        };

        const [summaryResponse, pageResponse] = await Promise.all([
          getTodoSummary(sessionToken, filters),
          listTodosPage(sessionToken, {
            ...filters,
            page: currentPage,
            limit: DEFAULT_PAGE_SIZE,
          }),
        ]);

        if (!ignore) {
          setSummary(summaryResponse);

          if (pageResponse.meta.totalPages < currentPage) {
            setCurrentPage(pageResponse.meta.totalPages);
            return;
          }

          setPageEntries(sortTodos(pageResponse.items));
          setTotalItems(pageResponse.meta.totalItems);
          setTotalPages(pageResponse.meta.totalPages);
        }
      } catch (loadError) {
        if (!ignore) {
          setSummary(null);
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
  }, [
    currentPage,
    appliedSearch,
    refreshKey,
    selectedDateFrom,
    selectedDateTo,
    selectedStatus,
    selectedFrequency,
    selectedPriority,
    token,
  ]);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadExpenseCategoriesForTodos() {
      try {
        const response = await listExpenseCategories(sessionToken);

        if (!ignore) {
          setExpenseCategories(response);
          setExpenseCategoriesError(null);
        }
      } catch (loadError) {
        if (!ignore) {
          setExpenseCategories([]);
          setExpenseCategoriesError(
            loadError instanceof ApiError
              ? loadError.message
              : "Expense categories could not be loaded right now.",
          );
        }
      }
    }

    void loadExpenseCategoriesForTodos();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !expenseDialog || expenseForm.paymentMethod !== "MOBILE_MONEY") {
      setExpenseQuote({ loading: false, error: null, data: null });
      return;
    }

    const amount = Number(expenseForm.amount);

    if (
      Number.isNaN(amount) ||
      amount <= 0 ||
      expenseForm.mobileMoneyChannel === "" ||
      (expenseForm.mobileMoneyChannel === "P2P_TRANSFER" &&
        expenseForm.mobileMoneyNetwork === "")
    ) {
      setExpenseQuote({ loading: false, error: null, data: null });
      return;
    }

    const mobileMoneyChannel = expenseForm.mobileMoneyChannel;
    const mobileMoneyNetwork =
      mobileMoneyChannel === "P2P_TRANSFER"
        ? expenseForm.mobileMoneyNetwork || undefined
        : undefined;

    let ignore = false;
    setExpenseQuote((current) => ({ ...current, loading: true, error: null }));

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await quoteMobileMoneyExpense(token, {
          amount,
          mobileMoneyProvider: "MTN_RWANDA",
          mobileMoneyChannel,
          ...(mobileMoneyChannel === "P2P_TRANSFER"
            ? { mobileMoneyNetwork }
            : {}),
        });

        if (!ignore) {
          setExpenseQuote({ loading: false, error: null, data: response });
        }
      } catch (quoteError) {
        if (!ignore) {
          setExpenseQuote({
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
    expenseDialog,
    expenseForm.amount,
    expenseForm.mobileMoneyChannel,
    expenseForm.mobileMoneyNetwork,
    expenseForm.paymentMethod,
    token,
  ]);

  const galleryEntry =
    galleryTarget !== null
      ? pageEntries.find((entry) => entry.id === galleryTarget.todoId) ?? null
      : null;

  const totalCount = summary?.totalCount ?? 0;
  const plannedTotal = summary?.plannedTotal ?? 0;
  const openLifecycleCount = summary?.openCount ?? 0;
  const topPriorityCount = summary?.topPriorityCount ?? 0;
  const withImagesCount = summary?.withImagesCount ?? 0;
  const completedCount = summary?.completedCount ?? 0;
  const completionShare = summary?.completionPercentage ?? 0;
  const imageCoverage = summary?.imageCoveragePercentage ?? 0;
  const latestTodo = summary?.latestTodo ?? null;
  const hasActiveBoardFilters =
    selectedFrequency !== "ALL" ||
    selectedPriority !== "ALL" ||
    selectedStatus !== "ALL" ||
    appliedSearch !== undefined ||
    hasExplicitDateFilter;

  function triggerRefresh() {
    setRefreshKey((current) => current + 1);
  }

  function openCreatePage() {
    router.push("/todos/new");
  }

  function openEditPage(entry: TodoResponse) {
    router.push(`/todos/${entry.id}/edit`);
  }

  function openExpenseDialog(entry: TodoResponse) {
    if (expenseCategories.length === 0) {
      toast.error(
        expenseCategoriesError ??
          "Expense categories are not available yet. Refresh and try again.",
      );
      return;
    }

    if (!canRecordTodoExpense(entry)) {
      toast.info(
        entry.frequency === "ONCE"
          ? `This todo is ${resolveTodoStatusLabel(entry.status).toLowerCase()}.`
          : "This recurring todo has no remaining budget or available occurrence left.",
      );
      return;
    }

    setExpenseForm(createTodoExpenseFormFromEntry(entry, expenseCategories));
    setExpenseDialog({ entry });
  }

  function openLinkedExpense(expenseId: string) {
    const params = new URLSearchParams();
    params.set("expenseId", expenseId);
    router.push(`/expenses?${params.toString()}`);
  }

  function closeExpenseDialog() {
    setExpenseDialog(null);
    setExpenseForm(createEmptyTodoExpenseForm());
    setExpenseQuote({ loading: false, error: null, data: null });
  }

  function updateExpenseForm(next: Partial<TodoExpenseFormValues>) {
    setExpenseForm((current) => {
      const merged = { ...current, ...next };

      if (next.paymentMethod === "MOBILE_MONEY") {
        merged.mobileMoneyChannel = current.mobileMoneyChannel || "P2P_TRANSFER";
        merged.mobileMoneyNetwork = current.mobileMoneyNetwork || "ON_NET";
      }

      if (next.paymentMethod && next.paymentMethod !== "MOBILE_MONEY") {
        merged.mobileMoneyChannel = "";
        merged.mobileMoneyNetwork = "";
      }

      if (next.mobileMoneyChannel === "MERCHANT_CODE") {
        merged.mobileMoneyNetwork = "ON_NET";
      }

      return merged;
    });
  }

  function openGallery(todoId: string, index: number) {
    setGalleryTarget({ todoId, index });
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;

    try {
      await deleteTodo(token, deleteTarget.id);

      if (pageEntries.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        triggerRefresh();
      }

      toast.success("Wishlist item deleted.");

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

  async function handleToggleStatus(entry: TodoResponse) {
    if (!token) return;

    const nextStatus =
      entry.status === "COMPLETED" ||
      entry.status === "SKIPPED" ||
      entry.status === "ARCHIVED"
        ? "ACTIVE"
        : "COMPLETED";
    setStatusBusyId(entry.id);

    try {
      await updateTodo(token, entry.id, {
        status: nextStatus,
      });

      triggerRefresh();
      toast.success(
        nextStatus === "COMPLETED"
          ? "Wishlist item marked as completed."
          : "Wishlist item reopened.",
      );
    } catch (updateError) {
      toast.error(
        updateError instanceof ApiError
          ? updateError.message
          : "Wishlist item status could not be updated right now.",
      );
    } finally {
      setStatusBusyId(null);
    }
  }

  async function handleRecordExpense(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token || !expenseDialog) return;

    const amount = Number(expenseForm.amount);

    if (
      expenseForm.category === "" ||
      expenseForm.paymentMethod === "" ||
      Number.isNaN(amount) ||
      amount <= 0 ||
      !expenseForm.date
    ) {
      toast.error("Choose a category, payment method, amount, and date before recording.");
      return;
    }

    if (
      expenseForm.paymentMethod === "MOBILE_MONEY" &&
      expenseForm.mobileMoneyChannel === ""
    ) {
      toast.error("Choose a mobile money transfer type before recording.");
      return;
    }

    if (
      expenseForm.paymentMethod === "MOBILE_MONEY" &&
      expenseForm.mobileMoneyChannel === "P2P_TRANSFER" &&
      expenseForm.mobileMoneyNetwork === ""
    ) {
      toast.error("Choose a mobile money network before recording.");
      return;
    }

    if (
      expenseForm.paymentMethod === "MOBILE_MONEY" &&
      expenseQuote.data === null
    ) {
      toast.error(
        expenseQuote.error ?? "Wait for the mobile money fee calculation before recording.",
      );
      return;
    }

    const chargedAmount =
      expenseForm.paymentMethod === "MOBILE_MONEY"
        ? expenseQuote.data?.totalAmountRwf ?? amount
        : amount;

    if (
      expenseDialog.entry.frequency !== "ONCE" &&
      expenseDialog.entry.remainingAmount !== null &&
      chargedAmount > expenseDialog.entry.remainingAmount
    ) {
      toast.error("Total charged amount cannot exceed the remaining recurring budget.");
      return;
    }

    setRecordingExpense(true);
    setRecordExpenseBusyId(expenseDialog.entry.id);

    try {
      const mobileMoneyChannel =
        expenseForm.paymentMethod === "MOBILE_MONEY"
          ? expenseForm.mobileMoneyChannel || undefined
          : undefined;
      const mobileMoneyNetwork =
        expenseForm.paymentMethod === "MOBILE_MONEY" &&
        expenseForm.mobileMoneyChannel === "P2P_TRANSFER"
          ? expenseForm.mobileMoneyNetwork || undefined
          : undefined;

      await recordTodoExpense(token, expenseDialog.entry.id, {
        label: expenseDialog.entry.name.trim(),
        amount,
        category: expenseForm.category,
        paymentMethod: expenseForm.paymentMethod,
        ...(expenseForm.paymentMethod === "MOBILE_MONEY"
          ? {
              mobileMoneyProvider: "MTN_RWANDA" as const,
              mobileMoneyChannel,
              ...(mobileMoneyChannel === "P2P_TRANSFER"
                ? { mobileMoneyNetwork }
                : {}),
            }
          : {}),
        date: expenseForm.date,
        occurrenceDate: expenseForm.date,
      });
      triggerRefresh();
      closeExpenseDialog();
      toast.success(
        expenseDialog.entry.frequency === "ONCE"
          ? "Expense recorded and todo moved to recorded status."
          : "Expense recorded and recurring todo status updated.",
      );
    } catch (recordError) {
      toast.error(
        recordError instanceof ApiError
          ? recordError.message
          : "Expense could not be recorded right now.",
      );
    } finally {
      setRecordingExpense(false);
      setRecordExpenseBusyId(null);
    }
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <TodosHeader onCreate={openCreatePage} />

        <section className="animate-dashboard-rise">
          <div className="group relative overflow-hidden rounded-[28px] border border-primary/12 bg-[linear-gradient(145deg,rgba(28,24,18,0.95)_0%,rgba(17,13,10,0.99)_100%)] px-4 py-4 shadow-[0_18px_56px_rgba(24,16,8,0.24)] md:px-5">
            <div className="pointer-events-none absolute inset-0">
              <div className="motion-safe:animate-income-drift absolute -right-8 top-0 h-28 w-28 rounded-full bg-primary/12 blur-3xl" />
              <div className="motion-safe:animate-income-sweep absolute inset-y-0 left-[-28%] w-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-60 blur-lg" />
            </div>

            <div className="relative z-10 grid gap-3 lg:grid-cols-[minmax(0,1.16fr)_280px]">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      <span className="motion-safe:animate-income-glow h-1.5 w-1.5 rounded-full bg-primary" />
                      Wishlist
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                      Purchase pipeline
                    </p>
                  </div>

                  <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/54">
                      Board
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {totalCount} {totalCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[clamp(1.85rem,3.5vw,2.9rem)] font-semibold leading-none tracking-[-0.055em] text-white transition-transform duration-500 ease-out group-hover:translate-x-1">
                      {rwfCompact(plannedTotal)}
                    </p>
                    <div className="mt-2 h-1.5 w-[min(220px,52vw)] overflow-hidden rounded-full bg-white/6">
                      <div
                        className="motion-safe:animate-income-sweep h-full rounded-full bg-[linear-gradient(90deg,rgba(199,191,167,0.42),rgba(199,191,167,1),rgba(228,192,99,0.64))] bg-[length:200%_100%]"
                        style={{ width: `${completionShare}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                      {openLifecycleCount} active or recorded
                    </span>
                    <span className="rounded-full border border-warning/14 bg-warning/8 px-2.5 py-1 text-[11px] font-medium text-warning/88">
                      {topPriorityCount} top priority
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
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                    <p className="mt-2 text-base font-semibold tracking-[-0.04em] text-text-primary">
                      {latestTodo ? formatTodoDate(latestTodo.createdAt) : "No entries yet"}
                    </p>
                  <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                    {latestTodo
                      ? latestTodo.name
                      : "Add an item to start shaping the wishlist."}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                      Visual coverage
                    </p>
                    <span className="text-[11px] font-medium text-primary">
                      {imageCoverage}%
                    </span>
                  </div>
                  <p className="mt-2 text-base font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                    {withImagesCount} {withImagesCount === 1 ? "item" : "items"} with images
                  </p>
                    <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                      {completedCount} {completedCount === 1 ? "item is" : "items are"} already completed.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[32px] p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
                Wishlist board
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                Wishlist items ordered by when you added them
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {totalItems}
              {hasActiveBoardFilters ? ` of ${totalCount}` : ""}{" "}
              {totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          <TodosBoardFilters
            dateFrom={selectedDateFrom}
            dateTo={selectedDateTo}
            status={selectedStatus}
            frequency={selectedFrequency}
            hasActiveFilters={hasActiveBoardFilters}
            priority={selectedPriority}
            search={searchInput}
            onClear={() => {
              setSelectedFrequency("ALL");
              setSelectedPriority("ALL");
              setSelectedStatus("ALL");
              setSearchInput("");
              setSelectedDateFrom("");
              setSelectedDateTo("");
              setCurrentPage(1);
            }}
            onDateFromChange={setSelectedDateFrom}
            onDateToChange={setSelectedDateTo}
            onStatusChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}
            onFrequencyChange={(value) => {
              setSelectedFrequency(value);
              setCurrentPage(1);
            }}
            onPriorityChange={(value) => {
              setSelectedPriority(value);
              setCurrentPage(1);
            }}
            onSearchChange={setSearchInput}
          />

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
            ) : totalCount === 0 ? (
              <EmptyState
                title="No wishlist items yet"
                description="Add the products or goals you want to save for, then keep the top lane brutally selective."
                action={{
                  label: "Add item",
                  onClick: openCreatePage,
                }}
              />
            ) : totalItems === 0 ? (
              <EmptyState
                title="No wishlist matches"
                description="Try another search, date range, priority, or status filter to reveal more wishlist items."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setSelectedFrequency("ALL");
                    setSelectedPriority("ALL");
                    setSelectedStatus("ALL");
                    setSearchInput("");
                    setSelectedDateFrom("");
                    setSelectedDateTo("");
                    setCurrentPage(1);
                  },
                }}
              />
            ) : (
              <TodosBoard
                busyDoneId={statusBusyId}
                busyRecordExpenseId={recordExpenseBusyId}
                entries={pageEntries}
                onDelete={setDeleteTarget}
                onEdit={openEditPage}
                onOpenExpense={openLinkedExpense}
                onOpenGallery={openGallery}
                onRecordExpense={openExpenseDialog}
                onToggleDone={handleToggleStatus}
              />
            )}
          </div>

          <PaginationControls
            className="mt-6 border-t-0 px-0 pb-0 pt-0 md:px-0"
            currentPage={currentPage}
            pageSize={DEFAULT_PAGE_SIZE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="item"
            onPageChange={setCurrentPage}
          />
        </section>
      </div>

      {expenseDialog ? (
        <TodoExpenseDialog
          categories={expenseCategories}
          entry={expenseDialog.entry}
          form={expenseForm}
          onOpenExpense={openLinkedExpense}
          quote={expenseQuote.data}
          quoteError={expenseQuote.error}
          quoteLoading={expenseQuote.loading}
          saving={recordingExpense}
          onChange={updateExpenseForm}
          onClose={closeExpenseDialog}
          onSubmit={handleRecordExpense}
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

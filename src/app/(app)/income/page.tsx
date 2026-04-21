"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createIncome,
  deleteIncome,
  getIncomeById,
  getIncomeSummary,
  listIncome,
  listIncomePage,
  listIncomeCategories,
  updateIncome,
} from "@/lib/api/income/income.api";
import { reverseSavingDeposit } from "@/lib/api/savings/savings.api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/pagination";
import type {
  CreateIncomeRequest,
  IncomeCategoryOptionResponse,
  IncomeSavingAllocationResponse,
  IncomeResponse,
  IncomeSummaryResponse,
} from "@/lib/types/income.types";
import { rwfCompact } from "@/lib/utils/currency";
import { IncomeFormDialog } from "./income/income-form-dialog";
import { IncomeDetailsDialog } from "./income/income-details-dialog";
import { IncomeHeader } from "./income/income-header";
import { IncomeLedgerFilters } from "./income/income-ledger-filters";
import type {
  IncomeLedgerAllocationFilter,
  IncomeDetailsDialogState,
  IncomeFormDialogState,
  IncomeFormValues,
  IncomeLedgerCategoryFilter,
  IncomeLedgerReceivedFilter,
} from "./income/income-page.types";
import { IncomeSummaryCard } from "./income/income-summary-card";
import { IncomeTable } from "./income/income-table";
import { IncomeTableSkeleton } from "./income/income-table-skeleton";
import {
  buildIncomeLedgerCategoryOptions,
  createEmptyIncomeForm,
  createIncomeFormFromCategories,
  createIncomeFormFromEntry,
  createIncomeFormForNextMonth,
  getCurrentMonthIndex,
  getCurrentYear,
  resolveIncomeMonthLabel,
  sortIncomeEntries,
} from "./income/income.utils";

export default function IncomePage() {
  const { token } = useAuth();
  const toast = useToast();
  const defaultMonth = getCurrentMonthIndex();

  const [entries, setEntries] = useState<IncomeResponse[]>([]);
  const [pageEntries, setPageEntries] = useState<IncomeResponse[]>([]);
  const [summary, setSummary] = useState<IncomeSummaryResponse | null>(null);
  const [categories, setCategories] = useState<IncomeCategoryOptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [receivedBusyId, setReceivedBusyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [formDialog, setFormDialog] = useState<IncomeFormDialogState>(null);
  const [detailsDialog, setDetailsDialog] =
    useState<IncomeDetailsDialogState>(null);
  const [pendingAllocationReversal, setPendingAllocationReversal] = useState<{
    allocation: IncomeSavingAllocationResponse;
    entry: IncomeResponse;
  } | null>(null);
  const [blockedIncomeAction, setBlockedIncomeAction] = useState<{
    action: "edit" | "delete";
    entry: IncomeResponse;
  } | null>(null);
  const [reversingAllocationId, setReversingAllocationId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IncomeResponse | null>(null);
  const [form, setForm] = useState<IncomeFormValues>(() => createEmptyIncomeForm());
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedCategory, setSelectedCategory] =
    useState<IncomeLedgerCategoryFilter>("ALL");
  const [selectedAllocation, setSelectedAllocation] =
    useState<IncomeLedgerAllocationFilter>("ALL");
  const [selectedReceived, setSelectedReceived] =
    useState<IncomeLedgerReceivedFilter>("ALL");
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
    setCurrentPage(1);
  }, [appliedSearch, selectedDateFrom, selectedDateTo]);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadIncomeCategories() {
      setCategoriesError(null);

      try {
        const response = await listIncomeCategories(sessionToken);

        if (!ignore) {
          setCategories(response);
        }
      } catch (loadError) {
        if (!ignore) {
          setCategoriesError(
            loadError instanceof ApiError
              ? loadError.message
              : "Income categories are unavailable right now.",
          );
        }
      }
    }

    void loadIncomeCategories();

    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadSummaryData() {
      try {
        const summaryResponse = await getIncomeSummary(sessionToken, {
          month: hasExplicitDateFilter ? undefined : selectedMonth + 1,
          year: hasExplicitDateFilter ? undefined : selectedYear,
          dateFrom: selectedDateFrom || undefined,
          dateTo: selectedDateTo || undefined,
        });

        if (!ignore) {
          setSummary(summaryResponse);
        }
      } catch {
        if (!ignore) {
          setSummary(null);
        }
      }
    }

    void loadSummaryData();

    return () => {
      ignore = true;
    };
  }, [
    hasExplicitDateFilter,
    refreshKey,
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    token,
  ]);

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;

    let ignore = false;

    async function loadIncomeEntries() {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          month: hasExplicitDateFilter ? undefined : selectedMonth + 1,
          year: hasExplicitDateFilter ? undefined : selectedYear,
          category:
            selectedCategory === "ALL" ? undefined : selectedCategory,
          allocationStatus:
            selectedAllocation === "ALL" ? undefined : selectedAllocation,
          received:
            selectedReceived === "ALL"
              ? undefined
              : selectedReceived === "RECEIVED",
          search: appliedSearch,
          dateFrom: selectedDateFrom || undefined,
          dateTo: selectedDateTo || undefined,
        };

        const [summaryResponse, pageResponse] = await Promise.all([
          listIncome(sessionToken, filters),
          listIncomePage(sessionToken, {
            ...filters,
            page: currentPage,
            limit: DEFAULT_PAGE_SIZE,
          }),
        ]);

        if (!ignore) {
          setEntries(sortIncomeEntries(summaryResponse));

          if (pageResponse.meta.totalPages < currentPage) {
            setCurrentPage(pageResponse.meta.totalPages);
            return;
          }

          setPageEntries(pageResponse.items);
          setTotalItems(pageResponse.meta.totalItems);
          setTotalPages(pageResponse.meta.totalPages);
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

    void loadIncomeEntries();

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
    selectedAllocation,
    selectedCategory,
    selectedMonth,
    selectedReceived,
    selectedYear,
    token,
  ]);

  const totalIncome = summary?.totalIncomeRwf ?? 0;
  const receivedIncome = summary?.receivedIncomeRwf ?? 0;
  const pendingIncome = summary?.pendingIncomeRwf ?? 0;
  const totalExpenses = summary?.totalExpensesRwf ?? 0;
  const totalSavingsBalance = summary?.totalSavingsBalanceRwf ?? 0;
  const availableMoneyNow = summary?.availableMoneyNowRwf ?? 0;
  const selectedMonthLabel = resolveIncomeMonthLabel(selectedMonth);
  const ledgerCategoryOptions = buildIncomeLedgerCategoryOptions(
    categories,
    entries,
  );
  const hasActiveLedgerFilters =
    selectedMonth !== defaultMonth ||
    selectedAllocation !== "ALL" ||
    selectedCategory !== "ALL" ||
    selectedReceived !== "ALL" ||
    appliedSearch !== undefined ||
    hasExplicitDateFilter;
  const canManageCategories = categories.length > 0;
  const receivedShare =
    totalIncome > 0 ? Math.round((receivedIncome / totalIncome) * 100) : 0;
  const receivedEntriesCount = summary?.receivedIncomeCount ?? 0;
  const pendingEntriesCount = summary?.pendingIncomeCount ?? 0;

  function triggerRefresh() {
    setRefreshKey((current) => current + 1);
  }

  function openCreateDialog() {
    if (!canManageCategories) {
      toast.error(categoriesError ?? "Income categories are unavailable right now.");
      return;
    }

    setForm(createIncomeFormFromCategories(categories, selectedMonth, selectedYear));
    setFormDialog({ mode: "create" });
  }

  function openEditDialog(entry: IncomeResponse) {
    if (!canManageCategories) {
      toast.error(categoriesError ?? "Income categories are unavailable right now.");
      return;
    }

    setForm(createIncomeFormFromEntry(entry));
    setFormDialog({ mode: "edit", entry });
  }

  function openRecordNextMonthDialog(entry: IncomeResponse) {
    if (!canManageCategories) {
      toast.error(categoriesError ?? "Income categories are unavailable right now.");
      return;
    }

    setForm(createIncomeFormForNextMonth(entry));
    setFormDialog({ mode: "create" });
  }

  function closeFormDialog() {
    setFormDialog(null);
    setForm(createEmptyIncomeForm());
  }

  async function openDetailsDialog(
    entry: IncomeResponse,
    options?: { highlightFirstActiveAllocation?: boolean },
  ) {
    if (!token) return;

    setDetailsDialog({
      entry,
      detail: null,
      highlightAllocationId: null,
      loading: true,
    });

    try {
      const detail = await getIncomeById(token, entry.id);
      const highlightAllocationId = options?.highlightFirstActiveAllocation
        ? detail.savingAllocations.find((allocation) => !allocation.isReversed)
            ?.id ?? null
        : null;
      setDetailsDialog({
        entry: detail,
        detail,
        highlightAllocationId,
        loading: false,
      });
    } catch (detailError) {
      toast.error(
        detailError instanceof ApiError
          ? detailError.message
          : "Income details could not be loaded right now.",
      );
      setDetailsDialog(null);
    }
  }

  function closeDetailsDialog() {
    setDetailsDialog(null);
    setReversingAllocationId(null);
    setPendingAllocationReversal(null);
  }

  function openBlockedIncomeRecovery(
    entry: IncomeResponse,
    action: "edit" | "delete",
  ) {
    setBlockedIncomeAction({ action, entry });
  }

  async function handleOpenRecoveryDetails() {
    if (!blockedIncomeAction) {
      return;
    }

    const { entry } = blockedIncomeAction;
    setBlockedIncomeAction(null);
    await openDetailsDialog(entry, { highlightFirstActiveAllocation: true });
  }

  function requestReverseAllocation(
    entry: IncomeResponse,
    allocation: IncomeSavingAllocationResponse,
  ) {
    setPendingAllocationReversal({ entry, allocation });
  }

  async function handleReverseAllocation() {
    if (!pendingAllocationReversal || !token) {
      return;
    }

    const { entry, allocation } = pendingAllocationReversal;
    setPendingAllocationReversal(null);

    if (!token) {
      return;
    }

    setReversingAllocationId(allocation.id);

    try {
      await reverseSavingDeposit(
        token,
        allocation.savingId,
        allocation.transactionId,
      );

      const updatedDetail = await getIncomeById(token, entry.id);
      setDetailsDialog({
        entry: updatedDetail,
        detail: updatedDetail,
        loading: false,
      });
      triggerRefresh();
      toast.success("Income allocation reversed.");
    } catch (reverseError) {
      toast.error(
        reverseError instanceof ApiError
          ? reverseError.message
          : "Income allocation could not be reversed right now.",
      );
    } finally {
      setReversingAllocationId(null);
    }
  }

  function updateForm(next: Partial<IncomeFormValues>) {
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
      toast.error("Select an income category.");
      return;
    }

    const payload: CreateIncomeRequest = {
      label: form.label.trim(),
      amount,
      category: form.category,
      date: form.date,
      received: form.received,
    };

    setSaving(true);

    try {
      if (formDialog.mode === "edit") {
        await updateIncome(token, formDialog.entry.id, payload);
        toast.success("Income entry updated.");
        triggerRefresh();
      } else {
        await createIncome(token, payload);
        toast.success("Income entry added.");

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
      if (pageEntries.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        triggerRefresh();
      }
      toast.success("Income entry deleted.");

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
          : "Income could not be deleted right now.",
      );
    }
  }

  async function handleToggleReceived(entry: IncomeResponse) {
    if (!token) return;

    const nextReceived = !entry.received;
    setReceivedBusyId(entry.id);

    try {
      await updateIncome(token, entry.id, {
        received: nextReceived,
      });
      triggerRefresh();
      toast.success(
        nextReceived
          ? "Income marked as received."
          : "Income marked as pending.",
      );
    } catch (toggleError) {
      toast.error(
        toggleError instanceof ApiError
          ? toggleError.message
          : "Income receipt state could not be updated right now.",
      );
    } finally {
      setReceivedBusyId(null);
    }
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <IncomeHeader
          canCreate={canManageCategories}
          onCreate={openCreateDialog}
        />

        <section className="animate-dashboard-rise">
          <div className="group relative overflow-hidden rounded-[28px] border border-success/12 bg-[linear-gradient(145deg,rgba(17,24,32,0.94)_0%,rgba(11,14,20,0.98)_100%)] px-4 py-4 shadow-[0_18px_56px_rgba(6,16,30,0.22)] md:px-5">
            <div className="pointer-events-none absolute inset-0">
              <div className="motion-safe:animate-income-drift absolute -right-8 top-0 h-28 w-28 rounded-full bg-success/12 blur-3xl" />
              <div className="motion-safe:animate-income-sweep absolute inset-y-0 left-[-28%] w-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-60 blur-lg" />
            </div>

            <div className="relative z-10 grid gap-3 lg:grid-cols-[minmax(0,1.16fr)_280px]">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-success/15 bg-success/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-success/78">
                      <span className="motion-safe:animate-income-glow h-1.5 w-1.5 rounded-full bg-success" />
                      Scheduled income
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
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                      Total income
                    </p>
                    <p className="text-[clamp(1.85rem,3.5vw,2.9rem)] font-semibold leading-none tracking-[-0.055em] text-white transition-transform duration-500 ease-out group-hover:translate-x-1">
                      {rwfCompact(totalIncome)}
                    </p>
                    <div className="mt-2 h-1.5 w-[min(220px,52vw)] overflow-hidden rounded-full bg-white/6">
                      <div
                        className="motion-safe:animate-income-sweep h-full rounded-full bg-[linear-gradient(90deg,rgba(74,222,128,0.48),rgba(34,197,94,1),rgba(74,222,128,0.48))] bg-[length:200%_100%]"
                        style={{ width: `${receivedShare}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-success/14 bg-success/8 px-2.5 py-1 text-[11px] font-medium text-success/82">
                      {rwfCompact(receivedIncome)} received cash
                    </span>
                    <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                      {rwfCompact(pendingIncome)} pending to receive
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <IncomeSummaryCard
                  eyebrow="Received cash"
                  value={rwfCompact(receivedIncome)}
                  tone="success"
                  detail={`${receivedEntriesCount} ${receivedEntriesCount === 1 ? "entry is" : "entries are"} already in hand. ${pendingEntriesCount} ${pendingEntriesCount === 1 ? "entry is" : "entries are"} still scheduled and not yet counted as cash you have.`}
                />

                <IncomeSummaryCard
                  eyebrow="Available money now"
                  value={rwfCompact(availableMoneyNow)}
                  tone="primary"
                  detail={`${rwfCompact(receivedIncome)} received, minus ${rwfCompact(totalExpenses)} spent and ${rwfCompact(totalSavingsBalance)} currently parked in savings.`}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel overflow-hidden rounded-[32px]">
          <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-5 md:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
                Income ledger
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                {selectedMonthLabel} {selectedYear} income
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Planned income stays here until it is marked received. Only received cash counts as money you already have, and saving allocations show how much is still free.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-medium text-text-secondary">
              {totalItems}
              {hasActiveLedgerFilters ? ` of ${entries.length}` : ""} rows
            </span>
          </div>

          <IncomeLedgerFilters
            allocation={selectedAllocation}
            category={selectedCategory}
            categoryOptions={ledgerCategoryOptions}
            dateFrom={selectedDateFrom}
            dateTo={selectedDateTo}
            hasActiveFilters={hasActiveLedgerFilters}
            month={selectedMonth}
            received={selectedReceived}
            search={searchInput}
            onAllocationChange={(value) => {
              setSelectedAllocation(value);
              setCurrentPage(1);
            }}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSelectedMonth(defaultMonth);
              setSelectedAllocation("ALL");
              setSelectedCategory("ALL");
              setSelectedReceived("ALL");
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
            onReceivedChange={(value) => {
              setSelectedReceived(value);
              setCurrentPage(1);
            }}
            onSearchChange={setSearchInput}
          />

          {loading ? (
            <IncomeTableSkeleton />
          ) : error ? (
            <div className="px-5 py-10 md:px-6">
              <EmptyState
                title="Could not load income"
                description={error}
                action={{
                  label: "Refresh",
                  onClick: () => window.location.reload(),
                }}
              />
            </div>
          ) : entries.length === 0 ? (
            <div className="px-5 py-10 md:px-6">
              <EmptyState
                title="No income recorded yet"
                description="Add your first income source to start building the ledger."
                action={{
                  label: "Add income",
                  onClick: openCreateDialog,
                }}
              />
            </div>
          ) : totalItems === 0 ? (
            <div className="px-5 py-10 md:px-6">
              <EmptyState
                title="No ledger matches"
                description="Try another search, date range, category, or received state to reveal more income rows."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setSelectedMonth(defaultMonth);
                    setSelectedAllocation("ALL");
                    setSelectedCategory("ALL");
                    setSelectedReceived("ALL");
                    setSearchInput("");
                    setSelectedDateFrom("");
                    setSelectedDateTo("");
                    setCurrentPage(1);
                  },
                }}
              />
            </div>
          ) : (
            <IncomeTable
              busyReceivedId={receivedBusyId}
              canEdit={canManageCategories}
              categories={categories}
              entries={pageEntries}
              onDelete={setDeleteTarget}
              onDetails={openDetailsDialog}
              onEdit={openEditDialog}
              onRecordNextMonth={openRecordNextMonthDialog}
              onRecover={openBlockedIncomeRecovery}
              onToggleReceived={handleToggleReceived}
            />
          )}

          <PaginationControls
            currentPage={currentPage}
            pageSize={DEFAULT_PAGE_SIZE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="row"
            onPageChange={setCurrentPage}
          />
        </section>
      </div>

      {formDialog ? (
        <IncomeFormDialog
          categories={categories}
          entry={formDialog.mode === "edit" ? formDialog.entry : undefined}
          form={form}
          mode={formDialog.mode}
          onOpenRecovery={async (entry) => {
            closeFormDialog();
            await openDetailsDialog(entry, {
              highlightFirstActiveAllocation: true,
            });
          }}
          saving={saving}
          onChange={updateForm}
          onClose={closeFormDialog}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detailsDialog ? (
        <IncomeDetailsDialog
          categories={categories}
          detail={detailsDialog.detail}
          entry={detailsDialog.entry}
          highlightAllocationId={detailsDialog.highlightAllocationId}
          loading={detailsDialog.loading}
          reversingAllocationId={reversingAllocationId}
          onClose={closeDetailsDialog}
          onReverseAllocation={requestReverseAllocation}
        />
      ) : null}

      {blockedIncomeAction ? (
        <Dialog onClose={() => setBlockedIncomeAction(null)} className="sm:max-w-lg">
          <h2 className="mb-2 text-lg font-semibold tracking-heading-sm text-text-primary">
            {blockedIncomeAction.action === "delete"
              ? "This income cannot be deleted yet"
              : "Some income changes are blocked"}
          </h2>
          <p className="text-sm leading-6 text-text-secondary">
            {blockedIncomeAction.entry.label} already funds one or more saving
            buckets. To {blockedIncomeAction.action}, first reverse the linked
            saving allocation so this income becomes free again.
          </p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/56">
              Allocated now
            </p>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {rwfCompact(blockedIncomeAction.entry.allocatedToSavingsRwf)} moved to savings
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {rwfCompact(blockedIncomeAction.entry.remainingAvailableRwf)} still free
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setBlockedIncomeAction(null)}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleOpenRecoveryDetails()}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Review allocations
            </button>
          </div>
        </Dialog>
      ) : null}

      {pendingAllocationReversal ? (
        <ConfirmActionDialog
          title="Reverse saving allocation"
          description={`This will remove ${rwfCompact(
            pendingAllocationReversal.allocation.amountRwf,
          )} from ${pendingAllocationReversal.allocation.savingLabel}, create a matching saving withdrawal, and make that income available again.`}
          actionLabel="Reverse"
          confirmLabel="Reverse allocation"
          onCancel={() => setPendingAllocationReversal(null)}
          onConfirm={handleReverseAllocation}
        />
      ) : null}

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

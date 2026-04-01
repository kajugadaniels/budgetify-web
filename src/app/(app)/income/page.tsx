"use client";

import { useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createIncome,
  deleteIncome,
  listIncome,
  listIncomePage,
  listIncomeCategories,
  updateIncome,
} from "@/lib/api/income/income.api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/pagination";
import type {
  CreateIncomeRequest,
  IncomeCategoryOptionResponse,
  IncomeResponse,
} from "@/lib/types/income.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import { IncomeFormDialog } from "./income/income-form-dialog";
import { IncomeHeader } from "./income/income-header";
import { IncomeLedgerFilters } from "./income/income-ledger-filters";
import type {
  IncomeFormDialogState,
  IncomeFormValues,
  IncomeLedgerCategoryFilter,
  IncomeLedgerReceivedFilter,
} from "./income/income-page.types";
import { IncomeTable } from "./income/income-table";
import { IncomeTableSkeleton } from "./income/income-table-skeleton";
import {
  buildIncomeLedgerCategoryOptions,
  createEmptyIncomeForm,
  createIncomeFormFromCategories,
  createIncomeFormFromEntry,
  formatIncomeDate,
  getCurrentMonthIndex,
  getCurrentYear,
  resolveIncomeMonthLabel,
  resolveIncomeCategoryLabel,
  sortIncomeEntries,
} from "./income/income.utils";

export default function IncomePage() {
  const { token } = useAuth();
  const toast = useToast();
  const defaultMonth = getCurrentMonthIndex();

  const [entries, setEntries] = useState<IncomeResponse[]>([]);
  const [pageEntries, setPageEntries] = useState<IncomeResponse[]>([]);
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
  const [deleteTarget, setDeleteTarget] = useState<IncomeResponse | null>(null);
  const [form, setForm] = useState<IncomeFormValues>(() => createEmptyIncomeForm());
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedCategory, setSelectedCategory] =
    useState<IncomeLedgerCategoryFilter>("ALL");
  const [selectedReceived, setSelectedReceived] =
    useState<IncomeLedgerReceivedFilter>("ALL");
  const selectedYear = getCurrentYear();

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

    async function loadIncomeEntries() {
      setLoading(true);
      setError(null);

      try {
        const [summaryResponse, pageResponse] = await Promise.all([
          listIncome(sessionToken, {
            month: selectedMonth + 1,
            year: selectedYear,
          }),
          listIncomePage(sessionToken, {
            month: selectedMonth + 1,
            year: selectedYear,
            category:
              selectedCategory === "ALL" ? undefined : selectedCategory,
            received:
              selectedReceived === "ALL"
                ? undefined
                : selectedReceived === "RECEIVED",
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
    refreshKey,
    selectedCategory,
    selectedMonth,
    selectedReceived,
    selectedYear,
    token,
  ]);

  const totalIncome = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const receivedIncome = entries
    .filter((entry) => entry.received)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const selectedMonthLabel = resolveIncomeMonthLabel(selectedMonth);
  const ledgerCategoryOptions = buildIncomeLedgerCategoryOptions(
    categories,
    entries,
  );
  const hasActiveLedgerFilters =
    selectedMonth !== defaultMonth ||
    selectedCategory !== "ALL" ||
    selectedReceived !== "ALL";
  const mostRecentEntry = entries[0];
  const highestEntry = [...entries].sort(
    (left, right) => Number(right.amount) - Number(left.amount),
  )[0];
  const canManageCategories = categories.length > 0;
  const pendingIncome = Math.max(totalIncome - receivedIncome, 0);
  const receivedShare =
    totalIncome > 0 ? Math.round((receivedIncome / totalIncome) * 100) : 0;

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

  function closeFormDialog() {
    setFormDialog(null);
    setForm(createEmptyIncomeForm());
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

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.24fr)_minmax(320px,0.86fr)]">
          <div className="relative overflow-hidden rounded-[34px] border border-success/14 bg-[linear-gradient(155deg,rgba(15,23,42,0.82)_0%,rgba(9,16,28,0.96)_100%)] px-6 py-6 shadow-[0_24px_80px_rgba(6,16,30,0.26)] md:px-7 md:py-7">
            <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.16),transparent_68%)]" />
            <div className="absolute inset-x-6 top-[92px] h-px bg-white/8 md:inset-x-7" />

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-success/18 bg-success/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-success/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Income overview
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary/62">
                    {selectedMonthLabel} {selectedYear}
                  </p>
                  <p className="mt-4 text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-none tracking-[-0.05em] text-white">
                    {rwfCompact(totalIncome)}
                  </p>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                  Ledger items
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
                  {entries.length}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {entries.length === 1 ? "entry" : "entries"} dated in this
                  month
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-10 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                      Received so far
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-success">
                      {rwfCompact(receivedIncome)}
                    </p>
                  </div>
                  <span className="rounded-full border border-success/16 bg-success/10 px-2.5 py-1 text-xs font-medium text-success/85">
                    {receivedShare}% collected
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(74,222,128,0.78),rgba(34,197,94,1))]"
                    style={{ width: `${receivedShare}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                  Still pending
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
                  {rwfCompact(pendingIncome)}
                </p>
                <p className="mt-3 text-xs leading-5 text-text-secondary">
                  Income already planned for this month but not marked as
                  received yet.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                  Most recent signal
                </p>
                <span className="h-2 w-2 rounded-full bg-success" />
              </div>
              <p className="mt-4 text-[1.7rem] font-semibold tracking-[-0.04em] text-text-primary">
                {mostRecentEntry
                  ? formatIncomeDate(mostRecentEntry.date)
                  : "No entries yet"}
              </p>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {mostRecentEntry
                  ? `${mostRecentEntry.label} was the latest income recorded in ${selectedMonthLabel}.`
                  : `No income dated in ${selectedMonthLabel} ${selectedYear}.`}
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-5 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                Strongest source
              </p>
              <p className="mt-4 text-[1.55rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                {highestEntry
                  ? resolveIncomeCategoryLabel(categories, highestEntry.category)
                  : "No entries yet"}
              </p>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {highestEntry
                  ? `${highestEntry.label} · ${rwf(Number(highestEntry.amount))}`
                  : "Add your first income entry to reveal the strongest source."}
              </p>
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
            </div>

            <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-medium text-text-secondary">
              {totalItems}
              {hasActiveLedgerFilters ? ` of ${entries.length}` : ""} rows
            </span>
          </div>

          <IncomeLedgerFilters
            category={selectedCategory}
            categoryOptions={ledgerCategoryOptions}
            hasActiveFilters={hasActiveLedgerFilters}
            month={selectedMonth}
            received={selectedReceived}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSelectedMonth(defaultMonth);
              setSelectedCategory("ALL");
              setSelectedReceived("ALL");
              setCurrentPage(1);
            }}
            onMonthChange={(value) => {
              setSelectedMonth(value);
              setCurrentPage(1);
            }}
            onReceivedChange={(value) => {
              setSelectedReceived(value);
              setCurrentPage(1);
            }}
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
                description="Try a different category or received state to reveal more income rows for this month."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setSelectedCategory("ALL");
                    setSelectedReceived("ALL");
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
              onEdit={openEditDialog}
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
          form={form}
          mode={formDialog.mode}
          saving={saving}
          onChange={updateForm}
          onClose={closeFormDialog}
          onSubmit={handleSubmit}
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

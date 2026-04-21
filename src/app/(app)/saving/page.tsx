"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { listIncome } from "@/lib/api/income/income.api";
import {
  createSaving,
  createSavingDeposit,
  createSavingWithdrawal,
  deleteSaving,
  listSavingTransactions,
  listSavings,
  listSavingsPage,
  updateSaving,
} from "@/lib/api/savings/savings.api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/pagination";
import type { IncomeResponse } from "@/lib/types/income.types";
import type {
  CreateSavingRequest,
  SavingResponse,
  SavingTransactionResponse,
  UpdateSavingRequest,
} from "@/lib/types/saving.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import { SavingDetailsDialog } from "./saving/saving-details-dialog";
import { SavingDepositDialog } from "./saving/saving-deposit-dialog";
import { SavingExpenseDialog } from "./saving/saving-expense-dialog";
import { SavingFormDialog } from "./saving/saving-form-dialog";
import { SavingHeader } from "./saving/saving-header";
import { SavingHistoryDialog } from "./saving/saving-history-dialog";
import { SavingLedgerFilters } from "./saving/saving-ledger-filters";
import type {
  SavingDepositDialogState,
  SavingDetailsDialogState,
  SavingDepositFormValues,
  SavingFormDialogState,
  SavingFormValues,
  SavingHistoryDialogState,
  SavingWithdrawalDialogState,
  SavingWithdrawalFormValues,
} from "./saving/saving-page.types";
import { SavingTable } from "./saving/saving-table";
import { SavingTableSkeleton } from "./saving/saving-table-skeleton";
import {
  createEmptySavingDepositForm,
  createEmptySavingForm,
  createEmptySavingWithdrawalForm,
  createEmptySourceAllocation,
  createSavingDepositFormFromEntry,
  createSavingFormFromEntry,
  createSavingWithdrawalFormFromEntry,
  formatSavingDate,
  getCurrentMonthIndex,
  getCurrentYear,
  resolveSavingMonthLabel,
  sortSavingEntries,
} from "./saving/saving.utils";

export default function SavingPage() {
  const { token } = useAuth();
  const toast = useToast();
  const defaultMonth = getCurrentMonthIndex();
  const defaultYear = getCurrentYear();

  const [entries, setEntries] = useState<SavingResponse[]>([]);
  const [pageEntries, setPageEntries] = useState<SavingResponse[]>([]);
  const [receivedIncomes, setReceivedIncomes] = useState<IncomeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [depositSaving, setDepositSaving] = useState(false);
  const [withdrawalSaving, setWithdrawalSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTransactions, setHistoryTransactions] = useState<
    SavingTransactionResponse[]
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [searchInput, setSearchInput] = useState("");
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const [formDialog, setFormDialog] = useState<SavingFormDialogState>(null);
  const [depositDialog, setDepositDialog] =
    useState<SavingDepositDialogState>(null);
  const [detailsDialog, setDetailsDialog] =
    useState<SavingDetailsDialogState>(null);
  const [withdrawalDialog, setWithdrawalDialog] =
    useState<SavingWithdrawalDialogState>(null);
  const [historyDialog, setHistoryDialog] =
    useState<SavingHistoryDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavingResponse | null>(null);
  const [form, setForm] = useState<SavingFormValues>(() =>
    createEmptySavingForm(),
  );
  const [depositForm, setDepositForm] = useState<SavingDepositFormValues>(() =>
    createEmptySavingDepositForm(),
  );
  const [withdrawalForm, setWithdrawalForm] =
    useState<SavingWithdrawalFormValues>(() =>
      createEmptySavingWithdrawalForm(),
    );
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

    async function loadSavings() {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          month: hasExplicitDateFilter ? undefined : selectedMonth + 1,
          year: hasExplicitDateFilter ? undefined : selectedYear,
          search: appliedSearch,
          dateFrom: selectedDateFrom || undefined,
          dateTo: selectedDateTo || undefined,
        };

        const [summaryResponse, pageResponse, incomeResponse] =
          await Promise.all([
            listSavings(sessionToken, filters),
            listSavingsPage(sessionToken, {
              ...filters,
              page: currentPage,
              limit: DEFAULT_PAGE_SIZE,
            }),
            listIncome(sessionToken, { received: true }),
          ]);

        if (!ignore) {
          setEntries(sortSavingEntries(summaryResponse));

          if (pageResponse.meta.totalPages < currentPage) {
            setCurrentPage(pageResponse.meta.totalPages);
            return;
          }

          setPageEntries(sortSavingEntries(pageResponse.items));
          setTotalItems(pageResponse.meta.totalItems);
          setTotalPages(pageResponse.meta.totalPages);
          setReceivedIncomes(
            incomeResponse.sort(
              (left, right) =>
                new Date(right.date).getTime() - new Date(left.date).getTime(),
            ),
          );
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "Saving entries could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadSavings();

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
    selectedMonth,
    selectedYear,
    token,
  ]);

  const selectedMonthLabel = resolveSavingMonthLabel(selectedMonth);
  const hasActiveFilters =
    selectedMonth !== defaultMonth ||
    selectedYear !== defaultYear ||
    appliedSearch !== undefined ||
    hasExplicitDateFilter;
  const totalBalance = entries.reduce(
    (sum, entry) => sum + entry.currentBalanceRwf,
    0,
  );
  const totalDeposited = entries.reduce(
    (sum, entry) => sum + entry.totalDepositedRwf,
    0,
  );
  const totalWithdrawn = entries.reduce(
    (sum, entry) => sum + entry.totalWithdrawnRwf,
    0,
  );
  const activeEntries = entries.filter((entry) => entry.currentBalanceRwf > 0);
  const activeBalance = activeEntries.reduce(
    (sum, entry) => sum + entry.currentBalanceRwf,
    0,
  );
  const largestSaving = [...entries].sort(
    (left, right) => right.currentBalanceRwf - left.currentBalanceRwf,
  )[0];
  const latestEntry = entries[0];
  const activeShare =
    totalDeposited > 0 ? Math.round((activeBalance / totalDeposited) * 100) : 0;

  function triggerRefresh() {
    setRefreshKey((current) => current + 1);
  }

  function handleMonthChange(nextMonth: number) {
    if (selectedMonth === 0 && nextMonth === 11) {
      setSelectedYear((current) => current - 1);
    } else if (selectedMonth === 11 && nextMonth === 0) {
      setSelectedYear((current) => current + 1);
    }

    setSelectedMonth(nextMonth);
    setCurrentPage(1);
  }

  function openCreateDialog() {
    setForm(createEmptySavingForm(selectedMonth, selectedYear));
    setFormDialog({ mode: "create" });
  }

  function openEditDialog(entry: SavingResponse) {
    setForm(createSavingFormFromEntry(entry));
    setFormDialog({ mode: "edit", entry });
  }

  function closeFormDialog() {
    setFormDialog(null);
    setForm(createEmptySavingForm(selectedMonth, selectedYear));
  }

  function openDepositDialog(entry: SavingResponse) {
    setDepositForm(createSavingDepositFormFromEntry(entry));
    setDepositDialog({ entry });
  }

  function openDetailsDialog(entry: SavingResponse) {
    setDetailsDialog({ entry });
  }

  function closeDetailsDialog() {
    setDetailsDialog(null);
  }

  function openDepositFromDetails(entry: SavingResponse) {
    closeDetailsDialog();
    openDepositDialog(entry);
  }

  function openWithdrawalFromDetails(entry: SavingResponse) {
    closeDetailsDialog();
    openWithdrawalDialog(entry);
  }

  function openHistoryFromDetails(entry: SavingResponse) {
    closeDetailsDialog();
    void openHistoryDialog(entry);
  }

  function openEditFromDetails(entry: SavingResponse) {
    closeDetailsDialog();
    openEditDialog(entry);
  }

  function closeDepositDialog() {
    setDepositDialog(null);
    setDepositForm(createEmptySavingDepositForm());
  }

  function openWithdrawalDialog(entry: SavingResponse) {
    setWithdrawalForm(createSavingWithdrawalFormFromEntry(entry));
    setWithdrawalDialog({ entry });
  }

  function closeWithdrawalDialog() {
    setWithdrawalDialog(null);
    setWithdrawalForm(createEmptySavingWithdrawalForm());
  }

  async function openHistoryDialog(entry: SavingResponse) {
    if (!token) return;

    setHistoryDialog({ entry, transactions: [], loading: true });
    setHistoryLoading(true);

    try {
      const transactions = await listSavingTransactions(token, entry.id);
      setHistoryTransactions(transactions);
      setHistoryDialog({ entry, transactions, loading: false });
    } catch (historyError) {
      toast.error(
        historyError instanceof ApiError
          ? historyError.message
          : "Saving history could not be loaded right now.",
      );
      setHistoryDialog(null);
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistoryDialog() {
    setHistoryDialog(null);
    setHistoryTransactions([]);
  }

  function updateForm(next: Partial<SavingFormValues>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function updateDepositForm(next: Partial<SavingDepositFormValues>) {
    setDepositForm((current) => ({ ...current, ...next }));
  }

  function updateDepositSource(
    index: number,
    next: Partial<SavingDepositFormValues["sources"][number]>,
  ) {
    setDepositForm((current) => ({
      ...current,
      sources: current.sources.map((source, sourceIndex) =>
        sourceIndex === index ? { ...source, ...next } : source,
      ),
    }));
  }

  function addDepositSource() {
    setDepositForm((current) => ({
      ...current,
      sources: [...current.sources, createEmptySourceAllocation()],
    }));
  }

  function removeDepositSource(index: number) {
    setDepositForm((current) => ({
      ...current,
      sources:
        current.sources.length === 1
          ? current.sources
          : current.sources.filter((_, sourceIndex) => sourceIndex !== index),
    }));
  }

  function updateWithdrawalForm(next: Partial<SavingWithdrawalFormValues>) {
    setWithdrawalForm((current) => ({ ...current, ...next }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !formDialog) return;

    if (!form.label.trim()) {
      toast.error("Enter a saving name.");
      return;
    }

    if (form.hasTarget) {
      const targetAmount = Number(form.targetAmount);

      if (Number.isNaN(targetAmount) || targetAmount <= 0) {
        toast.error("Enter a target amount greater than zero.");
        return;
      }

      if (!form.endDate) {
        toast.error("Select the target end date.");
        return;
      }

      if (new Date(form.endDate).getTime() < new Date(form.date).getTime()) {
        toast.error("End date must be the same as or later than bucket date.");
        return;
      }
    }

    const basePayload = {
      label: form.label.trim(),
      date: form.date,
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };

    setSaving(true);

    try {
      if (formDialog.mode === "edit" && formDialog.entry) {
        const payload: UpdateSavingRequest = form.hasTarget
          ? {
              ...basePayload,
              targetAmount: Number(form.targetAmount),
              targetCurrency: form.targetCurrency,
              startDate: form.date,
              endDate: form.endDate,
            }
          : {
              ...basePayload,
              targetAmount: null,
              targetCurrency: null,
              startDate: null,
              endDate: null,
            };
        await updateSaving(token, formDialog.entry.id, payload);
        toast.success("Saving bucket updated.");
        triggerRefresh();
      } else {
        const payload: CreateSavingRequest = {
          ...basePayload,
          ...(form.hasTarget
            ? {
                targetAmount: Number(form.targetAmount),
                targetCurrency: form.targetCurrency,
                startDate: form.date,
                endDate: form.endDate,
              }
            : {}),
          amount: 0,
          currency: "RWF",
        };
        await createSaving(token, payload);
        toast.success("Saving bucket created.");

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
          : "Saving bucket could not be saved right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;

    try {
      await deleteSaving(token, deleteTarget.id);

      if (pageEntries.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        triggerRefresh();
      }

      toast.success("Saving entry deleted.");
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof ApiError
          ? deleteError.message
          : "Saving entry could not be deleted right now.",
      );
    }
  }

  async function handleDeposit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !depositDialog) return;

    const amount = Number(depositForm.amount);
    const invalidSource = depositForm.sources.find(
      (source) =>
        !source.incomeId ||
        Number.isNaN(Number(source.amount)) ||
        Number(source.amount) <= 0,
    );

    if (Number.isNaN(amount) || amount <= 0 || invalidSource) {
      toast.error("Enter a deposit amount and valid income sources.");
      return;
    }

    setDepositSaving(true);

    try {
      await createSavingDeposit(token, depositDialog.entry.id, {
        amount,
        currency: depositForm.currency,
        date: depositForm.date,
        ...(depositForm.note.trim() ? { note: depositForm.note.trim() } : {}),
        incomeSources: depositForm.sources.map((source) => ({
          incomeId: source.incomeId,
          amount: Number(source.amount),
          currency: source.currency,
        })),
      });

      triggerRefresh();
      closeDepositDialog();
      toast.success("Money added to saving.");
    } catch (depositError) {
      toast.error(
        depositError instanceof ApiError
          ? depositError.message
          : "Deposit could not be created right now.",
      );
    } finally {
      setDepositSaving(false);
    }
  }

  async function handleWithdrawal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !withdrawalDialog) return;

    const amount = Number(withdrawalForm.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a withdrawal amount greater than zero.");
      return;
    }

    setWithdrawalSaving(true);

    try {
      await createSavingWithdrawal(token, withdrawalDialog.entry.id, {
        amount,
        currency: withdrawalForm.currency,
        date: withdrawalForm.date,
        ...(withdrawalForm.note.trim()
          ? { note: withdrawalForm.note.trim() }
          : {}),
      });

      triggerRefresh();
      closeWithdrawalDialog();
      toast.success("Money withdrawn from saving.");
    } catch (withdrawalError) {
      toast.error(
        withdrawalError instanceof ApiError
          ? withdrawalError.message
          : "Withdrawal could not be created right now.",
      );
    } finally {
      setWithdrawalSaving(false);
    }
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <SavingHeader onCreate={openCreateDialog} />

        <section className="animate-dashboard-rise">
          <div className="group relative overflow-hidden rounded-[28px] border border-[rgba(125,211,252,0.16)] bg-[linear-gradient(145deg,rgba(11,22,31,0.96)_0%,rgba(8,14,22,0.99)_100%)] px-4 py-4 shadow-[0_18px_56px_rgba(5,18,34,0.28)] md:px-5">
            <div className="pointer-events-none absolute inset-0">
              <div className="motion-safe:animate-income-drift absolute -right-8 top-0 h-28 w-28 rounded-full bg-[rgba(125,211,252,0.14)] blur-3xl" />
              <div className="motion-safe:animate-income-sweep absolute inset-y-0 left-[-28%] w-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-60 blur-lg" />
            </div>

            <div className="relative z-10 grid gap-3 lg:grid-cols-[minmax(0,1.16fr)_280px]">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7DD3FC]">
                      <span className="motion-safe:animate-income-glow h-1.5 w-1.5 rounded-full bg-[#7DD3FC]" />
                      Savings
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/58">
                      {selectedMonthLabel} {selectedYear}
                    </p>
                  </div>

                  <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/54">
                      Buckets
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {entries.length} {entries.length === 1 ? "saving" : "savings"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[clamp(1.85rem,3.5vw,2.9rem)] font-semibold leading-none tracking-[-0.055em] text-white transition-transform duration-500 ease-out group-hover:translate-x-1">
                      {rwfCompact(totalBalance)}
                    </p>
                    <div className="mt-2 h-1.5 w-[min(220px,52vw)] overflow-hidden rounded-full bg-white/6">
                      <div
                        className="motion-safe:animate-income-sweep h-full rounded-full bg-[linear-gradient(90deg,rgba(125,211,252,0.52),rgba(56,189,248,1),rgba(125,211,252,0.52))] bg-[length:200%_100%]"
                        style={{ width: `${activeShare}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.08)] px-2.5 py-1 text-[11px] font-medium text-[#7DD3FC]">
                      {rwfCompact(totalDeposited)} deposited
                    </span>
                    <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                      {rwfCompact(totalWithdrawn)} withdrawn
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
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7DD3FC]" />
                  </div>
                  <p className="mt-2 text-base font-semibold tracking-[-0.04em] text-text-primary">
                    {latestEntry ? formatSavingDate(latestEntry.date) : "No savings yet"}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                    {latestEntry
                      ? latestEntry.label
                      : `No savings recorded in ${selectedMonthLabel}.`}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                      Largest balance
                    </p>
                    <span className="text-[11px] font-medium text-[#7DD3FC]">
                      {activeShare}%
                    </span>
                  </div>
                  <p className="mt-2 text-base font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                    {largestSaving ? rwfCompact(largestSaving.currentBalanceRwf) : "RWF 0"}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                    {largestSaving
                      ? `${largestSaving.label} · ${rwf(largestSaving.currentBalanceRwf)}`
                      : "Create a saving bucket to start tracking reserves."}
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
                Saving ledger
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                {selectedMonthLabel} {selectedYear} savings
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {totalItems} {totalItems === 1 ? "entry" : "entries"}
              {latestEntry
                ? ` · latest ${new Date(latestEntry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}`
                : ""}
            </p>
          </div>

          <SavingLedgerFilters
            dateFrom={selectedDateFrom}
            dateTo={selectedDateTo}
            hasActiveFilters={hasActiveFilters}
            month={selectedMonth}
            search={searchInput}
            year={selectedYear}
            onClear={() => {
              setSelectedMonth(defaultMonth);
              setSelectedYear(defaultYear);
              setSearchInput("");
              setSelectedDateFrom("");
              setSelectedDateTo("");
              setCurrentPage(1);
            }}
            onDateFromChange={setSelectedDateFrom}
            onDateToChange={setSelectedDateTo}
            onMonthChange={handleMonthChange}
            onSearchChange={setSearchInput}
            onYearChange={(value) => {
              setSelectedYear(value);
              setCurrentPage(1);
            }}
          />

          {loading ? (
            <SavingTableSkeleton />
          ) : error ? (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <EmptyState
                title="Could not load savings"
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
                title="No savings recorded yet"
                description="Create a saving bucket, then fund it from received income to keep a clear ledger trail."
                action={{
                  label: "Add saving",
                  onClick: openCreateDialog,
                }}
              />
            </div>
          ) : totalItems === 0 ? (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <EmptyState
                title="No ledger matches"
                description="Try another search, date range, month, or year to reveal more saving entries."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setSelectedMonth(defaultMonth);
                    setSelectedYear(defaultYear);
                    setSearchInput("");
                    setSelectedDateFrom("");
                    setSelectedDateTo("");
                    setCurrentPage(1);
                  },
                }}
              />
            </div>
          ) : (
            <SavingTable
              entries={pageEntries}
              onDelete={setDeleteTarget}
              onDetails={openDetailsDialog}
              onEdit={openEditDialog}
              onDeposit={openDepositDialog}
              onWithdraw={openWithdrawalDialog}
              onViewHistory={openHistoryDialog}
            />
          )}

          <PaginationControls
            currentPage={currentPage}
            pageSize={DEFAULT_PAGE_SIZE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="saving"
            onPageChange={setCurrentPage}
          />
        </section>
      </div>

      {formDialog ? (
        <SavingFormDialog
          form={form}
          mode={formDialog.mode}
          saving={saving}
          onChange={updateForm}
          onClose={closeFormDialog}
          onSubmit={handleSubmit}
        />
      ) : null}

      {depositDialog ? (
        <SavingDepositDialog
          entry={depositDialog.entry}
          form={depositForm}
          incomes={receivedIncomes}
          saving={depositSaving}
          onChange={updateDepositForm}
          onSourceChange={updateDepositSource}
          onAddSource={addDepositSource}
          onRemoveSource={removeDepositSource}
          onClose={closeDepositDialog}
          onSubmit={handleDeposit}
        />
      ) : null}

      {detailsDialog ? (
        <SavingDetailsDialog
          entry={detailsDialog.entry}
          onClose={closeDetailsDialog}
          onDeposit={openDepositFromDetails}
          onEdit={openEditFromDetails}
          onViewHistory={openHistoryFromDetails}
          onWithdraw={openWithdrawalFromDetails}
        />
      ) : null}

      {withdrawalDialog ? (
        <SavingExpenseDialog
          entry={withdrawalDialog.entry}
          form={withdrawalForm}
          saving={withdrawalSaving}
          onChange={updateWithdrawalForm}
          onClose={closeWithdrawalDialog}
          onSubmit={handleWithdrawal}
        />
      ) : null}

      {historyDialog ? (
        <SavingHistoryDialog
          entry={historyDialog.entry}
          loading={historyLoading || historyDialog.loading}
          transactions={historyTransactions}
          onClose={closeHistoryDialog}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteDialog
          label="saving record"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

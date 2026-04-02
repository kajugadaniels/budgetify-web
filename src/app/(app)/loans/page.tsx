"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createLoan,
  deleteLoan,
  listLoans,
  listLoansPage,
  sendLoanToExpense,
  updateLoan,
} from "@/lib/api/loans/loans.api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/pagination";
import type {
  CreateLoanRequest,
  LoanResponse,
  SendLoanToExpenseRequest,
} from "@/lib/types/loan.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import { LoanFormDialog } from "./loans/loan-form-dialog";
import { LoansHeader } from "./loans/loans-header";
import { LoansLedgerFilters } from "./loans/loans-ledger-filters";
import { LoanSettlementDialog } from "./loans/loan-settlement-dialog";
import type {
  LoanFormDialogState,
  LoanFormValues,
  LoanLedgerPaidFilter,
  LoanSettlementDialogState,
  LoanSettlementFormValues,
} from "./loans/loans-page.types";
import { LoansTable } from "./loans/loans-table";
import { LoansTableSkeleton } from "./loans/loans-table-skeleton";
import {
  createEmptyLoanForm,
  createEmptyLoanSettlementForm,
  createLoanFormFromEntry,
  createLoanSettlementFormFromEntry,
  formatLoanDate,
  getCurrentMonthIndex,
  getCurrentYear,
  resolveLoanMonthLabel,
  sortLoanEntries,
} from "./loans/loans.utils";

export default function LoansPage() {
  const { token } = useAuth();
  const toast = useToast();
  const defaultMonth = getCurrentMonthIndex();
  const defaultYear = getCurrentYear();

  const [entries, setEntries] = useState<LoanResponse[]>([]);
  const [pageEntries, setPageEntries] = useState<LoanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [settling, setSettling] = useState(false);
  const [paidBusyId, setPaidBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedPaid, setSelectedPaid] =
    useState<LoanLedgerPaidFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const [formDialog, setFormDialog] = useState<LoanFormDialogState>(null);
  const [settlementDialog, setSettlementDialog] =
    useState<LoanSettlementDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<LoanResponse | null>(null);
  const [form, setForm] = useState<LoanFormValues>(() => createEmptyLoanForm());
  const [settlementForm, setSettlementForm] =
    useState<LoanSettlementFormValues>(() => createEmptyLoanSettlementForm());
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

    async function loadLoans() {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          month: hasExplicitDateFilter ? undefined : selectedMonth + 1,
          year: hasExplicitDateFilter ? undefined : selectedYear,
          paid:
            selectedPaid === "ALL" ? undefined : selectedPaid === "PAID",
          search: appliedSearch,
          dateFrom: selectedDateFrom || undefined,
          dateTo: selectedDateTo || undefined,
        };

        const [summaryResponse, pageResponse] = await Promise.all([
          listLoans(sessionToken, filters),
          listLoansPage(sessionToken, {
            ...filters,
            page: currentPage,
            limit: DEFAULT_PAGE_SIZE,
          }),
        ]);

        if (!ignore) {
          setEntries(sortLoanEntries(summaryResponse));

          if (pageResponse.meta.totalPages < currentPage) {
            setCurrentPage(pageResponse.meta.totalPages);
            return;
          }

          setPageEntries(sortLoanEntries(pageResponse.items));
          setTotalItems(pageResponse.meta.totalItems);
          setTotalPages(pageResponse.meta.totalPages);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : "Loans could not be loaded right now.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadLoans();

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
    selectedPaid,
    selectedYear,
    token,
  ]);

  const selectedMonthLabel = resolveLoanMonthLabel(selectedMonth);
  const hasActiveFilters =
    selectedMonth !== defaultMonth ||
    selectedYear !== defaultYear ||
    selectedPaid !== "ALL" ||
    appliedSearch !== undefined ||
    hasExplicitDateFilter;
  const totalLoans = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const paidAmount = entries
    .filter((entry) => entry.paid)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const outstandingAmount = totalLoans - paidAmount;
  const largestLoan = [...entries].sort(
    (left, right) => Number(right.amount) - Number(left.amount),
  )[0];
  const latestLoan = entries[0];
  const paidCount = entries.filter((entry) => entry.paid).length;
  const paidShare =
    totalLoans > 0 ? Math.round((paidAmount / totalLoans) * 100) : 0;

  function triggerRefresh() {
    setRefreshKey((current) => current + 1);
  }

  function openCreateDialog() {
    setForm(createEmptyLoanForm(selectedMonth, selectedYear));
    setFormDialog({ mode: "create" });
  }

  function openEditDialog(entry: LoanResponse) {
    setForm(createLoanFormFromEntry(entry));
    setFormDialog({ mode: "edit", entry });
  }

  function closeFormDialog() {
    setFormDialog(null);
    setForm(createEmptyLoanForm(selectedMonth, selectedYear));
  }

  function openSettlementDialog(entry: LoanResponse) {
    if (entry.paid) {
      toast.info("This loan is already settled.");
      return;
    }

    setSettlementForm(createLoanSettlementFormFromEntry(entry));
    setSettlementDialog({ entry });
  }

  function closeSettlementDialog() {
    setSettlementDialog(null);
    setSettlementForm(createEmptyLoanSettlementForm());
  }

  function updateForm(next: Partial<LoanFormValues>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function updateSettlementForm(next: Partial<LoanSettlementFormValues>) {
    setSettlementForm((current) => ({ ...current, ...next }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !formDialog) return;

    const amount = Number(form.amount);
    if (!form.label.trim() || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a label and an amount greater than zero.");
      return;
    }

    const payload: CreateLoanRequest = {
      label: form.label.trim(),
      amount,
      date: form.date,
      paid: form.paid,
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };

    setSaving(true);

    try {
      if (formDialog.mode === "edit") {
        await updateLoan(token, formDialog.entry.id, payload);
        toast.success("Loan updated.");
        triggerRefresh();
      } else {
        await createLoan(token, payload);
        toast.success("Loan added.");

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
          : "Loan could not be saved right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;

    try {
      await deleteLoan(token, deleteTarget.id);

      if (pageEntries.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        triggerRefresh();
      }

      toast.success("Loan deleted.");

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
          : "Loan could not be deleted right now.",
      );
    }
  }

  async function handleSendToExpense(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token || !settlementDialog) return;

    if (!settlementForm.date) {
      toast.error("Choose the expense date for this settlement.");
      return;
    }

    const payload: SendLoanToExpenseRequest = {
      date: settlementForm.date,
      ...(settlementForm.note.trim()
        ? { note: settlementForm.note.trim() }
        : {}),
    };

    setSettling(true);

    try {
      await sendLoanToExpense(token, settlementDialog.entry.id, payload);

      triggerRefresh();

      if (
        formDialog?.mode === "edit" &&
        formDialog.entry.id === settlementDialog.entry.id
      ) {
        closeFormDialog();
      }

      closeSettlementDialog();
      toast.success("Loan sent to expenses and marked as paid.");
    } catch (settleError) {
      toast.error(
        settleError instanceof ApiError
          ? settleError.message
          : "Loan could not be sent to expenses right now.",
      );
    } finally {
      setSettling(false);
    }
  }

  async function handleTogglePaid(entry: LoanResponse) {
    if (!token) return;

    const nextPaid = !entry.paid;
    setPaidBusyId(entry.id);

    try {
      await updateLoan(token, entry.id, { paid: nextPaid });
      triggerRefresh();
      toast.success(nextPaid ? "Loan marked as paid." : "Loan marked as unpaid.");
    } catch (toggleError) {
      toast.error(
        toggleError instanceof ApiError
          ? toggleError.message
          : "Loan payment state could not be updated right now.",
      );
    } finally {
      setPaidBusyId(null);
    }
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <LoansHeader onCreate={openCreateDialog} />

        <section className="animate-dashboard-rise">
          <div className="group relative overflow-hidden rounded-[28px] border border-warning/12 bg-[linear-gradient(145deg,rgba(30,20,12,0.95)_0%,rgba(18,12,8,0.99)_100%)] px-4 py-4 shadow-[0_18px_56px_rgba(28,14,6,0.26)] md:px-5">
            <div className="pointer-events-none absolute inset-0">
              <div className="motion-safe:animate-income-drift absolute -right-8 top-0 h-28 w-28 rounded-full bg-warning/14 blur-3xl" />
              <div className="motion-safe:animate-income-sweep absolute inset-y-0 left-[-28%] w-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-60 blur-lg" />
            </div>

            <div className="relative z-10 grid gap-3 lg:grid-cols-[minmax(0,1.16fr)_280px]">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-warning/15 bg-warning/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-warning/88">
                      <span className="motion-safe:animate-income-glow h-1.5 w-1.5 rounded-full bg-warning" />
                      Loans
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
                      {entries.length} {entries.length === 1 ? "loan" : "loans"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[clamp(1.85rem,3.5vw,2.9rem)] font-semibold leading-none tracking-[-0.055em] text-white transition-transform duration-500 ease-out group-hover:translate-x-1">
                      {rwfCompact(totalLoans)}
                    </p>
                    <div className="mt-2 h-1.5 w-[min(220px,52vw)] overflow-hidden rounded-full bg-white/6">
                      <div
                        className="motion-safe:animate-income-sweep h-full rounded-full bg-[linear-gradient(90deg,rgba(228,192,99,0.52),rgba(255,122,122,1),rgba(228,192,99,0.52))] bg-[length:200%_100%]"
                        style={{ width: `${paidShare}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-success/14 bg-success/8 px-2.5 py-1 text-[11px] font-medium text-success">
                      {rwfCompact(paidAmount)} paid
                    </span>
                    <span className="rounded-full border border-danger/14 bg-danger/8 px-2.5 py-1 text-[11px] font-medium text-danger/84">
                      {rwfCompact(outstandingAmount)} outstanding
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
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  </div>
                  <p className="mt-2 text-base font-semibold tracking-[-0.04em] text-text-primary">
                    {latestLoan ? formatLoanDate(latestLoan.date) : "No entries yet"}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                    {latestLoan
                      ? latestLoan.label
                      : `No loans dated in ${selectedMonthLabel}.`}
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/56">
                      Settled
                    </p>
                    <span className="text-[11px] font-medium text-warning/88">
                      {paidShare}%
                    </span>
                  </div>
                  <p className="mt-2 text-base font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                    {paidCount} {paidCount === 1 ? "loan" : "loans"} paid
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                    {largestLoan
                      ? `${largestLoan.label} · ${rwf(Number(largestLoan.amount))}`
                      : "Add loans to track outstanding obligations."}
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
                Loan ledger
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
                {selectedMonthLabel} {selectedYear} loans
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {totalItems}
              {hasActiveFilters ? ` of ${entries.length}` : ""}{" "}
              {totalItems === 1 ? "loan" : "loans"}
            </p>
          </div>

          <LoansLedgerFilters
            dateFrom={selectedDateFrom}
            dateTo={selectedDateTo}
            hasActiveFilters={hasActiveFilters}
            month={selectedMonth}
            paid={selectedPaid}
            search={searchInput}
            year={selectedYear}
            onClear={() => {
              setSelectedMonth(defaultMonth);
              setSelectedYear(defaultYear);
              setSelectedPaid("ALL");
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
            onPaidChange={(value) => {
              setSelectedPaid(value);
              setCurrentPage(1);
            }}
            onSearchChange={setSearchInput}
            onYearChange={(value) => {
              setSelectedYear(value);
              setCurrentPage(1);
            }}
          />

          {loading ? (
            <LoansTableSkeleton />
          ) : error ? (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <EmptyState
                title="Could not load loans"
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
                title="No loans recorded yet"
                description="Add the borrowed amounts you need to track, then keep payment status current from the ledger."
                action={{
                  label: "Add loan",
                  onClick: openCreateDialog,
                }}
              />
            </div>
          ) : totalItems === 0 ? (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <EmptyState
                title="No ledger matches"
                description="Try another search, date range, month, year, or payment state to reveal more loan rows."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setSelectedMonth(defaultMonth);
                    setSelectedYear(defaultYear);
                    setSelectedPaid("ALL");
                    setSearchInput("");
                    setSelectedDateFrom("");
                    setSelectedDateTo("");
                    setCurrentPage(1);
                  },
                }}
              />
            </div>
          ) : (
            <LoansTable
              busyPaidId={paidBusyId}
              entries={pageEntries}
              onDelete={setDeleteTarget}
              onEdit={openEditDialog}
              onSendToExpense={openSettlementDialog}
              onTogglePaid={handleTogglePaid}
            />
          )}

          <PaginationControls
            currentPage={currentPage}
            pageSize={DEFAULT_PAGE_SIZE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="loan"
            onPageChange={setCurrentPage}
          />
        </section>
      </div>

      {formDialog ? (
        <LoanFormDialog
          form={form}
          mode={formDialog.mode}
          saving={saving}
          onChange={updateForm}
          onClose={closeFormDialog}
          onSubmit={handleSubmit}
        />
      ) : null}

      {settlementDialog ? (
        <LoanSettlementDialog
          entry={settlementDialog.entry}
          form={settlementForm}
          saving={settling}
          onChange={updateSettlementForm}
          onClose={closeSettlementDialog}
          onSubmit={handleSendToExpense}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteDialog
          label="loan record"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

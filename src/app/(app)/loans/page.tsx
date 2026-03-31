"use client";

import { useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createLoan,
  deleteLoan,
  listLoans,
  sendLoanToExpense,
  updateLoan,
} from "@/lib/api/loans/loans.api";
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
import { LoansSummaryCard } from "./loans/loans-summary-card";
import { LoansTable } from "./loans/loans-table";
import { LoansTableSkeleton } from "./loans/loans-table-skeleton";
import {
  createEmptyLoanForm,
  createEmptyLoanSettlementForm,
  createLoanFormFromEntry,
  createLoanSettlementFormFromEntry,
  filterLoanEntries,
  getCurrentMonthIndex,
  getCurrentYear,
  resolveLoanMonthLabel,
  sortLoanEntries,
} from "./loans/loans.utils";

export default function LoansPage() {
  const { token } = useAuth();
  const toast = useToast();
  const defaultMonth = getCurrentMonthIndex();
  const selectedYear = getCurrentYear();

  const [entries, setEntries] = useState<LoanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [settling, setSettling] = useState(false);
  const [paidBusyId, setPaidBusyId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedPaid, setSelectedPaid] =
    useState<LoanLedgerPaidFilter>("ALL");
  const [formDialog, setFormDialog] = useState<LoanFormDialogState>(null);
  const [settlementDialog, setSettlementDialog] =
    useState<LoanSettlementDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<LoanResponse | null>(null);
  const [form, setForm] = useState<LoanFormValues>(() => createEmptyLoanForm());
  const [settlementForm, setSettlementForm] =
    useState<LoanSettlementFormValues>(() => createEmptyLoanSettlementForm());

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;
    let ignore = false;

    async function loadLoans() {
      setLoading(true);
      setError(null);

      try {
        const response = await listLoans(sessionToken, {
          month: selectedMonth + 1,
          year: selectedYear,
        });

        if (!ignore) {
          setEntries(sortLoanEntries(response));
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
  }, [selectedMonth, selectedYear, token]);

  const selectedMonthLabel = resolveLoanMonthLabel(selectedMonth);
  const filteredEntries = filterLoanEntries(entries, selectedPaid);
  const hasActiveFilters =
    selectedMonth !== defaultMonth || selectedPaid !== "ALL";
  const totalLoans = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const paidAmount = entries
    .filter((entry) => entry.paid)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const outstandingAmount = totalLoans - paidAmount;
  const largestLoan = [...entries].sort(
    (left, right) => Number(right.amount) - Number(left.amount),
  )[0];

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

  async function refreshLoans() {
    if (!token) return;

    const refreshed = await listLoans(token, {
      month: selectedMonth + 1,
      year: selectedYear,
    });

    setEntries(sortLoanEntries(refreshed));
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
      } else {
        await createLoan(token, payload);
        toast.success("Loan added.");
      }

      await refreshLoans();
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
      await refreshLoans();
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
      await refreshLoans();

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
      await refreshLoans();
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

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
          <div className="glass-panel rounded-[32px] p-6 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              {selectedMonthLabel} {selectedYear}
            </p>
            <p className="mt-4 text-[2.6rem] font-semibold tracking-heading-lg text-text-primary">
              {rwfCompact(totalLoans)}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" />
              <span>
                {entries.length} {entries.length === 1 ? "loan" : "loans"} dated
                inside {selectedMonthLabel}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <LoansSummaryCard
              eyebrow="Paid"
              value={rwfCompact(paidAmount)}
              valueClassName="text-success"
              detail={
                entries.length > 0
                  ? `${entries.filter((entry) => entry.paid).length} ${
                      entries.filter((entry) => entry.paid).length === 1
                        ? "loan"
                        : "loans"
                    } cleared this month`
                  : `No loans dated in ${selectedMonthLabel} ${selectedYear}`
              }
            />
            <LoansSummaryCard
              eyebrow="Outstanding"
              value={rwfCompact(outstandingAmount)}
              valueClassName={outstandingAmount > 0 ? "text-danger" : "text-success"}
              detail={
                largestLoan
                  ? `${largestLoan.label} · ${rwf(Number(largestLoan.amount))}`
                  : "Add loans to track outstanding obligations"
              }
            />
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
              {filteredEntries.length}
              {hasActiveFilters ? ` of ${entries.length}` : ""}{" "}
              {filteredEntries.length === 1 ? "loan" : "loans"}
            </p>
          </div>

          <LoansLedgerFilters
            hasActiveFilters={hasActiveFilters}
            month={selectedMonth}
            paid={selectedPaid}
            onClear={() => {
              setSelectedMonth(defaultMonth);
              setSelectedPaid("ALL");
            }}
            onMonthChange={setSelectedMonth}
            onPaidChange={setSelectedPaid}
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
          ) : filteredEntries.length === 0 ? (
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <EmptyState
                title="No ledger matches"
                description="Try another month or payment state to reveal more loan rows."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setSelectedMonth(defaultMonth);
                    setSelectedPaid("ALL");
                  },
                }}
              />
            </div>
          ) : (
            <LoansTable
              busyPaidId={paidBusyId}
              entries={filteredEntries}
              onDelete={setDeleteTarget}
              onEdit={openEditDialog}
              onSendToExpense={openSettlementDialog}
              onTogglePaid={handleTogglePaid}
            />
          )}
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

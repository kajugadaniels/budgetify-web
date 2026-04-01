"use client";

import { useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { createExpense } from "@/lib/api/expenses/expenses.api";
import {
  createSaving,
  deleteSaving,
  listSavings,
  updateSaving,
} from "@/lib/api/savings/savings.api";
import type {
  CreateSavingRequest,
  SavingResponse,
} from "@/lib/types/saving.types";
import { usd, usdCompact } from "@/lib/utils/currency";
import { SavingExpenseDialog } from "./saving/saving-expense-dialog";
import { SavingFormDialog } from "./saving/saving-form-dialog";
import { SavingHeader } from "./saving/saving-header";
import { SavingLedgerFilters } from "./saving/saving-ledger-filters";
import type {
  SavingExpenseDialogState,
  SavingExpenseFormValues,
  SavingFormDialogState,
  SavingFormValues,
} from "./saving/saving-page.types";
import { SavingSummaryCard } from "./saving/saving-summary-card";
import { SavingTable } from "./saving/saving-table";
import { SavingTableSkeleton } from "./saving/saving-table-skeleton";
import {
  createEmptySavingExpenseForm,
  createEmptySavingForm,
  createSavingExpenseFormFromEntry,
  createSavingFormFromEntry,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [recordingExpense, setRecordingExpense] = useState(false);
  const [stillHaveBusyId, setStillHaveBusyId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [formDialog, setFormDialog] = useState<SavingFormDialogState>(null);
  const [expenseDialog, setExpenseDialog] =
    useState<SavingExpenseDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavingResponse | null>(null);
  const [form, setForm] = useState<SavingFormValues>(() =>
    createEmptySavingForm(),
  );
  const [expenseForm, setExpenseForm] = useState<SavingExpenseFormValues>(() =>
    createEmptySavingExpenseForm(),
  );

  useEffect(() => {
    if (!token) return;
    const sessionToken = token;
    let ignore = false;

    async function loadSavings() {
      setLoading(true);
      setError(null);

      try {
        const response = await listSavings(sessionToken, {
          month: selectedMonth + 1,
          year: selectedYear,
        });

        if (!ignore) {
          setEntries(sortSavingEntries(response));
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
  }, [selectedMonth, selectedYear, token]);

  const selectedMonthLabel = resolveSavingMonthLabel(selectedMonth);
  const hasActiveFilters =
    selectedMonth !== defaultMonth || selectedYear !== defaultYear;
  const totalSaved = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const activeEntries = entries.filter((entry) => entry.stillHave);
  const stillHaveSaved = activeEntries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0,
  );
  const largestSaving = [...entries].sort(
    (left, right) => Number(right.amount) - Number(left.amount),
  )[0];
  const latestEntry = entries[0];

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

  function openExpenseDialog(entry: SavingResponse) {
    setExpenseForm(createSavingExpenseFormFromEntry(entry));
    setExpenseDialog({ entry });
  }

  function closeExpenseDialog() {
    setExpenseDialog(null);
    setExpenseForm(createEmptySavingExpenseForm());
  }

  function updateForm(next: Partial<SavingFormValues>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function updateExpenseForm(next: Partial<SavingExpenseFormValues>) {
    setExpenseForm((current) => ({ ...current, ...next }));
  }

  async function refreshSavings() {
    if (!token) return;

    const refreshed = await listSavings(token, {
      month: selectedMonth + 1,
      year: selectedYear,
    });

    setEntries(sortSavingEntries(refreshed));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !formDialog) return;

    const amount = Number(form.amount);
    if (!form.label.trim() || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a label and a USD amount greater than zero.");
      return;
    }

    const payload: CreateSavingRequest = {
      label: form.label.trim(),
      amount,
      date: form.date,
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };

    setSaving(true);

    try {
      if (formDialog.mode === "edit") {
        await updateSaving(token, formDialog.entry.id, payload);
        toast.success("Saving entry updated.");
      } else {
        await createSaving(token, payload);
        toast.success("Saving entry added.");
      }

      await refreshSavings();
      closeFormDialog();
    } catch (saveError) {
      toast.error(
        saveError instanceof ApiError
          ? saveError.message
          : "Saving entry could not be saved right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;

    try {
      await deleteSaving(token, deleteTarget.id);
      await refreshSavings();
      toast.success("Saving entry deleted.");

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
          : "Saving entry could not be deleted right now.",
      );
    }
  }

  async function handleToggleStillHave(entry: SavingResponse) {
    if (!token) return;

    const nextStillHave = !entry.stillHave;
    setStillHaveBusyId(entry.id);

    try {
      await updateSaving(token, entry.id, { stillHave: nextStillHave });
      await refreshSavings();
      toast.success(
        nextStillHave
          ? "Saving marked as still available."
          : "Saving marked as no longer available.",
      );
    } catch (toggleError) {
      toast.error(
        toggleError instanceof ApiError
          ? toggleError.message
          : "Saving availability could not be updated right now.",
      );
    } finally {
      setStillHaveBusyId(null);
    }
  }

  async function handleRecordExpense(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token || !expenseDialog) return;

    const amount = Number(expenseForm.amountRwf);

    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter the converted expense amount in RWF.");
      return;
    }

    setRecordingExpense(true);

    try {
      await createExpense(token, {
        label: expenseDialog.entry.label,
        amount,
        category: "SAVINGS",
        date: expenseForm.date,
        ...(expenseForm.note.trim() ? { note: expenseForm.note.trim() } : {}),
      });

      closeExpenseDialog();
      toast.success("Expense recorded from saving.");
    } catch (recordError) {
      toast.error(
        recordError instanceof ApiError
          ? recordError.message
          : "Expense could not be recorded right now.",
      );
    } finally {
      setRecordingExpense(false);
    }
  }

  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <SavingHeader onCreate={openCreateDialog} />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
          <div className="glass-panel rounded-[32px] p-6 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              {selectedMonthLabel} {selectedYear}
            </p>
            <p className="mt-4 text-[2.6rem] font-semibold tracking-heading-lg text-text-primary">
              {usdCompact(totalSaved)}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <span>
                {entries.length} {entries.length === 1 ? "entry" : "entries"}{" "}
                recorded in USD for {selectedMonthLabel}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <SavingSummaryCard
              eyebrow="Still have"
              value={usdCompact(stillHaveSaved)}
              valueClassName={stillHaveSaved > 0 ? "text-success" : "text-text-secondary"}
              detail={
                activeEntries.length > 0
                  ? `${activeEntries.length} ${
                      activeEntries.length === 1 ? "saving record is" : "saving records are"
                    } still available this month`
                  : entries.length > 0
                    ? "No saving record in this month is still marked as available"
                    : `No savings recorded in ${selectedMonthLabel} ${selectedYear}`
              }
            />
            <SavingSummaryCard
              eyebrow="Largest"
              value={largestSaving ? usdCompact(Number(largestSaving.amount)) : "$0.00"}
              valueClassName="text-success"
              detail={
                largestSaving
                  ? `${largestSaving.label} · ${usd(Number(largestSaving.amount))}`
                  : "Add a saving entry to start tracking your USD reserve"
              }
            />
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
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
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
            hasActiveFilters={hasActiveFilters}
            month={selectedMonth}
            year={selectedYear}
            onClear={() => {
              setSelectedMonth(defaultMonth);
              setSelectedYear(defaultYear);
            }}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
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
                description="Add your USD saving contributions so the ledger and monthly snapshots stay current."
                action={{
                  label: "Add saving",
                  onClick: openCreateDialog,
                }}
              />
            </div>
          ) : (
            <SavingTable
              busyStillHaveId={stillHaveBusyId}
              entries={entries}
              onDelete={setDeleteTarget}
              onEdit={openEditDialog}
              onRecordExpense={openExpenseDialog}
              onToggleStillHave={handleToggleStillHave}
            />
          )}
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

      {expenseDialog ? (
        <SavingExpenseDialog
          entry={expenseDialog.entry}
          form={expenseForm}
          saving={recordingExpense}
          onChange={updateExpenseForm}
          onClose={closeExpenseDialog}
          onSubmit={handleRecordExpense}
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

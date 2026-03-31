"use client";

import { useEffect, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  createIncome,
  deleteIncome,
  listIncome,
  listIncomeCategories,
  updateIncome,
} from "@/lib/api/income/income.api";
import type {
  CreateIncomeRequest,
  IncomeCategoryOptionResponse,
  IncomeResponse,
} from "@/lib/types/income.types";
import { rwf, rwfCompact } from "@/lib/utils/currency";
import { IncomeFormDialog } from "./income/income-form-dialog";
import { IncomeHeader } from "./income/income-header";
import type {
  IncomeFormDialogState,
  IncomeFormValues,
} from "./income/income-page.types";
import { IncomeSummaryCard } from "./income/income-summary-card";
import { IncomeTable } from "./income/income-table";
import { IncomeTableSkeleton } from "./income/income-table-skeleton";
import {
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

  const [entries, setEntries] = useState<IncomeResponse[]>([]);
  const [categories, setCategories] = useState<IncomeCategoryOptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [receivedBusyId, setReceivedBusyId] = useState<string | null>(null);
  const [formDialog, setFormDialog] = useState<IncomeFormDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<IncomeResponse | null>(null);
  const [form, setForm] = useState<IncomeFormValues>(() => createEmptyIncomeForm());
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthIndex());
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
        const response = await listIncome(sessionToken, {
          month: selectedMonth + 1,
          year: selectedYear,
        });

        if (!ignore) {
          setEntries(sortIncomeEntries(response));
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
  }, [selectedMonth, selectedYear, token]);

  const totalIncome = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const receivedIncome = entries
    .filter((entry) => entry.received)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const selectedMonthLabel = resolveIncomeMonthLabel(selectedMonth);
  const mostRecentEntry = entries[0];
  const highestEntry = [...entries].sort(
    (left, right) => Number(right.amount) - Number(left.amount),
  )[0];
  const canManageCategories = categories.length > 0;

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
      } else {
        await createIncome(token, payload);
        toast.success("Income entry added.");
      }

      const refreshed = await listIncome(token, {
        month: selectedMonth + 1,
        year: selectedYear,
      });
      setEntries(sortIncomeEntries(refreshed));

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
      const refreshed = await listIncome(token, {
        month: selectedMonth + 1,
        year: selectedYear,
      });
      setEntries(sortIncomeEntries(refreshed));
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
      const refreshed = await listIncome(token, {
        month: selectedMonth + 1,
        year: selectedYear,
      });
      setEntries(sortIncomeEntries(refreshed));
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
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onCreate={openCreateDialog}
          onMonthChange={setSelectedMonth}
        />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
          <div className="glass-panel rounded-[32px] p-6 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
              {selectedMonthLabel} {selectedYear}
            </p>
            <p className="mt-4 text-[2.6rem] font-semibold tracking-heading-lg text-text-primary">
              {rwfCompact(totalIncome)}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <span>
                {entries.length} {entries.length === 1 ? "entry" : "entries"} dated
                inside {selectedMonthLabel}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <IncomeSummaryCard
              eyebrow="Received"
              value={rwfCompact(receivedIncome)}
              detail={
                mostRecentEntry
                  ? `Most recent on ${formatIncomeDate(mostRecentEntry.date)}`
                  : `No income dated in ${selectedMonthLabel} ${selectedYear}`
              }
            />
            <IncomeSummaryCard
              eyebrow="Strongest source"
              value={
                highestEntry
                  ? resolveIncomeCategoryLabel(categories, highestEntry.category)
                  : "No entries yet"
              }
              detail={
                highestEntry
                  ? `${highestEntry.label} · ${rwf(Number(highestEntry.amount))}`
                  : "Add your first income entry"
              }
            />
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
              {entries.length} rows
            </span>
          </div>

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
          ) : (
            <IncomeTable
              busyReceivedId={receivedBusyId}
              canEdit={canManageCategories}
              categories={categories}
              entries={entries}
              onDelete={setDeleteTarget}
              onEdit={openEditDialog}
              onToggleReceived={handleToggleReceived}
            />
          )}
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

"use client";

import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_META } from "@/constant/todos/priority-meta";
import type { ExpenseCategoryOptionResponse } from "@/lib/types/expense.types";
import type { TodoResponse } from "@/lib/types/todo.types";
import { rwf } from "@/lib/utils/currency";
import type { TodoExpenseFormValues } from "./todos-page.types";
import { formatTodoDate } from "./todos.utils";

const INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/45 transition-colors focus:border-primary/60 focus:outline-none";

interface TodoExpenseDialogProps {
  categories: ExpenseCategoryOptionResponse[];
  entry: TodoResponse;
  form: TodoExpenseFormValues;
  saving: boolean;
  onChange: (next: Partial<TodoExpenseFormValues>) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function TodoExpenseDialog({
  categories,
  entry,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: TodoExpenseDialogProps) {
  const priorityMeta = PRIORITY_META[entry.priority];
  const parsedAmount = Number(form.amount);
  const amountPreview =
    !Number.isNaN(parsedAmount) && parsedAmount > 0
      ? rwf(parsedAmount)
      : "Enter the expense amount in RWF";

  return (
    <Dialog onClose={onClose} className="sm:max-w-xl p-4 sm:p-5">
      <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(199,191,167,0.14),transparent_72%)]" />

        <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/14 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Record expense
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-heading-md text-text-primary sm:text-[1.35rem]">
              Move todo into expenses
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">
              Uses the todo name as the expense label and marks the item done on success.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <form className="relative z-10 space-y-4" onSubmit={onSubmit}>
          <section className="grid gap-2.5 rounded-[22px] border border-white/8 bg-background/36 p-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(140px,0.7fr)] sm:p-4">
            <div className="min-w-0 rounded-[18px] border border-white/8 bg-surface-elevated/70 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
                Todo
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-text-primary">
                {entry.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${priorityMeta.chipClass}`}
                >
                  {priorityMeta.label}
                </span>
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                  Added {formatTodoDate(entry.createdAt)}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <MiniStat label="Wishlist price" value={rwf(Number(entry.price))} />
              <MiniStat label="Status on save" value="Done" valueClassName="text-success" />
            </div>
          </section>

          <div className="">
            <Field label="Expense category">
              <Select
                value={form.category}
                onValueChange={(value) =>
                  onChange({
                    category: value as TodoExpenseFormValues["category"],
                  })
                }
              >
                <SelectTrigger className="h-[50px] w-full rounded-2xl border-border bg-surface-elevated text-sm text-text-primary focus-visible:border-primary/60 focus-visible:ring-primary/20">
                  <SelectValue placeholder="Select expense category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="">
            <Field label="Expense date">
              <input
                type="date"
                value={form.date}
                onChange={(event) => onChange({ date: event.target.value })}
                className={INPUT_CLASS}
                required
              />
            </Field>
          </div>

          <div className="">
            <Field label="Amount in RWF">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0.01}
                value={form.amount}
                onChange={(event) => onChange({ amount: event.target.value })}
                placeholder="125000"
                className={INPUT_CLASS}
                required
              />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:min-w-[120px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[160px]"
            >
              {saving ? "Recording..." : "Record expense"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

function MiniStat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-surface-elevated/70 px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary/52">
        {label}
      </p>
      <p
        className={`mt-2 line-clamp-2 text-sm font-semibold text-text-primary ${valueClassName ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}

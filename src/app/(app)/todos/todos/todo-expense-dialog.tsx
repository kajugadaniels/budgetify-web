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
    <Dialog onClose={onClose} className="sm:max-w-2xl">
      <div className="mb-6 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">
          Record expense
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-heading-md text-text-primary">
              Send this todo into expenses
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
              The expense label will use the todo name. Choose the expense
              category, confirm the RWF amount, and this todo will be marked as
              done after the expense is created.
            </p>
          </div>
          <span className="inline-flex h-10 items-center justify-center rounded-full border border-success/20 bg-success/10 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-success">
            Marks todo as done
          </span>
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <section className="grid gap-3 rounded-[28px] border border-white/8 bg-background/40 p-4 md:grid-cols-3 md:p-5">
          <SummaryBlock label="Todo label" value={entry.name} />
          <SummaryBlock label="Wishlist price" value={rwf(Number(entry.price))} />
          <div className="rounded-[22px] border border-white/8 bg-surface-elevated/70 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
              Priority
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityMeta.chipClass}`}
              >
                {priorityMeta.label}
              </span>
              <span className="text-xs text-text-secondary">
                Added {formatTodoDate(entry.createdAt)}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Expense category">
            <Select
              value={form.category}
              onValueChange={(value) =>
                onChange({
                  category: value as TodoExpenseFormValues["category"],
                })
              }
            >
              <SelectTrigger className="h-[52px] rounded-2xl border-border bg-surface-elevated text-sm text-text-primary focus-visible:border-primary/60 focus-visible:ring-primary/20">
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

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
          <Field label="Amount in RWF">
            <div className="space-y-2">
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
              <p className="text-sm text-text-secondary">{amountPreview}</p>
            </div>
          </Field>

          <div className="rounded-[24px] border border-white/8 bg-background/34 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary/55">
              What happens next
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
              <li>The expense label stays aligned with this todo name.</li>
              <li>You can choose any expense category before recording.</li>
              <li>The todo flips to Done immediately after a successful send.</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Recording..." : "Record expense"}
          </button>
        </div>
      </form>
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

function SummaryBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-surface-elevated/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
        {label}
      </p>
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

import { MONTH_OPTIONS } from "@/constant/months";
import type {
  ExpenseCategory,
  ExpenseCategoryOptionResponse,
  ExpenseCurrency,
  ExpenseMobileMoneyChannel,
  ExpenseMobileMoneyNetwork,
  ExpensePaymentMethod,
  ExpenseResponse,
} from "@/lib/types/expense.types";
import type {
  ExpenseFormValues,
  ExpenseLedgerCategoryFilter,
} from "./expenses-page.types";

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function createEmptyExpenseForm(): ExpenseFormValues {
  return {
    label: "",
    amount: "",
    currency: "RWF",
    category: "",
    paymentMethod: "MOBILE_MONEY",
    mobileMoneyChannel: "P2P_TRANSFER",
    mobileMoneyProvider: "MTN_RWANDA",
    mobileMoneyNetwork: "ON_NET",
    date: getTodayString(),
    note: "",
  };
}

export function createExpenseFormFromCategories(
  categories: ExpenseCategoryOptionResponse[],
  month = getCurrentMonthIndex(),
  year = getCurrentYear(),
): ExpenseFormValues {
  return {
    label: "",
    amount: "",
    currency: "RWF",
    category: categories[0]?.value ?? "",
    paymentMethod: "MOBILE_MONEY",
    mobileMoneyChannel: "P2P_TRANSFER",
    mobileMoneyProvider: "MTN_RWANDA",
    mobileMoneyNetwork: "ON_NET",
    date: getMonthDefaultDate(month, year),
    note: "",
  };
}

export function createExpenseFormFromEntry(
  entry: ExpenseResponse,
): ExpenseFormValues {
  return {
    label: entry.label,
    amount: String(entry.amount),
    currency: entry.currency,
    category: entry.category,
    paymentMethod: entry.paymentMethod,
    mobileMoneyChannel: entry.mobileMoneyChannel ?? "MERCHANT_CODE",
    mobileMoneyProvider: entry.mobileMoneyProvider ?? "MTN_RWANDA",
    mobileMoneyNetwork: entry.mobileMoneyNetwork ?? "ON_NET",
    date: entry.date.split("T")[0] ?? getTodayString(),
    note: entry.note ?? "",
  };
}

export function sortExpenseEntries(entries: ExpenseResponse[]): ExpenseResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export function formatExpenseDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function resolveExpenseMonthLabel(month: number): string {
  return MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "Month";
}

export function resolveExpenseCategoryLabel(
  categories: ExpenseCategoryOptionResponse[],
  value: ExpenseCategory,
): string {
  return categories.find((category) => category.value === value)?.label ?? value;
}

export function buildExpenseLedgerCategoryOptions(
  categories: ExpenseCategoryOptionResponse[],
  entries: ExpenseResponse[],
): ExpenseCategoryOptionResponse[] {
  if (categories.length > 0) {
    return categories;
  }

  const seen = new Set<ExpenseCategory>();

  return entries.reduce<ExpenseCategoryOptionResponse[]>((result, entry) => {
    if (seen.has(entry.category)) {
      return result;
    }

    seen.add(entry.category);
    result.push({
      value: entry.category,
      label: entry.category,
    });

    return result;
  }, []);
}

export function filterExpenseEntries(
  entries: ExpenseResponse[],
  category: ExpenseLedgerCategoryFilter,
): ExpenseResponse[] {
  return entries.filter(
    (entry) => category === "ALL" || entry.category === category,
  );
}

export function formatExpenseNote(note: string | null): string {
  const trimmed = note?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : "No note";
}

export function isMobileMoneyExpense(
  paymentMethod: ExpensePaymentMethod,
): boolean {
  return paymentMethod === "MOBILE_MONEY";
}

export function requiresMobileMoneyNetwork(
  channel: ExpenseMobileMoneyChannel,
): boolean {
  return channel === "P2P_TRANSFER";
}

export function resolveExpensePaymentMethodLabel(
  paymentMethod: ExpensePaymentMethod,
): string {
  switch (paymentMethod) {
    case "CASH":
      return "Cash";
    case "BANK":
      return "Bank";
    case "MOBILE_MONEY":
      return "Mobile money";
    case "CARD":
      return "Card";
    default:
      return "Other";
  }
}

export function resolveExpenseMobileMoneyChannelLabel(
  channel: ExpenseMobileMoneyChannel,
): string {
  return channel === "MERCHANT_CODE" ? "Merchant code" : "Normal transfer";
}

export function resolveExpenseMobileMoneyNetworkLabel(
  network: ExpenseMobileMoneyNetwork,
): string {
  return network === "ON_NET" ? "MTN to MTN" : "Other network";
}

export function resolveExpenseCurrencyLabel(currency: ExpenseCurrency): string {
  return currency;
}

function getMonthDefaultDate(month: number, year: number): string {
  const currentMonth = getCurrentMonthIndex();
  const currentYear = getCurrentYear();

  if (month === currentMonth && year === currentYear) {
    return getTodayString();
  }

  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

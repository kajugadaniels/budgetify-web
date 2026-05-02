import { MONTH_OPTIONS } from "@/constant/months";
import type {
  LoanBalanceEffect,
  LoanDirection,
  LoanAgingResponse,
  LoanAuditResponse,
  LoanOperationalFilter,
  LoanRepaymentAllocation,
  LoanResponse,
  LoanSortOption,
  LoanStatus,
  LoanSummaryResponse,
  LoanTransactionType,
  LoanType,
} from "@/lib/types/loan.types";
import type {
  LoanLedgerDirectionFilter,
  LoanFormValues,
  LoanLedgerStatusFilter,
  LoanLedgerTypeFilter,
  LoanTransactionFinancialFlowFormValues,
  LoanTransactionFormValues,
  LoanTransactionReversalFormValues,
  LoanSettlementFormValues,
} from "./loans-page.types";

export const LOAN_DIRECTION_OPTIONS: Array<{
  label: string;
  value: LoanDirection;
}> = [
  { label: "Borrowed", value: "BORROWED" },
  { label: "Lent", value: "LENT" },
];

export const LOAN_TYPE_OPTIONS: Array<{
  label: string;
  value: LoanType;
}> = [
  { label: "Personal", value: "PERSONAL" },
  { label: "Business", value: "BUSINESS" },
  { label: "Family", value: "FAMILY" },
  { label: "Friend", value: "FRIEND" },
  { label: "Other", value: "OTHER" },
];

export const LOAN_STATUS_OPTIONS: Array<{
  label: string;
  value: LoanStatus;
}> = [
  { label: "Active", value: "ACTIVE" },
  { label: "Partially repaid", value: "PARTIALLY_REPAID" },
  { label: "Settled", value: "SETTLED" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Written off", value: "WRITTEN_OFF" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Archived", value: "ARCHIVED" },
];

export const LOAN_OPERATIONAL_FILTER_OPTIONS: Array<{
  label: string;
  value: LoanOperationalFilter;
}> = [
  { label: "Due in 7 days", value: "DUE_SOON" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Outstanding balance", value: "OUTSTANDING" },
  { label: "Linked to expense", value: "HAS_LINKED_EXPENSE" },
  { label: "Linked to income", value: "HAS_LINKED_INCOME" },
  { label: "Needs financial link", value: "UNLINKED_ELIGIBLE" },
  { label: "Interest-bearing", value: "HAS_INTEREST" },
];

export const LOAN_SORT_OPTIONS: Array<{
  label: string;
  value: LoanSortOption;
}> = [
  { label: "Newest issued", value: "ISSUED_DESC" },
  { label: "Oldest issued", value: "ISSUED_ASC" },
  { label: "Due date soonest", value: "DUE_ASC" },
  { label: "Due date latest", value: "DUE_DESC" },
  { label: "Largest outstanding", value: "OUTSTANDING_DESC" },
  { label: "Smallest outstanding", value: "OUTSTANDING_ASC" },
  { label: "Counterparty A-Z", value: "COUNTERPARTY_ASC" },
  { label: "Latest activity", value: "LATEST_ACTIVITY_DESC" },
];

export const LOAN_TRANSACTION_TYPE_OPTIONS: Array<{
  label: string;
  value: LoanTransactionType;
}> = [
  { label: "Disbursement", value: "DISBURSEMENT" },
  { label: "Repayment", value: "REPAYMENT" },
  { label: "Interest charge", value: "INTEREST_CHARGE" },
  { label: "Interest payment", value: "INTEREST_PAYMENT" },
  { label: "Adjustment", value: "ADJUSTMENT" },
  { label: "Write off", value: "WRITE_OFF" },
];

export const LOAN_BALANCE_EFFECT_OPTIONS: Array<{
  label: string;
  value: LoanBalanceEffect;
}> = [
  { label: "Increase balance", value: "INCREASE" },
  { label: "Decrease balance", value: "DECREASE" },
];

export const LOAN_REPAYMENT_ALLOCATION_OPTIONS: Array<{
  label: string;
  value: LoanRepaymentAllocation;
}> = [
  { label: "Interest first", value: "INTEREST_FIRST" },
  { label: "Principal first", value: "PRINCIPAL_FIRST" },
];

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function buildLoanYearOptions(): Array<{
  label: string;
  value: number;
}> {
  const currentYear = getCurrentYear();

  return Array.from({ length: currentYear - 1999 }, (_, index) => {
    const year = currentYear - index;

    return {
      label: String(year),
      value: year,
    };
  });
}

export function createEmptyLoanForm(
  month = getCurrentMonthIndex(),
  year = getCurrentYear(),
): LoanFormValues {
  return {
    label: "",
    direction: "BORROWED",
    type: "OTHER",
    counterpartyName: "",
    counterpartyContact: "",
    amount: "",
    currency: "RWF",
    issuedDate: getMonthDefaultDate(month, year),
    dueDate: "",
    status: "ACTIVE",
    repaymentAllocation: "INTEREST_FIRST",
    note: "",
  };
}

export function createLoanFormFromEntry(entry: LoanResponse): LoanFormValues {
  return {
    label: entry.label,
    direction: entry.direction,
    type: entry.type,
    counterpartyName: entry.counterpartyName,
    counterpartyContact: entry.counterpartyContact ?? "",
    amount: String(entry.amount),
    currency: entry.currency,
    issuedDate: entry.issuedDate.split("T")[0] ?? getTodayString(),
    dueDate: entry.dueDate?.split("T")[0] ?? "",
    status: entry.status,
    repaymentAllocation: entry.repaymentAllocation,
    note: entry.note ?? "",
  };
}

export function createEmptyLoanSettlementForm(): LoanSettlementFormValues {
  return {
    date: getTodayString(),
    label: "",
    note: "",
  };
}

export function createEmptyLoanTransactionForm(): LoanTransactionFormValues {
  return {
    type: "REPAYMENT",
    amount: "",
    principalAmount: "",
    interestAmount: "",
    currency: "RWF",
    balanceEffect: "DECREASE",
    date: getTodayString(),
    note: "",
  };
}

export function createLoanSettlementFormFromEntry(
  entry: LoanResponse,
): LoanSettlementFormValues {
  return {
    date: entry.issuedDate.split("T")[0] ?? getTodayString(),
    label: "",
    note: entry.note ?? "",
  };
}

export function createEmptyLoanTransactionFinancialFlowForm(): LoanTransactionFinancialFlowFormValues {
  return {
    date: getTodayString(),
    label: "",
    note: "",
  };
}

export function createEmptyLoanTransactionReversalForm(): LoanTransactionReversalFormValues {
  return {
    date: getTodayString(),
    note: "",
  };
}

export function sortLoanEntries(entries: LoanResponse[]): LoanResponse[] {
  return [...entries].sort(
    (left, right) =>
      new Date(right.issuedDate).getTime() -
      new Date(left.issuedDate).getTime(),
  );
}

export interface ClientLoanFilters {
  month?: number;
  year?: number;
  status?: LoanStatus;
  direction?: LoanDirection;
  type?: LoanType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  operationalFilter?: LoanOperationalFilter;
  sortBy?: LoanSortOption;
  minOutstandingRwf?: number;
  maxOutstandingRwf?: number;
}

export function filterLoansClientSide(
  entries: LoanResponse[],
  filters: ClientLoanFilters,
): LoanResponse[] {
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
  const normalizedSearch = filters.search?.trim().toLowerCase();

  return sortLoansClientSide(
    entries.filter((entry) => {
      const issuedDate = new Date(entry.issuedDate);

      if (
        filters.month !== undefined &&
        filters.year !== undefined &&
        (issuedDate.getUTCMonth() + 1 !== filters.month ||
          issuedDate.getUTCFullYear() !== filters.year)
      ) {
        return false;
      }

      if (dateFrom && issuedDate < dateFrom) {
        return false;
      }

      if (dateTo) {
        const exclusiveDateTo = new Date(dateTo);
        exclusiveDateTo.setUTCDate(exclusiveDateTo.getUTCDate() + 1);

        if (issuedDate >= exclusiveDateTo) {
          return false;
        }
      }

      if (filters.status !== undefined && entry.status !== filters.status) {
        return false;
      }

      if (
        filters.direction !== undefined &&
        entry.direction !== filters.direction
      ) {
        return false;
      }

      if (filters.type !== undefined && entry.type !== filters.type) {
        return false;
      }

      if (
        filters.minOutstandingRwf !== undefined &&
        Number(entry.totalOutstandingRwf) < filters.minOutstandingRwf
      ) {
        return false;
      }

      if (
        filters.maxOutstandingRwf !== undefined &&
        Number(entry.totalOutstandingRwf) > filters.maxOutstandingRwf
      ) {
        return false;
      }

      if (
        normalizedSearch &&
        ![
          entry.label,
          entry.counterpartyName,
          entry.counterpartyContact ?? "",
          entry.note ?? "",
        ].some((value) => value.toLowerCase().includes(normalizedSearch))
      ) {
        return false;
      }

      return matchesLoanOperationalFilter(entry, filters.operationalFilter);
    }),
    filters.sortBy,
  );
}

export function buildLoanReportsFromEntries(entries: LoanResponse[]): {
  aging: LoanAgingResponse;
  audit: LoanAuditResponse;
  summary: LoanSummaryResponse;
} {
  const exposureByDirection = (["BORROWED", "LENT"] as const).map(
    (direction) => {
      const directionLoans = entries.filter(
        (entry) => entry.direction === direction,
      );

      return {
        direction,
        loanCount: directionLoans.length,
        originalPrincipalRwf: sumLoans(
          directionLoans,
          "originalPrincipalRwf",
        ),
        principalOutstandingRwf: sumLoans(
          directionLoans,
          "principalOutstandingRwf",
        ),
        interestOutstandingRwf: sumLoans(
          directionLoans,
          "interestOutstandingRwf",
        ),
        totalOutstandingRwf: sumLoans(directionLoans, "totalOutstandingRwf"),
      };
    },
  );
  const statusBreakdown = LOAN_STATUS_OPTIONS.map(({ value: status }) => {
    const statusLoans = entries.filter((entry) => entry.status === status);

    return {
      status,
      loanCount: statusLoans.length,
      totalOutstandingRwf: sumLoans(statusLoans, "totalOutstandingRwf"),
    };
  });
  const overdueLoans = entries.filter((entry) =>
    matchesLoanOperationalFilter(entry, "OVERDUE"),
  );
  const overdueOutstandingRwf = sumLoans(overdueLoans, "totalOutstandingRwf");
  const summary: LoanSummaryResponse = {
    totalLoanCount: entries.length,
    activeLoanCount: entries.filter((entry) => entry.status === "ACTIVE").length,
    settledLoanCount: entries.filter((entry) => entry.status === "SETTLED").length,
    overdueLoanCount: overdueLoans.length,
    borrowedOutstandingRwf: sumLoans(
      entries.filter((entry) => entry.direction === "BORROWED"),
      "totalOutstandingRwf",
    ),
    lentOutstandingRwf: sumLoans(
      entries.filter((entry) => entry.direction === "LENT"),
      "totalOutstandingRwf",
    ),
    interestPayableOutstandingRwf: sumLoans(
      entries.filter((entry) => entry.direction === "BORROWED"),
      "interestOutstandingRwf",
    ),
    interestReceivableOutstandingRwf: sumLoans(
      entries.filter((entry) => entry.direction === "LENT"),
      "interestOutstandingRwf",
    ),
    repaymentsThisPeriodRwf: sumLoans(entries, "principalRepaidRwf"),
    interestEarnedThisPeriodRwf: sumLoans(
      entries.filter((entry) => entry.direction === "LENT"),
      "interestPaidRwf",
    ),
    interestPaidThisPeriodRwf: sumLoans(
      entries.filter((entry) => entry.direction === "BORROWED"),
      "interestPaidRwf",
    ),
    linkedExpenseCount: 0,
    linkedIncomeCount: 0,
    reversedTransactionCount: 0,
    exposureByDirection,
    statusBreakdown,
    latestTransaction: null,
  };
  const audit: LoanAuditResponse = {
    periodStartDate: null,
    periodEndDate: null,
    loanCount: entries.length,
    transactionCount: 0,
    reversedTransactionCount: 0,
    originalPrincipalRwf: sumLoans(entries, "originalPrincipalRwf"),
    principalRepaidRwf: sumLoans(entries, "principalRepaidRwf"),
    principalOutstandingRwf: sumLoans(entries, "principalOutstandingRwf"),
    interestChargedRwf: sumLoans(entries, "interestChargedRwf"),
    interestPaidRwf: sumLoans(entries, "interestPaidRwf"),
    interestOutstandingRwf: sumLoans(entries, "interestOutstandingRwf"),
    totalOutstandingRwf: sumLoans(entries, "totalOutstandingRwf"),
    linkedExpenseCount: 0,
    linkedIncomeCount: 0,
    unlinkedEligibleTransactionCount: 0,
    exposureByDirection,
    statusBreakdown,
  };

  return {
    aging: {
      asOfDate: getTodayString(),
      overdueLoanCount: overdueLoans.length,
      overdueOutstandingRwf,
      buckets: [
        {
          bucket: "OVERDUE",
          loanCount: overdueLoans.length,
          principalOutstandingRwf: sumLoans(
            overdueLoans,
            "principalOutstandingRwf",
          ),
          interestOutstandingRwf: sumLoans(
            overdueLoans,
            "interestOutstandingRwf",
          ),
          totalOutstandingRwf: overdueOutstandingRwf,
        },
      ],
      byDirection: (["BORROWED", "LENT"] as const).map((direction) => {
        const directionOverdueLoans = overdueLoans.filter(
          (entry) => entry.direction === direction,
        );
        const directionOutstandingRwf = sumLoans(
          directionOverdueLoans,
          "totalOutstandingRwf",
        );

        return {
          direction,
          overdueLoanCount: directionOverdueLoans.length,
          overdueOutstandingRwf: directionOutstandingRwf,
          buckets: [
            {
              bucket: "OVERDUE",
              loanCount: directionOverdueLoans.length,
              principalOutstandingRwf: sumLoans(
                directionOverdueLoans,
                "principalOutstandingRwf",
              ),
              interestOutstandingRwf: sumLoans(
                directionOverdueLoans,
                "interestOutstandingRwf",
              ),
              totalOutstandingRwf: directionOutstandingRwf,
            },
          ],
        };
      }),
    },
    audit,
    summary,
  };
}

function sortLoansClientSide(
  entries: LoanResponse[],
  sortBy: LoanSortOption = "ISSUED_DESC",
): LoanResponse[] {
  return [...entries].sort((left, right) => {
    switch (sortBy) {
      case "ISSUED_ASC":
        return (
          new Date(left.issuedDate).getTime() -
          new Date(right.issuedDate).getTime()
        );
      case "DUE_ASC":
        return compareOptionalDates(left.dueDate, right.dueDate);
      case "DUE_DESC":
        return compareOptionalDates(right.dueDate, left.dueDate);
      case "OUTSTANDING_DESC":
        return Number(right.totalOutstandingRwf) - Number(left.totalOutstandingRwf);
      case "OUTSTANDING_ASC":
        return Number(left.totalOutstandingRwf) - Number(right.totalOutstandingRwf);
      case "COUNTERPARTY_ASC":
        return left.counterpartyName.localeCompare(right.counterpartyName);
      case "LATEST_ACTIVITY_DESC":
      case "ISSUED_DESC":
      default:
        return (
          new Date(right.updatedAt ?? right.issuedDate).getTime() -
          new Date(left.updatedAt ?? left.issuedDate).getTime()
        );
    }
  });
}

function matchesLoanOperationalFilter(
  entry: LoanResponse,
  operationalFilter?: LoanOperationalFilter,
): boolean {
  if (operationalFilter === undefined) {
    return true;
  }

  const outstanding = Number(entry.totalOutstandingRwf) > 0;
  const dueDate = entry.dueDate ? new Date(entry.dueDate) : null;
  const today = new Date(getTodayString());
  const sevenDaysFromToday = new Date(today);
  sevenDaysFromToday.setDate(today.getDate() + 7);

  switch (operationalFilter) {
    case "DUE_SOON":
      return (
        outstanding &&
        dueDate !== null &&
        dueDate >= today &&
        dueDate <= sevenDaysFromToday
      );
    case "OVERDUE":
      return (
        outstanding &&
        (entry.status === "OVERDUE" || (dueDate !== null && dueDate < today))
      );
    case "OUTSTANDING":
      return outstanding;
    case "HAS_INTEREST":
      return (
        Number(entry.interestChargedRwf) > 0 ||
        Number(entry.interestOutstandingRwf) > 0
      );
    case "HAS_LINKED_EXPENSE":
    case "HAS_LINKED_INCOME":
    case "UNLINKED_ELIGIBLE":
      return false;
    default:
      return true;
  }
}

function compareOptionalDates(left: string | null, right: string | null): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;

  return new Date(left).getTime() - new Date(right).getTime();
}

function sumLoans(
  entries: LoanResponse[],
  key: keyof Pick<
    LoanResponse,
    | "interestChargedRwf"
    | "interestOutstandingRwf"
    | "interestPaidRwf"
    | "originalPrincipalRwf"
    | "principalOutstandingRwf"
    | "principalRepaidRwf"
    | "totalOutstandingRwf"
  >,
): number {
  return entries.reduce((sum, entry) => sum + Number(entry[key] ?? 0), 0);
}

export function formatLoanDirection(direction: LoanDirection): string {
  return direction === "BORROWED" ? "Borrowed" : "Lent";
}

export function formatLoanType(type: LoanType): string {
  return LOAN_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "Other";
}

export function formatLoanStatus(status: LoanStatus): string {
  return (
    LOAN_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    "Active"
  );
}

export function formatLoanTransactionType(type: LoanTransactionType): string {
  return (
    LOAN_TRANSACTION_TYPE_OPTIONS.find((option) => option.value === type)
      ?.label ?? "Transaction"
  );
}

export function formatLoanBalanceEffect(effect: LoanBalanceEffect): string {
  return effect === "INCREASE" ? "Increase" : "Decrease";
}

export function formatLoanRepaymentAllocation(
  allocation: LoanRepaymentAllocation,
): string {
  return allocation === "PRINCIPAL_FIRST"
    ? "Principal first"
    : "Interest first";
}

export function canLoanTransactionCreateExpense(
  entry: LoanResponse,
  transaction: {
    type: LoanTransactionType;
    balanceEffect: LoanBalanceEffect;
    isReversed: boolean;
    reversalOfTransactionId: string | null;
    linkedExpense: unknown | null;
  },
): boolean {
  if (
    transaction.linkedExpense !== null ||
    transaction.isReversed ||
    transaction.reversalOfTransactionId !== null
  ) {
    return false;
  }

  return (
    (entry.direction === "LENT" && transaction.type === "DISBURSEMENT") ||
    (entry.direction === "BORROWED" &&
      transaction.balanceEffect === "DECREASE" &&
      (transaction.type === "REPAYMENT" ||
        transaction.type === "INTEREST_PAYMENT"))
  );
}

export function canLoanTransactionCreateIncome(
  entry: LoanResponse,
  transaction: {
    type: LoanTransactionType;
    balanceEffect: LoanBalanceEffect;
    isReversed: boolean;
    reversalOfTransactionId: string | null;
    linkedIncome: unknown | null;
  },
): boolean {
  if (
    transaction.linkedIncome !== null ||
    transaction.isReversed ||
    transaction.reversalOfTransactionId !== null
  ) {
    return false;
  }

  return (
    entry.direction === "LENT" &&
    transaction.balanceEffect === "DECREASE" &&
    (transaction.type === "REPAYMENT" ||
      transaction.type === "INTEREST_PAYMENT")
  );
}

export function canReverseLoanTransaction(transaction: {
  type: LoanTransactionType;
  isReversed: boolean;
  reversalOfTransactionId: string | null;
}): boolean {
  return (
    transaction.type !== "REVERSAL" &&
    transaction.reversalOfTransactionId === null &&
    !transaction.isReversed
  );
}

export function formatLoanDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function resolveLoanMonthLabel(month: number): string {
  return MONTH_OPTIONS.find((option) => option.value === month)?.label ?? "Month";
}

export function filterLoanEntries(
  entries: LoanResponse[],
  status: LoanLedgerStatusFilter,
  direction: LoanLedgerDirectionFilter,
  type: LoanLedgerTypeFilter,
): LoanResponse[] {
  return entries.filter((entry) => {
    const matchesStatus = status === "ALL" ? true : entry.status === status;
    const matchesDirection =
      direction === "ALL" ? true : entry.direction === direction;
    const matchesType = type === "ALL" ? true : entry.type === type;
    return matchesStatus && matchesDirection && matchesType;
  });
}

export function isLoanSettled(status: LoanStatus): boolean {
  return status === "SETTLED";
}

export function isLoanTerminalStatus(status: LoanStatus): boolean {
  return (
    status === "CANCELLED" ||
    status === "WRITTEN_OFF" ||
    status === "ARCHIVED"
  );
}

export function formatLoanNote(note: string | null): string {
  const trimmed = note?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "No note";
}

function getMonthDefaultDate(month: number, year: number): string {
  const currentMonth = getCurrentMonthIndex();
  const currentYear = getCurrentYear();

  if (month === currentMonth && year === currentYear) {
    return getTodayString();
  }

  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

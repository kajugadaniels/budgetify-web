import type {
  IncomeAllocationStatus,
  IncomeCategory,
  IncomeDetailResponse,
  IncomeResponse,
} from "@/lib/types/income.types";

export type IncomeLedgerCategoryFilter = IncomeCategory | "ALL";
export type IncomeLedgerReceivedFilter = "ALL" | "RECEIVED" | "PENDING";
export type IncomeLedgerAllocationFilter = IncomeAllocationStatus | "ALL";

export interface IncomeFormValues {
  label: string;
  amount: string;
  category: IncomeCategory | "";
  date: string;
  received: boolean;
}

export type IncomeFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: IncomeResponse }
  | null;

export type IncomeDetailsDialogState =
  | {
      entry: IncomeResponse;
      detail: IncomeDetailResponse | null;
      highlightAllocationId?: string | null;
      loading: boolean;
    }
  | null;

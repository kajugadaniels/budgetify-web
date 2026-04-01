import type { SavingResponse } from "@/lib/types/saving.types";

export interface SavingFormValues {
  label: string;
  amount: string;
  date: string;
  note: string;
}

export type SavingFormDialogState =
  | { mode: "create" }
  | { mode: "edit"; entry: SavingResponse }
  | null;

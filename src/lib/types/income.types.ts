export type IncomeCategory =
  | "SALARY"
  | "FREELANCE"
  | "DIVIDENDS"
  | "RENTAL"
  | "SIDE_HUSTLE"
  | "OTHER";

export interface IncomeCategoryOptionResponse {
  value: IncomeCategory;
  label: string;
}

export interface IncomeResponse {
  id: string;
  label: string;
  amount: number;
  category: IncomeCategory;
  date: string;
  received: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeRequest {
  label: string;
  amount: number;
  category: IncomeCategory;
  date: string;
  received: boolean;
}

export interface UpdateIncomeRequest {
  label?: string;
  amount?: number;
  category?: IncomeCategory;
  date?: string;
  received?: boolean;
}

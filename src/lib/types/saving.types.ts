export interface SavingResponse {
  id: string;
  label: string;
  amount: number;
  date: string;
  note: string | null;
  stillHave: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingRequest {
  label: string;
  amount: number;
  date: string;
  note?: string;
  stillHave?: boolean;
}

export interface UpdateSavingRequest {
  label?: string;
  amount?: number;
  date?: string;
  note?: string;
  stillHave?: boolean;
}

export interface ListSavingsParams {
  month?: number;
  year?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

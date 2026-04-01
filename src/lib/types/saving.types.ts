export interface SavingResponse {
  id: string;
  label: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingRequest {
  label: string;
  amount: number;
  date: string;
  note?: string;
}

export interface UpdateSavingRequest {
  label?: string;
  amount?: number;
  date?: string;
  note?: string;
}

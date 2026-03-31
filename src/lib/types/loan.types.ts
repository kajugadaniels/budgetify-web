export interface LoanResponse {
  id: string;
  label: string;
  amount: number;
  date: string;
  paid: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanRequest {
  label: string;
  amount: number;
  date: string;
  paid: boolean;
  note?: string;
}

export interface UpdateLoanRequest {
  label?: string;
  amount?: number;
  date?: string;
  paid?: boolean;
  note?: string;
}

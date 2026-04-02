export type TodoPriority = "TOP_PRIORITY" | "PRIORITY" | "NOT_PRIORITY";
export type TodoFrequency = "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface TodoImageResponse {
  id: string;
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoResponse {
  id: string;
  name: string;
  price: number;
  priority: TodoPriority;
  done: boolean;
  frequency: TodoFrequency;
  startDate: string | null;
  endDate: string | null;
  frequencyDays: number[];
  occurrenceDates: string[];
  recordedOccurrenceDates: string[];
  remainingAmount: number | null;
  coverImageUrl: string | null;
  imageCount: number;
  images: TodoImageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  name: string;
  price: number;
  priority: TodoPriority;
  done: boolean;
  frequency: TodoFrequency;
  startDate: string;
  endDate?: string;
  frequencyDays?: number[];
  occurrenceDates?: string[];
}

export interface UpdateTodoRequest {
  name?: string;
  price?: number;
  priority?: TodoPriority;
  done?: boolean;
  frequency?: TodoFrequency;
  startDate?: string;
  endDate?: string;
  frequencyDays?: number[];
  occurrenceDates?: string[];
  deductAmount?: number;
  recordedOccurrenceDate?: string;
  primaryImageId?: string;
}

export interface ListTodosParams {
  frequency?: TodoFrequency;
  priority?: TodoPriority;
  done?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

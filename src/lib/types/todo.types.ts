export type TodoPriority = "TOP_PRIORITY" | "PRIORITY" | "NOT_PRIORITY";

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
}

export interface UpdateTodoRequest {
  name?: string;
  price?: number;
  priority?: TodoPriority;
  primaryImageId?: string;
}

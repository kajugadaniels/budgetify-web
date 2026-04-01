export interface PaginationMetaResponse {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMetaResponse;
}

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
}

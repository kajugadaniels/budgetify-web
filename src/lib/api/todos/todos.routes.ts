const BASE = "/api/v1/todos";

function buildTodoSearchParams(params?: {
  frequency?: string;
  priority?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  days?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.frequency !== undefined) {
    searchParams.set("frequency", String(params.frequency));
  }

  if (params?.priority !== undefined) {
    searchParams.set("priority", String(params.priority));
  }

  if (params?.status !== undefined) {
    searchParams.set("status", String(params.status));
  }

  if (params?.search !== undefined) {
    searchParams.set("search", params.search);
  }

  if (params?.dateFrom !== undefined) {
    searchParams.set("dateFrom", params.dateFrom);
  }

  if (params?.dateTo !== undefined) {
    searchParams.set("dateTo", params.dateTo);
  }

  if (params?.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params?.days !== undefined) {
    searchParams.set("days", String(params.days));
  }

  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : "";
}

export const TODOS_ROUTES = {
  list:        (params?: {
    frequency?: string;
    priority?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => `${BASE}${buildTodoSearchParams(params)}`,
  summary:     (params?: {
    frequency?: string;
    priority?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => `${BASE}/summary${buildTodoSearchParams(params)}`,
  upcoming:    (params?: {
    frequency?: string;
    priority?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    days?: number;
  }) => `${BASE}/upcoming${buildTodoSearchParams(params)}`,
  create:      BASE,
  byId:        (id: string) => `${BASE}/${id}`,
  recordings:  (id: string) => `${BASE}/${id}/recordings`,
  images:      (id: string) => `${BASE}/${id}/images`,
  imageById:   (id: string, imageId: string) => `${BASE}/${id}/images/${imageId}`,
} as const;

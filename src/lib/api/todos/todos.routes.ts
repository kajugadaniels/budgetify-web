const BASE = "/api/v1/todos";

export const TODOS_ROUTES = {
  list:        (params?: {
    priority?: string;
    done?: boolean;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();

    if (params?.priority !== undefined) {
      searchParams.set("priority", String(params.priority));
    }

    if (params?.done !== undefined) {
      searchParams.set("done", String(params.done));
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

    const query = searchParams.toString();
    return query.length > 0 ? `${BASE}?${query}` : BASE;
  },
  create:      BASE,
  byId:        (id: string) => `${BASE}/${id}`,
  images:      (id: string) => `${BASE}/${id}/images`,
  imageById:   (id: string, imageId: string) => `${BASE}/${id}/images/${imageId}`,
} as const;

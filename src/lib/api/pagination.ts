import type {
  PaginatedResponse,
  PaginationQueryParams,
} from "../types/pagination.types";

const BATCH_LIMIT = 100;

export async function collectPaginatedItems<T, TParams extends PaginationQueryParams>(
  fetchPage: (params: TParams) => Promise<PaginatedResponse<T>>,
  params?: Omit<TParams, keyof PaginationQueryParams>,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetchPage({
      ...(params ?? {}),
      page,
      limit: BATCH_LIMIT,
    } as TParams);

    items.push(...response.items);
    hasNextPage = response.meta.hasNextPage;
    page += 1;
  }

  return items;
}

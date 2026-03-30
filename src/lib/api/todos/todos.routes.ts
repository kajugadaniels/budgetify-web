const BASE = "/api/v1/todos";

export const TODOS_ROUTES = {
  list:        BASE,
  create:      BASE,
  byId:        (id: string) => `${BASE}/${id}`,
  images:      (id: string) => `${BASE}/${id}/images`,
  imageById:   (id: string, imageId: string) => `${BASE}/${id}/images/${imageId}`,
} as const;

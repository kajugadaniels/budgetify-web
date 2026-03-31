const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

/**
 * Thin wrapper around `fetch` that:
 * - Prepends the API base URL
 * - Attaches the Bearer token when provided
 * - Parses JSON responses
 * - Throws a typed ApiError on non-2xx status
 * - Returns undefined for 204 No Content
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, body, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  };

  if (body !== undefined && !isFormData(body) && headers["Content-Type"] === undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    body:
      body === undefined
        ? undefined
        : isFormData(body)
          ? body
          : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json();

  if (!response.ok) {
    const err = data as { error?: string; message?: string };
    throw new ApiError(
      response.status,
      err.error ?? "UNKNOWN_ERROR",
      err.message ?? "An unexpected error occurred.",
    );
  }

  return data as T;
}

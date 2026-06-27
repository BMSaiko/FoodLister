export interface PaginationMeta {
  page: number;
  limit: number;
  total: number | null;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: { defaultLimit?: number; maxLimit?: number } = {}
): { page: number; limit: number; from: number; to: number } {
  const { defaultLimit = 25, maxLimit = 100 } = defaults;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limitRaw = searchParams.get("limit");
  let limit: number;
  if (limitRaw === "all") {
    limit = 10000;
  } else {
    limit = Math.min(maxLimit, Math.max(1, parseInt(limitRaw || String(defaultLimit), 10)));
  }
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number | null
): PaginationMeta {
  const totalPages = total !== null ? Math.max(1, Math.ceil(total / limit)) : 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: total !== null ? page * limit < total : false,
    hasPrev: page > 1,
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number | null,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: buildPaginationMeta(page, limit, total),
  };
}

/**
 * Parse pagination from NextRequest — convenience for API routes.
 * Supports ?page=N and ?limit=N query params.
 */
export function parsePaginationFromRequest(
  request: Request,
  defaults?: { defaultLimit?: number; maxLimit?: number }
): { page: number; limit: number; from: number; to: number; all: boolean } {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("limit") === "all";
  const result = parsePaginationParams(searchParams, { maxLimit: 5000, ...defaults });
  return { ...result, all };
}

export function isRandomSort(request: Request): boolean {
  const { searchParams } = new URL(request.url);
  return searchParams.get("random") === "true";
}

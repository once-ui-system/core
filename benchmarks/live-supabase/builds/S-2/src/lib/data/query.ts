/**
 * The query a server-mode table sends, and how a route reads it back.
 * Client-safe and dependency-free: the hook that drives a DataTable writes
 * these parameters, the route handler parses them with the same spec, and
 * demo mode answers them in memory — so all three agree on what a page is.
 *
 * A route never trusts the parameters it is sent. `parseTableQuery` keeps a
 * sort only on a column the spec lists, a filter only to a value the spec
 * lists, and clamps the page size, so what reaches the database is always
 * something the route's author chose to allow.
 */

export type SortDirection = "asc" | "desc";

export interface TableQuery {
  /** From 1. */
  page: number;
  perPage: number;
  sort: { key: string; direction: SortDirection } | null;
  /** Free-text search, trimmed; empty for none. */
  q: string;
  /** Exact-match filters, one value per key, each one the spec allowed. */
  filters: Record<string, string>;
}

export interface TableQuerySpec {
  /** Columns the reader may sort by. Anything else is dropped, not an error. */
  sortable: readonly string[];
  /** Filter keys and the values each one accepts. */
  filters?: Readonly<Record<string, readonly string[]>>;
  defaultSort?: TableQuery["sort"];
  defaultPerPage?: number;
  /** The most rows one request can ask for. Defaults to 100. */
  maxPerPage?: number;
}

export interface TablePage<T> {
  rows: T[];
  /** Rows matching the query across every page. */
  count: number;
  page: number;
  perPage: number;
}

/** The longest search a route will pass to the database. */
const MAX_QUERY_LENGTH = 100;

function positiveInt(value: string | null, fallback: number): number {
  const n = value === null ? Number.NaN : Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/** Read a table query from a request's search params, keeping only what `spec` allows. */
export function parseTableQuery(params: URLSearchParams, spec: TableQuerySpec): TableQuery {
  const maxPerPage = spec.maxPerPage ?? 100;
  const perPage = Math.min(positiveInt(params.get("perPage"), spec.defaultPerPage ?? 10), maxPerPage);
  const page = positiveInt(params.get("page"), 1);

  const sortKey = params.get("sort");
  const direction: SortDirection = params.get("dir") === "desc" ? "desc" : "asc";
  const sort =
    sortKey && spec.sortable.includes(sortKey)
      ? { key: sortKey, direction }
      : (spec.defaultSort ?? null);

  const filters: Record<string, string> = {};
  for (const [key, allowed] of Object.entries(spec.filters ?? {})) {
    const value = params.get(key);
    if (value !== null && allowed.includes(value)) filters[key] = value;
  }

  const q = (params.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);

  return { page, perPage, sort, q, filters };
}

/** The search params for a query — what the hook puts in the URL and the fetch. */
export function tableQueryToParams(query: TableQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page !== 1) params.set("page", String(query.page));
  params.set("perPage", String(query.perPage));
  if (query.sort) {
    params.set("sort", query.sort.key);
    params.set("dir", query.sort.direction);
  }
  if (query.q) params.set("q", query.q);
  for (const [key, value] of Object.entries(query.filters)) params.set(key, value);
  return params;
}

/** The zero-based, inclusive row range a page covers — PostgREST's `.range()`. */
export function pageRange(query: Pick<TableQuery, "page" | "perPage">): [number, number] {
  const from = (query.page - 1) * query.perPage;
  return [from, from + query.perPage - 1];
}

/**
 * Escape a search term for a PostgREST `ilike` pattern inside an `or=()`
 * filter: `%` and `_` are wildcards, and `,` `(` `)` are the filter grammar's
 * own punctuation. Without this a search for `a,b` is two filters.
 */
export function ilikePattern(q: string): string {
  const escaped = q.replace(/[\\%_]/g, (c) => `\\${c}`).replace(/[,()]/g, " ");
  return `%${escaped}%`;
}

/**
 * Answer a query from rows held in memory — demo mode, and any list small
 * enough to load whole. Same semantics as the database path: filters, then
 * search over `searchKeys`, then sort, then the page.
 */
export function queryInMemory<T extends object>(
  rows: readonly T[],
  query: TableQuery,
  searchKeys: readonly (keyof T & string)[],
): TablePage<T> {
  const field = (row: T, key: string): unknown => (row as Record<string, unknown>)[key];
  const needle = query.q.toLowerCase();
  let matched = rows.filter(
    (row) =>
      Object.entries(query.filters).every(([key, value]) => String(field(row, key) ?? "") === value) &&
      (!needle || searchKeys.some((key) => String(field(row, key) ?? "").toLowerCase().includes(needle))),
  );

  if (query.sort) {
    const { key, direction } = query.sort;
    const sign = direction === "asc" ? 1 : -1;
    matched = [...matched].sort((a, b) => {
      const x = field(a, key);
      const y = field(b, key);
      // Empty values last in either direction, like DataTable's own sort.
      if (x === null || x === undefined || x === "") return 1;
      if (y === null || y === undefined || y === "") return -1;
      return sign * String(x).localeCompare(String(y), undefined, { numeric: true });
    });
  }

  const [from, to] = pageRange(query);
  return { rows: matched.slice(from, to + 1), count: matched.length, page: query.page, perPage: query.perPage };
}

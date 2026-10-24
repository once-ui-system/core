"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type TablePage,
  type TableQuery,
  type TableQuerySpec,
  parseTableQuery,
  tableQueryToParams,
} from "./query";

/**
 * Where the rows come from: an API route that answers `TableQuery` search
 * params with a `TablePage`, or a function — demo mode answers in memory with
 * `queryInMemory`, so the table behaves the same with no database.
 */
export type TableSource<T> = { url: string } | { load: (query: TableQuery) => Promise<TablePage<T>> };

export interface ServerTable<T> {
  query: TableQuery;
  rows: T[];
  count: number;
  /** True while a page is in flight, including the first one. */
  loading: boolean;
  error: string | null;
  setSearch: (q: string) => void;
  /** Set a filter, or clear it with `null`. */
  setFilter: (key: string, value: string | null) => void;
  refresh: () => void;
  /** Spread onto core's `DataTable`: server mode, controlled page, sort and size. */
  tableProps: {
    rows: T[];
    count: number;
    page: number;
    perPage: number;
    sort: TableQuery["sort"];
    loading: boolean;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onSortChange: (sort: TableQuery["sort"]) => void;
  };
}

/** How long typing settles before a search is sent. */
const SEARCH_DEBOUNCE_MS = 250;

function readUrlQuery(spec: TableQuerySpec): TableQuery {
  const params =
    typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  return parseTableQuery(params, spec);
}

/**
 * Drive a DataTable in server mode: the page, sort, size, search and filters
 * live in the URL (so a refresh or a shared link shows the same rows), each
 * change fetches one page, and a stale response never overwrites a newer one.
 *
 * The URL is written with `history.replaceState` rather than the router, so a
 * keystroke in the search box neither adds history entries nor re-renders
 * the route, and the page needs no Suspense boundary for `useSearchParams`.
 */
export function useServerTable<T>(source: TableSource<T>, spec: TableQuerySpec): ServerTable<T> {
  const [query, setQuery] = useState<TableQuery>(() => parseTableQuery(new URLSearchParams(), spec));
  const [result, setResult] = useState<TablePage<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [ready, setReady] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The spec and source are usually literals; key them by content so a parent
  // re-render does not refetch.
  const specKey = JSON.stringify(spec);
  const sourceKey = "url" in source ? source.url : "load";
  const sourceRef = useRef(source);
  sourceRef.current = source;

  // Read the URL after hydration, so the server render and the first client
  // render agree, then start fetching.
  useEffect(() => {
    setQuery(readUrlQuery(JSON.parse(specKey)));
    setReady(true);
  }, [specKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: sourceKey stands in for source; nonce forces a refetch
  useEffect(() => {
    if (!ready) return;

    const params = tableQueryToParams(query);
    if (typeof window !== "undefined") {
      const next = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(window.history.state, "", next);
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const current = sourceRef.current;
    const request: Promise<TablePage<T>> =
      "url" in current
        ? fetch(`${current.url}?${params.toString()}`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }).then(async (res) => {
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(apiErrorMessage(body, `Request failed (${res.status})`));
            return body as TablePage<T>;
          })
        : current.load(query);

    request
      .then((page) => {
        if (controller.signal.aborted) return;
        setResult(page);
        // A page past the end (rows were removed, or a stale link): step back
        // to the last page that has rows instead of showing an empty table.
        const lastPage = Math.max(1, Math.ceil(page.count / page.perPage));
        if (page.rows.length === 0 && query.page > lastPage) {
          setQuery((q) => ({ ...q, page: lastPage }));
        }
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [ready, query, sourceKey, nonce]);

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  const setSearch = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setQuery((current) => (current.q === q.trim() ? current : { ...current, q: q.trim(), page: 1 }));
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const setFilter = useCallback((key: string, value: string | null) => {
    setQuery((current) => {
      const filters = { ...current.filters };
      if (value === null) delete filters[key];
      else filters[key] = value;
      return { ...current, filters, page: 1 };
    });
  }, []);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const rows = result?.rows ?? [];
  const count = result?.count ?? 0;

  const tableProps = useMemo(
    () => ({
      rows,
      count,
      page: query.page,
      perPage: query.perPage,
      sort: query.sort,
      loading,
      onPageChange: (page: number) => setQuery((q) => ({ ...q, page })),
      onPerPageChange: (perPage: number) => setQuery((q) => ({ ...q, perPage, page: 1 })),
      onSortChange: (sort: TableQuery["sort"]) => setQuery((q) => ({ ...q, sort, page: 1 })),
    }),
    [rows, count, query, loading],
  );

  return { query, rows, count, loading, error, setSearch, setFilter, refresh, tableProps };
}

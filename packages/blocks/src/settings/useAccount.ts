"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Account, AccountAdapter, Organization, OrganizationAdapter } from "./types.js";

/**
 * Loads a record through an adapter and keeps it current. `update` takes the
 * record a write returned, or reloads when the write returned nothing.
 */
function useRecord<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const loadRef = useRef(load);
  loadRef.current = load;

  const reload = useCallback(async () => {
    try {
      const next = await loadRef.current();
      setData(next);
      setError(null);
      return next;
    } catch (e) {
      setError(e);
      return null;
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const update = useCallback(
    async (next: T | void | undefined) => {
      if (next) setData(next);
      else await reload();
    },
    [reload],
  );

  return { data, error, loading: data === null && error === null, reload, update, setData };
}

/** The signed-in person's account, read through the adapter. */
export function useAccount(adapter: AccountAdapter) {
  const record = useRecord<Account>(() => adapter.getAccount());
  return { ...record, account: record.data };
}

/** The organization, read through the adapter. */
export function useOrganization(adapter: OrganizationAdapter) {
  const record = useRecord<Organization>(() => adapter.getOrganization());
  return { ...record, organization: record.data };
}

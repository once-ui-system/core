"use client";

import { apiErrorMessage } from "@/lib/api-error-message";
import { type OrgMembership, orgSlugFromPath, repointOrgPath } from "@/lib/orgs/types";
import { createClient } from "@/lib/sb/client";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * The one source of truth for tenancy on the client.
 *
 * Aveiro grew a UserProvider that carried organizations AND a separate
 * OrganizationProvider, and the switcher then had two lists that could
 * disagree. There is one provider here, and `UserProvider` stays about the
 * person — profile, email, global role — and knows nothing about tenants.
 *
 * The URL is what selects the organization, not state held here: `selected`
 * is derived from the `[org]` segment. That way a link, a refresh and a back
 * button all land on the same tenant as a click on the switcher, and there
 * is no second place for the selection to drift out of sync.
 */
type OrgContextValue = {
  /** Every organization the signed-in user belongs to. Empty in demo mode. */
  organizations: OrgMembership[];
  /** The one the URL is pointing at, once it is known. */
  selected: OrgMembership | null;
  /**
   * The `[org]` segment itself. Available before `organizations` loads, and
   * in demo mode where there is no database to load them from — so this, not
   * `selected`, is what a link builds a path from.
   */
  slug: string | null;
  /** Go to the same page under another organization. */
  select: (slug: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  // Demo mode (no Supabase env): there is nothing to fetch, so start settled
  // rather than showing a spinner that will never resolve.
  const configured = isSupabaseConfigured();
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const [organizations, setOrganizations] = useState<OrgMembership[]>([]);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string | null>(null);

  const slug = orgSlugFromPath(pathname);

  const load = useCallback(async () => {
    if (!configured) return;
    try {
      setLoading(true);
      setError(null);

      // No session cookie: signed out, and the request would only log a 401.
      const { data: session } = await createClient().auth.getSession();
      if (!session.session) {
        setOrganizations([]);
        return;
      }

      const res = await fetch("/api/orgs", { credentials: "include", cache: "no-store" });

      // Signed out, or a composition running without Supabase configured:
      // normal states, not errors worth putting in front of anybody.
      if (res.status === 401 || res.status === 503) {
        setOrganizations([]);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(apiErrorMessage(body, `Request failed (${res.status})`));
      }

      const data = (await res.json()) as { organizations?: OrgMembership[] };
      setOrganizations(data.organizations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your organizations");
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [configured]);

  // `load` is stable, so this runs once per mount. The list changes when an
  // organization is created or left, and both of those call refresh(), and
  // when the session does: signing in navigates on the client, so the
  // provider is still mounted from the signed-out page.
  useEffect(() => {
    void load();
    if (!configured) return;
    const { data: sub } = createClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void load();
    });
    return () => sub.subscription.unsubscribe();
  }, [configured, load]);

  const value = useMemo<OrgContextValue>(() => {
    const selected = organizations.find((org) => org.slug === slug) ?? null;

    return {
      organizations,
      selected,
      slug,
      // Switching is a re-root of the current path, not a jump to a fixed
      // landing page: whoever switches stays on the page they were reading.
      select: (next: string) => {
        if (next !== slug) router.push(repointOrgPath(pathname, next));
      },
      loading,
      error,
      refresh: load,
    };
  }, [organizations, slug, pathname, loading, error, router, load]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return ctx;
}

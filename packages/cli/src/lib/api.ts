/** A failure the user can act on. Printed without a stack trace. */
export class CliError extends Error {}

export type ApiClient = {
  base: string;
  token: string | null;
  fetch: (path: string, init?: RequestInit) => Promise<Response>;
};

export function createClient(base: string, token: string | null): ApiClient {
  return {
    base,
    token,
    fetch: (path, init = {}) => {
      const headers = new Headers(init.headers);
      if (token) headers.set("authorization", `Bearer ${token}`);
      headers.set("user-agent", "once-ui-cli");
      return fetch(`${base}${path}`, { ...init, headers });
    },
  };
}

/**
 * Turn a non-2xx response into a message that says what to do next. The
 * server's own `{ error }` text is kept: it names the surface or block that a
 * plan lacks, which is more useful than anything generic.
 */
export async function failureFrom(res: Response): Promise<CliError> {
  let message = `${res.status} ${res.statusText}`.trim();
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body.error === "string") message = body.error;
  } catch {
    // not JSON — keep the status line
  }
  if (res.status === 401)
    return new CliError(
      `${message}\nRun \`once-ui login\` (or \`npx @once-ui-system/cli login\`) first.`,
    );
  if (res.status === 402) {
    return new CliError(`${message}\nSee plans at https://once-ui.com/pricing`);
  }
  return new CliError(message);
}

export type CatalogEntry = { id: string; title: string; requires: string[]; owned: boolean };

export type Catalog = {
  release: string;
  signedIn: boolean;
  access: "subscription" | "grant" | "free";
  surfaces: CatalogEntry[];
  slices: CatalogEntry[];
};

export async function getCatalog(client: ApiClient): Promise<Catalog> {
  const res = await client.fetch("/api/stack");
  if (!res.ok) throw await failureFrom(res);
  return (await res.json()) as Catalog;
}

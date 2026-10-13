import { classifyHostname, normalizeHostname } from "./og-address";
import { OGFetchError, OGUrlValidationError } from "./og-errors";
import { loadNodeBuiltins } from "./og-node";
import { createPinnedLookup, requestPinned, resolvePublicAddresses } from "./og-transport";

export { OGUrlValidationError } from "./og-errors";

export interface OGUrlValidationOptions {
  /** When set, only these domains (and their subdomains) are permitted. */
  allowedDomains?: string[];
  /** These domains (and their subdomains) are always refused. */
  blockedDomains?: string[];
  /** Also accept plain `http:` URLs. Default `false`: HTTPS only. */
  allowHttp?: boolean;
  /**
   * Final say on every URL, the first one and each redirect target, called
   * after the built-in checks pass. Return `false` to refuse it. It can only
   * narrow: a URL the built-in checks refuse never reaches it.
   */
  isAllowed?: (url: URL) => boolean | Promise<boolean>;
}

export const DEFAULT_MAX_REDIRECTS = 3;

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function matchesDomain(hostname: string, domains: string[]): boolean {
  const normalized = normalizeHostname(hostname);
  return domains.some((domain) => {
    const candidate = normalizeHostname(domain.trim());
    return candidate !== "" && (normalized === candidate || normalized.endsWith(`.${candidate}`));
  });
}

function parseUrl(urlString: string, options: OGUrlValidationOptions): URL {
  let parsed: URL;

  try {
    parsed = new URL(urlString);
  } catch {
    throw new OGUrlValidationError("URL is malformed");
  }

  const protocols = options.allowHttp ? ["https:", "http:"] : ["https:"];
  if (!protocols.includes(parsed.protocol)) {
    throw new OGUrlValidationError(
      options.allowHttp ? "Only HTTP and HTTPS URLs are allowed" : "Only HTTPS URLs are allowed",
    );
  }

  if (parsed.username || parsed.password) {
    throw new OGUrlValidationError("URL credentials are not allowed");
  }

  if (!parsed.hostname) {
    throw new OGUrlValidationError("URL hostname is required");
  }

  return parsed;
}

/**
 * Every check that needs no DNS: scheme, credentials, the hostname itself
 * (internal names, non-public IP literals), the allow and block lists and the
 * `isAllowed` hook. Returns whether the hostname still needs resolving.
 */
async function checkUrl(urlString: string, options: OGUrlValidationOptions) {
  const url = parseUrl(urlString, options);
  const hostname = url.hostname;

  if (options.allowedDomains?.length && !matchesDomain(hostname, options.allowedDomains)) {
    throw new OGUrlValidationError("URL domain is not allowed");
  }

  if (options.blockedDomains?.length && matchesDomain(hostname, options.blockedDomains)) {
    throw new OGUrlValidationError("URL domain is blocked");
  }

  const kind = classifyHostname(hostname);
  if (kind === "blocked") {
    throw new OGUrlValidationError("URL hostname is not allowed");
  }

  if (options.isAllowed && !(await options.isAllowed(new URL(url.href)))) {
    throw new OGUrlValidationError("URL is not allowed");
  }

  return { url, needsResolution: kind === "name" };
}

async function requireNodeBuiltins() {
  const builtins = await loadNodeBuiltins();
  if (!builtins) {
    throw new OGFetchError(
      500,
      "Open Graph fetching needs the Node.js runtime (it resolves and checks hostnames)",
    );
  }
  return builtins;
}

/**
 * Checks a URL without fetching it: scheme (HTTPS, or HTTP with
 * `allowHttp`), no credentials, not an internal hostname or non-public IP
 * literal, the allow and block lists, `isAllowed`, and that every address the
 * hostname resolves to is public. Throws `OGUrlValidationError` otherwise.
 *
 * On its own this leaves a window between the check and a later connection
 * (DNS rebinding). The OG handlers do not rely on it: they resolve and check
 * again inside the connection itself.
 */
export async function validateOgUrl(
  urlString: string,
  options: OGUrlValidationOptions = {},
): Promise<URL> {
  const { url, needsResolution } = await checkUrl(urlString, options);

  if (needsResolution) {
    const { dns } = await requireNodeBuiltins();
    await resolvePublicAddresses(dns, url.hostname);
  }

  return url;
}

export interface OGPublicFetchOptions extends OGUrlValidationOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Redirects to follow, each one checked like the first URL. Default 3. */
  maxRedirects?: number;
}

/**
 * GETs a URL that must stay on public addresses: every hop is checked before
 * it is requested, redirects are followed by hand (up to `maxRedirects`), and
 * each connection goes to an address checked at connect time.
 */
export async function fetchPublicUrl(
  urlString: string,
  options: OGPublicFetchOptions = {},
): Promise<{ response: Response; url: URL }> {
  const builtins = await requireNodeBuiltins();
  const lookup = createPinnedLookup(builtins.dns);
  const maxRedirects = Math.max(0, options.maxRedirects ?? DEFAULT_MAX_REDIRECTS);

  let current = urlString;
  for (let redirects = 0; ; redirects++) {
    const { url } = await checkUrl(current, options);

    const response = await requestPinned(builtins, url, {
      headers: options.headers ?? {},
      lookup,
      signal: options.signal,
    });

    if (!REDIRECT_STATUSES.has(response.status)) {
      return { response, url };
    }

    const location = response.headers.get("location");
    if (!location) {
      throw new OGFetchError(502, "Redirect response missing location");
    }
    if (redirects >= maxRedirects) {
      throw new OGFetchError(502, "Too many redirects");
    }

    try {
      current = new URL(location, url).href;
    } catch {
      throw new OGFetchError(502, "Redirect location is malformed");
    }
  }
}

/**
 * Fetches a URL with the same guarantees as the OG handlers. Kept for
 * existing callers; only `headers` and `signal` are read from `init`, and the
 * request is always a GET.
 */
export async function fetchValidatedUrl(
  urlString: string,
  init: RequestInit = {},
  validationOptions: OGUrlValidationOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {};
  new Headers(init.headers).forEach((value, key) => {
    headers[key] = value;
  });

  const { response } = await fetchPublicUrl(urlString, {
    ...validationOptions,
    headers,
    signal: init.signal ?? undefined,
  });
  return response;
}

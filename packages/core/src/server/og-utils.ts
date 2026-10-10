/**
 * Open Graph fetch/proxy handlers.
 *
 * Uses the standard `Response` rather than `NextResponse`: `NextResponse`
 * extends `Response`, so Next route handlers accept these return values
 * unchanged, and the module no longer pulls `next/server` into core.
 *
 * Both handlers only ever request public addresses: every URL, and every
 * redirect target, is checked before it is requested, and the connection
 * itself goes to an address checked at connect time (see og-transport.ts).
 * They need the Node.js runtime.
 */
import { OGFetchError, OGUrlValidationError } from "./og-errors";
import { fetchPublicUrl, type OGUrlValidationOptions } from "./og-url-validation";

export interface OGData {
  url: string;
  title: string;
  description: string;
  image: string;
  faviconUrl?: string;
}

interface OGRequestOptions extends OGUrlValidationOptions {
  /** User-Agent sent upstream. */
  userAgent?: string;
  /** Milliseconds for the whole upstream exchange: DNS, connect, redirects and body. */
  timeout?: number;
  /** Largest response body read, in bytes, after decompression. */
  maxBytes?: number;
  /** Redirects to follow, each one checked like the first URL. Default 3. */
  maxRedirects?: number;
  /** `Cache-Control` for successful responses. Errors are always `no-store`. */
  cacheControl?: string;
  /**
   * Refuse (403) requests whose `Origin`, or else `Referer`, names another
   * host. Requests that carry neither are allowed. Default `false`.
   */
  sameOrigin?: boolean;
}

export interface OGFetchOptions extends OGRequestOptions {
  /** Default 5000. */
  timeout?: number;
  /** Decode HTML entities in the title and description. Default `true`. */
  decodeEntities?: boolean;
  /**
   * Default 1 MiB. Only HTML is read, and only up to this many bytes; Open
   * Graph tags live in `<head>`, so a longer page is parsed from what was read.
   */
  maxBytes?: number;
  /** Default `"public, max-age=3600"`. */
  cacheControl?: string;
}

export interface OGProxyOptions extends OGRequestOptions {
  /** Default 10000. */
  timeout?: number;
  /** Default 5 MiB. A larger image is refused, not truncated. */
  maxBytes?: number;
  /** `max-age` for successful responses, in seconds. Default 3600. */
  cacheMaxAge?: number;
  /** Full `Cache-Control` for successful responses. Overrides `cacheMaxAge`. */
  cacheControl?: string;
  /**
   * Content types the proxy passes through. Default `DEFAULT_OG_IMAGE_TYPES`.
   * `"image/*"` matches any image type. SVG is left out of the default
   * because it can carry script; proxied responses are sent with
   * `nosniff` and a sandboxing CSP either way.
   */
  allowedContentTypes?: readonly string[];
}

/** Raster image types the proxy passes through by default. */
export const DEFAULT_OG_IMAGE_TYPES: readonly string[] = Object.freeze([
  "image/avif",
  "image/webp",
  "image/png",
  "image/apng",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/gif",
  "image/bmp",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const HTML_TYPES = new Set(["text/html", "application/xhtml+xml"]);

const DEFAULT_FETCH_USER_AGENT = "Mozilla/5.0 (compatible; OG-Fetcher/1.0)";
const DEFAULT_PROXY_USER_AGENT = "Mozilla/5.0 (compatible; OG-Proxy/1.0)";
const KIB = 1024;
const MIB = 1024 * KIB;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  middot: "·",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
};

function decodeHTMLEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      const valid = code > 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff);
      return valid ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity] ?? NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const ATTRIBUTE_PATTERN = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** Attribute values as written; callers decode entities where they need to. */
function parseAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [, name, doubleQuoted, singleQuoted, unquoted] of source.matchAll(ATTRIBUTE_PATTERN)) {
    const key = name.toLowerCase();
    if (!(key in attributes)) {
      attributes[key] = doubleQuoted ?? singleQuoted ?? unquoted ?? "";
    }
  }
  return attributes;
}

function collectTags(html: string, tag: "meta" | "link"): Record<string, string>[] {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>`, "gi");
  return Array.from(html.matchAll(pattern), ([, attributes]) => parseAttributes(attributes));
}

/** An absolute http(s) URL resolved against the page, or "" for anything else. */
function resolveHttpUrl(value: string | undefined, base: URL): string {
  const candidate = value ? decodeHTMLEntities(value).trim() : "";
  if (!candidate) {
    return "";
  }
  try {
    const resolved = new URL(candidate, base);
    return resolved.protocol === "https:" || resolved.protocol === "http:" ? resolved.href : "";
  } catch {
    return "";
  }
}

function extractOgData(
  html: string,
  requestedUrl: string,
  pageUrl: URL,
  decodeEntities: boolean,
): OGData {
  const metas = collectTags(html, "meta");
  const meta = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      for (const attributes of metas) {
        const names = [attributes.property, attributes.name].map((value) => value?.toLowerCase());
        if (names.includes(key) && attributes.content?.trim()) {
          return attributes.content;
        }
      }
    }
    return undefined;
  };
  const text = (value: string | undefined) =>
    (decodeEntities ? decodeHTMLEntities(value ?? "") : (value ?? "")).replace(/\s+/g, " ").trim();

  const title =
    text(meta("og:title")) ||
    text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]) ||
    text(meta("twitter:title"));
  const description = text(meta("description", "og:description", "twitter:description"));
  const image = resolveHttpUrl(
    meta("og:image", "og:image:url", "og:image:secure_url", "twitter:image", "twitter:image:src"),
    pageUrl,
  );

  const icon = collectTags(html, "link").find((attributes) =>
    (attributes.rel ?? "").toLowerCase().split(/\s+/).includes("icon"),
  );
  const faviconUrl = resolveHttpUrl(icon?.href, pageUrl);

  const data: OGData = { url: requestedUrl, title, description, image };
  if (faviconUrl) {
    data.faviconUrl = faviconUrl;
  }
  return data;
}

function mediaType(contentType: string | null): string {
  return (contentType ?? "").split(";")[0].trim().toLowerCase();
}

function charsetOf(contentType: string | null): string {
  return /charset\s*=\s*"?([^";\s]+)/i.exec(contentType ?? "")?.[1] ?? "utf-8";
}

function decodeText(bytes: Uint8Array, charset: string): string {
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

function isAllowedContentType(type: string, allowed: readonly string[]): boolean {
  return allowed.some((entry) => {
    const candidate = entry.trim().toLowerCase();
    return candidate.endsWith("/*")
      ? type.startsWith(candidate.slice(0, -1)) && type.length > candidate.length - 1
      : candidate === type;
  });
}

async function cancelBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // Already closed or errored.
  }
}

/**
 * Reads a body up to `maxBytes`. With `truncate`, the rest is dropped;
 * otherwise a longer body is an error. Reading stops as soon as the limit is
 * reached, so an oversized or endless body is never buffered whole.
 */
async function readBody(
  response: Response,
  maxBytes: number,
  truncate: boolean,
): Promise<Uint8Array<ArrayBuffer>> {
  const chunks: Uint8Array[] = [];
  let total = 0;

  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (total + value.byteLength > maxBytes) {
        if (!truncate) {
          await reader.cancel().catch(() => undefined);
          throw new OGFetchError(502, "Upstream response is too large");
        }
        chunks.push(value.subarray(0, maxBytes - total));
        total = maxBytes;
        await reader.cancel().catch(() => undefined);
        break;
      }
      chunks.push(value);
      total += value.byteLength;
    }
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function jsonError(status: number, error: string, extraHeaders?: Record<string, string>) {
  return Response.json(
    { error },
    { status, headers: { "Cache-Control": "no-store", ...extraHeaders } },
  );
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function isCrossOrigin(request: Request): boolean {
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  if (!source) {
    return false;
  }

  let sourceHost: string;
  try {
    sourceHost = new URL(source).host;
  } catch {
    return true;
  }

  const ownHosts = [
    new URL(request.url).host,
    firstHeaderValue(request.headers.get("x-forwarded-host")),
    request.headers.get("host"),
  ];
  return !ownHosts.includes(sourceHost);
}

type Handled = { target: string } | { response: Response };

function readTarget(request: Request, options: OGRequestOptions): Handled {
  if (options.sameOrigin && isCrossOrigin(request)) {
    return { response: jsonError(403, "Forbidden", { Vary: "Origin" }) };
  }

  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    return { response: jsonError(400, "URL parameter is required") };
  }

  return { target };
}

/**
 * Runs the upstream exchange under one deadline. The returned promise settles
 * by the deadline even if a step (DNS) cannot be cancelled; the signal tears
 * down whatever is in flight.
 */
async function withDeadline<T>(
  timeout: number,
  parent: AbortSignal | undefined,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new OGFetchError(504, "Upstream request timed out")),
    timeout,
  );
  const onParentAbort = () => controller.abort(new OGFetchError(499, "Request aborted"));
  if (parent?.aborted) {
    onParentAbort();
  } else {
    parent?.addEventListener("abort", onParentAbort, { once: true });
  }

  let rejectOnAbort: (reason: unknown) => void = () => undefined;
  const aborted = new Promise<never>((_, reject) => {
    rejectOnAbort = reject;
  });
  const onAbort = () => rejectOnAbort(controller.signal.reason);
  if (controller.signal.aborted) {
    onAbort();
  } else {
    controller.signal.addEventListener("abort", onAbort, { once: true });
  }

  const work = run(controller.signal);
  // If the deadline wins the race, the abandoned work still settles; keep
  // that from surfacing as an unhandled rejection.
  work.catch(() => undefined);

  try {
    return await Promise.race([work, aborted]);
  } catch (error) {
    throw controller.signal.aborted ? controller.signal.reason : error;
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener("abort", onParentAbort);
    controller.signal.removeEventListener("abort", onAbort);
  }
}

function errorResponse(error: unknown, upstreamFailure: string): Response {
  if (error instanceof OGUrlValidationError) {
    return jsonError(400, "URL is not allowed");
  }
  if (error instanceof OGFetchError) {
    if (error.status >= 500 && error.status !== 502 && error.status !== 504) {
      console.error(`[once-ui] ${error.message}`);
    }
    return jsonError(error.status, error.status === 502 ? upstreamFailure : error.message);
  }
  // Network failures (refused, reset, TLS) carry a code; anything else is a bug.
  if (!(error instanceof Error && "code" in error)) {
    console.error("[once-ui] Unexpected error in Open Graph handler:", error);
  }
  return jsonError(502, upstreamFailure);
}

export async function handleOGFetch(
  request: Request,
  options: OGFetchOptions = {},
): Promise<Response> {
  const {
    timeout = 5000,
    userAgent = DEFAULT_FETCH_USER_AGENT,
    decodeEntities = true,
    maxBytes = MIB,
    cacheControl = "public, max-age=3600",
    sameOrigin = false,
  } = options;

  const handled = readTarget(request, options);
  if ("response" in handled) {
    return handled.response;
  }

  try {
    return await withDeadline(timeout, request.signal, async (signal) => {
      const { response, url } = await fetchPublicUrl(handled.target, {
        ...options,
        signal,
        headers: {
          "user-agent": userAgent,
          accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
        },
      });

      if (!response.ok) {
        await cancelBody(response);
        throw new OGFetchError(502, `Upstream responded with ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!HTML_TYPES.has(mediaType(contentType))) {
        await cancelBody(response);
        throw new OGFetchError(415, "URL is not an HTML page");
      }

      const html = decodeText(await readBody(response, maxBytes, true), charsetOf(contentType));
      const data = extractOgData(html, handled.target, url, decodeEntities);

      return Response.json(data, {
        headers: {
          "Cache-Control": cacheControl,
          ...(sameOrigin ? { Vary: "Origin" } : {}),
        },
      });
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch Open Graph data");
  }
}

export async function handleOGProxy(
  request: Request,
  options: OGProxyOptions = {},
): Promise<Response> {
  const {
    timeout = 10_000,
    userAgent = DEFAULT_PROXY_USER_AGENT,
    maxBytes = 5 * MIB,
    cacheMaxAge = 3600,
    cacheControl = `public, max-age=${cacheMaxAge}`,
    allowedContentTypes = DEFAULT_OG_IMAGE_TYPES,
    sameOrigin = false,
  } = options;

  const handled = readTarget(request, options);
  if ("response" in handled) {
    return handled.response;
  }

  try {
    return await withDeadline(timeout, request.signal, async (signal) => {
      const { response } = await fetchPublicUrl(handled.target, {
        ...options,
        signal,
        headers: {
          "user-agent": userAgent,
          accept: "image/avif,image/webp,image/png,image/*;q=0.8,*/*;q=0.1",
        },
      });

      if (!response.ok) {
        await cancelBody(response);
        const status = response.status >= 400 && response.status < 600 ? response.status : 502;
        return jsonError(status, "Failed to fetch image");
      }

      const contentType = mediaType(response.headers.get("content-type"));
      if (!isAllowedContentType(contentType, allowedContentTypes)) {
        await cancelBody(response);
        throw new OGFetchError(415, "URL is not a supported image type");
      }

      const declaredLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        await cancelBody(response);
        throw new OGFetchError(413, "Image is too large");
      }

      let body: Uint8Array<ArrayBuffer>;
      try {
        body = await readBody(response, maxBytes, false);
      } catch (error) {
        if (error instanceof OGFetchError && error.status === 502) {
          throw new OGFetchError(413, "Image is too large");
        }
        throw error;
      }

      return new Response(body, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(body.byteLength),
          "Cache-Control": cacheControl,
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          ...(sameOrigin ? { Vary: "Origin" } : {}),
        },
      });
    });
  } catch (error) {
    return errorResponse(error, "Failed to proxy image");
  }
}

export type { OGUrlValidationOptions } from "./og-url-validation";
export { OGUrlValidationError, validateOgUrl } from "./og-url-validation";

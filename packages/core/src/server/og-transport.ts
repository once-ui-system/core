import type { LookupAddress } from "node:dns";
import type { IncomingMessage } from "node:http";
import type { LookupFunction } from "node:net";
import type { Transform } from "node:stream";
import { isPublicIpAddress } from "./og-address.js";
import { OGFetchError, OGUrlValidationError } from "./og-errors.js";
import type { NodeBuiltins } from "./og-node.js";

/*
 * The OG handlers' HTTP client: Node's `http`/`https` with a `lookup` that
 * resolves and checks the hostname in one step.
 *
 * This is what closes the DNS-rebinding gap. Node connects to the address the
 * `lookup` returned, so there is no second resolution between the check and
 * the connection. `fetch` cannot do this without a custom undici dispatcher,
 * and Node does not expose undici's `Agent` without the undici package.
 *
 * - `agent: false`: never reuse a pooled socket, which may have been opened
 *   to an address this request did not check.
 * - TLS still verifies the certificate against the hostname (SNI and
 *   `servername` come from the URL, not the resolved address).
 * - The body is decompressed here (gzip, deflate, br); size limits apply to
 *   the decompressed bytes, so compression cannot be used to slip past them.
 */

/**
 * Resolves a hostname the way the connection will (`getaddrinfo`, so
 * `/etc/hosts` and search domains apply) and refuses it if any address is
 * not public. All records are checked, not just the first, so a name cannot
 * pair a public address with a private one.
 */
export async function resolvePublicAddresses(
  dns: NodeBuiltins["dns"],
  hostname: string,
): Promise<LookupAddress[]> {
  let addresses: LookupAddress[];
  try {
    addresses = await dns.promises.lookup(hostname, { all: true });
  } catch {
    throw new OGUrlValidationError("URL hostname could not be resolved");
  }

  if (addresses.length === 0) {
    throw new OGUrlValidationError("URL hostname could not be resolved");
  }

  if (addresses.some(({ address }) => !isPublicIpAddress(address))) {
    throw new OGUrlValidationError("URL resolves to a blocked address");
  }

  return addresses;
}

/**
 * A `lookup` for `http.request` that only ever hands Node public addresses.
 * Resolution and the check happen in one step, at connection time, and the
 * socket connects to exactly the address that was checked.
 */
export function createPinnedLookup(dns: NodeBuiltins["dns"]): LookupFunction {
  return (hostname, options, callback) => {
    const done = callback as (
      error: NodeJS.ErrnoException | null,
      address?: string | LookupAddress[],
      family?: number,
    ) => void;
    const settings = (typeof options === "object" && options ? options : {}) as {
      all?: boolean;
      family?: number | string;
    };

    resolvePublicAddresses(dns, hostname).then(
      (addresses) => {
        const family =
          settings.family === 4 || settings.family === "IPv4"
            ? 4
            : settings.family === 6 || settings.family === "IPv6"
              ? 6
              : 0;
        const usable = family
          ? addresses.filter((address) => address.family === family)
          : addresses;

        if (usable.length === 0) {
          const error: NodeJS.ErrnoException = new Error(`getaddrinfo ENOTFOUND ${hostname}`);
          error.code = "ENOTFOUND";
          done(error);
          return;
        }

        if (settings.all) {
          done(null, usable);
        } else {
          done(null, usable[0].address, usable[0].family);
        }
      },
      (error: NodeJS.ErrnoException) => done(error),
    );
  };
}

export interface PinnedRequestInit {
  headers: Record<string, string>;
  lookup: LookupFunction;
  signal?: AbortSignal;
}

const NULL_BODY_STATUSES = new Set([204, 205, 304]);

function toHeaders(message: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(message.headers)) {
    if (value === undefined) {
      continue;
    }
    for (const item of Array.isArray(value) ? value : [value]) {
      try {
        headers.append(name, item);
      } catch {
        // A header value fetch would reject; drop it.
      }
    }
  }
  return headers;
}

function createDecoder(builtins: NodeBuiltins, encoding: string): Transform | null {
  switch (encoding) {
    case "":
    case "identity":
      return null;
    case "gzip":
    case "x-gzip":
      return builtins.zlib.createGunzip();
    case "deflate":
      return builtins.zlib.createInflate();
    case "br":
      return builtins.zlib.createBrotliDecompress();
    default:
      throw new OGFetchError(502, "Unsupported content encoding");
  }
}

type NodeReadable = IncomingMessage | Transform;

function toWebStream(source: NodeReadable, destroy: () => void): ReadableStream<Uint8Array> {
  let settled = false;
  return new ReadableStream<Uint8Array>({
    start(controller) {
      source.on("data", (chunk: Uint8Array) => {
        if (settled) {
          return;
        }
        controller.enqueue(chunk);
        if ((controller.desiredSize ?? 1) <= 0) {
          source.pause();
        }
      });
      source.on("end", () => {
        if (!settled) {
          settled = true;
          controller.close();
        }
      });
      source.on("error", (error) => {
        if (!settled) {
          settled = true;
          controller.error(error);
        }
      });
      // Closed before "end": the connection dropped mid-body.
      source.on("close", () => {
        if (!settled) {
          settled = true;
          controller.error(new OGFetchError(502, "Upstream connection closed early"));
        }
      });
    },
    pull() {
      source.resume();
    },
    cancel() {
      settled = true;
      destroy();
    },
  });
}

function toResponse(builtins: NodeBuiltins, message: IncomingMessage): Response {
  const status = message.statusCode ?? 0;
  if (status < 200 || status > 599) {
    message.destroy();
    throw new OGFetchError(502, "Upstream returned an invalid status");
  }

  const headers = toHeaders(message);

  // Redirect and no-content responses: the caller only needs the status and
  // headers (`Location`), never the body.
  if (NULL_BODY_STATUSES.has(status) || (status >= 300 && status < 400)) {
    message.destroy();
    return new Response(null, { status, headers });
  }

  const encoding = (headers.get("content-encoding") ?? "").trim().toLowerCase();
  let decoder: Transform | null;
  try {
    decoder = createDecoder(builtins, encoding);
  } catch (error) {
    message.destroy();
    throw error;
  }

  let source: NodeReadable = message;
  if (decoder) {
    const activeDecoder = decoder;
    // `pipe` forwards data, not failure: carry errors and early closes over.
    message.on("error", (error) => activeDecoder.destroy(error));
    message.on("close", () => {
      if (!message.complete) {
        activeDecoder.destroy(new OGFetchError(502, "Upstream connection closed early"));
      }
    });
    message.pipe(activeDecoder);
    source = activeDecoder;
    headers.delete("content-encoding");
    headers.delete("content-length");
  }

  const body = toWebStream(source, () => {
    decoder?.destroy();
    message.destroy();
  });
  return new Response(body, { status, headers });
}

export function requestPinned(
  builtins: NodeBuiltins,
  url: URL,
  init: PinnedRequestInit,
): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    if (init.signal?.aborted) {
      reject(init.signal.reason);
      return;
    }

    const client = url.protocol === "https:" ? builtins.https : builtins.http;
    const hostname = url.hostname.startsWith("[") ? url.hostname.slice(1, -1) : url.hostname;

    let settled = false;
    const fail = (error: unknown) => {
      if (!settled) {
        settled = true;
        reject(init.signal?.aborted ? init.signal.reason : error);
      }
    };

    try {
      const request = client.request({
        protocol: url.protocol,
        hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: { "accept-encoding": "gzip, deflate, br", ...init.headers },
        agent: false,
        lookup: init.lookup,
        signal: init.signal,
      });

      request.on("error", fail);
      request.on("response", (message) => {
        if (settled) {
          message.destroy();
          return;
        }
        try {
          const response = toResponse(builtins, message);
          settled = true;
          resolve(response);
        } catch (error) {
          fail(error);
        }
      });
      request.end();
    } catch (error) {
      fail(error);
    }
  });
}

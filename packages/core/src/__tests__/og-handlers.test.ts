// @vitest-environment node
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The OG route handlers end to end: real `http.request`, real decompression,
 * real redirects, against a local server. Only two things are stubbed:
 *
 * - DNS (`lookup`), so `og.test` and friends resolve without a network.
 * - The address check, which counts 127.0.0.1 as public *when DNS returns
 *   it*, because the test server has to listen somewhere. IP literals and
 *   every other address go through the real checks, so a redirect to
 *   `http://127.0.0.1/` is still refused.
 */

const { lookup, records, runtime } = vi.hoisted(() => {
  const records = new Map<string, string[]>();
  const lookup = vi.fn(async (hostname: string) => {
    const addresses = records.get(hostname);
    if (!addresses) {
      throw Object.assign(new Error(`getaddrinfo ENOTFOUND ${hostname}`), { code: "ENOTFOUND" });
    }
    return addresses.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
  });
  return { lookup, records, runtime: { node: true } };
});

vi.mock("../server/og-node", async () => {
  const [http, https, zlib] = await Promise.all([
    import("node:http"),
    import("node:https"),
    import("node:zlib"),
  ]);
  return {
    loadNodeBuiltins: async () =>
      runtime.node ? { dns: { promises: { lookup } }, http, https, zlib } : null,
  };
});

vi.mock("../server/og-address", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../server/og-address")>();
  return {
    ...actual,
    isPublicIpAddress: (ip: string) => ip === "127.0.0.1" || actual.isPublicIpAddress(ip),
  };
});

import { createOgFetchRoute, createOgProxyRoute, DEFAULT_OG_IMAGE_TYPES } from "../next";
import { handleOGFetch, handleOGProxy, type OGFetchOptions, type OGProxyOptions } from "../server";
import { OGUrlValidationError } from "../server/og-errors";
import { fetchValidatedUrl } from "../server/og-url-validation";

const fetchRoute = (options: OGFetchOptions = {}) => ({
  GET: (request: Request) => handleOGFetch(request, options),
});
const proxyRoute = (options: OGProxyOptions = {}) => ({
  GET: (request: Request) => handleOGProxy(request, options),
});

const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010806000000" +
    "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082",
  "hex",
);

const PAGE = `<!doctype html>
<html><head>
  <meta charset="utf-8">
  <title>Fallback title</title>
  <meta property="og:title" content="Tom &amp; Jerry &#8212; &quot;Live&quot;">
  <meta content="A page about   cats &amp; dogs" name="description">
  <meta property='og:image' content='/img/og.png?w=1200&amp;h=630'>
  <link rel="shortcut icon" href="/favicon.ico">
</head><body><p>Hello</p></body></html>`;

let server: Server;
let origin = "";
const seen: { path: string; headers: IncomingMessage["headers"] }[] = [];

type Route = (request: IncomingMessage, response: ServerResponse) => void;

const routes: Record<string, Route> = {
  "/page": (_, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(PAGE);
  },
  "/page-gzip": (_, res) => {
    res.writeHead(200, { "content-type": "text/html", "content-encoding": "gzip" });
    res.end(gzipSync(PAGE));
  },
  "/page-br": (_, res) => {
    res.writeHead(200, { "content-type": "text/html", "content-encoding": "br" });
    res.end(brotliCompressSync(PAGE));
  },
  "/page-latin1": (_, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=iso-8859-1" });
    res.end(Buffer.from('<meta property="og:title" content="Café">', "latin1"));
  },
  "/huge-page": (_, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    res.write(PAGE.replace("</head>", "</head><!--"));
    const filler = Buffer.alloc(64 * 1024, "a");
    let sent = 0;
    const pump = () => {
      while (sent < 4 * 1024 * 1024) {
        sent += filler.length;
        if (!res.write(filler)) {
          res.once("drain", pump);
          return;
        }
      }
      res.end("-->");
    };
    pump();
  },
  "/not-html": (_, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end("{}");
  },
  "/missing": (_, res) => {
    res.writeHead(404, { "content-type": "text/html" });
    res.end("<title>Not found</title>");
  },
  "/image.png": (_, res) => {
    res.writeHead(200, { "content-type": "image/png", "content-length": PNG.length });
    res.end(PNG);
  },
  "/image.svg": (_, res) => {
    res.writeHead(200, { "content-type": "image/svg+xml" });
    res.end('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  },
  "/disguised.png": (_, res) => {
    res.writeHead(200, { "content-type": "text/html" });
    res.end("<script>alert(1)</script>");
  },
  "/untyped": (_, res) => {
    res.writeHead(200);
    res.end(PNG);
  },
  "/big.png": (_, res) => {
    res.writeHead(200, { "content-type": "image/png", "content-length": 6 * 1024 * 1024 });
    res.end(Buffer.alloc(6 * 1024 * 1024));
  },
  "/big-chunked.png": (_, res) => {
    res.writeHead(200, { "content-type": "image/png" });
    res.end(Buffer.alloc(6 * 1024 * 1024));
  },
  "/bomb.png": (_, res) => {
    // ~20 KB on the wire, 20 MiB once inflated.
    res.writeHead(200, { "content-type": "image/png", "content-encoding": "gzip" });
    res.end(gzipSync(Buffer.alloc(20 * 1024 * 1024)));
  },
  "/hang": () => {
    // Never answers.
  },
  "/slow.png": (_, res) => {
    res.writeHead(200, { "content-type": "image/png" });
    res.write(PNG.subarray(0, 8));
    // The rest never arrives.
  },
  "/loop": (_, res) => {
    res.writeHead(302, { location: "/loop" });
    res.end();
  },
  "/no-location": (_, res) => {
    res.writeHead(302);
    res.end();
  },
};

beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://og.test");
    seen.push({ path: url.pathname, headers: req.headers });
    if (url.pathname === "/redirect") {
      res.writeHead(Number(url.searchParams.get("status") ?? 302), {
        location: url.searchParams.get("to") ?? "/page",
      });
      res.end();
      return;
    }
    const route = routes[url.pathname];
    if (route) {
      route(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://og.test:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  runtime.node = true;
  seen.length = 0;
  lookup.mockClear();
  records.clear();
  records.set("og.test", ["127.0.0.1"]);
  records.set("cdn.og.test", ["127.0.0.1"]);
  records.set("private.og.test", ["10.0.0.7"]);
});

const call = (
  handler: { GET: (request: Request) => Promise<Response> },
  target: string | null,
  headers?: Record<string, string>,
) =>
  handler.GET(
    new Request(
      `https://app.example/api/og/x${target === null ? "" : `?url=${encodeURIComponent(target)}`}`,
      { headers },
    ),
  );

describe("handleOGFetch", () => {
  const route = fetchRoute({ allowHttp: true });

  it("returns the shape OgCard and useOgData read, with URLs made absolute", async () => {
    const response = await call(route, `${origin}/page`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(await response.json()).toEqual({
      url: `${origin}/page`,
      title: 'Tom & Jerry — "Live"',
      description: "A page about cats & dogs",
      image: `${origin}/img/og.png?w=1200&h=630`,
      faviconUrl: `${origin}/favicon.ico`,
    });
  });

  it("connects to the address its own lookup checked", async () => {
    await call(route, `${origin}/page`);

    // og.test exists only in the stubbed DNS, so reaching the server proves
    // the connection used the checked answer.
    expect(lookup).toHaveBeenCalledTimes(1);
    expect(lookup).toHaveBeenCalledWith("og.test", expect.objectContaining({ all: true }));
    expect(seen.map((entry) => entry.path)).toEqual(["/page"]);
    expect(seen[0].headers["user-agent"]).toBe("Mozilla/5.0 (compatible; OG-Fetcher/1.0)");
  });

  it("leaves faviconUrl out with favicon: false", async () => {
    const data = await (
      await call(fetchRoute({ allowHttp: true, favicon: false }), `${origin}/page`)
    ).json();

    expect(data).not.toHaveProperty("faviconUrl");
    expect(data.image).toBe(`${origin}/img/og.png?w=1200&h=630`);
  });

  it("decodes gzip, brotli and the declared charset", async () => {
    for (const path of ["/page-gzip", "/page-br"]) {
      const data = await (await call(route, `${origin}${path}`)).json();
      expect(data.title).toBe('Tom & Jerry — "Live"');
    }
    const latin1 = await (await call(route, `${origin}/page-latin1`)).json();
    expect(latin1.title).toBe("Café");
  });

  it("reads at most maxBytes of HTML and parses what it read", async () => {
    const response = await call(route, `${origin}/huge-page`);

    expect(response.status).toBe(200);
    expect((await response.json()).title).toBe('Tom & Jerry — "Live"');
  });

  it("refuses responses that are not HTML", async () => {
    const response = await call(route, `${origin}/not-html`);

    expect(response.status).toBe(415);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "URL is not an HTML page" });
  });

  it("reports upstream errors with a JSON error body", async () => {
    const response = await call(route, `${origin}/missing`);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Failed to fetch Open Graph data" });
  });

  it("follows redirects and reports the requested URL", async () => {
    const response = await call(route, `${origin}/redirect?to=/page&status=301`);

    expect(response.status).toBe(200);
    expect((await response.json()).url).toBe(`${origin}/redirect?to=/page&status=301`);
    expect(seen.map((entry) => entry.path)).toEqual(["/redirect", "/page"]);
  });

  it("checks every redirect target", async () => {
    for (const to of [
      "http://127.0.0.1/admin",
      "http://169.254.169.254/latest/meta-data/",
      "http://[::1]/",
      "http://2130706433/",
      "http://localhost/",
      `http://private.og.test:${new URL(origin).port}/`,
      "file:///etc/passwd",
    ]) {
      const response = await call(route, `${origin}/redirect?to=${encodeURIComponent(to)}`);
      expect(response.status, to).toBe(400);
      expect(await response.json()).toEqual({ error: "URL is not allowed" });
    }
  });

  it("stops after maxRedirects", async () => {
    const response = await call(route, `${origin}/loop`);

    expect(response.status).toBe(502);
    expect(seen).toHaveLength(4);
    expect(
      (await call(fetchRoute({ allowHttp: true, maxRedirects: 0 }), `${origin}/redirect`)).status,
    ).toBe(502);
    expect((await call(route, `${origin}/no-location`)).status).toBe(502);
  });

  it("asks isAllowed about every hop, and blockedDomains applies to redirects", async () => {
    const isAllowed = vi.fn((url: URL) => url.pathname !== "/page");
    const guarded = fetchRoute({ allowHttp: true, isAllowed });

    expect((await call(guarded, `${origin}/redirect?to=/page`)).status).toBe(400);
    expect(isAllowed.mock.calls.map(([url]) => url.pathname)).toEqual(["/redirect", "/page"]);

    const blocking = fetchRoute({ allowHttp: true, blockedDomains: ["cdn.og.test"] });
    const cdn = `http://cdn.og.test:${new URL(origin).port}/page`;
    expect((await call(blocking, `${origin}/redirect?to=${encodeURIComponent(cdn)}`)).status).toBe(
      400,
    );
  });

  it("times out", async () => {
    const started = Date.now();
    const response = await call(fetchRoute({ allowHttp: true, timeout: 150 }), `${origin}/hang`);

    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ error: "Upstream request timed out" });
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it("rejects bad input before any request is made", async () => {
    expect((await call(route, null)).status).toBe(400);
    expect((await call(route, "not a url")).status).toBe(400);
    expect((await call(fetchRoute(), `${origin}/page`)).status).toBe(400);
    expect((await call(route, "http://127.0.0.1/")).status).toBe(400);
    expect(seen).toHaveLength(0);
    expect(lookup).not.toHaveBeenCalled();
  });

  it("can refuse cross-origin callers", async () => {
    const strict = fetchRoute({ allowHttp: true, sameOrigin: true });

    expect((await call(strict, `${origin}/page`, { origin: "https://evil.example" })).status).toBe(
      403,
    );
    expect(
      (await call(strict, `${origin}/page`, { referer: "https://evil.example/x" })).status,
    ).toBe(403);
    const same = await call(strict, `${origin}/page`, { origin: "https://app.example" });
    expect(same.status).toBe(200);
    expect(same.headers.get("vary")).toBe("Origin");
    expect((await call(strict, `${origin}/page`)).status).toBe(200);
  });

  it("explains itself outside the Node.js runtime", async () => {
    runtime.node = false;
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await call(route, `${origin}/page`);

    expect(response.status).toBe(500);
    expect((await response.json()).error).toMatch(/Node\.js runtime/);
    expect(error).toHaveBeenCalled();
  });
});

describe("handleOGProxy", () => {
  const route = proxyRoute({ allowHttp: true });

  it("serves the image from the app's origin, locked down", async () => {
    const response = await call(route, `${origin}/image.png`);

    expect(response.status).toBe(200);
    expect(Buffer.from(await response.arrayBuffer())).toEqual(PNG);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("content-length")).toBe(String(PNG.length));
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain("sandbox");
    expect(seen[0].headers["user-agent"]).toBe("Mozilla/5.0 (compatible; OG-Proxy/1.0)");
  });

  it("takes cache settings", async () => {
    const daily = await call(
      proxyRoute({ allowHttp: true, cacheMaxAge: 86400 }),
      `${origin}/image.png`,
    );
    expect(daily.headers.get("cache-control")).toBe("public, max-age=86400");

    const custom = await call(
      proxyRoute({ allowHttp: true, cacheControl: "public, s-maxage=600" }),
      `${origin}/image.png`,
    );
    expect(custom.headers.get("cache-control")).toBe("public, s-maxage=600");
  });

  it("passes only allowed image types", async () => {
    for (const path of ["/image.svg", "/disguised.png", "/untyped", "/page"]) {
      const response = await call(route, `${origin}${path}`);
      expect(response.status, path).toBe(415);
    }

    const withSvg = proxyRoute({ allowHttp: true, allowedContentTypes: ["image/*"] });
    const svg = await call(withSvg, `${origin}/image.svg`);
    expect(svg.status).toBe(200);
    expect(svg.headers.get("content-type")).toBe("image/svg+xml");
    expect(svg.headers.get("content-security-policy")).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    );
  });

  it("refuses images over maxBytes, declared, streamed or compressed", async () => {
    for (const path of ["/big.png", "/big-chunked.png", "/bomb.png"]) {
      const response = await call(route, `${origin}${path}`);
      expect(response.status, path).toBe(413);
      expect(await response.json()).toEqual({ error: "Image is too large" });
    }

    const tight = proxyRoute({ allowHttp: true, maxBytes: 16 });
    expect((await call(tight, `${origin}/image.png`)).status).toBe(413);
  });

  it("forwards upstream error statuses", async () => {
    const response = await call(route, `${origin}/missing`);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Failed to fetch image" });
  });

  it("checks redirect targets", async () => {
    const response = await call(
      route,
      `${origin}/redirect?to=${encodeURIComponent("http://10.0.0.1/x.png")}`,
    );

    expect(response.status).toBe(400);
  });

  it("times out on a body that never finishes", async () => {
    const response = await call(
      proxyRoute({ allowHttp: true, timeout: 150 }),
      `${origin}/slow.png`,
    );

    expect(response.status).toBe(504);
  });
});

describe("route factories from @once-ui-system/core/next", () => {
  it("createOgFetchRoute returns a GET for app/api/og/fetch/route.ts", async () => {
    const { GET } = createOgFetchRoute({ allowHttp: true });
    const response = await GET(
      new Request(`https://app.example/api/og/fetch?url=${encodeURIComponent(`${origin}/page`)}`),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: `${origin}/page`,
      title: 'Tom & Jerry \u2014 "Live"',
      description: "A page about cats & dogs",
      image: `${origin}/img/og.png?w=1200&h=630`,
      faviconUrl: `${origin}/favicon.ico`,
    });
  });

  it("createOgProxyRoute returns a GET for app/api/og/proxy/route.ts", async () => {
    const { GET } = createOgProxyRoute({ allowHttp: true, cacheMaxAge: 86400 });
    const response = await GET(
      new Request(
        `https://app.example/api/og/proxy?url=${encodeURIComponent(`${origin}/image.png`)}`,
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toBe("public, max-age=86400");
    expect(Buffer.from(await response.arrayBuffer())).toEqual(PNG);
  });

  it("refuses private targets with the defaults", async () => {
    const fetchResponse = await call(createOgFetchRoute(), "https://169.254.169.254/");
    const proxyResponse = await call(createOgProxyRoute(), "https://[::ffff:7f00:1]/a.png");

    expect(fetchResponse.status).toBe(400);
    expect(proxyResponse.status).toBe(400);
  });

  it("reads its options once, when the route is created", async () => {
    const options: OGFetchOptions = { allowHttp: true };
    const route = createOgFetchRoute(options);
    options.allowHttp = false;

    expect((await call(route, `${origin}/page`)).status).toBe(200);
  });

  it("re-exports the default image types", () => {
    expect(DEFAULT_OG_IMAGE_TYPES).toContain("image/png");
    expect(DEFAULT_OG_IMAGE_TYPES).not.toContain("image/svg+xml");
  });
});

describe("fetchValidatedUrl", () => {
  it("follows safe redirects by hand", async () => {
    const response = await fetchValidatedUrl(
      `${origin}/redirect?to=/page`,
      {},
      { allowHttp: true },
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("og:title");
    expect(seen.map((entry) => entry.path)).toEqual(["/redirect", "/page"]);
  });

  it("refuses a redirect to a private address", async () => {
    await expect(
      fetchValidatedUrl(
        `${origin}/redirect?to=${encodeURIComponent("http://127.0.0.1/secret")}`,
        {},
        { allowHttp: true },
      ),
    ).rejects.toBeInstanceOf(OGUrlValidationError);
  });
});

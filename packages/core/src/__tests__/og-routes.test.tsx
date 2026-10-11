import { render, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OgCard } from "../components/OgCard";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { OgRoutesProvider, useOgRoutes } from "../contexts/OgRoutesProvider";
import { useOgData } from "../hooks/useFetchOg";
import { Meta } from "../modules/seo/Meta";
import { buildOgRouteUrl, DEFAULT_OG_ROUTES } from "../utils/ogRoutes";

/**
 * Where `useOgData`, `OgCard` and `Meta.generate` send their requests:
 * today's `/api/og/*` paths by default, or whatever the app configures.
 */

const PAGE = "https://example.com/post?id=1";
const IMAGE = "https://cdn.example.com/og.png";

const fetchMock = vi.fn(async (_input: string) =>
  Response.json({ url: PAGE, title: "Post", description: "About it", image: IMAGE }),
);

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const routesWrapper =
  (routes: Parameters<typeof OgRoutesProvider>[0]["routes"]) =>
  ({ children }: { children: ReactNode }) => (
    <OgRoutesProvider routes={routes}>{children}</OgRoutesProvider>
  );

describe("useOgData routes", () => {
  it("routes a cross-origin favicon through the proxy, like the image", async () => {
    const FAVICON = "https://example.com/favicon.ico";
    fetchMock.mockImplementationOnce(async () =>
      Response.json({ url: PAGE, title: "Post", image: IMAGE, faviconUrl: FAVICON }),
    );
    const { result } = renderHook(() => useOgData(PAGE));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.ogData?.faviconUrl).toBe(
      `/api/og/proxy?url=${encodeURIComponent(FAVICON)}`,
    );
  });

  it("defaults to /api/og/fetch and /api/og/proxy", async () => {
    const { result } = renderHook(() => useOgData(PAGE));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).toHaveBeenCalledWith(`/api/og/fetch?url=${encodeURIComponent(PAGE)}`);
    expect(result.current.ogData?.image).toBe(`/api/og/proxy?url=${encodeURIComponent(IMAGE)}`);
  });

  it("reads the routes from OgRoutesProvider", async () => {
    const { result } = renderHook(() => useOgData(PAGE), {
      wrapper: routesWrapper({ fetch: "/og/meta", proxy: "/og/image?v=2" }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).toHaveBeenCalledWith(`/og/meta?url=${encodeURIComponent(PAGE)}`);
    expect(result.current.ogData?.image).toBe(`/og/image?v=2&url=${encodeURIComponent(IMAGE)}`);
  });

  it("lets explicit arguments win over the provider", async () => {
    const { result } = renderHook(() => useOgData(PAGE, "/custom/fetch", "/custom/proxy"), {
      wrapper: routesWrapper({ fetch: "/og/meta", proxy: "/og/image" }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).toHaveBeenCalledWith(`/custom/fetch?url=${encodeURIComponent(PAGE)}`);
    expect(result.current.ogData?.image).toBe(`/custom/proxy?url=${encodeURIComponent(IMAGE)}`);
  });
});

describe("OgRoutesProvider", () => {
  it("fills unset routes from the provider above, then the defaults", () => {
    const { result } = renderHook(() => useOgRoutes(), {
      wrapper: ({ children }) => (
        <OgRoutesProvider routes={{ fetch: "/outer/fetch", proxy: "/outer/proxy" }}>
          <OgRoutesProvider routes={{ proxy: "/inner/proxy" }}>{children}</OgRoutesProvider>
        </OgRoutesProvider>
      ),
    });

    expect(result.current).toEqual({
      fetch: "/outer/fetch",
      proxy: "/inner/proxy",
      generate: DEFAULT_OG_ROUTES.generate,
    });
  });

  it("routes OgCard's request, unless serviceConfig names one", async () => {
    render(
      <LayoutProvider>
        <OgRoutesProvider routes={{ fetch: "/og/meta" }}>
          <OgCard url={PAGE} />
          <OgCard url={PAGE} serviceConfig={{ fetchOgUrl: "/card/fetch" }} />
        </OgRoutesProvider>
      </LayoutProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls.map(([input]) => input).sort()).toEqual([
      `/card/fetch?url=${encodeURIComponent(PAGE)}`,
      `/og/meta?url=${encodeURIComponent(PAGE)}`,
    ]);
  });
});

describe("Meta.generate ogRoutes", () => {
  const base = { title: "Hello World", description: "d", baseURL: "https://example.com" };

  it("defaults the social image to /api/og/generate", () => {
    const metadata = Meta.generate(base);

    expect(metadata.openGraph.images[0].url).toBe("/api/og/generate?title=Hello%20World");
    expect(metadata.twitter.images).toEqual(["/api/og/generate?title=Hello%20World"]);
  });

  it("uses the configured generate route", () => {
    expect(
      Meta.generate({ ...base, ogRoutes: { generate: "/og/image" } }).openGraph.images[0].url,
    ).toBe("/og/image?title=Hello%20World");
    expect(
      Meta.generate({ ...base, ogRoutes: { generate: "/og?theme=dark" } }).openGraph.images[0].url,
    ).toBe("/og?theme=dark&title=Hello%20World");
  });

  it("leaves an explicit image alone", () => {
    expect(
      Meta.generate({ ...base, image: "/cover.png", ogRoutes: { generate: "/og/image" } }).openGraph
        .images[0].url,
    ).toBe("/cover.png");
  });
});

describe("buildOgRouteUrl", () => {
  it("appends encoded parameters with ? or &", () => {
    expect(buildOgRouteUrl("/api/og/proxy", { url: "https://a.test/x y.png?q=1" })).toBe(
      "/api/og/proxy?url=https%3A%2F%2Fa.test%2Fx%20y.png%3Fq%3D1",
    );
    expect(buildOgRouteUrl("/og?v=1", { title: "A&B" })).toBe("/og?v=1&title=A%26B");
    expect(buildOgRouteUrl("/og", {})).toBe("/og");
  });
});

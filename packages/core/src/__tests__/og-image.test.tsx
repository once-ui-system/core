import { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: { element: unknown; options: Record<string, unknown> }[] = [];
vi.mock("next/og.js", () => ({
  ImageResponse: class extends Response {
    constructor(element: unknown, options: Record<string, unknown>) {
      super("png", { headers: options.headers as Record<string, string> });
      calls.push({ element, options });
    }
  },
}));

import {
  createOgImageRoute,
  defineOgSkin,
  ogImageUrl,
  ogTitleSize,
  parseOgTitle,
  readOgCard,
  renderOgCard,
} from "../next/ogImage";

const skin = defineOgSkin({
  name: "Fjell",
  domain: "fjell.example",
  brand: "emerald",
  mascot: {
    color: "brand",
    eyes: "round",
    mouth: "smile",
    accessory: <circle cx="1" cy="1" r="1" />,
  },
  imageHosts: ["img.fjell.example"],
});

beforeEach(() => {
  calls.length = 0;
});

describe("OG image cards", () => {
  it("splits *emphasis* out of a title", () => {
    expect(parseOgTitle("Packing for a *winter* trail")).toEqual([
      { text: "Packing", em: false },
      { text: "for", em: false },
      { text: "a", em: false },
      { text: "winter", em: true },
      { text: "trail", em: false },
    ]);
  });

  it("sets short titles bigger than long ones", () => {
    expect(ogTitleSize("Button", "page")).toBeGreaterThan(
      ogTitleSize("A much longer page title here", "page"),
    );
    expect(ogTitleSize("*3.0*", "hero")).toBe(168);
  });

  it("builds a card URL", () => {
    expect(ogImageUrl("/api/og/generate", { title: "Hi there", eyebrow: "Blog", v: 2 })).toBe(
      "/api/og/generate?title=Hi+there&eyebrow=Blog&v=2",
    );
  });

  it("reads a card from the query, clipped and checked", () => {
    const card = readOgCard(
      new URL(
        `https://fjell.example/api/og/generate?title=${"x".repeat(200)}&mood=evil&section=Docs`,
      ),
      skin,
    );
    expect(card.title.length).toBe(90);
    expect(card.mood).toBe("neutral");
    expect(card.eyebrow).toBe("Docs");
    expect(card.layout).toBe("page");
    expect(readOgCard(new URL("https://fjell.example/api/og/generate"), skin).title).toBe("Fjell");
  });

  it("only takes images from its own origin or the skin's hosts", () => {
    const read = (image: string) =>
      readOgCard(new URL(`https://fjell.example/og?image=${encodeURIComponent(image)}`), skin)
        .image;
    expect(read("/photos/a.jpg")).toBe("https://fjell.example/photos/a.jpg");
    expect(read("https://img.fjell.example/a.jpg")).toBe("https://img.fjell.example/a.jpg");
    expect(read("https://evil.example/a.jpg")).toBeUndefined();
    expect(read("//evil.example/a.jpg")).toBeUndefined();
    expect(read("http://img.fjell.example/a.jpg")).toBeUndefined();
    expect(readOgCard(new URL("https://fjell.example/og?image=/a.jpg"), skin).layout).toBe("photo");
  });

  it("draws the title, eyebrow, domain and mascot", async () => {
    const element = await renderOgCard(skin, {
      title: "Packing for a *winter* trail",
      eyebrow: "Journal",
    });
    expect(isValidElement(element)).toBe(true);
    const html = renderToStaticMarkup(element);
    expect(html).toContain("winter");
    expect(html).toContain("Journal");
    expect(html).toContain("fjell.example");
    expect(html).toContain("data:image/svg+xml;utf8,%3Csvg");
    // The JSX accessory is rendered into the mascot's SVG.
    expect(html).toContain(encodeURIComponent('<circle cx="1" cy="1" r="1">'));
  });

  it("resolves a mark given as a path against the request's origin", async () => {
    const html = renderToStaticMarkup(
      await renderOgCard(
        { ...skin, mark: "/og/mark.svg" },
        { title: "Hi" },
        { origin: "https://fjell.example" },
      ),
    );
    expect(html).toContain("https://fjell.example/og/mark.svg");
  });

  it("draws every layout", async () => {
    for (const layout of ["page", "hero", "photo"] as const) {
      const html = renderToStaticMarkup(
        await renderOgCard(skin, { title: "Hi", layout, image: "https://fjell.example/a.jpg" }),
      );
      expect(html).toContain("Hi");
    }
  });

  it("serves a 1200 × 630 card cached for a year", async () => {
    const { GET } = createOgImageRoute({ skin });
    const response = await GET(new Request("https://fjell.example/api/og/generate?title=Hello"));
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(calls[0].options).toMatchObject({ width: 1200, height: 630 });
  });

  it("still draws when a font can't be fetched", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("offline");
    });
    vi.stubGlobal("fetch", fetchMock);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { GET } = createOgImageRoute({
      skin: { ...skin, fonts: [{ name: "Geist", weight: 700, google: "Geist" }] },
    });
    const response = await GET(new Request("https://fjell.example/api/og/generate?title=Hello"));
    expect(response.status).toBe(200);
    expect(calls[0].options.fonts).toBeUndefined();
    warn.mockRestore();
    vi.unstubAllGlobals();
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meta } from "../modules/seo/Meta";
import { Schema, type SchemaProps } from "../modules/seo/Schema";
import { expectNoAxeViolations } from "../test/axe";

const base: SchemaProps = {
  as: "article",
  title: "Hello </script> world",
  description: "A post",
  baseURL: "https://site.com/",
  path: "blog/hello",
};

const readSchema = (container: HTMLElement) => {
  const script = container.querySelector("script[type='application/ld+json']") as HTMLElement;
  return { script, json: JSON.parse(script.innerHTML) };
};

/**
 * Schema renders one JSON-LD script for a page: the type, absolute URL and
 * image, dates and author, safe to embed whatever the title holds.
 */
describe("Schema", () => {
  it("renders article JSON-LD with an absolute URL and an OG image fallback", async () => {
    const { container } = render(<Schema {...base} datePublished="2026-01-02" />);
    const { script, json } = readSchema(container);
    expect(script.id).toBe("schema-article-blog/hello");
    expect(json).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      url: "https://site.com/blog/hello",
      headline: "Hello </script> world",
      datePublished: "2026-01-02",
      dateModified: "2026-01-02",
      image: `https://site.com/api/og/generate?title=${encodeURIComponent("Hello </script> world")}`,
    });
    // The title cannot close the script early.
    expect(script.innerHTML).not.toContain("</script>");
    await expectNoAxeViolations(container);
  });

  it("names a website or organization instead of a headline", () => {
    for (const as of ["website", "organization"] as const) {
      const { container, unmount } = render(<Schema {...base} as={as} />);
      const { json } = readSchema(container);
      expect(json.name).toBe(base.title);
      expect(json.headline).toBeUndefined();
      expect(json.datePublished).toBeUndefined();
      unmount();
    }
  });

  it("puts a relative image on baseURL and keeps an absolute one", () => {
    const { container, rerender } = render(<Schema {...base} image="img/cover.png" />);
    expect(readSchema(container).json.image).toBe("https://site.com/img/cover.png");
    rerender(<Schema {...base} image="https://cdn.example.com/cover.png" />);
    expect(readSchema(container).json.image).toBe("https://cdn.example.com/cover.png");
  });

  it("adds author and drops empty sameAs entries", () => {
    const { container } = render(
      <Schema
        {...base}
        dateModified="2026-02-01"
        datePublished="2026-01-01"
        sameAs={["https://x.com/a", ""]}
        author={{ name: "Ana", url: "https://ana.dev", image: "https://ana.dev/a.png" }}
      />,
    );
    const { json } = readSchema(container);
    expect(json.dateModified).toBe("2026-02-01");
    expect(json.sameAs).toEqual(["https://x.com/a"]);
    expect(json.author).toEqual({
      "@type": "Person",
      name: "Ana",
      url: "https://ana.dev",
      image: { "@type": "ImageObject", url: "https://ana.dev/a.png" },
    });
  });
});

/**
 * Meta.generate builds the Next metadata object: title/description, Open
 * Graph and Twitter cards sharing one image, canonical URL, robots and
 * hreflang alternates.
 */
describe("Meta.generate", () => {
  it("builds the open graph and twitter cards from the minimal props", () => {
    const meta = Meta.generate({ title: "Home", description: "Hi", baseURL: "site.com" });
    expect(meta.metadataBase.href).toBe("https://site.com/");
    expect(meta.openGraph).toMatchObject({ type: "website", url: "site.com/" });
    expect(meta.openGraph.images[0]).toEqual({ url: meta.twitter.images[0], alt: "Home" });
    expect(meta.twitter.images[0]).toContain("title=Home");
    expect(meta.robots).toBeUndefined();
    expect(meta.alternates).toBeUndefined();
  });

  it("keeps an http base URL, as in local development", () => {
    const meta = Meta.generate({ title: "T", description: "D", baseURL: "http://localhost:3000/" });
    expect(meta.metadataBase.href).toBe("http://localhost:3000/");
  });

  it("uses a given image, absolute or as a root path", () => {
    const abs = Meta.generate({
      title: "T",
      description: "D",
      baseURL: "https://site.com",
      image: "https://cdn.site.com/a.png",
    });
    expect(abs.twitter.images).toEqual(["https://cdn.site.com/a.png"]);
    const rel = Meta.generate({
      title: "T",
      description: "D",
      baseURL: "https://site.com",
      image: "a.png",
    });
    expect(rel.twitter.images).toEqual(["/a.png"]);
  });

  it("uses the app's OG route when given", () => {
    const meta = Meta.generate({
      title: "T",
      description: "D",
      baseURL: "https://site.com",
      ogRoutes: { generate: "/og" },
    });
    expect(meta.twitter.images[0].startsWith("/og?")).toBe(true);
  });

  it("adds publishedTime only to articles", () => {
    const props = { title: "T", description: "D", baseURL: "https://s.com", publishedTime: "2026" };
    expect(Meta.generate({ ...props, type: "article" }).openGraph.publishedTime).toBe("2026");
    expect(Meta.generate(props).openGraph.publishedTime).toBeUndefined();
  });

  it("writes robots from noindex/nofollow unless robots is given", () => {
    const props = { title: "T", description: "D", baseURL: "https://s.com" };
    expect(Meta.generate({ ...props, noindex: true }).robots).toBe("noindex,follow");
    expect(Meta.generate({ ...props, nofollow: true }).robots).toBe("index,nofollow");
    expect(Meta.generate({ ...props, noindex: true, robots: "all" }).robots).toBe("all");
  });

  it("uses canonical for the URL and lists alternates", () => {
    const meta = Meta.generate({
      title: "T",
      description: "D",
      baseURL: "https://s.com",
      path: "/en/a",
      canonical: "https://s.com/a",
      author: { name: "Ana" },
      alternates: [{ hrefLang: "de", href: "https://s.com/de/a" }],
    });
    expect(meta.openGraph.url).toBe("https://s.com/a");
    expect(meta.alternates).toEqual({
      canonical: "https://s.com/a",
      languages: { de: "https://s.com/de/a" },
    });
    expect(meta.authors).toEqual([{ name: "Ana", url: undefined }]);
  });
});

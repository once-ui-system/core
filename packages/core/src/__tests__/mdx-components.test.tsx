import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Line } from "../components/Line";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import {
  createMdxComponents,
  type MdxComponents,
  MdxHeading,
  mdxComponents,
} from "../modules/mdx/index";
import { expectNoAxeViolations } from "../test/axe";

/**
 * `@once-ui-system/core/mdx` (ROADMAP W9): the component map that replaces the
 * five per-app copies.
 *
 * No MDX compiler runs here. MDX compiles content to
 * `_jsx(_components.p, { children })` over `{ p: "p", …, ...props.components }`,
 * so `h()` below does exactly that: it renders a tag through the map when the
 * map has it, and as plain HTML otherwise, with the props MDX would pass.
 */

const Providers = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

const renderer =
  (components: MdxComponents) =>
  (name: string, props: Record<string, unknown> | null, ...children: ReactNode[]) =>
    createElement(components[name] ?? name, props, ...children);

const h = renderer(mdxComponents);

/** What MDX produces for a short article. */
const article = () => (
  <main>
    {h("h1", null, "Getting started & deploy")}
    {h(
      "p",
      null,
      "Read the ",
      h("a", { href: "/docs" }, "docs"),
      ", the ",
      h("a", { href: "https://example.com" }, "spec"),
      " and ",
      h("code", null, "npm i"),
      ".",
    )}
    {h("p", null, h("img", { src: "/diagram.png", alt: "A diagram", title: "Flow" }))}
    {h("h2", null, "Why ", h("code", null, "overflow"))}
    {h("ul", null, "\n", h("li", null, "One"), "\n", h("li", null, "Two"), "\n")}
    {h("ol", { start: 3 }, "\n", h("li", null, "Three"), "\n")}
    {h("blockquote", null, "\n", h("p", null, "Ship small."), "\n")}
    {h("pre", null, h("code", { className: "language-ts" }, "const answer = 42;\n"))}
    {h("hr", null)}
    {h(
      "table",
      null,
      h("thead", null, h("tr", null, h("th", { style: { textAlign: "center" } }, "Name"))),
      h("tbody", null, h("tr", null, h("td", null, "Once"))),
    )}
    {h("Feedback", { title: "Heads up", description: "Tags work by name." })}
  </main>
);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mdxComponents", () => {
  it("gives headings a slug id and a link to themselves", () => {
    render(article(), { wrapper: Providers });

    const title = screen.getByRole("heading", { level: 1, name: "Getting started & deploy" });
    expect(title).toHaveAttribute("id", "getting-started-and-deploy");
    const anchor = screen.getByRole("link", {
      name: "Copy link to Getting started & deploy",
    });
    expect(anchor).toHaveAttribute("href", "#getting-started-and-deploy");

    // A heading with inline markup slugs its text, not "[object Object]".
    expect(screen.getByRole("heading", { level: 2, name: "Why overflow" })).toHaveAttribute(
      "id",
      "why-overflow",
    );
  });

  it("copies the section URL when the anchor is activated", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(article(), { wrapper: Providers });

    fireEvent.click(screen.getByRole("link", { name: "Copy link to Why overflow" }));

    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}${window.location.pathname}#why-overflow`,
    );
    expect(await screen.findByText("Link copied to clipboard.")).toBeInTheDocument();
  });

  it("renders links through SmartLink: internal in place, external in a new tab", () => {
    render(article(), { wrapper: Providers });

    const internal = screen.getByRole("link", { name: "docs" });
    expect(internal).toHaveAttribute("href", "/docs");
    expect(internal).not.toHaveAttribute("target");

    const external = screen.getByRole("link", { name: "spec" });
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noreferrer");
  });

  it("keeps body text in <p> and never nests a block inside one", () => {
    const { container } = render(article(), { wrapper: Providers });

    const paragraph = screen.getByText(/Read the/);
    expect(paragraph.tagName).toBe("P");
    expect(within(paragraph).getByText("npm i")).toBeInTheDocument();

    // `![A diagram](/diagram.png)` on its own line: the image, unwrapped.
    const image = screen.getByRole("img", { name: "A diagram" });
    expect(image).toHaveAttribute("src", "/diagram.png");
    expect(image.closest("p")).toBeNull();

    // Checked on the DOM rather than through React's warning, which fires
    // once per tag pair per process and so depends on test order.
    const blockInParagraph = "p :is(div, p, ul, ol, table, blockquote, figure, pre, hr)";
    expect(container.querySelector(blockInParagraph)).toBeNull();
  });

  it("renders text around an inline image as a <div>, not a <p>", () => {
    const { container } = render(
      h("p", null, "Before ", h("img", { src: "/inline.png", alt: "Inline" }), " after"),
      { wrapper: Providers },
    );
    expect(container.querySelector("p")).toBeNull();
    expect(screen.getByText(/Before/).tagName).toBe("DIV");
  });

  it("renders lists, quotes, rules and tables through Once UI", () => {
    render(article(), { wrapper: Providers });

    const [bullets, numbered] = screen.getAllByRole("list");
    expect(bullets.tagName).toBe("UL");
    expect(within(bullets).getAllByRole("listitem")).toHaveLength(2);
    expect(numbered.tagName).toBe("OL");
    expect(numbered).toHaveAttribute("start", "3");

    const quote = screen.getByText("Ship small.");
    expect(quote.closest("blockquote")).not.toBeNull();
    // BlockQuote sets its content in a span, which cannot hold a <p>.
    expect(quote.closest("p")).toBeNull();
    expect(screen.getByRole("separator")).toBeInTheDocument();

    const table = screen.getByRole("table");
    const header = within(table).getByRole("columnheader", { name: "Name" });
    expect(header.className).toMatch(/AlignCenter/);
    expect(within(table).getByRole("cell", { name: "Once" })).toBeInTheDocument();
  });

  it("renders fenced code through CodeBlock with its language", async () => {
    render(article(), { wrapper: Providers });

    expect(await screen.findByText("const answer = 42;")).toBeInTheDocument();
    expect(screen.getByText("Ts")).toBeInTheDocument();
  });

  it("registers the common Once UI components as tags", () => {
    render(article(), { wrapper: Providers });
    expect(screen.getByText("Tags work by name.")).toBeInTheDocument();

    for (const tag of ["Accordion", "Button", "Card", "CodeBlock", "Media", "OgCard", "Table"]) {
      expect(mdxComponents[tag]).toBeDefined();
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(article(), { wrapper: Providers });
    await screen.findByText("const answer = 42;");
    await expectNoAxeViolations(container);
  });
});

describe("createMdxComponents", () => {
  it("replaces elements, adds tags and keeps the rest", () => {
    const Callout = ({ children }: { children?: ReactNode }) => <aside>{children}</aside>;
    const components = createMdxComponents({
      hr: () => <Line data-testid="custom-rule" />,
      Callout,
    });
    const hc = renderer(components);

    render(
      <>
        {hc("hr", null)}
        {hc("Callout", null, "Custom")}
        {hc("h2", null, "Kept")}
      </>,
      { wrapper: Providers },
    );

    expect(screen.getByTestId("custom-rule")).toBeInTheDocument();
    expect(screen.getByText("Custom").tagName).toBe("ASIDE");
    expect(screen.getByRole("heading", { level: 2, name: "Kept" })).toHaveAttribute("id", "kept");
    expect(mdxComponents.Callout).toBeUndefined();
  });

  it("skips undefined entries instead of writing them", () => {
    const components = createMdxComponents({ hr: undefined });
    expect(components.hr).toBe(mdxComponents.hr);
  });

  it("maps a tag back to plain HTML", () => {
    const { container } = render(renderer(createMdxComponents({ hr: "hr" }))("hr", null));
    expect(container.querySelector("hr")).not.toBeNull();
  });

  it("types element overrides against the props MDX passes", () => {
    createMdxComponents({
      // Contextually typed: `props` is what MDX passes for an <h2>.
      h2: (props) => <MdxHeading as="h2" marginTop="64" {...props} />,
      // @ts-expect-error Markdown never passes `level`, so this could never render.
      h3: ({ level }: { level: number }) => <span>{level}</span>,
    });
  });
});

describe("element spacing", () => {
  it("replaces the default margins when any margin is set", () => {
    const { container } = render(
      <>
        <MdxHeading as="h2">Default</MdxHeading>
        <MdxHeading as="h2" marginY="64">
          Custom
        </MdxHeading>
      </>,
      { wrapper: Providers },
    );
    const [defaults, custom] = Array.from(container.querySelectorAll("h2")).map(
      (heading) => heading.parentElement?.className ?? "",
    );
    expect(defaults).toMatch(/\bmt-24\b/);
    expect(custom).toMatch(/\bmy-64\b/);
    expect(custom).not.toMatch(/\bmt-24\b/);
  });
});

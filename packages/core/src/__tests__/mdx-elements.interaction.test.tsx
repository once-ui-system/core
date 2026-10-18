import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import { mdxComponents } from "../modules/mdx/mdxComponents";
import {
  MdxHeading,
  MdxImage,
  MdxLink,
  MdxList,
  MdxParagraph,
  MdxTable,
} from "../modules/mdx/MdxElements";
import { expectNoAxeViolations } from "../test/axe";

const Providers = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

const h = (name: string, props: Record<string, unknown> | null, ...children: ReactNode[]) =>
  createElement(mdxComponents[name] ?? name, props, ...children);

/**
 * The MDX elements a keyboard and screen-reader user meets in an article:
 * heading anchors reachable by Tab and activated by Enter, images that enlarge
 * and close with Escape, and tables, lists and links that keep their meaning.
 * (Rendering and nesting rules are covered in mdx-components.test.tsx.)
 */
describe("MDX elements interaction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reaches a heading's anchor with Tab and copies its URL with Enter", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<MdxHeading as="h2">Install the kit</MdxHeading>, { wrapper: Providers });

    await user.tab();
    const anchor = screen.getByRole("link", { name: "Copy link to Install the kit" });
    expect(anchor).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/#install-the-kit$/));
  });

  it("keeps an id MDX passes and draws no anchor for an empty heading", () => {
    const { rerender } = render(
      <MdxHeading as="h3" id="custom">
        Title
      </MdxHeading>,
      { wrapper: Providers },
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveAttribute("id", "custom");
    expect(screen.getByRole("link")).toHaveAttribute("href", "#custom");
    rerender(<MdxHeading as="h3">{"!!!"}</MdxHeading>);
    expect(screen.getByRole("heading", { level: 3 })).not.toHaveAttribute("id");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("enlarges an article image on click and closes it with Escape", async () => {
    const user = userEvent.setup();
    const { container } = render(<MdxImage src="/flow.png" alt="Request flow" />, {
      wrapper: Providers,
    });
    const overlay = () => container.querySelector(".position-fixed");
    await user.click(screen.getByRole("img", { name: "Request flow" }));
    expect(overlay()).not.toBeNull();
    await user.keyboard("{Escape}");
    expect(overlay()).toBeNull();
  });

  it("renders nothing for an image without a source", () => {
    const { container } = render(<MdxImage alt="Missing" />, { wrapper: Providers });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a link without href as its text", () => {
    render(<MdxLink>plain</MdxLink>, { wrapper: Providers });
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("plain")).toBeInTheDocument();
  });

  it("keeps an ordered list's start and reversed", () => {
    const { container } = render(
      <MdxList as="ol" start={5} reversed>
        <li>Five</li>
      </MdxList>,
      { wrapper: Providers },
    );
    const list = container.querySelector("ol") as HTMLOListElement;
    expect(list.start).toBe(5);
    expect(list.reversed).toBe(true);
    expect(screen.getByRole("list")).toBe(list);
  });

  it("turns a GFM table into a table with headers and every body row", async () => {
    const { container } = render(
      <MdxTable>
        {h(
          "thead",
          null,
          h("tr", null, h("th", { align: "right" }, "Name"), h("th", null, "Size")),
        )}
        {h(
          "tbody",
          null,
          h("tr", null, h("td", null, "Once"), h("td", null, "S")),
          h("tr", null, h("td", null, "UI"), h("td", null, "M")),
        )}
      </MdxTable>,
      { wrapper: Providers },
    );
    expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "Name",
      "Size",
    ]);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("cell", { name: "UI" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("renders a paragraph of text as a <p> with its id", () => {
    const { container } = render(<MdxParagraph id="intro">Hello</MdxParagraph>, {
      wrapper: Providers,
    });
    expect(container.querySelector("p#intro")).toHaveTextContent("Hello");
  });

  it("renders a whole article without axe violations", async () => {
    const { container } = render(
      <main>
        {h("h1", null, "Guide")}
        {h("p", null, "See ", h("a", { href: "/docs" }, "the docs"), ".")}
        {h("h2", null, "Steps")}
        {h("ol", null, h("li", null, "One"), h("li", null, "Two"))}
        {h("blockquote", null, h("p", null, "Ship small."))}
        {h("hr", null)}
      </main>,
      { wrapper: Providers },
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});

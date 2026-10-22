import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Markdown, parseInline, parseMarkdown } from "../src/components/Markdown";
import { ThemeProvider } from "../src/theme";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

describe("parseMarkdown", () => {
  it("reads headings, paragraphs, rules and fenced code", () => {
    const blocks = parseMarkdown(
      "# Title\n\nFirst line\nsame paragraph.\n\n---\n\n```ts\nconst a = 1;\n```\n\nSetext\n======",
    );
    expect(blocks.map((b) => b.type)).toEqual(["heading", "paragraph", "hr", "code", "heading"]);
    expect(blocks[1]).toEqual({
      type: "paragraph",
      children: [{ type: "text", text: "First line same paragraph." }],
    });
    expect(blocks[3]).toEqual({ type: "code", language: "ts", code: "const a = 1;" });
    expect(blocks[4]).toMatchObject({ type: "heading", level: 1 });
  });

  it("nests lists, keeps an ordered list's start, and reads quotes", () => {
    const [list, ordered, quote] = parseMarkdown(
      "- one\n- two\n  - inner\n\n3. three\n4. four\n\n> quoted\n> text",
    );
    expect(list).toMatchObject({ type: "list", ordered: false });
    if (list.type !== "list") throw new Error("not a list");
    expect(list.items).toHaveLength(2);
    expect(list.items[1].map((b) => b.type)).toEqual(["paragraph", "list"]);
    expect(ordered).toMatchObject({ type: "list", ordered: true, start: 3 });
    expect(quote).toMatchObject({
      type: "quote",
      children: [{ type: "paragraph", children: [{ type: "text", text: "quoted text" }] }],
    });
  });

  it("reads a GFM table with alignment and an image on its own line", () => {
    const [table, image] = parseMarkdown(
      "| Name | Visits |\n| :--- | ---: |\n| Anna | 12 |\n\n![A cat](https://x.dev/cat.png)",
    );
    expect(table).toMatchObject({ type: "table", align: ["left", "right"] });
    expect(image).toEqual({ type: "image", alt: "A cat", src: "https://x.dev/cat.png" });
  });
});

describe("parseInline", () => {
  it("reads emphasis, code, strikethrough and links", () => {
    expect(parseInline("**bold** and *it* and `x` and ~~gone~~")).toEqual([
      { type: "strong", children: [{ type: "text", text: "bold" }] },
      { type: "text", text: " and " },
      { type: "em", children: [{ type: "text", text: "it" }] },
      { type: "text", text: " and " },
      { type: "code", text: "x" },
      { type: "text", text: " and " },
      { type: "del", children: [{ type: "text", text: "gone" }] },
    ]);
    expect(parseInline('[docs](https://once-ui.com "Once UI")')).toEqual([
      { type: "link", href: "https://once-ui.com", children: [{ type: "text", text: "docs" }] },
    ]);
  });

  it("leaves snake_case, lone stars and escapes as text", () => {
    expect(parseInline("snake_case_name")).toEqual([{ type: "text", text: "snake_case_name" }]);
    expect(parseInline("2 * 3 = 6")).toEqual([{ type: "text", text: "2 * 3 = 6" }]);
    expect(parseInline("\\*not em\\*")).toEqual([{ type: "text", text: "*not em*" }]);
  });

  it("links bare URLs", () => {
    expect(parseInline("see https://once-ui.com.")).toEqual([
      { type: "text", text: "see " },
      {
        type: "link",
        href: "https://once-ui.com",
        children: [{ type: "text", text: "https://once-ui.com" }],
      },
      { type: "text", text: "." },
    ]);
  });
});

describe("Markdown", () => {
  it("renders a post body with headings, lists and links", async () => {
    const onLinkPress = jest.fn();
    await wrap(
      <Markdown onLinkPress={onLinkPress}>
        {
          "## Launch notes\n\nRead the **docs** at [Once UI](https://once-ui.com).\n\n- Fast\n- Native"
        }
      </Markdown>,
    );
    expect(screen.getByRole("header", { name: "Launch notes" })).toBeTruthy();
    expect(screen.getByText("Fast")).toBeTruthy();
    expect(screen.getByText("Native")).toBeTruthy();
    await fireEvent.press(screen.getByRole("link", { name: "Once UI" }));
    expect(onLinkPress).toHaveBeenCalledWith("https://once-ui.com");
  });

  it("renders fenced code through CodeBlock and a table through Table", async () => {
    await wrap(
      <Markdown>
        {"```bash\npnpm add @once-ui-system/native\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |"}
      </Markdown>,
    );
    expect(screen.getByText("pnpm add @once-ui-system/native", { exact: false })).toBeTruthy();
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });
});

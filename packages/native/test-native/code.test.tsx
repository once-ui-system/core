import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { CodeBlock, parseHighlight } from "../src/components/CodeBlock";
import { tokenize, tokenizeLines } from "../src/components/codeTokens";
import { InlineCode } from "../src/components/InlineCode";
import { Kbd } from "../src/components/Kbd";
import { ThemeProvider } from "../src/theme";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

const types = (code: string, language: string) =>
  tokenize(code, language)
    .filter((t) => t.type !== "plain")
    .map((t) => `${t.type}:${t.text}`);

describe("code tokenizer", () => {
  it("finds keywords, strings, comments and numbers in TypeScript", () => {
    const found = types('const n: number = 42; // the answer\nlet s = "hi";', "ts");
    expect(found).toContain("keyword:const");
    expect(found).toContain("number:42");
    expect(found).toContain("comment:// the answer");
    expect(found).toContain('string:"hi"');
  });

  it("leaves keywords and numbers inside identifiers alone", () => {
    const found = types("const constant1 = format(x);", "js");
    expect(found).toContain("keyword:const");
    expect(found).not.toContain("number:1");
    expect(found).toContain("function:format");
  });

  it("colours JSX tags, JSON keys, CSS properties and bash variables", () => {
    expect(types("<Row gap='8' />", "tsx")).toContain("tag:<Row");
    expect(types('{ "name": "once", "n": 1, "ok": true }', "json")).toEqual(
      expect.arrayContaining(['property:"name"', 'string:"once"', "number:1", "boolean:true"]),
    );
    const css = types("a:hover { color: #fff; margin: 4px; }", "css");
    expect(css).toEqual(expect.arrayContaining(["property:color", "number:#fff", "number:4px"]));
    expect(css).not.toContain("property:a");
    const bash = types('# install\nexport NAME="x" && echo $NAME a#b', "sh");
    expect(bash).toEqual(
      expect.arrayContaining(["comment:# install", "keyword:export", "variable:$NAME"]),
    );
    expect(bash.some((t) => t.startsWith("comment:#b"))).toBe(false);
  });

  it("splits a block comment across lines and leaves unknown languages plain", () => {
    const lines = tokenizeLines("/* a\nb */ x", "js");
    expect(lines).toHaveLength(2);
    expect(lines[1][0]).toEqual({ type: "comment", text: "b */" });
    expect(tokenize("SELECT 1", "sql")).toEqual([{ type: "plain", text: "SELECT 1" }]);
  });

  it("parses highlight ranges", () => {
    expect([...parseHighlight("1, 3-5")]).toEqual([1, 3, 4, 5]);
    expect(parseHighlight(undefined).size).toBe(0);
  });
});

describe("CodeBlock", () => {
  const codes = [
    { code: "const a = 1;", language: "tsx", label: "App.tsx" },
    { code: ".a { color: red; }", language: "css", label: "styles.css" },
  ];

  it("shows the single snippet's label and its code", async () => {
    await wrap(<CodeBlock codes={[codes[0]]} />);
    expect(screen.getByText("App.tsx")).toBeTruthy();
    expect(screen.getByText("const")).toBeTruthy();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("switches snippets with tabs and reports the index", async () => {
    const onInstanceChange = jest.fn();
    await wrap(<CodeBlock codes={codes} onInstanceChange={onInstanceChange} />);
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "App.tsx", selected: true })).toBeTruthy();
    await fireEvent.press(screen.getByRole("tab", { name: "styles.css" }));
    expect(onInstanceChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole("tab", { name: "styles.css", selected: true })).toBeTruthy();
    expect(screen.getByText("color")).toBeTruthy();
    expect(screen.queryByText("const")).toBeNull();
  });

  it("copies through onCopy and shows it was copied", async () => {
    jest.useFakeTimers();
    const onCopy = jest.fn();
    await wrap(<CodeBlock codes={[codes[0]]} onCopy={onCopy} />);
    await fireEvent.press(screen.getByRole("button", { name: "Copy code" }));
    expect(onCopy).toHaveBeenCalledWith("const a = 1;");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("button", { name: "Copy code" })).toBeTruthy();
    jest.useRealTimers();
  });

  it("falls back to React Native's Clipboard without onCopy", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { Clipboard } = require("react-native") as {
      Clipboard: { setString: jest.Mock };
    };
    await wrap(<CodeBlock codes={[codes[0]]} />);
    await fireEvent.press(screen.getByRole("button", { name: "Copy code" }));
    expect(Clipboard.setString).toHaveBeenCalledWith("const a = 1;");
    warn.mockRestore();
  });

  it("numbers lines from startLineNumber and marks highlighted ones", async () => {
    await wrap(
      <CodeBlock
        lineNumbers
        codes={[
          {
            code: "one\ntwo\nthree",
            language: "text",
            label: "notes",
            startLineNumber: 10,
            highlight: "11",
          },
        ]}
      />,
    );
    expect(screen.getByText("10", { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText("12", { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getAllByTestId("code-line-highlighted")).toHaveLength(1);
  });

  it("collapses to maxLines until View code is pressed", async () => {
    const code = ["l1", "l2", "l3", "l4"].join("\n");
    await wrap(
      <CodeBlock isCollapsible maxLines={2} codes={[{ code, language: "text", label: "x" }]} />,
    );
    expect(screen.queryByText("l3")).toBeNull();
    await fireEvent.press(screen.getByText("View code"));
    expect(screen.getByText("l4")).toBeTruthy();
  });

  it("drops the header when compact, keeping a floating copy button", async () => {
    await wrap(<CodeBlock compact codes={[codes[0]]} onCopy={() => {}} />);
    expect(screen.queryByText("App.tsx")).toBeNull();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeTruthy();
  });

  it("renders a preview and hides the code with hideCode", async () => {
    await wrap(<CodeBlock hideCode reloadButton preview={<Text>Live</Text>} codes={[codes[0]]} />);
    expect(screen.getByText("Live")).toBeTruthy();
    expect(screen.queryByText("const")).toBeNull();
    await fireEvent.press(screen.getByRole("button", { name: "Reload" }));
    expect(screen.getByText("Live")).toBeTruthy();
  });

  it("tints added and deleted lines of a diff", async () => {
    await wrap(
      <CodeBlock
        codes={[{ code: "@@ -1 +1 @@\n-let a\n+const a", language: ["diff", "ts"], label: "d" }]}
      />,
    );
    expect(screen.getByText("@@ -1 +1 @@")).toBeTruthy();
    expect(screen.getByText("+")).toBeTruthy();
    expect(screen.getByText("const")).toBeTruthy();
  });
});

describe("InlineCode and Kbd", () => {
  it("renders InlineCode in the code font inside a sentence", async () => {
    await wrap(
      <Text>
        Run <InlineCode>pnpm dev</InlineCode> to start.
      </Text>,
    );
    const code = screen.getByText("pnpm dev");
    const style = Object.assign({}, ...[code.props.style].flat(Number.POSITIVE_INFINITY));
    expect(style.fontFamily).toBeTruthy();
    expect(style.borderWidth).toBe(1);
  });

  it("renders Kbd from label or children", async () => {
    await wrap(
      <>
        <Kbd label="⌘" />
        <Kbd>K</Kbd>
      </>,
    );
    expect(screen.getByText("⌘")).toBeTruthy();
    expect(screen.getByText("K")).toBeTruthy();
  });
});

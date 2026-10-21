import { Fragment, forwardRef, type ReactNode, useMemo } from "react";
import { Linking, type TextStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TextVariant } from "../types";
import { CodeBlock } from "./CodeBlock";
import { Column, type FlexProps } from "./Flex";
import { InlineCode } from "./InlineCode";
import { Line } from "./Line";
import { List, ListItem } from "./List";
import { Media } from "./Media";
import type { RefComponent, ViewRef } from "./refs";
import { Table } from "./Table";
import { Text } from "./Text";

// ─── Syntax tree ─────────────────────────────────────────────────────────────

export type MarkdownInline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong" | "em" | "del"; children: MarkdownInline[] }
  | { type: "link"; href: string; children: MarkdownInline[] }
  | { type: "image"; src: string; alt: string }
  | { type: "break" };

export type MarkdownAlign = "left" | "center" | "right" | undefined;

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: MarkdownInline[] }
  | { type: "paragraph"; children: MarkdownInline[] }
  | { type: "image"; src: string; alt: string }
  | { type: "code"; language: string; code: string }
  | { type: "quote"; children: MarkdownBlock[] }
  | { type: "list"; ordered: boolean; start: number; items: MarkdownBlock[][] }
  | {
      type: "table";
      align: MarkdownAlign[];
      headers: MarkdownInline[][];
      rows: MarkdownInline[][][];
    }
  | { type: "hr" };

// ─── Inline parsing ──────────────────────────────────────────────────────────

const ESCAPABLE = /[\\`*_{}[\]()#+\-.!~|<>]/;

/** `[label](href "title")` starting at `at`, or null. */
function matchLink(text: string, at: number) {
  if (text[at] !== "[") return null;
  let depth = 0;
  let close = -1;
  for (let j = at; j < text.length; j += 1) {
    if (text[j] === "\\") j += 1;
    else if (text[j] === "[") depth += 1;
    else if (text[j] === "]" && --depth === 0) {
      close = j;
      break;
    }
  }
  if (close === -1 || text[close + 1] !== "(") return null;
  let parens = 0;
  let end = -1;
  for (let j = close + 1; j < text.length; j += 1) {
    if (text[j] === "\\") j += 1;
    else if (text[j] === "(") parens += 1;
    else if (text[j] === ")" && --parens === 0) {
      end = j;
      break;
    }
  }
  if (end === -1) return null;
  const target = text.slice(close + 2, end).trim();
  const href = target
    .replace(/\s+(["'(]).*\1?\)?$/, "")
    .replace(/\s+"[^"]*"$/, "")
    .replace(/^<(.*)>$/, "$1");
  return { label: text.slice(at + 1, close), href, end: end + 1 };
}

const runAt = (text: string, at: number, char: string) => {
  let j = at;
  while (text[j] === char) j += 1;
  return j - at;
};

/** Where an emphasis run of `length` × `char` opened before `from` closes, or -1. */
function findClose(text: string, from: number, char: string, length: number) {
  let j = from;
  while (j < text.length) {
    if (text[j] === "\\") {
      j += 2;
      continue;
    }
    if (text[j] === "`") {
      const ticks = runAt(text, j, "`");
      const end = text.indexOf("`".repeat(ticks), j + ticks);
      j = end === -1 ? j + ticks : end + ticks;
      continue;
    }
    if (text[j] === char) {
      const run = runAt(text, j, char);
      const before = text[j - 1] ?? "";
      const after = text[j + run] ?? "";
      const closes =
        run === length &&
        j > from &&
        !/\s/.test(before) &&
        // `snake_case_words` are not emphasis.
        !(char === "_" && /[\p{L}\p{N}]/u.test(after));
      if (closes) return j;
      j += run;
      continue;
    }
    j += 1;
  }
  return -1;
}

const BARE_URL = /^https?:\/\/[^\s<]*[^\s<.,:;"')\]!?*_~]/;

/** Inline Markdown: code, emphasis, strikethrough, links, images and hard breaks. */
export function parseInline(text: string): MarkdownInline[] {
  const out: MarkdownInline[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) out.push({ type: "text", text: buffer });
    buffer = "";
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const rest = text.slice(i);

    if (c === "\\" && text[i + 1] === "\n") {
      flush();
      out.push({ type: "break" });
      i += 2;
      continue;
    }
    if (c === "\\" && i + 1 < text.length && ESCAPABLE.test(text[i + 1])) {
      buffer += text[i + 1];
      i += 2;
      continue;
    }
    if (c === "\n") {
      flush();
      out.push({ type: "break" });
      i += 1;
      continue;
    }
    if (c === "`") {
      const ticks = runAt(text, i, "`");
      const end = text.indexOf("`".repeat(ticks), i + ticks);
      if (end !== -1) {
        flush();
        const code = text.slice(i + ticks, end);
        out.push({ type: "code", text: /^ .* $/.test(code) ? code.slice(1, -1) : code });
        i = end + ticks;
        continue;
      }
      buffer += "`".repeat(ticks);
      i += ticks;
      continue;
    }
    if (c === "!" && text[i + 1] === "[") {
      const link = matchLink(text, i + 1);
      if (link) {
        flush();
        out.push({ type: "image", src: link.href, alt: link.label });
        i = link.end;
        continue;
      }
    }
    if (c === "[") {
      const link = matchLink(text, i);
      if (link) {
        flush();
        out.push({ type: "link", href: link.href, children: parseInline(link.label) });
        i = link.end;
        continue;
      }
    }
    if (c === "<") {
      const auto = /^<((?:https?:\/\/|mailto:)[^\s>]+)>/.exec(rest);
      if (auto) {
        flush();
        out.push({
          type: "link",
          href: auto[1],
          children: [{ type: "text", text: auto[1].replace(/^mailto:/, "") }],
        });
        i += auto[0].length;
        continue;
      }
    }
    if (c === "h" && !/[\p{L}\p{N}]/u.test(text[i - 1] ?? "")) {
      const url = BARE_URL.exec(rest);
      if (url) {
        flush();
        out.push({ type: "link", href: url[0], children: [{ type: "text", text: url[0] }] });
        i += url[0].length;
        continue;
      }
    }
    if (c === "*" || c === "_" || (c === "~" && text[i + 1] === "~")) {
      const run = runAt(text, i, c);
      const length = c === "~" ? 2 : Math.min(run, 3);
      const after = text[i + length] ?? "";
      const opens =
        run === length &&
        after !== "" &&
        !/\s/.test(after) &&
        !(c === "_" && /[\p{L}\p{N}]/u.test(text[i - 1] ?? ""));
      const close = opens ? findClose(text, i + length, c, length) : -1;
      if (close !== -1) {
        flush();
        const inner = parseInline(text.slice(i + length, close));
        out.push(
          c === "~"
            ? { type: "del", children: inner }
            : length === 3
              ? { type: "strong", children: [{ type: "em", children: inner }] }
              : { type: length === 2 ? "strong" : "em", children: inner },
        );
        i = close + length;
        continue;
      }
      buffer += c.repeat(run);
      i += run;
      continue;
    }
    buffer += c;
    i += 1;
  }
  flush();
  return out;
}

// ─── Block parsing ───────────────────────────────────────────────────────────

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^`\s]*)/;
const HEADING = /^ {0,3}(#{1,6})(?:\s+(.*?))?(?:\s+#+)?\s*$/;
const RULE = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE = /^ {0,3}> ?/;
const LIST_ITEM = /^( *)([-*+]|\d{1,9}[.)])(?:\s+(.*))?$/;
const TABLE_DIVIDER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const IMAGE_ONLY = /^!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?(?:\s+"[^"]*")?\s*\)$/;

const indentOf = (line: string) => /^ */.exec(line)?.[0].length ?? 0;

/** A line that ends the paragraph above it. */
const startsBlock = (line: string) =>
  FENCE.test(line) ||
  HEADING.test(line) ||
  RULE.test(line) ||
  QUOTE.test(line) ||
  (LIST_ITEM.test(line) && !!LIST_ITEM.exec(line)?.[3]);

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));

/**
 * Markdown blocks, as GitHub writes them: ATX and setext headings, paragraphs,
 * fenced code, block quotes, nested lists, GFM tables, rules and images.
 */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const marker = fence[1];
      const indent = indentOf(line);
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(marker)) {
        code.push(lines[i].slice(Math.min(indent, indentOf(lines[i]))));
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", language: fence[2] || "plaintext", code: code.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInline(heading[2] ?? ""),
      });
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        // A line without `>` continues the quote's paragraph, as in CommonMark.
        if (!QUOTE.test(lines[i]) && startsBlock(lines[i])) break;
        quoted.push(lines[i].replace(QUOTE, ""));
        i += 1;
      }
      blocks.push({ type: "quote", children: parseMarkdown(quoted.join("\n")) });
      continue;
    }

    const first = LIST_ITEM.exec(line);
    if (first) {
      const indent = first[1].length;
      const ordered = /\d/.test(first[2]);
      const contentIndent = indent + first[2].length + 1;
      const items: string[][] = [];
      let blank = false;
      while (i < lines.length) {
        const current = lines[i];
        const item = LIST_ITEM.exec(current);
        if (item && item[1].length < contentIndent && item[1].length >= indent - 1) {
          if (/\d/.test(item[2]) !== ordered) break;
          items.push([item[3] ?? ""]);
          blank = false;
        } else if (!current.trim()) {
          blank = true;
          items[items.length - 1].push("");
        } else if (indentOf(current) >= contentIndent - 1) {
          items[items.length - 1].push(current.slice(Math.min(indentOf(current), contentIndent)));
          blank = false;
        } else if (!blank && !startsBlock(current)) {
          // A lazy line: it carries on the item's paragraph.
          items[items.length - 1].push(current.trim());
        } else {
          break;
        }
        i += 1;
      }
      blocks.push({
        type: "list",
        ordered,
        start: ordered ? Number.parseInt(first[2], 10) : 1,
        items: items.map((item) => parseMarkdown(item.join("\n"))),
      });
      continue;
    }

    if (
      line.includes("|") &&
      TABLE_DIVIDER.test(lines[i + 1] ?? "") &&
      lines[i + 1].includes("-")
    ) {
      const headers = cells(line);
      const align = cells(lines[i + 1]).map((cell): MarkdownAlign => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        return left && right ? "center" : right ? "right" : left ? "left" : undefined;
      });
      i += 2;
      const rows: MarkdownInline[][][] = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        const row = cells(lines[i]);
        rows.push(headers.map((_, c) => parseInline(row[c] ?? "")));
        i += 1;
      }
      blocks.push({ type: "table", align, headers: headers.map((h) => parseInline(h)), rows });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      if (paragraph.length > 0 && startsBlock(lines[i]) && !/^ {0,3}(=+|-+)\s*$/.test(lines[i]))
        break;
      paragraph.push(lines[i]);
      i += 1;
      // A setext heading: the text, then a line of `=` or `-`.
      const underline = /^ {0,3}(=+|-+)\s*$/.exec(lines[i] ?? "");
      if (underline) {
        blocks.push({
          type: "heading",
          level: underline[1][0] === "=" ? 1 : 2,
          children: parseInline(paragraph.map((l) => l.trim()).join(" ")),
        });
        paragraph.length = 0;
        i += 1;
        break;
      }
    }
    if (paragraph.length === 0) continue;
    // Two trailing spaces or a backslash end a line; any other line break is a space.
    const text = paragraph
      .map((l, n) =>
        n === paragraph.length - 1
          ? l.trim()
          : / {2,}$/.test(l)
            ? `${l.trim()}\n`
            : l.trim().endsWith("\\")
              ? `${l.trim()}\n`
              : `${l.trim()} `,
      )
      .join("");
    const image = IMAGE_ONLY.exec(text);
    blocks.push(
      image
        ? { type: "image", alt: image[1], src: image[2] }
        : { type: "paragraph", children: parseInline(text) },
    );
  }
  return blocks;
}

// ─── Rendering ───────────────────────────────────────────────────────────────

/** The variant each heading level takes, as core's MDX headings do. */
const HEADING_VARIANT: Record<number, TextVariant> = {
  1: "display-strong-xs",
  2: "heading-strong-xl",
  3: "heading-strong-l",
  4: "heading-strong-m",
  5: "heading-strong-s",
  6: "heading-strong-xs",
};

const BODY: TextVariant = "body-default-m";

const plainText = (nodes: MarkdownInline[]): string =>
  nodes
    .map((node) =>
      node.type === "text" || node.type === "code"
        ? node.text
        : node.type === "image"
          ? node.alt
          : node.type === "break"
            ? "\n"
            : plainText(node.children),
    )
    .join("");

export interface MarkdownProps extends Omit<FlexProps, "children"> {
  /** The Markdown source, such as a post body stored as Markdown. */
  children: string;
  /** Called with a link's URL. Without it, links open with `Linking.openURL`. */
  onLinkPress?: (href: string) => void;
}

/**
 * Markdown rendered with Once UI, as core's MDX components render it on the
 * web: headings, body text, links, inline code, `CodeBlock`, `BlockQuote`
 * style quotes, `List`, `Table`, `Media` and `Line`. Parsed on the device with
 * no dependencies; raw HTML and MDX tags are shown as text.
 */
export const Markdown: RefComponent<MarkdownProps, ViewRef> = forwardRef<ViewRef, MarkdownProps>(
  function Markdown({ children, onLinkPress, ...column }, ref) {
    const theme = useTheme();
    const blocks = useMemo(() => parseMarkdown(children ?? ""), [children]);
    const bodyLine = theme.text(BODY).fontSize ?? 16;
    const strong = { fontWeight: theme.text("body-strong-m").fontWeight };
    const open = (href: string) => {
      if (onLinkPress) onLinkPress(href);
      else Linking.openURL(href).catch(() => {});
    };

    const inline = (nodes: MarkdownInline[]): ReactNode =>
      nodes.map((node, n) => {
        const key = `${node.type}-${n}`;
        switch (node.type) {
          case "text":
            return <Fragment key={key}>{node.text}</Fragment>;
          case "break":
            return <Fragment key={key}>{"\n"}</Fragment>;
          case "code":
            return <InlineCode key={key}>{node.text}</InlineCode>;
          case "strong":
            return (
              <Text key={key} style={strong as TextStyle}>
                {inline(node.children)}
              </Text>
            );
          case "em":
            return (
              <Text key={key} style={{ fontStyle: "italic" }}>
                {inline(node.children)}
              </Text>
            );
          case "del":
            return (
              <Text key={key} style={{ textDecorationLine: "line-through" }}>
                {inline(node.children)}
              </Text>
            );
          case "link":
            return (
              <Text
                key={key}
                accessibilityRole="link"
                accessibilityHint={node.href}
                onPress={() => open(node.href)}
                style={{
                  color: theme.onBackground("neutral-strong"),
                  textDecorationLine: "underline",
                }}
              >
                {inline(node.children)}
              </Text>
            );
          case "image":
            // An image inside a sentence reads as its alt text.
            return <Fragment key={key}>{node.alt}</Fragment>;
        }
        return null;
      });

    const paragraph = (nodes: MarkdownInline[], key: string) => (
      <Text
        key={key}
        textVariant={BODY}
        onBackground="neutral-medium"
        marginTop="8"
        marginBottom="12"
        style={{ lineHeight: bodyLine * 1.75 }}
      >
        {inline(nodes)}
      </Text>
    );

    // Plain cells stay strings, so the table sorts and searches them.
    const tableCell = (cell: MarkdownInline[]): ReactNode =>
      cell.every((part) => part.type === "text") ? (
        plainText(cell)
      ) : (
        <Text textVariant="body-default-s">{inline(cell)}</Text>
      );

    const block = (node: MarkdownBlock, key: string, tight = false): ReactNode => {
      switch (node.type) {
        case "heading":
          return (
            <Text
              key={key}
              textVariant={HEADING_VARIANT[node.level]}
              accessibilityRole="header"
              aria-level={node.level}
              marginTop="24"
              marginBottom="12"
            >
              {inline(node.children)}
            </Text>
          );
        case "paragraph":
          return tight ? (
            // In a list item, on the marker's line height.
            <Text key={key} textVariant={BODY} onBackground="neutral-medium">
              {inline(node.children)}
            </Text>
          ) : (
            paragraph(node.children, key)
          );
        case "image":
          return (
            <Media
              key={key}
              src={node.src}
              alt={node.alt}
              radius="m"
              border="neutral-alpha-medium"
              marginTop="8"
              marginBottom="16"
            />
          );
        case "code": {
          const label =
            node.language === "plaintext"
              ? "Text"
              : `${node.language.charAt(0).toUpperCase()}${node.language.slice(1)}`;
          return (
            <CodeBlock
              key={key}
              marginTop="8"
              marginBottom="16"
              codes={[{ code: node.code, language: node.language, label }]}
            />
          );
        }
        case "quote":
          // Core's MDX quote: body text, set off by a rule on its leading edge.
          return (
            <Column
              key={key}
              accessibilityRole="summary"
              borderLeft="neutral-alpha-medium"
              paddingLeft="16"
              marginTop="16"
              marginBottom="24"
            >
              {node.children.map((child, c) => block(child, `${key}-${c}`))}
            </Column>
          );
        case "list":
          return (
            <List
              key={key}
              as={node.ordered ? "ol" : "ul"}
              start={node.start}
              marginTop="4"
              marginBottom="12"
            >
              {node.items.map((item, n) => {
                const itemKey = `${key}-${n}`;
                const only = item.length === 1 && item[0].type === "paragraph" ? item[0] : null;
                return only ? (
                  <ListItem
                    key={itemKey}
                    onBackground="neutral-medium"
                    marginTop="4"
                    marginBottom="4"
                  >
                    {/* One `Text`, so the item stays one run of text around inline code and links. */}
                    <Text onBackground="neutral-medium">{inline(only.children)}</Text>
                  </ListItem>
                ) : (
                  <ListItem key={itemKey} marginTop="4" marginBottom="4">
                    {item.map((child, c) => block(child, `${itemKey}-${c}`, true))}
                  </ListItem>
                );
              })}
            </List>
          );
        case "table":
          return (
            <Table
              key={key}
              marginTop="16"
              marginBottom="16"
              data={{
                headers: node.headers.map((header, c) => ({
                  content: plainText(header),
                  key: `column-${c}`,
                  align: node.align[c],
                })),
                rows: node.rows.map((row) => row.map(tableCell)),
              }}
            />
          );
        case "hr":
          return (
            <Column key={key} marginY="32" accessibilityRole="none">
              <Line />
            </Column>
          );
      }
      return null;
    };

    return (
      <Column ref={ref} fillWidth {...column}>
        {blocks.map((node, n) => block(node, `block-${n}`))}
      </Column>
    );
  },
);

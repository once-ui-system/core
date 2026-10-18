import { type ReactNode, useEffect, useRef, useState } from "react";
import * as ReactNative from "react-native";
import { AccessibilityInfo, ScrollView, type TextStyle, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { OnceTheme } from "../theme/theme";
import type { SpacingToken } from "../types";
import { Button } from "./Button";
import {
  type CodeToken,
  type CodeTokenType,
  codeLanguage,
  codeTextStyle,
  tokenize,
  tokenizeLines,
} from "./codeTokens";
import { Flex, type FlexProps, flexStyle, Row } from "./Flex";
import type { IconName } from "./Icon";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { ToggleButton } from "./ToggleButton";

/** One snippet of a `CodeBlock`, as core's `CodeInstance`. */
export interface CodeInstance {
  code: string | { content: string; error: string | null };
  /** `"tsx"`, `"css"`, … or `["diff", "tsx"]` for a diff of that language. */
  language: string | ["diff", string];
  /** The snippet's tab, or the header when it is the only one. */
  label: string;
  /** Lines to mark, as `"1,3-5"`. */
  highlight?: string;
  prefixIcon?: IconName;
  /** The first line's number when `lineNumbers` is on; 1 by default. */
  startLineNumber?: number;
}

export interface CodeBlockProps extends FlexProps {
  codes?: CodeInstance[];
  /** Rendered above the code, on an overlay panel, as a live example. */
  preview?: ReactNode;
  previewPadding?: SpacingToken;
  copyButton?: boolean;
  /**
   * Puts the code on the clipboard, as `(code) => Clipboard.setStringAsync(code)`
   * with expo-clipboard. Without it the copy button uses React Native's own
   * `Clipboard`, deprecated and slated for removal.
   */
  onCopy?: (code: string) => unknown;
  /** A button that mounts `preview` afresh. */
  reloadButton?: boolean;
  /** No header: the copy button floats over the code. */
  compact?: boolean;
  lineNumbers?: boolean;
  /** The code's maximum height, in rem as in core; it scrolls past it. */
  codeHeight?: number;
  /** With `isCollapsible`, the lines shown before "View code". */
  maxLines?: number;
  isCollapsible?: boolean;
  hideCode?: boolean;
  onInstanceChange?: (index: number) => void;
  /**
   * @deprecated Set `highlight` on each entry of `codes` instead, as in core.
   * This one still applies to an entry that sets none.
   */
  highlight?: string;
}

// CodeHighlight.css: Prism's token classes onto core's `--code-*` colours.
const TOKEN_COLORS: Record<CodeTokenType, string> = {
  plain: "neutral-on-background-strong",
  comment: "code-moss",
  punctuation: "code-gray",
  property: "code-aqua",
  tag: "code-aqua",
  boolean: "code-green",
  number: "code-green",
  string: "code-blue",
  function: "code-blue",
  keyword: "code-violet",
  atrule: "code-violet",
  variable: "code-orange",
};

function tokenColor(theme: OnceTheme, type: CodeTokenType, language: string): string {
  // As core's `.language-json` and `.language-css` overrides.
  if (language === "json" && type === "property") return theme.color("code-blue");
  if (language === "json" && type === "string") return theme.color("code-green");
  if (language === "css" && type === "string") return theme.color("code-gray");
  return theme.color(TOKEN_COLORS[type]);
}

/** `"1,3-5"` as the set {1, 3, 4, 5}. */
export function parseHighlight(spec: string | undefined): Set<number> {
  const lines = new Set<number>();
  for (const part of (spec ?? "").split(",")) {
    const [from, to] = part.trim().split("-").map(Number);
    if (!Number.isFinite(from) || from < 1) continue;
    const last = Number.isFinite(to) && to >= from ? to : from;
    for (let n = from; n <= last; n++) lines.add(n);
  }
  return lines;
}

type DiffKind = "added" | "deleted" | "context" | "info";

interface Line {
  tokens: CodeToken[];
  /** The number in the gutter; undefined leaves it blank, as a deleted diff line. */
  number?: number;
  diff?: DiffKind;
}

function codeLines(
  code: string,
  language: CodeInstance["language"],
  start: number,
): { lines: Line[]; language: string } {
  const isDiff = Array.isArray(language) ? language[0] === "diff" : language === "diff";
  const lang = Array.isArray(language) ? (language[1] ?? "") : language;
  if (!isDiff) {
    return {
      language: lang,
      lines: tokenizeLines(code, lang).map((tokens, i) => ({ tokens, number: start + i })),
    };
  }
  // A unified diff: headers and hunks in the comment colour, the rest in its
  // language after the sign, numbered as the new file's lines.
  let number = start;
  const lines = code.split("\n").map((text): Line => {
    if (/^(?:diff |index |\+\+\+|---|@@)/.test(text)) {
      return { tokens: text ? [{ type: "comment", text }] : [], diff: "info" };
    }
    const sign = text[0] === "+" || text[0] === "-" || text[0] === " " ? text[0] : "";
    const diff: DiffKind = sign === "+" ? "added" : sign === "-" ? "deleted" : "context";
    const tokens: CodeToken[] = [
      ...(sign ? [{ type: "punctuation" as const, text: sign }] : []),
      ...tokenize(text.slice(sign.length), lang),
    ];
    return { tokens, diff, number: diff === "deleted" ? undefined : number++ };
  });
  return { language: lang, lines };
}

const DIFF_BACKGROUND: Partial<Record<DiffKind, string>> = {
  added: "success-alpha-weak",
  deleted: "danger-alpha-weak",
};

/**
 * Core's `CodeBlock`: one or more snippets, with tabs between them, a copy
 * button, line numbers and highlighted lines, coloured by a small built-in
 * tokenizer in place of Prism. Code scrolls sideways rather than wrapping.
 */
export function CodeBlock({
  codes = [],
  preview,
  previewPadding = "l",
  copyButton = true,
  onCopy,
  reloadButton = false,
  compact = false,
  lineNumbers = false,
  codeHeight,
  maxLines = 5,
  isCollapsible = false,
  hideCode = false,
  onInstanceChange,
  highlight: deprecatedHighlight,
  ...props
}: CodeBlockProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const { style, rest, userStyle, hidden } = flexStyle(theme, {
    direction: "column",
    fillWidth: true,
    background: "surface",
    border: "neutral-medium",
    radius: "m",
    overflow: "hidden",
    ...props,
  });
  if (hidden) return null;

  const instance = codes[selected] ?? codes[0];
  const raw = instance
    ? typeof instance.code === "string"
      ? instance.code
      : instance.code.content
    : "";

  const copy = async () => {
    if (!raw) return;
    try {
      if (onCopy) {
        await onCopy(raw);
      } else {
        // Read on press, so React Native's deprecation warning only comes with a copy.
        const clipboard = (ReactNative as { Clipboard?: { setString(text: string): void } })
          .Clipboard;
        if (!clipboard) {
          console.warn("CodeBlock: this React Native has no Clipboard. Pass onCopy.");
          return;
        }
        clipboard.setString(raw);
      }
      setCopied(true);
      // Core's VisuallyHidden status line: the icon swap alone says nothing.
      AccessibilityInfo.announceForAccessibility("Copied");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 5000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  const copyIcon = (
    <IconButton
      size="m"
      variant="tertiary"
      color="neutral-weak"
      icon={copied ? "check" : "clipboard"}
      ariaLabel={copied ? "Copied" : "Copy code"}
      onPress={copy}
    />
  );

  const header = !compact && codes.length > 0 && (
    <Row horizontal="between" vertical="center" fillWidth>
      {codes.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityRole="tablist"
          style={{ flexShrink: 1 }}
          contentContainerStyle={{
            alignItems: "center",
            gap: theme.space("2"),
            paddingHorizontal: theme.space("8"),
            paddingVertical: theme.space("4"),
          }}
        >
          {codes.map((code, index) => (
            <ToggleButton
              // Labels can repeat; the position is what tells the tabs apart.
              // biome-ignore lint/suspicious/noArrayIndexKey: the tabs never reorder
              key={index}
              accessibilityRole="tab"
              selected={selected === index}
              prefixIcon={code.prefixIcon}
              onPress={() => {
                setSelected(index);
                setExpanded(false);
                onInstanceChange?.(index);
              }}
            >
              <Text
                variant="label-default-s"
                onBackground={selected === index ? "neutral-strong" : "neutral-weak"}
              >
                {code.label}
              </Text>
            </ToggleButton>
          ))}
        </ScrollView>
      ) : (
        <Text
          variant="label-default-s"
          paddingY="12"
          paddingX="16"
          style={{ flexShrink: 1 }}
          numberOfLines={1}
        >
          {codes[0].label}
        </Text>
      )}
      <Row paddingY="4" paddingX="8" gap="2">
        {reloadButton && (
          <IconButton
            size="m"
            variant="tertiary"
            color="neutral-weak"
            icon="refresh"
            ariaLabel="Reload"
            onPress={() => setRefreshKey((k) => k + 1)}
          />
        )}
        {copyButton && copyIcon}
      </Row>
    </Row>
  );

  const hasPreview = preview !== undefined && preview !== null;
  const previewPanel = hasPreview && (
    <Flex key={refreshKey} paddingX="4" paddingBottom="4" paddingTop={compact ? "4" : "0"}>
      <Flex
        fillWidth
        background="overlay"
        radius="l"
        border="neutral-medium"
        padding={previewPadding}
        horizontal="center"
      >
        {preview}
      </Flex>
    </Flex>
  );

  return (
    <View {...rest} style={[style, userStyle]}>
      {header}
      {previewPanel}
      {instance && raw && !hideCode ? (
        <CodeLines
          instance={instance}
          raw={raw}
          highlight={instance.highlight ?? deprecatedHighlight}
          lineNumbers={lineNumbers}
          codeHeight={codeHeight}
          collapsedLines={isCollapsible && !expanded && maxLines > 0 ? maxLines : undefined}
          onExpand={() => setExpanded(true)}
          divider={!compact || hasPreview}
          copyButton={compact && copyButton ? copyIcon : undefined}
        />
      ) : null}
    </View>
  );
}

function CodeLines({
  instance,
  raw,
  highlight,
  lineNumbers,
  codeHeight,
  collapsedLines,
  onExpand,
  divider,
  copyButton,
}: {
  instance: CodeInstance;
  raw: string;
  highlight?: string;
  lineNumbers: boolean;
  codeHeight?: number;
  collapsedLines?: number;
  onExpand: () => void;
  divider: boolean;
  copyButton?: ReactNode;
}) {
  const theme = useTheme();
  const start = instance.startLineNumber ?? 1;
  const { lines, language } = codeLines(raw, instance.language, start);
  const marked = parseHighlight(highlight);
  const collapsed = collapsedLines !== undefined && lines.length > collapsedLines;
  const shown = collapsed ? lines.slice(0, collapsedLines) : lines;

  // CodeBlock.module.scss: body-s in the code font, `line-height: 1.75`.
  const mono = codeTextStyle(theme, "body-default-s", 1.75);
  const digits = String(start + lines.length - 1).length;
  // Monospace digits are about 0.6em wide.
  const gutter = Math.ceil(digits * (mono.fontSize ?? 14) * 0.6);
  const tokenLang = codeLanguage(language) ?? "";

  const rows = shown.map((line, i) => {
    const isMarked = line.number !== undefined && marked.has(line.number);
    const diffBackground = line.diff && DIFF_BACKGROUND[line.diff];
    const left = theme.space(lineNumbers ? "8" : "20");
    const row: ViewStyle = {
      flexDirection: "row",
      paddingLeft: left,
      paddingRight: theme.space("20"),
      ...(diffBackground ? { backgroundColor: theme.color(diffBackground) } : {}),
      // CodeHighlight.css's `.line-highlight`: a brand tint and a 2px brand edge.
      ...(isMarked
        ? {
            backgroundColor: theme.color("brand-alpha-weak"),
            borderLeftWidth: 2,
            borderLeftColor: theme.color("brand-alpha-strong"),
            paddingLeft: left - 2,
          }
        : {}),
    };
    const numberStyle: TextStyle = {
      ...mono,
      width: gutter,
      marginRight: theme.space("12"),
      textAlign: "right",
      color: theme.color("neutral-on-background-weak"),
    };
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
      <View key={i} style={row} testID={isMarked ? "code-line-highlighted" : undefined}>
        {lineNumbers && (
          <Text style={numberStyle} accessibilityElementsHidden importantForAccessibility="no">
            {line.number ?? ""}
          </Text>
        )}
        <Text style={[mono, { color: theme.color("neutral-on-background-strong") }]}>
          {line.tokens.length === 0
            ? " "
            : line.tokens.map((token, t) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
                <Text key={t} style={{ color: tokenColor(theme, token.type, tokenLang) }}>
                  {token.text}
                </Text>
              ))}
        </Text>
      </View>
    );
  });

  // Sideways for long lines, filling the width so a highlight band spans it.
  const sideways = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        flexDirection: "column",
        paddingVertical: theme.space("8"),
      }}
    >
      {rows}
    </ScrollView>
  );

  return (
    <View
      style={{
        position: "relative",
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: theme.color("neutral-alpha-weak"),
      }}
    >
      {codeHeight !== undefined ? (
        <ScrollView nestedScrollEnabled style={{ maxHeight: theme.space(codeHeight) }}>
          {sideways}
        </ScrollView>
      ) : (
        sideways
      )}
      {collapsed && (
        <Row horizontal="center" paddingBottom="12">
          <Button variant="subtle" weight="default" size="s" onPress={onExpand}>
            View code
          </Button>
        </Row>
      )}
      {copyButton && (
        <View style={{ position: "absolute", top: theme.space("4"), right: theme.space("4") }}>
          {copyButton}
        </View>
      )}
    </View>
  );
}

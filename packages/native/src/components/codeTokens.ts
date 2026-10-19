import { Platform, type TextStyle } from "react-native";
import type { OnceTheme } from "../theme/theme";
import type { TextVariant } from "../types";

/**
 * A small tokenizer for `CodeBlock`, in place of core's Prism: enough to
 * colour keywords, strings, comments and numbers in the languages a phone app
 * shows most (js, ts, jsx, tsx, css, bash, json). Anything else is plain text.
 */

export type CodeTokenType =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "boolean"
  | "keyword"
  | "function"
  | "property"
  | "tag"
  | "variable"
  | "atrule"
  | "punctuation";

export interface CodeToken {
  type: CodeTokenType;
  text: string;
}

interface Rule {
  type: CodeTokenType;
  pattern: RegExp;
  /** Only where the previous character is whitespace or the start, as bash's `#`. */
  afterSpace?: boolean;
}

const rule = (type: CodeTokenType, source: string, afterSpace = false): Rule => ({
  type,
  pattern: new RegExp(source, "y"),
  afterSpace,
});

const JS_KEYWORDS =
  "const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|in|of|class|extends|super|this|import|export|from|default|as|async|await|yield|try|catch|finally|throw|void|static|get|set";
const TS_KEYWORDS = `${JS_KEYWORDS}|type|interface|enum|implements|private|public|protected|readonly|declare|namespace|keyof|satisfies|abstract|is|infer`;

const STRINGS = [
  rule("string", "`(?:\\\\[\\s\\S]|[^\\\\`])*`?"),
  rule("string", '"(?:\\\\.|[^"\\\\\\n])*"?'),
  rule("string", "'(?:\\\\.|[^'\\\\\\n])*'?"),
];

const script = (keywords: string, jsx: boolean): Rule[] => [
  rule("comment", "\\/\\/[^\\n]*"),
  rule("comment", "\\/\\*[\\s\\S]*?(?:\\*\\/|$)"),
  ...STRINGS,
  // `<Row` and `</Row`: there is no type information to tell them from `a < b`.
  ...(jsx ? [rule("tag", "<\\/?[A-Za-z][\\w.]*")] : []),
  rule("keyword", `\\b(?:${keywords})\\b`),
  rule("boolean", "\\b(?:true|false|null|undefined|NaN|Infinity)\\b"),
  rule(
    "number",
    "\\b(?:0[xX][\\da-fA-F_]+|0[bB][01_]+|\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?n?)\\b",
  ),
  rule("function", "[A-Za-z_$][\\w$]*(?=\\s*\\()"),
  // Whole identifiers, so a keyword or number is never found inside one.
  rule("plain", "[A-Za-z_$][\\w$]*"),
  rule("punctuation", "[{}()[\\];,.]"),
  rule("punctuation", "[=+\\-*/%!<>&|^~?:]+"),
];

const LANGUAGES: Record<string, Rule[]> = {
  js: script(JS_KEYWORDS, false),
  jsx: script(JS_KEYWORDS, true),
  ts: script(TS_KEYWORDS, false),
  tsx: script(TS_KEYWORDS, true),
  css: [
    rule("comment", "\\/\\*[\\s\\S]*?(?:\\*\\/|$)"),
    ...STRINGS.slice(1),
    rule("atrule", "@[\\w-]+"),
    // A name before a colon whose value ends the declaration, so `a:hover {` stays a selector.
    rule("property", "-{0,2}[A-Za-z][\\w-]*(?=\\s*:[^{\\n]*(?:;|\\}|\\n|$))"),
    rule("function", "[\\w-]+(?=\\()"),
    rule("number", "#[\\da-fA-F]{3,8}\\b"),
    rule("number", "-?(?:\\d+\\.?\\d*|\\.\\d+)(?:%|[a-zA-Z]+)?"),
    rule("plain", "[\\w-]+"),
    rule("punctuation", "[{}();:,]"),
  ],
  bash: [
    rule("comment", "#[^\\n]*", true),
    rule("string", '"(?:\\\\[\\s\\S]|[^"\\\\])*"?'),
    rule("string", "'[^']*'?"),
    rule("variable", "\\$(?:\\{[^}\\n]*\\}|[A-Za-z_]\\w*|[\\d@#?$!*-])"),
    rule(
      "keyword",
      "\\b(?:if|then|else|elif|fi|for|in|do|done|while|until|case|esac|function|return|export|local|select)\\b",
    ),
    rule("number", "\\b\\d+\\b"),
    rule("plain", "[\\w-]+"),
    rule("punctuation", "[|&;<>]+"),
  ],
  json: [
    rule("property", '"(?:\\\\.|[^"\\\\\\n])*"(?=\\s*:)'),
    rule("string", '"(?:\\\\.|[^"\\\\\\n])*"?'),
    rule("number", "-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?"),
    rule("boolean", "\\b(?:true|false|null)\\b"),
    rule("punctuation", "[{}[\\],:]"),
  ],
};

// The names editors and core's docs use, as core's `languageAliases`.
const ALIASES: Record<string, string> = {
  javascript: "js",
  mjs: "js",
  cjs: "js",
  typescript: "ts",
  mdx: "tsx",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  jsonc: "json",
  scss: "css",
};

/** The tokenizer's own name for `language`, or undefined when it has no rules for it. */
export function codeLanguage(language: string): string | undefined {
  const name = language.toLowerCase();
  const resolved = ALIASES[name] ?? name;
  return LANGUAGES[resolved] ? resolved : undefined;
}

/** Splits `code` into coloured tokens; one plain token for a language it does not know. */
export function tokenize(code: string, language: string): CodeToken[] {
  const lang = codeLanguage(language);
  if (!lang) return code ? [{ type: "plain", text: code }] : [];
  const rules = LANGUAGES[lang];
  const tokens: CodeToken[] = [];
  const push = (type: CodeTokenType, text: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.type === type) last.text += text;
    else tokens.push({ type, text });
  };
  let i = 0;
  while (i < code.length) {
    let matched = false;
    for (const r of rules) {
      if (r.afterSpace && i > 0 && !/\s/.test(code[i - 1])) continue;
      r.pattern.lastIndex = i;
      const m = r.pattern.exec(code);
      if (m && m[0].length > 0) {
        push(r.type, m[0]);
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      push("plain", code[i]);
      i += 1;
    }
  }
  return tokens;
}

/** `tokenize`, cut into lines: a token that spans lines, as a block comment, is split at each. */
export function tokenizeLines(code: string, language: string): CodeToken[][] {
  const lines: CodeToken[][] = [[]];
  for (const token of tokenize(code, language)) {
    const parts = token.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: token.type, text: part });
    });
  }
  return lines;
}

// The platform's own monospace face, for an app that loads no `fonts.code`.
const MONOSPACE = Platform.select({ ios: "Menlo", default: "monospace" });

/**
 * Core's `font-code` at the size of `metrics`: the code family
 * (`ThemeProvider`'s `fonts.code`, else the platform monospace) at that text
 * variant's size and line height. Core's `.font-code.font-s` reads the label
 * type's, its `CodeBlock` the body type's. `lineHeight`, in ems, overrides the
 * line height, as `CodeBlock`'s `line-height: 1.75`.
 */
export function codeTextStyle(
  theme: OnceTheme,
  metrics: TextVariant,
  lineHeight?: number,
): TextStyle {
  const { fontSize, lineHeight: variantLineHeight } = theme.text(metrics);
  const code = theme.text("code-default-s");
  return {
    fontSize,
    lineHeight: lineHeight && fontSize ? fontSize * lineHeight : variantLineHeight,
    fontWeight: code.fontWeight,
    fontFamily: code.fontFamily ?? MONOSPACE,
  };
}

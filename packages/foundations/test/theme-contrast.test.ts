import { join } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";
import { oklchToHex } from "../scripts/export-tokens.mjs";

/**
 * WCAG AA for text is 4.5:1, and every text token a theme defines is meant
 * for text. So for every theme a project can configure (light and dark,
 * each solid style, each neutral, each brand and accent palette), each
 * `--<role>-on-background-*` is checked on the page, on a surface and on its
 * own weak and medium backgrounds, and each `--<role>-on-solid-<weight>` on
 * `--<role>-solid-<weight>`.
 *
 * The tokens are compiled from the SCSS, then resolved the way the browser
 * resolves them on <html>: the rules whose whole selector is `:root` or
 * attributes the root carries, in source order, then `var()` chains down to
 * a colour. Colours are compared as the hex the token export writes. Rules
 * for nested subtrees (a dark section in a light page) repeat the same
 * values, so the root covers them.
 */
const css = sass
  .compile(join(__dirname, "..", "scss", "tokens", "index.scss"))
  .css.replace(/@charset[^;]*;/, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

type Rule = { selectors: string[]; declarations: Record<string, string> };

/** Top-level rules only: media queries change sizes, not colours. */
const rules: Rule[] = [];
{
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") {
      if (depth === 0) {
        const selector = css.slice(start, i).trim();
        const end = css.indexOf("}", i);
        if (!selector.startsWith("@") && css.slice(i + 1, end).indexOf("{") === -1) {
          rules.push({
            selectors: selector.split(",").map((s) => s.trim()),
            declarations: Object.fromEntries(
              [...css.slice(i + 1, end).matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)].map((m) => [
                m[1],
                m[2].trim(),
              ]),
            ),
          });
        }
      }
      depth++;
    } else if (css[i] === "}") {
      depth--;
      if (depth === 0) start = i + 1;
    }
  }
}

type Root = Record<string, string>;

function appliesToRoot(selector: string, root: Root) {
  if (selector === ":root" || selector === ":where(:root)") return true;
  const parts = [...selector.matchAll(/\[([\w-]+)="?([\w-]+)"?\]/g)];
  if (!parts.length || parts.map((m) => m[0]).join("") !== selector) return false;
  return parts.every(([, name, value]) => root[name] === value);
}

function tokensFor(root: Root) {
  const tokens: Record<string, string> = {};
  for (const rule of rules) {
    if (rule.selectors.some((s) => appliesToRoot(s, root)))
      Object.assign(tokens, rule.declarations);
  }
  return tokens;
}

function color(tokens: Record<string, string>, name: string, seen = new Set<string>()): string {
  const value = tokens[name];
  if (value === undefined || seen.has(name)) throw new Error(`${name} does not resolve`);
  seen.add(name);
  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  if (reference) return color(tokens, reference[1], seen);
  const oklch = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(value);
  if (oklch) return oklchToHex(Number(oklch[1]), Number(oklch[2]), Number(oklch[3]));
  if (/^#[\da-f]{6}$/i.test(value)) return value.toLowerCase();
  throw new Error(`${name} is ${value}, not an opaque colour`);
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const palettes = (attribute: string) =>
  [
    ...new Set(
      rules.flatMap((r) =>
        r.selectors.flatMap(
          (s) => new RegExp(`^\\[${attribute}="?(\\w+)"?\\]$`).exec(s)?.[1] ?? [],
        ),
      ),
    ),
  ].filter((name) => name !== "custom");

const SCHEMES = palettes("data-brand");
const NEUTRALS = palettes("data-neutral");
const SOLIDS = ["color", "contrast", "inverse"];
const ROLES = ["brand", "accent", "neutral", "info", "success", "warning", "danger"];
const WEIGHTS = ["strong", "medium", "weak"];

/** Every text/background pair a theme promises, as `[text, background]`. */
const pairs = ROLES.flatMap((role) => [
  ...WEIGHTS.flatMap((w) =>
    [
      "--page-background",
      "--surface-background",
      `--${role}-background-weak`,
      `--${role}-background-medium`,
    ].map((bg) => [`--${role}-on-background-${w}`, bg]),
  ),
  ...WEIGHTS.map((w) => [`--${role}-on-solid-${w}`, `--${role}-solid-${w}`]),
]);

describe("theme contrast", () => {
  it("covers every palette a theme can pick", () => {
    expect(SCHEMES).toEqual(expect.arrayContaining(["red", "blue", "yellow", "moss"]));
    expect(SCHEMES.length).toBeGreaterThanOrEqual(13);
    expect(NEUTRALS).toEqual(
      expect.arrayContaining(["gray", "sand", "slate", "rose", "mint", "dusk"]),
    );
  });

  describe.each(["light", "dark"])("%s", (theme) => {
    it.each(SOLIDS)("data-solid=%s: every text token reads at least 4.5:1", (solid) => {
      const failures: string[] = [];
      for (const neutral of NEUTRALS) {
        for (const scheme of SCHEMES) {
          const tokens = tokensFor({
            "data-theme": theme,
            "data-solid": solid,
            "data-neutral": neutral,
            "data-brand": scheme,
            "data-accent": scheme,
          });
          for (const [text, background] of pairs) {
            const ratio = contrast(color(tokens, text), color(tokens, background));
            if (ratio < 4.5) {
              failures.push(
                `${neutral}/${scheme}: ${text} on ${background} is ${ratio.toFixed(2)}:1`,
              );
            }
          }
        }
      }
      expect(failures).toEqual([]);
    });
  });
});

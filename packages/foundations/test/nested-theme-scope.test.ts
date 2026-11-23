import { join } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";

/**
 * A scheme token (`--neutral-on-background-strong`) is declared once per
 * theme. Where themes nest, the nearest `data-theme` must win, also on an
 * element that carries a theme and a seeded scheme at once (a StyleScope with
 * `theme` and `accentSeed`), up to three levels deep (core#558).
 *
 * The rules are compiled from the SCSS, then the winner for an element is
 * picked as the browser does: the matching selector with the highest
 * specificity, the later rule on a tie. The selectors involved are attribute
 * compounds joined by descendant combinators, with `:is()` lists of
 * attributes, so a small matcher is enough.
 */
const css = sass
  .compile(join(__dirname, "..", "scss", "tokens", "index.scss"))
  .css.replace(/@charset[^;]*;/, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

const TOKEN = "--neutral-on-background-strong";

type Rule = { order: number; selectors: string[]; value: string };

/** Top-level rules that declare TOKEN. */
const rules: Rule[] = [];
{
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") {
      if (depth === 0) {
        const selector = css.slice(start, i).trim();
        const end = css.indexOf("}", i);
        const body = css.slice(i + 1, end);
        const match = body.match(new RegExp(`${TOKEN}\\s*:\\s*([^;}]+)`));
        if (!selector.startsWith("@") && body.indexOf("{") === -1 && match) {
          rules.push({
            order: rules.length,
            selectors: splitTop(selector, ",").map((s) => s.trim()),
            value: match[1].trim(),
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

/** Split on `sep` outside parentheses. */
function splitTop(text: string, sep: string) {
  const out: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    else if (depth === 0 && text[i] === sep) {
      out.push(text.slice(from, i));
      from = i + 1;
    }
  }
  out.push(text.slice(from));
  return out.filter((part) => part.trim() !== "");
}

type El = Record<string, string>;
type Simple = { attrs: [string, string | null][] } | { anyOf: [string, string | null][] };

function parseAttr(text: string): [string, string | null] {
  const m = text.trim().match(/^\[([\w-]+)(?:="?([^"\]]*)"?)?\]$/);
  if (!m) throw new Error(`unsupported selector part: ${text}`);
  return [m[1], m[2] ?? null];
}

/** One compound: `[a="b"]:is([c], [d])` → its simple parts. */
function parseCompound(text: string): Simple[] {
  const parts: Simple[] = [];
  let rest = text;
  while (rest) {
    if (rest.startsWith(":is(")) {
      let depth = 0;
      let i = 0;
      for (; i < rest.length; i++) {
        if (rest[i] === "(") depth++;
        else if (rest[i] === ")" && --depth === 0) break;
      }
      parts.push({ anyOf: splitTop(rest.slice(4, i), ",").map(parseAttr) });
      rest = rest.slice(i + 1);
    } else if (rest.startsWith("[")) {
      const end = rest.indexOf("]");
      parts.push({ attrs: [parseAttr(rest.slice(0, end + 1))] });
      rest = rest.slice(end + 1);
    } else if (rest.startsWith(":root")) {
      parts.push({ attrs: [[":root", null]] });
      rest = rest.slice(5);
    } else {
      throw new Error(`unsupported selector: ${text}`);
    }
  }
  return parts;
}

const has = (el: El, [name, value]: [string, string | null]) =>
  name in el && (value === null || el[name] === value);

const matchesCompound = (el: El, compound: Simple[]) =>
  compound.every((part) =>
    "attrs" in part ? part.attrs.every((a) => has(el, a)) : part.anyOf.some((a) => has(el, a)),
  );

/** Does `selector` match the last element of `chain` (root first)? */
function matches(selector: string, chain: El[]) {
  const compounds = splitTop(selector, " ").map(parseCompound);
  const at = (c: number, e: number): boolean => {
    if (c < 0) return true;
    for (let i = e; i >= 0; i--) {
      if (matchesCompound(chain[i], compounds[c])) {
        if (at(c - 1, i - 1)) return true;
      }
      if (c === compounds.length - 1) return false; // the subject is the element itself
    }
    return false;
  };
  return at(compounds.length - 1, chain.length - 1);
}

const specificity = (selector: string) =>
  splitTop(selector, " ")
    .map(parseCompound)
    .flat()
    .reduce((sum) => sum + 1, 0);

/** The value of TOKEN on the last element of `chain`, by the cascade. */
function resolve(chain: El[]) {
  let best: { spec: number; order: number; value: string } | null = null;
  for (const rule of rules) {
    for (const selector of rule.selectors) {
      if (!matches(selector, chain)) continue;
      const spec = specificity(selector);
      if (!best || spec > best.spec || (spec === best.spec && rule.order >= best.order)) {
        best = { spec, order: rule.order, value: rule.value };
      }
    }
  }
  return best?.value;
}

const html = (theme: string): El => ({ ":root": "", "data-theme": theme });
const dark = resolve([html("dark")]);
const light = resolve([html("light")]);

describe("nested themes: the nearest data-theme wins", () => {
  it("has different dark and light values to tell apart", () => {
    expect(dark).toBeDefined();
    expect(light).toBeDefined();
    expect(dark).not.toBe(light);
  });

  it("a dark scope with a seed inside a light section of a dark page reads dark (core#558)", () => {
    const scope = { "data-theme": "dark", "data-accent": "custom" };
    expect(resolve([html("dark"), { "data-theme": "light" }, scope])).toBe(dark);
    // and an element with a scheme inside it
    expect(
      resolve([html("dark"), { "data-theme": "light" }, scope, { "data-brand": "blue" }]),
    ).toBe(dark);
  });

  it("a light scope with a seed inside a dark section of a light page reads light", () => {
    const scope = { "data-theme": "light", "data-brand": "custom" };
    expect(resolve([html("light"), { "data-theme": "dark" }, scope])).toBe(light);
    expect(
      resolve([html("light"), { "data-theme": "dark" }, scope, { "data-neutral": "sand" }]),
    ).toBe(light);
  });

  it("keeps the two-level cases", () => {
    expect(resolve([html("dark"), { "data-theme": "light", "data-accent": "custom" }])).toBe(light);
    expect(resolve([html("light"), { "data-theme": "dark", "data-accent": "custom" }])).toBe(dark);
    expect(resolve([html("dark"), { "data-theme": "light" }, { "data-brand": "blue" }])).toBe(
      light,
    );
    expect(resolve([html("light"), { "data-theme": "dark" }, { "data-brand": "blue" }])).toBe(dark);
  });
});

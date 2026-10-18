import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { compile } from "sass";
import { describe, expect, it } from "vitest";

/**
 * Keeps core usable on a phone (ROADMAP: mobile-ready core, 2.3). Four rules,
 * each checked on the source rather than in a browser, so a new component
 * that breaks one fails here before anyone opens it on a device:
 *
 * 1. Hover styles only apply where the pointer can hover. A phone keeps
 *    `:hover` on whatever was tapped last, so an unguarded hover style sticks.
 * 2. No `vh`/`vw` lengths. `vh` is the viewport with a phone's toolbars
 *    hidden, so `100vh` runs under them; `vw` counts a desktop scrollbar. Use
 *    `dvh`/`svh`, `%` or `inset`.
 * 3. A component that draws something `position="fixed"` keeps it clear of the
 *    device's safe areas (`--safe-area-*`), or says here why it doesn't need to.
 * 4. The small controls take taps from at least `--touch-target` (44px) on a
 *    coarse pointer.
 */

const SRC = join(__dirname, "..");
const FOUNDATIONS = join(SRC, "..", "..", "foundations");

const walk = (dir: string, match: (file: string) => boolean): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : walk(path, match);
    return match(entry.name) ? [path] : [];
  });

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const compileScss = (file: string) =>
  stripComments(compile(file, { style: "expanded", logger: { warn: () => {} } }).css);

type Rule = { selector: string; at: string[]; body: string };

/** The style rules of compiled CSS, each with the at-rules it sits inside. */
const rules = (css: string): Rule[] => {
  const out: Rule[] = [];
  const stack: string[] = [];
  let buffer = "";
  for (const char of css) {
    if (char === "{") {
      stack.push(buffer.trim());
      buffer = "";
    } else if (char === "}") {
      const prelude = stack.pop() ?? "";
      if (!prelude.startsWith("@") && buffer.trim()) {
        out.push({
          selector: prelude,
          at: stack.filter((s) => s.startsWith("@")),
          body: buffer.trim(),
        });
      }
      buffer = "";
    } else if (char === ";" && stack.length === 0) {
      buffer = "";
    } else {
      buffer += char;
    }
  }
  return out;
};

const modules = walk(SRC, (name) => name.endsWith(".module.scss"));
const compiled = new Map(modules.map((file) => [file, compileScss(file)]));
const foundationsCss = compileScss(join(FOUNDATIONS, "scss", "styles", "index.scss"));
const foundationsTokens = compileScss(join(FOUNDATIONS, "scss", "tokens", "index.scss"));

const sources = [
  ...walk(join(SRC, "components"), (n) => n.endsWith(".tsx")),
  ...walk(join(SRC, "modules"), (n) => n.endsWith(".tsx")),
].filter((file) => !/\.test\.tsx$/.test(file));

const rel = (file: string) => relative(SRC, file);

describe("mobile-ready core", () => {
  it("reads rules inside their at-rules", () => {
    const found = rules("@media (hover: hover) { .a:hover { color: red; } } .b { color: blue; }");
    expect(found).toEqual([
      { selector: ".a:hover", at: ["@media (hover: hover)"], body: "color: red;" },
      { selector: ".b", at: [], body: "color: blue;" },
    ]);
  });

  it("only applies hover styles where the pointer can hover", () => {
    const canHover = (at: string[]) => at.some((a) => /\((any-)?hover:\s*hover\)/.test(a));
    // `:not(:hover)` holds on a phone, and a scrollbar thumb only exists for a mouse.
    const isHover = (selector: string) =>
      /:hover/.test(selector.replace(/:not\(:hover\)/g, "")) &&
      !/::-webkit-scrollbar/.test(selector);

    const offenders = [
      ...[...compiled].flatMap(([file, css]) =>
        rules(css)
          .filter((r) => isHover(r.selector) && !canHover(r.at))
          .map((r) => `${rel(file)}: ${r.selector}`),
      ),
      ...rules(foundationsCss)
        .filter((r) => isHover(r.selector) && !canHover(r.at))
        .map((r) => `foundations: ${r.selector}`),
    ];

    expect(offenders, "wrap these in @media (hover: hover)").toEqual([]);
  });

  it("uses no vh or vw lengths", () => {
    // A number glued to the unit: `100vh`, `50vw`; `dvh` and `svh` pass.
    const unit = /(?:\d|\})(?:vh|vw)\b/;
    // A clip margin is not a box size, and `sizes` is the media condition an
    // <img> picks a source with, where `vw` is the right unit.
    const allowed = (line: string) => /overflow-clip-margin|sizes/.test(line);

    const offenders = [
      ...[...compiled].flatMap(([file, css]) =>
        css
          .split("\n")
          .filter((line) => unit.test(line) && !allowed(line))
          .map((line) => `${rel(file)}: ${line.trim()}`),
      ),
      ...sources.flatMap((file) =>
        readFileSync(file, "utf8")
          .split("\n")
          .filter((line) => unit.test(line) && !allowed(line) && !line.trim().startsWith("//"))
          .map((line) => `${rel(file)}: ${line.trim()}`),
      ),
    ];

    expect(offenders, "use dvh/svh, % or inset").toEqual([]);
  });

  it("keeps fixed UI clear of the device's safe areas", () => {
    // Fixed, and fine without: say why.
    const exempt: Record<string, string> = {
      "components/Cursor.tsx": "follows the pointer",
      "components/CursorCard.tsx": "follows the pointer",
      "components/ContextMenu.tsx": "opens at the pointer",
      "components/Media.tsx": "a full-bleed backdrop behind the enlarged image",
    };

    const offenders = sources.filter((file) => {
      const source = readFileSync(file, "utf8");
      if (!/position="fixed"/.test(source) || exempt[rel(file)]) return false;
      const ownStyles = [...source.matchAll(/from "(\.{1,2}\/[^"]+\.module\.scss)"/g)].map((m) =>
        readFileSync(join(dirname(file), m[1]), "utf8"),
      );
      return ![source, ...ownStyles].some((text) => text.includes("--safe-area-"));
    });

    expect(
      offenders.map(rel),
      "use --safe-area-*, or add it to the exemptions with a reason",
    ).toEqual([]);
  });

  it("defines the safe-area and touch-target tokens", () => {
    for (const side of ["top", "right", "bottom", "left"]) {
      expect(foundationsTokens).toContain(`--safe-area-${side}: env(safe-area-inset-${side}, 0px)`);
    }
    expect(foundationsTokens).toContain("--touch-target: 2.75rem");
  });

  it("gives small controls a 44px tap area on a coarse pointer", () => {
    // Module, then the selector that takes the tap.
    const targets: Array<[string, string]> = [
      ["components/Button.module.scss", ".button"], // Button, IconButton
      ["components/ToggleButton.module.scss", ".button"], // ToggleButton, SegmentedControl, Pagination
      ["components/SharedInteractiveStyles.module.scss", ".element"], // Checkbox, RadioButton
      ["components/Switch.module.scss", ".switch"],
      ["components/Chip.module.scss", '.chip[role="button"]'],
      ["components/Chip.module.scss", ".action"],
      ["components/NavIcon.module.scss", ".navIcon"],
      ["components/Carousel.module.scss", ".indicator"],
      ["components/MediaVideoPlayer.module.scss", ".progressTrack"],
    ];

    const coarse = (r: Rule) => r.at.some((a) => /\(pointer:\s*coarse\)/.test(a));
    const missing = targets.filter(([file, selector]) => {
      const css = compiled.get(join(SRC, file));
      if (!css) return true;
      return !rules(css).some(
        (r) =>
          coarse(r) &&
          // Sass drops the quotes around an attribute value.
          r.selector.split(",").some((s) => s.trim() === `${selector.replace(/"/g, "")}::after`) &&
          /width: max\(100%, var\(--touch-target/.test(r.body) &&
          /height: max\(100%, var\(--touch-target/.test(r.body),
      );
    });
    expect(missing).toEqual([]);

    // The audio seek bar clips its overflow, so it grows with borders instead.
    const audio = rules(compiled.get(join(SRC, "components/MediaAudioPlayer.module.scss")) ?? "");
    expect(
      audio.some(
        (r) =>
          coarse(r) &&
          r.selector === ".progressTrack.progressTrack" &&
          /height: var\(--touch-target/.test(r.body),
      ),
    ).toBe(true);
  });

  it("checks every module it reads", () => {
    expect(modules.length).toBeGreaterThan(50);
    expect(modules.map((m) => basename(m))).toContain("Button.module.scss");
  });
});

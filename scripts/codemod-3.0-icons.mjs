/**
 * Once UI 2.x → 3.0 codemod, H1: built-in icon names whose drawing changed
 * meaning when core moved to its own icon set (once-ui-system/icons).
 *
 *   `check`    2.x drew a check in a circle; 3.0 draws the plain mark (`checkCircle` is the circle)
 *   `checkbox` 2.x drew the plain check mark; 3.0 draws a ticked box (`check` is the mark)
 *
 * Reported, never rewritten: rewriting would not be idempotent (a second run
 * would read the `check` the first wrote as 2.x's), and the plain mark is
 * often what a 2.x `check` meant anyway (a selected row, a copied state).
 *
 * Reads string literals given to `<Icon name>` and to any `icon`,
 * `prefixIcon`, `suffixIcon`, `startIcon`, `endIcon` or `arrowIcon` prop, and
 * `icon: "…"` entries in objects (nav and menu configs).
 */

export const ICON_MEANINGS = {
  check: "draws the plain check mark in 3.0 (2.x drew it in a circle); write checkCircle for the 2.x look",
  checkbox: "draws a ticked box in 3.0 (2.x drew the plain check mark); write check for the 2.x look",
};

const NAMES = Object.keys(ICON_MEANINGS).join("|");
const PROPS = "icon|prefixIcon|suffixIcon|startIcon|endIcon|arrowIcon";
const PATTERNS = [
  // <Icon … name="check" …>
  new RegExp(`(<Icon\\b[^<>]*?\\sname=\\{?\\s*)(["'])(${NAMES})\\2`, "g"),
  // icon="check", prefixIcon={"check"}
  new RegExp(`(\\s(?:${PROPS})=\\{?\\s*)(["'])(${NAMES})\\2`, "g"),
  // { icon: "check" }
  new RegExp(`(\\b(?:${PROPS})\\s*:\\s*)(["'])(${NAMES})\\2`, "g"),
];

export function transformIconNames(src) {
  const found = new Map();
  for (const re of PATTERNS) {
    for (const m of src.matchAll(re)) found.set(m.index + m[1].length, m[3]);
  }
  const warnings = [...found.keys()]
    .sort((a, b) => a - b)
    .map((at) => {
      const name = found.get(at);
      const line = src.slice(0, at).split("\n").length;
      return `icon "${name}" ${ICON_MEANINGS[name]} (line ${line})`;
    });
  return { out: src, hits: [], warnings };
}

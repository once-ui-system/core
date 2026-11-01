// `data-theme="invert"`: a subtree in the opposite of the theme around it.
//
// Every rule Once UI keys off `[data-theme="dark"]` or `[data-theme="light"]`
// is rewritten in the shipped CSS to also match an `invert` element whose
// nearest themed ancestor is the other theme:
//
//   [data-theme=dark]
//   → :is([data-theme=dark],
//         [data-theme=invert]:where([data-theme=light] *)
//                            :not(:where([data-theme=light] [data-theme=dark] *)))
//
// `:where()` weighs nothing and `:is()` takes its heaviest branch, so the
// selector keeps the specificity of `[data-theme=dark]` (0,1,0) and every
// nested-theme rule meets the others exactly as before. Pure CSS: no script
// reads the page's theme, so it is right on the first paint, under
// `theme="system"` and with JavaScript off.
//
// The nearest-ancestor test reaches two levels, as the nested-theme rules do
// (a light section on a dark page, then `invert` inside it). An `invert`
// inside another `invert` is not resolved: give it a theme of its own.
//
// The source SCSS stays as written: the token exporter and the tests read the
// literal `[data-theme="dark"]` rules, and a new rule gets its invert twin
// without anyone remembering to write one.
//
//   node scripts/theme-invert.cjs <file.css>...   rewrite files in place
//
// `@once-ui-system/core`, `fx` and `blocks` run it on their compiled CSS from
// compile-css-modules.cjs, before `wrapFile`.

const fs = require("node:fs");

const OTHER = { dark: "light", light: "dark" };
const MARK = "[data-theme=invert]";

/** The selector an element in `theme` matches: that theme, or invert of the other. */
function themeSelector(theme) {
  const other = OTHER[theme];
  return (
    `:is([data-theme=${theme}],${MARK}` +
    `:where([data-theme=${other}] *)` +
    `:not(:where([data-theme=${other}] [data-theme=${theme}] *)))`
  );
}

/** `css` with every `[data-theme=dark|light]` selector also matching `invert`. */
function invert(css) {
  if (css.includes(MARK)) return css;
  return css.replace(/\[data-theme=("?)(dark|light)\1\]/g, (_, __, theme) => themeSelector(theme));
}

function invertFile(file) {
  const css = fs.readFileSync(file, "utf8");
  const next = invert(css);
  if (next !== css) fs.writeFileSync(file, next);
}

module.exports = { invert, invertFile, themeSelector };

if (require.main === module) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: node scripts/theme-invert.cjs <file.css>...");
    process.exit(1);
  }
  for (const file of files) invertFile(file);
  console.log(`theme-invert: ${files.length} file(s)`);
}

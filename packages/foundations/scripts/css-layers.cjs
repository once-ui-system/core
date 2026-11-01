// Puts Once UI's shipped CSS in a cascade layer, `once-ui` (3.0).
//
// An app's own CSS is unlayered, and unlayered styles beat every layer
// whatever their specificity, so an app's `.card { padding: 0 }` or a Tailwind
// utility overrides a Once UI style without `!important` or a longer selector.
//
// One layer, not one per file: inside it Once UI's rules still meet by
// specificity and source order, as they did unlayered. tokens.css holds rules
// as well as tokens (`.dark-flex` hides a `showIn="dark"` element), and they
// win over a component's own `display` by specificity; layering tokens,
// utilities and components apart would let the later layer win instead.
//
//   node scripts/css-layers.cjs <file.css>...   wrap files in place
//
// `@once-ui-system/core`, `fx` and `blocks` call `wrapFile` on their compiled
// CSS from compile-css-modules.cjs.

const fs = require("node:fs");

const LAYER = "once-ui";
const OPEN = `@layer ${LAYER} {`;

/**
 * `css` inside `@layer once-ui { … }`. `@charset`
 * and `@import` must come before any other rule, so they stay in front.
 * Already wrapped CSS comes back unchanged.
 */
function wrap(css) {
  if (css.includes(`${OPEN}\n`)) return css;
  // Compressed Sass marks non-ASCII output with a byte-order mark instead
  // of `@charset`; it has to stay the first thing in the file.
  let head = css.startsWith("\uFEFF") ? "\uFEFF" : "";
  let body = css.slice(head.length);
  for (;;) {
    const match = body.match(/^\s*(@charset\s+"[^"]*";|@import\s[^;]*;)/);
    if (!match) break;
    head += `${match[1]}\n`;
    body = body.slice(match[0].length);
  }
  // A source map comment has to stay last, outside the block.
  let tail = "";
  const map = body.match(/\s*(\/\*# sourceMappingURL=[^*]*\*\/)\s*$/);
  if (map) {
    tail = `${map[1]}\n`;
    body = body.slice(0, map.index);
  }
  return `${head}${OPEN}\n${body.replace(/^\s+|\s+$/g, "")}\n}\n${tail}`;
}

/**
 * Wraps a file in place. Its source map, if Sass wrote one next to it, moves
 * down the line the wrapper adds in front.
 */
function wrapFile(file) {
  const css = fs.readFileSync(file, "utf8");
  const next = wrap(css);
  if (next === css) return;
  fs.writeFileSync(file, next);
  const mapFile = `${file}.map`;
  if (fs.existsSync(mapFile)) {
    const map = JSON.parse(fs.readFileSync(mapFile, "utf8"));
    const before = (css.match(/^\s*/)[0].match(/\n/g) ?? []).length;
    const added = next.slice(0, next.indexOf("{\n") + 2).split("\n").length - 1 - before;
    map.mappings = ";".repeat(added) + map.mappings;
    fs.writeFileSync(mapFile, JSON.stringify(map));
  }
}

module.exports = { wrap, wrapFile, LAYER };

if (require.main === module) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: node scripts/css-layers.cjs <file.css>...");
    process.exit(1);
  }
  for (const file of files) wrapFile(file);
  console.log(`css-layers: ${files.length} file(s) in @layer ${LAYER}`);
}

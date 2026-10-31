// Puts Once UI's shipped CSS in cascade layers (3.0).
//
// An app's own CSS is unlayered, and unlayered styles beat every layer
// whatever their specificity, so an app's `.card { padding: 0 }` or a Tailwind
// utility overrides a Once UI style without `!important` or a longer selector.
//
// Every file starts with the same order statement, so the order holds however
// an app's bundler orders the files (the docs import styles.css before
// tokens.css): tokens, then the global and utility styles, then components,
// the order the files have always loaded in.
//
//   node scripts/css-layers.cjs <layer> <file.css>...   wrap files in place
//
// `@once-ui-system/core`, `fx` and `blocks` call `wrap` on their compiled CSS
// modules from compile-css-modules.cjs.

const fs = require("node:fs");

const ORDER = "@layer once-ui.tokens, once-ui.styles, once-ui.components;";
const LAYERS = ["once-ui.tokens", "once-ui.styles", "once-ui.components"];

/**
 * `css` inside `@layer <layer> { … }`, after the order statement. `@charset`
 * and `@import` must come before any other rule, so they stay in front.
 * Already wrapped CSS comes back unchanged.
 */
function wrap(css, layer) {
  if (!LAYERS.includes(layer)) throw new Error(`css-layers: unknown layer ${layer}`);
  if (css.startsWith(ORDER) || css.includes(`\n${ORDER}`)) return css;
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
  return `${head}${ORDER}\n@layer ${layer} {\n${body.replace(/^\s+|\s+$/g, "")}\n}\n${tail}`;
}

/**
 * Wraps a file in place. Its source map, if Sass wrote one next to it, moves
 * down the two lines the wrapper adds in front.
 */
function wrapFile(file, layer) {
  const css = fs.readFileSync(file, "utf8");
  const next = wrap(css, layer);
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

module.exports = { wrap, wrapFile, ORDER, LAYERS };

if (require.main === module) {
  const [layer, ...files] = process.argv.slice(2);
  if (!layer || files.length === 0) {
    console.error("Usage: node scripts/css-layers.cjs <layer> <file.css>...");
    process.exit(1);
  }
  for (const file of files) wrapFile(file, layer);
  console.log(`css-layers: ${files.length} file(s) in @layer ${layer}`);
}

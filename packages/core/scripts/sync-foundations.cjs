const fs = require("fs");
const path = require("path");

// Syncs build inputs/outputs from @once-ui-system/foundations into this
// package (Once UI 2.0 Phase 1 — rfcs/2026-08-once-ui-2-architecture.md §7).
//
//   scss: copies breakpoints.scss into src/styles/ (gitignored) so the
//         component .module.scss files resolve their relative
//         `../styles/breakpoints.scss` import when compile-css-modules.cjs
//         compiles them (it is not shipped; 3.0 ships the compiled CSS only).
//   css:  copies foundations' compiled tokens.css/styles.css into dist/css/
//         so the deprecated `@once-ui-system/core/css/*.css` entries keep
//         working for one major.

const foundationsRoot = path.dirname(require.resolve("@once-ui-system/foundations/package.json"));

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

const mode = process.argv[2];

if (mode === "scss") {
  copy(
    path.join(foundationsRoot, "scss", "styles", "breakpoints.scss"),
    path.join(__dirname, "..", "src", "styles", "breakpoints.scss"),
  );
  console.log("Synced breakpoints.scss from @once-ui-system/foundations");
} else if (mode === "css") {
  for (const file of ["tokens.css", "styles.css"]) {
    copy(
      path.join(foundationsRoot, "dist", "css", file),
      path.join(__dirname, "..", "dist", "css", file),
    );
  }
  console.log("Copied foundations CSS into dist/css (deprecated compat entries)");
} else {
  console.error("Usage: node scripts/sync-foundations.cjs <scss|css>");
  process.exit(1);
}

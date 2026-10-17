const fs = require("fs");
const path = require("path");

// Syncs build inputs/outputs from @once-ui-system/foundations into this
// package (Once UI 2.0 Phase 1 — rfcs/2026-08-once-ui-2-architecture.md §7).
//
//   scss: copies breakpoints.scss and touch.scss into src/styles/
//         (gitignored) so the shipped component .module.scss files keep
//         resolving their relative `../styles/*.scss` imports inside dist/.
//   css:  copies foundations' compiled tokens.css/styles.css into dist/css/
//         so the deprecated `@once-ui-system/core/css/*.css` entries keep
//         working for one major, and the token export (tokens.json, the
//         same tokens as JSON for platforms without CSS) into dist/.

const foundationsRoot = path.dirname(require.resolve("@once-ui-system/foundations/package.json"));

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

const mode = process.argv[2];

if (mode === "scss") {
  for (const file of ["breakpoints.scss", "touch.scss"]) {
    copy(
      path.join(foundationsRoot, "scss", "styles", file),
      path.join(__dirname, "..", "src", "styles", file),
    );
  }
  console.log("Synced breakpoints.scss and touch.scss from @once-ui-system/foundations");
} else if (mode === "css") {
  for (const file of ["tokens.css", "styles.css"]) {
    copy(
      path.join(foundationsRoot, "dist", "css", file),
      path.join(__dirname, "..", "dist", "css", file),
    );
  }
  copy(
    path.join(foundationsRoot, "tokens", "once-ui.tokens.json"),
    path.join(__dirname, "..", "dist", "tokens.json"),
  );
  console.log("Copied foundations CSS into dist/css (deprecated compat entries) and tokens.json");
} else {
  console.error("Usage: node scripts/sync-foundations.js <scss|css>");
  process.exit(1);
}

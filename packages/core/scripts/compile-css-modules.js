const fs = require("node:fs");
const path = require("node:path");

// Precompiles the components' Sass modules, so an app needs no Sass to use
// Once UI (ROADMAP.md W11).
//
// For every `src/**/*.module.scss` this writes `dist/**/*.module.css`, with
// the Sass resolved: `@use`, mixins, nesting, interpolation and `if()`. Then
// it points the compiled JS at it: `import styles from "./Button.module.scss"`
// becomes `"./Button.module.css"`.
//
// The output is still a CSS module. Scoping it (hashed class names, local
// `@keyframes`, `:global`, `composes`) stays the consumer's bundler's job, as
// it was after their Sass step; Next.js, Vite, webpack, Turbopack, Parcel and
// Remotion handle `.module.css` with no setup. The Sass is compiled exactly as
// sass-loader would compile it in development (expanded, comments kept), so
// the CSS the bundler receives is the same text it received before.
//
// The `.module.scss` sources keep shipping beside the CSS: nothing leaves the
// tarball, and `pnpm dev` (`tsc --watch`, which re-emits the `.scss` imports)
// keeps working in the workspace apps, which install `sass` themselves.
//
// The build fails if a module does not compile, if an import would point at
// CSS that was not written, or if any emitted file still imports Sass.

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");

// `sass` is this package's optional peer, installed here by the workspace; the
// foundations package compiles the tokens with the same one.
const foundationsRoot = path.dirname(require.resolve("@once-ui-system/foundations/package.json"));
const sass = require(require.resolve("sass", { paths: [ROOT, foundationsRoot] }));

// A relative module specifier in an import, a re-export, a dynamic import or a
// require. `$1` is the keyword, `$2` the quote, `$3` the path before `.module`.
const SCSS_MODULE_IMPORT =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(["'])(\.{1,2}\/[^"'\n]+?)\.module\.scss\2/g;
const ANY_SASS_IMPORT =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(["'])[^"'\n]+\.s[ac]ss\2/;

// Folders copied into dist that hold no package code: the CLIs and the harness.
const NOT_CODE = new Set(["ai", "agent", "scripts"].map((dir) => path.join(DIST, dir)));

function walk(dir, keep, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!NOT_CODE.has(full)) walk(full, keep, files);
    } else if (keep(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const rel = (file) => path.relative(ROOT, file);
const failures = [];

// 1. Compile every Sass module next to where its JS lands.
const modules = walk(SRC, (name) => name.endsWith(".module.scss"));
const warnings = [];

for (const file of modules) {
  const out = path.join(DIST, path.relative(SRC, file)).replace(/\.scss$/, ".css");
  const sibling = file.replace(/\.scss$/, ".css");
  if (fs.existsSync(sibling)) {
    failures.push(`${rel(file)}: ${rel(sibling)} already exists and would be overwritten`);
    continue;
  }
  try {
    const { css } = sass.compile(file, {
      style: "expanded",
      logger: {
        warn(message, { span }) {
          const line = span ? `:${span.start.line + 1}` : "";
          warnings.push(`${rel(file)}${line}: ${message.split("\n")[0]}`);
        },
        debug() {},
      },
    });
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, `${css}\n`);
  } catch (error) {
    failures.push(`${rel(file)}: ${error.message}`);
  }
}

// 2. Point the emitted JS at the compiled CSS.
let rewritten = 0;
for (const file of walk(DIST, (name) => name.endsWith(".js"))) {
  const source = fs.readFileSync(file, "utf8");
  const next = source.replace(SCSS_MODULE_IMPORT, (_, keyword, quote, specifier) => {
    const target = path.resolve(path.dirname(file), `${specifier}.module.css`);
    if (!fs.existsSync(target)) {
      failures.push(
        `${rel(file)}: imports ${specifier}.module.scss, but ${rel(target)} was not written`,
      );
    }
    rewritten += 1;
    return `${keyword}${quote}${specifier}.module.css${quote}`;
  });
  if (next !== source) fs.writeFileSync(file, next);
}

// 3. Nothing the package runs may still need Sass.
for (const file of walk(DIST, (name) => name.endsWith(".js") || name.endsWith(".d.ts"))) {
  const match = fs.readFileSync(file, "utf8").match(ANY_SASS_IMPORT);
  if (match) failures.push(`${rel(file)}: still imports Sass (${match[0]})`);
}

for (const warning of new Set(warnings)) {
  console.warn(`compile-css-modules: warning: ${warning}`);
}
if (failures.length > 0) {
  for (const failure of failures) console.error(`compile-css-modules: ${failure}`);
  process.exit(1);
}
console.log(
  `Compiled ${modules.length} Sass modules to CSS and repointed ${rewritten} imports in dist`,
);

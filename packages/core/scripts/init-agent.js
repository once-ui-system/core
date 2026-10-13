#!/usr/bin/env node
/**
 * Scaffold agent harness pointers in a consumer project.
 * Usage: npx once-ui-init-agent [--force] [--dry-run]
 *
 * Writes the Once UI harness section into AGENTS.md (read by Codex, Cursor,
 * Copilot, Gemini CLI, Zed and most other agents) and CLAUDE.md (read by
 * Claude Code, which does not read AGENTS.md), plus a Cursor rule. The section
 * sits between markers, so an existing file keeps everything else and a rerun
 * changes nothing; `--force` replaces a section already there. A CLAUDE.md
 * that already imports AGENTS.md (`@AGENTS.md`) is left alone, since it would
 * load the section twice.
 */

const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_ROOT = path.join(__dirname, "..");
const MARKER_START = "<!-- once-ui-agent-harness:start -->";
const MARKER_END = "<!-- once-ui-agent-harness:end -->";

const PROJECT_AGENTS_SECTION = `${MARKER_START}
## Once UI codegen harness

Before generating Once UI code, load the harness from your installed package (not full doc pages):

1. Read \`node_modules/@once-ui-system/core/ai/manifest.json\`
2. Load bootstrap: \`ai/rules.compact.md\` + \`ai/catalog.json\`
3. Match intent via \`ai/tasks/index.json\` → fetch task bundle + component slices
4. Validate: \`npx once-ui-validate-ai-code path/to/file.tsx\`

In a Next.js app, import \`LayoutProvider\` from \`@once-ui-system/core/next\`, not the package root —
the root export renders links and images as plain \`<a>\` and \`<img>\`.

npm exports: \`@once-ui-system/core/ai/manifest.json\`

Remote fallback: https://docs.once-ui.com/ai/manifest.json
${MARKER_END}
`;

function parseArgs(argv) {
  return {
    force: argv.includes("--force"),
    dryRun: argv.includes("--dry-run"),
  };
}

function findProjectRoot(startDir = process.cwd()) {
  let dir = path.resolve(startDir);

  while (true) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        if (pkg.name !== "@once-ui-system/core") {
          return dir;
        }
      } catch {
        // keep walking
      }
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  return path.resolve(startDir);
}

function upsertMarkedSection(existing, section, force, title = "AGENTS.md") {
  if (existing.includes(MARKER_START) && existing.includes(MARKER_END)) {
    if (!force) {
      return {
        content: existing,
        changed: false,
        reason: `${title} already contains Once UI harness section`,
      };
    }

    const start = existing.indexOf(MARKER_START);
    const end = existing.indexOf(MARKER_END) + MARKER_END.length;
    // The section ends in a newline and so did what followed the old one;
    // keep one of them, or every --force run adds a blank line.
    const rest = existing.slice(end).replace(/^\r?\n/, "");
    return {
      content: `${existing.slice(0, start)}${section}${rest}`,
      changed: true,
    };
  }

  if (existing.trim().length === 0) {
    return {
      content: `# ${title}\n\n${section}`,
      changed: true,
    };
  }

  return {
    content: `${existing.trimEnd()}\n\n${section}`,
    changed: true,
  };
}

/** Does this CLAUDE.md already pull AGENTS.md in through an import? */
function importsAgentsMd(content) {
  return /^\s*@(?:\.\/)?AGENTS\.md\s*$/m.test(content);
}

/**
 * Write `content` to `relativePath`. A whole file the tool owns (the Cursor
 * rule) is never overwritten without `--force`; a marked-section upsert
 * (`upsert: true`) only ever adds or replaces its own section, so it writes.
 */
function writeFile(root, relativePath, content, { dryRun, force, upsert = false }) {
  const target = path.join(root, relativePath);
  const exists = fs.existsSync(target);

  if (exists) {
    const current = fs.readFileSync(target, "utf8");
    if (current === content) {
      return { path: target, status: "unchanged" };
    }
    if (!force && !upsert) {
      return { path: target, status: "skipped", reason: "already exists (use --force)" };
    }
  }

  if (dryRun) {
    return { path: target, status: "would-write" };
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  return { path: target, status: exists ? "updated" : "created" };
}

/** Upsert the harness section into one instructions file at the project root. */
function writeInstructions(projectRoot, file, options) {
  const target = path.join(projectRoot, file);
  const existing = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";

  if (file === "CLAUDE.md" && importsAgentsMd(existing)) {
    return { path: target, status: "unchanged", reason: "CLAUDE.md already imports AGENTS.md" };
  }

  const result = upsertMarkedSection(existing, PROJECT_AGENTS_SECTION, options.force, file);
  if (!result.changed) {
    return { path: target, status: "unchanged", reason: result.reason };
  }
  return writeFile(projectRoot, file, result.content, { ...options, upsert: true });
}

function run({ cwd = process.cwd(), force = false, dryRun = false } = {}) {
  const options = { force, dryRun };
  const projectRoot = findProjectRoot(cwd);
  const cursorRuleTemplate = fs.readFileSync(
    path.join(PACKAGE_ROOT, "agent", "once-ui-codegen.mdc"),
    "utf8",
  );

  const results = [
    writeInstructions(projectRoot, "AGENTS.md", options),
    writeInstructions(projectRoot, "CLAUDE.md", options),
    writeFile(projectRoot, ".cursor/rules/once-ui-codegen.mdc", cursorRuleTemplate, options),
  ];
  return { projectRoot, results };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const { projectRoot, results } = run(options);

  console.log(`Once UI agent harness setup (${options.dryRun ? "dry run" : "applied"})`);
  console.log(`Project root: ${projectRoot}`);
  for (const result of results) {
    const suffix = result.reason ? ` (${result.reason})` : "";
    console.log(`- ${result.status}: ${path.relative(projectRoot, result.path)}${suffix}`);
  }

  if (!options.dryRun) {
    console.log(
      "\nNext: open a .tsx file and ask your agent to build Once UI — it should load the harness from node_modules/@once-ui-system/core/ai/",
    );
  }
}

// Importable for tests; the CLI runs only when this file is invoked directly.
if (require.main === module) main();

module.exports = {
  MARKER_START,
  MARKER_END,
  PROJECT_AGENTS_SECTION,
  findProjectRoot,
  importsAgentsMd,
  run,
  upsertMarkedSection,
  writeFile,
};

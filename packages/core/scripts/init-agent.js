#!/usr/bin/env node
/**
 * Scaffold agent harness pointers in a consumer project.
 * Usage: npx once-ui-init-agent [--force] [--dry-run]
 */

const fs = require("fs");
const path = require("path");

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

function upsertMarkedSection(existing, section, force) {
  if (existing.includes(MARKER_START) && existing.includes(MARKER_END)) {
    if (!force) {
      return { content: existing, changed: false, reason: "AGENTS.md already contains Once UI harness section" };
    }

    const start = existing.indexOf(MARKER_START);
    const end = existing.indexOf(MARKER_END) + MARKER_END.length;
    return {
      content: `${existing.slice(0, start)}${section}${existing.slice(end)}`,
      changed: true,
    };
  }

  if (existing.trim().length === 0) {
    return {
      content: `# AGENTS.md\n\n${section}\n`,
      changed: true,
    };
  }

  return {
    content: `${existing.trimEnd()}\n\n${section}\n`,
    changed: true,
  };
}

function writeFile(root, relativePath, content, { dryRun, force }) {
  const target = path.join(root, relativePath);
  const exists = fs.existsSync(target);

  if (exists && !force) {
    const current = fs.readFileSync(target, "utf8");
    if (current === content) {
      return { path: target, status: "unchanged" };
    }
    return { path: target, status: "skipped", reason: "already exists (use --force)" };
  }

  if (dryRun) {
    return { path: target, status: "would-write" };
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  return { path: target, status: exists ? "updated" : "created" };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const projectRoot = findProjectRoot();
  const cursorRuleTemplate = fs.readFileSync(
    path.join(PACKAGE_ROOT, "agent", "once-ui-codegen.mdc"),
    "utf8",
  );

  const agentsPath = path.join(projectRoot, "AGENTS.md");
  let agentsContent = "";
  if (fs.existsSync(agentsPath)) {
    agentsContent = fs.readFileSync(agentsPath, "utf8");
  }

  const agentsResult = upsertMarkedSection(agentsContent, PROJECT_AGENTS_SECTION, options.force);
  const results = [];

  if (agentsResult.changed) {
    results.push(
      writeFile(projectRoot, "AGENTS.md", agentsResult.content, options),
    );
  } else {
    results.push({
      path: agentsPath,
      status: "unchanged",
      reason: agentsResult.reason,
    });
  }

  results.push(
    writeFile(projectRoot, ".cursor/rules/once-ui-codegen.mdc", cursorRuleTemplate, options),
  );

  console.log(`Once UI agent harness setup (${options.dryRun ? "dry run" : "applied"})`);
  console.log(`Project root: ${projectRoot}`);
  for (const result of results) {
    const suffix = result.reason ? ` (${result.reason})` : "";
    console.log(`- ${result.status}: ${path.relative(projectRoot, result.path)}${suffix}`);
  }

  if (!options.dryRun) {
    console.log("\nNext: open a .tsx file and ask your agent to build Once UI — it should load the harness from node_modules/@once-ui-system/core/ai/");
  }
}

main();

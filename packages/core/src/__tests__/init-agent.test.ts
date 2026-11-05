import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { run, MARKER_START, MARKER_END } = require("../../scripts/init-agent.cjs");

type Result = { path: string; status: string; reason?: string };

/** A throwaway consumer project with a package.json and the given files. */
function project(files: Record<string, string> = {}): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "once-ui-init-agent-"));
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "app" }));
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  }
  return dir;
}

const read = (dir: string, file: string) => fs.readFileSync(path.join(dir, file), "utf8");
const statusOf = (results: Result[], file: string) =>
  results.find((r) => path.basename(r.path) === file)?.status;
const sections = (text: string) => text.split(MARKER_START).length - 1;

describe("once-ui-init-agent", () => {
  it("writes AGENTS.md, CLAUDE.md and the Cursor rule in a fresh project", () => {
    const dir = project();
    const { results } = run({ cwd: dir });
    expect(statusOf(results, "AGENTS.md")).toBe("created");
    expect(statusOf(results, "CLAUDE.md")).toBe("created");
    expect(statusOf(results, "once-ui-codegen.mdc")).toBe("created");

    // Claude Code reads CLAUDE.md, not AGENTS.md, so it gets the section too.
    for (const file of ["AGENTS.md", "CLAUDE.md"]) {
      const text = read(dir, file);
      expect(text.startsWith(`# ${file}`)).toBe(true);
      expect(text).toContain(MARKER_START);
      expect(text).toContain(MARKER_END);
      expect(text).toContain("ai/manifest.json");
    }
  });

  it("points a Next.js app at the /next LayoutProvider", () => {
    const dir = project();
    run({ cwd: dir });
    for (const file of ["AGENTS.md", "CLAUDE.md", ".cursor/rules/once-ui-codegen.mdc"]) {
      expect(read(dir, file)).toContain("@once-ui-system/core/next");
    }
  });

  it("appends to existing instructions without --force, keeping what is there", () => {
    const dir = project({
      "AGENTS.md": "# Project rules\n\nUse pnpm.\n",
      "CLAUDE.md": "# Claude\n\nRun the tests.\n",
    });
    const { results } = run({ cwd: dir });
    expect(statusOf(results, "AGENTS.md")).toBe("updated");
    expect(statusOf(results, "CLAUDE.md")).toBe("updated");
    expect(read(dir, "AGENTS.md")).toMatch(/^# Project rules\n\nUse pnpm\.\n\n<!-- once-ui/);
    expect(read(dir, "CLAUDE.md")).toMatch(/^# Claude\n\nRun the tests\.\n\n<!-- once-ui/);
  });

  it("changes nothing on a second run", () => {
    const dir = project();
    run({ cwd: dir });
    const before = read(dir, "AGENTS.md");
    const { results } = run({ cwd: dir });
    expect(results.map((r: Result) => r.status)).toEqual(["unchanged", "unchanged", "unchanged"]);
    expect(read(dir, "AGENTS.md")).toBe(before);
  });

  it("replaces the section in place under --force, once", () => {
    const dir = project({
      "AGENTS.md": `# Rules\n\n${MARKER_START}\nold\n${MARKER_END}\n\n## After\n`,
    });
    run({ cwd: dir, force: true });
    run({ cwd: dir, force: true });
    const text = read(dir, "AGENTS.md");
    expect(sections(text)).toBe(1);
    expect(text).not.toContain("\nold\n");
    expect(text).toMatch(/<!-- once-ui-agent-harness:end -->\n\n## After\n$/);
  });

  it("leaves a CLAUDE.md that already imports AGENTS.md alone", () => {
    const dir = project({ "CLAUDE.md": "# Claude\n\n@AGENTS.md\n" });
    const { results } = run({ cwd: dir });
    expect(statusOf(results, "CLAUDE.md")).toBe("unchanged");
    expect(read(dir, "CLAUDE.md")).toBe("# Claude\n\n@AGENTS.md\n");
    expect(sections(read(dir, "AGENTS.md"))).toBe(1);
  });

  it("writes nothing on --dry-run", () => {
    const dir = project();
    const { results } = run({ cwd: dir, dryRun: true });
    expect(results.map((r: Result) => r.status)).toEqual([
      "would-write",
      "would-write",
      "would-write",
    ]);
    expect(fs.existsSync(path.join(dir, "AGENTS.md"))).toBe(false);
    expect(fs.existsSync(path.join(dir, "CLAUDE.md"))).toBe(false);
  });

  it("does not overwrite a Cursor rule the project changed, unless forced", () => {
    const dir = project({ ".cursor/rules/once-ui-codegen.mdc": "custom\n" });
    expect(statusOf(run({ cwd: dir }).results, "once-ui-codegen.mdc")).toBe("skipped");
    expect(read(dir, ".cursor/rules/once-ui-codegen.mdc")).toBe("custom\n");
    expect(statusOf(run({ cwd: dir, force: true }).results, "once-ui-codegen.mdc")).toBe("updated");
  });
});

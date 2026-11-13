import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The agent harness under ai/ follows core's (packages/core/ai): one
 * Markdown bundle per task that an agent reads in a single step, so these
 * hold it to the same limits as core's ai-bundles test.
 */
const ROOT = path.join(__dirname, "..");
const AI = path.join(ROOT, "ai");
const read = (file: string) => JSON.parse(readFileSync(path.join(AI, file), "utf8"));
const index = read("tasks/index.json") as { tasks: { id: string; file: string }[] };
const catalog = read("catalog.json") as { components: Record<string, unknown> };
const gotchas = read("gotchas.json") as Record<string, unknown>;

describe("native agent harness", () => {
  it("is generated from the current source", () => {
    expect(() =>
      execFileSync(process.execPath, [path.join(ROOT, "scripts/generate-ai.cjs"), "--check"], {
        stdio: "pipe",
      }),
    ).not.toThrow();
  });

  it.each(readdirSync(path.join(AI, "bundles")))("%s fits in one read", (file) => {
    expect(statSync(path.join(AI, "bundles", file)).size).toBeLessThan(50_000);
  });

  it("keeps the catalog small enough to load on every task", () => {
    expect(statSync(path.join(AI, "catalog.json")).size).toBeLessThan(25_000);
  });

  it.each(index.tasks.map((t) => [t.id, t.file] as const))(
    "%s names only components and gotchas that exist, and has an example",
    (id, file) => {
      const task = read(file) as { components: string[]; gotchas?: string[]; example: string };
      expect(task.components.filter((name) => !catalog.components[name])).toEqual([]);
      expect((task.gotchas ?? []).filter((name) => !gotchas[name])).toEqual([]);
      const bundle = readFileSync(path.join(AI, "bundles", `${id}.md`), "utf8");
      for (const name of task.components) expect(bundle).toContain(`### ${name}\n`);
      expect(bundle).toContain(`## Gold example (\`${task.example}\`)`);
    },
  );

  it("never teaches a web-only import or a 2.x state name in the examples", () => {
    for (const file of readdirSync(path.join(AI, "examples"))) {
      const code = readFileSync(path.join(AI, "examples", file), "utf8");
      expect(code, file).not.toMatch(/@once-ui-system\/core|className=|onToggle=|isChecked=/);
    }
  });
});

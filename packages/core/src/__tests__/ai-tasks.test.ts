import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import gotchas from "../../ai/gotchas.json";
import spec from "../../ai/spec.json";

/**
 * Every path and name a task bundle hands an agent has to exist. The chat
 * bundle named `examples/chat.tsx`, which was never written, and nothing
 * noticed: an agent that followed it read a 404.
 */
const AI = path.join(__dirname, "..", "..", "ai");
const read = (file: string) => JSON.parse(readFileSync(path.join(AI, file), "utf8"));

type Task = {
  id: string;
  components: string[];
  example?: string;
  gotchas?: string[];
  layout?: string | string[];
  blocks?: { manifest?: string; primary?: string[]; compose?: string[]; patterns?: string[] };
};

const index = read("tasks/index.json") as { tasks: { id: string; file: string }[] };
const tasks = index.tasks.map((entry) => ({ entry, task: read(entry.file) as Task }));
const components = spec.components as unknown as Record<string, unknown>;
const blockIds = new Set(
  (read("examples/blocks/manifest.json") as { blocks: { id: string }[] }).blocks.map((b) => b.id),
);

describe("ai task bundles", () => {
  it("indexes every bundle in tasks/, under its own id", () => {
    const files = readdirSync(path.join(AI, "tasks")).filter((f) => f !== "index.json");
    expect(index.tasks.map((t) => t.file.replace("tasks/", "")).sort()).toEqual(files.sort());
    for (const { entry, task } of tasks) expect(task.id).toBe(entry.id);
  });

  it.each(tasks.map(({ task }) => [task.id, task] as const))(
    "%s names only components the spec has",
    (_, task) => {
      expect(task.components.filter((name) => !components[name])).toEqual([]);
    },
  );

  it.each(tasks.map(({ task }) => [task.id, task] as const))(
    "%s points at an example, gotchas and blocks that exist",
    (_, task) => {
      if (task.example) expect(existsSync(path.join(AI, task.example))).toBe(true);
      const known = gotchas as Record<string, unknown>;
      expect((task.gotchas ?? []).filter((id) => !known[id])).toEqual([]);
      const named = [
        ...(task.blocks?.primary ?? []),
        ...(task.blocks?.compose ?? []),
        ...(task.blocks?.patterns ?? []),
      ];
      const missing = named.filter(
        (id) => !blockIds.has(id) && !existsSync(path.join(AI, "examples", "blocks", `${id}.tsx`)),
      );
      expect(missing).toEqual([]);
      for (const ref of [task.layout ?? []].flat()) {
        const [file, anchor] = ref.split("#");
        const text = readFileSync(path.join(AI, file), "utf8");
        const slugs = [...text.matchAll(/^#+\s+(.*)$/gm)].map((m) =>
          m[1]
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-"),
        );
        expect(slugs).toContain(anchor);
      }
    },
  );
});

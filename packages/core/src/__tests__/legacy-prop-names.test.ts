import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * 2.0 renamed `height` to `size` on the field components and dropped
 * `Skeleton`'s own `width`/`height` scale in favour of `size` (the height of a
 * line, the diameter of a circle). The codemod rewrites consumer trees, but
 * core's own call sites were never run through it, so `Table`'s page-size
 * `Select` kept `height="xs"` and `User`'s skeleton kept `height="m"` — both
 * now land on the Flex layout prop of the same name, where "xs" and "m" are
 * spacing tokens. The result was a 2rem-wide select and a skeleton the size
 * of its container. This pins every internal call site to the 2.0 names.
 */
const TSHIRT = /["'](?:xs|s|m|l|xl)["']/;
const FIELDS =
  /<(?:Input|Textarea|Select|NumberInput|TagInput|ColorInput|DateInput|DateRangeInput|PasswordInput|OTPInput)\b/;

function* sources(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sources(full);
    else if (/\.tsx$/.test(entry.name) && !entry.name.includes(".test.")) yield full;
  }
}

function tags(src: string, open: RegExp): { tag: string; line: number }[] {
  const out: { tag: string; line: number }[] = [];
  const re = new RegExp(`${open.source}[^>]*>`, "g");
  for (const m of src.matchAll(re)) {
    out.push({ tag: m[0], line: src.slice(0, m.index).split("\n").length });
  }
  return out;
}

describe("core uses its own 2.0 prop names", () => {
  const root = path.resolve(__dirname, "..");
  const files = [...sources(path.join(root, "components")), ...sources(path.join(root, "modules"))];

  it("no field component is sized with the 1.8 height prop", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      for (const { tag, line } of tags(src, FIELDS)) {
        const height = tag.match(/\sheight=(\{?["'][^"']*["']\}?)/);
        if (height && TSHIRT.test(height[1])) offenders.push(`${path.basename(file)}:${line}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("no Skeleton is sized with the 1.8 height or width scale", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      for (const { tag, line } of tags(src, /<Skeleton\b/)) {
        const height = tag.match(/\sheight=(\{?["'][^"']*["']\}?)/);
        const width = tag.match(/\swidth=(\{?["'][^"']*["']\}?)/);
        if ((height && TSHIRT.test(height[1])) || (width && TSHIRT.test(width[1]))) {
          offenders.push(`${path.basename(file)}:${line}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

import fs from "node:fs";
import path from "node:path";
import * as core from "@once-ui-system/core";
import { describe, expect, it } from "vitest";
import * as fx from "../index.js";
import { ParticleFx } from "../ParticleFx.js";

/**
 * 2.0 renamed `Particle` to `ParticleFx`, like the other effects, and 3.0
 * removed the deprecated alias. Neither package exports it, and nothing here
 * uses the old name.
 */
describe("ParticleFx", () => {
  it("exports only the new name", () => {
    expect("Particle" in fx).toBe(false);
    expect("Particle" in core).toBe(false);
    expect(ParticleFx.displayName).toBe("ParticleFx");
  });

  it("is not used under its deprecated name", () => {
    const root = path.resolve(__dirname, "..");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "__tests__") walk(full);
        } else if (/\.tsx?$/.test(entry.name) && entry.name !== "ParticleFx.tsx") {
          if (/<Particle\b|\bParticle\s*[,}]/.test(fs.readFileSync(full, "utf8"))) {
            offenders.push(path.relative(root, full));
          }
        }
      }
    };
    walk(root);
    expect(offenders).toEqual([]);
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Particle, ParticleFx } from "../components/ParticleFx";

/**
 * 2.0 renamed `Particle` to `ParticleFx`, like the other effects, and kept the
 * old name as a deprecated alias so no consumer breaks before 3.0. The alias has
 * to stay the same component, not a copy, and core itself should only use the
 * new name, or the deprecation would be advertised by its own call sites.
 */
describe("ParticleFx", () => {
  it("keeps Particle as an alias of the same component", () => {
    expect(Particle).toBe(ParticleFx);
    expect(ParticleFx.displayName).toBe("ParticleFx");
  });

  it("is not used under its deprecated name inside core", () => {
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

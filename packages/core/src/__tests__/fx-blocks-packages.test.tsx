import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import catalog from "../../ai/catalog.json";
import manifest from "../../ai/manifest.json";
import spec from "../../ai/spec.json";
import { LayoutProvider } from "../contexts/LayoutProvider";
import * as core from "../index";
import { CodeBlock } from "../modules/code/CodeBlock";

/**
 * 3.0, F8 and F10: the sixteen effects are `@once-ui-system/fx` and six
 * compositions `@once-ui-system/blocks`, packages of their own built on core.
 * Core's root no longer has them and imports none of them (CodeBlock's
 * `styleButton`, which rendered StyleOverlay, is the `actions` slot), and the
 * harness still documents them, each with its package as `importFrom`, so an
 * agent can find them and knows to install the package.
 */
const FX = [
  "BlobFx",
  "CelebrationFx",
  "CountdownFx",
  "CountFx",
  "Effect",
  "FlipFx",
  "GlitchFx",
  "HoloFx",
  "LetterFx",
  "MatrixFx",
  "ParticleFx",
  "RevealFx",
  "ShineFx",
  "TiltFx",
  "TypeFx",
  "WeatherFx",
];
const BLOCKS = ["Banner", "Book", "LogoCloud", "ScrollToTop", "StyleOverlay", "StylePanel"];
/** The page sections, new in blocks with 3.0 (never in core). */
const SECTIONS = [
  "AboutSection",
  "ContactSection",
  "CtaSection",
  "FaqSection",
  "FeaturesSection",
  "HeroSection",
  "LogosSection",
  "PricingSection",
  "Sections",
  "StatsSection",
  "TeamSection",
  "TestimonialsSection",
];
const PACKAGES = [
  ["@once-ui-system/fx", FX],
  ["@once-ui-system/blocks", [...BLOCKS, ...SECTIONS]],
] as const;

type Entry = { group: string; importFrom?: string };
type Row = { use: string; install?: string; exports?: string[]; types?: string[] };
const components = spec.components as unknown as Record<string, Entry>;
const imports = (manifest as unknown as { imports: Record<string, Row> }).imports;
const catalogEntries = (catalog as unknown as { components: Record<string, Entry> }).components;
const slice = (name: string) =>
  JSON.parse(
    readFileSync(path.join(__dirname, "..", "..", "ai", "components", `${name}.json`), "utf8"),
  );

describe("core's root", () => {
  it.each([...FX, ...BLOCKS, "useStylePanel"])("no longer exports %s", (name) => {
    expect(name in core).toBe(false);
  });

  it("renders CodeBlock actions in its header, where styleButton was", async () => {
    const wrap = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );
    render(
      <CodeBlock
        actions={<button type="button">Style</button>}
        codes={[{ code: "const a = 1;", language: "tsx", label: "Example" }]}
      />,
      { wrapper: wrap },
    );
    // CodeBlock loads its implementation (and prismjs) lazily.
    expect(await screen.findByText("Style", {}, { timeout: 5000 })).toBeInTheDocument();
  });
});

describe.each(PACKAGES)("the harness documents %s", (pkg, names) => {
  it.each(names)("%s, with the package as importFrom in the spec, slice and catalog", (name) => {
    expect(components[name]?.importFrom).toBe(pkg);
    expect(components[name]?.group).toBe(pkg.split("/")[1]);
    expect(slice(name).importFrom).toBe(pkg);
    expect(catalogEntries[name]?.importFrom).toBe(pkg);
  });

  it("lists the package in the manifest's imports, to install", () => {
    expect(imports[pkg]?.install).toBe(pkg);
    expect([...(imports[pkg]?.exports ?? [])].filter((n) => /^[A-Z]/.test(n)).sort()).toEqual(
      [...names].sort(),
    );
  });
});

describe("the validator", () => {
  const require = createRequire(import.meta.url);
  const { validate, loadSpec, parseIconNames } = require("../../scripts/validate-ai-code.cjs");
  const loaded = loadSpec();
  const rules = (source: string): string[] =>
    validate(source, loaded, parseIconNames(loaded), {}).map(
      (issue: { rule: string; message: string }) => `${issue.rule}: ${issue.message}`,
    );

  it("flags an effect or a block imported from core's root", () => {
    const found = rules(
      `import { Column, RevealFx, useStylePanel } from "@once-ui-system/core";\n<Column />;\n`,
    );
    expect(found.filter((r) => r.startsWith("imports.package"))).toEqual([
      expect.stringContaining("RevealFx is in @once-ui-system/fx since 3.0"),
      expect.stringContaining("useStylePanel is in @once-ui-system/blocks since 3.0"),
    ]);
  });

  it("accepts them from their packages, and core's own names from the root", () => {
    const found = rules(
      `import { Column } from "@once-ui-system/core";\nimport { RevealFx } from "@once-ui-system/fx";\nimport { StylePanel } from "@once-ui-system/blocks";\n`,
    );
    expect(found.filter((r) => r.startsWith("imports.package"))).toEqual([]);
  });
});

// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { LayoutProvider } from "@once-ui-system/core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Banner } from "../Banner.js";

/**
 * Banner has nothing client-side, so it renders as a server component, as it
 * did in core (core's server-components test): no "use client", no client-only
 * React API, no handler of its own, and it renders in Node.
 */
describe("Banner", () => {
  const source = readFileSync(path.resolve(__dirname, "../Banner.tsx"), "utf8");

  it("is not a client boundary", () => {
    expect(source).not.toMatch(/^\s*["']use client["']/);
    expect(source).not.toMatch(/\b(?:useState|useEffect|useRef|useContext|createContext)\b/);
    expect(source).not.toMatch(/\son(?!Background\b|Solid\b)[A-Z][A-Za-z]*=\{/);
  });

  it("renders in Node", () => {
    const html = renderToString(
      <LayoutProvider>
        <Banner>Banner text</Banner>
      </LayoutProvider>,
    );
    expect(html).toContain("Banner text");
  });
});

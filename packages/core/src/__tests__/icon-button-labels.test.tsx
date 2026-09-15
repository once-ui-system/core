import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconButton } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("IconButton accessible names", () => {
  // An IconButton with neither onClick nor href is decorative and renders a
  // div, by ElementType's design — so these pass a handler to get a real
  // button, which is the case an accessible name actually matters for.
  const noop = () => {};

  it("uses an explicit aria-label over the icon name", () => {
    render(<IconButton icon="chevronRight" aria-label="Next slide" onClick={noop} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
  });

  it("uses the tooltip when there is no aria-label", () => {
    render(<IconButton icon="close" tooltip="Remove" onClick={noop} />, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  /**
   * The icon-name fallback stays: an unnamed button is worse than a badly named
   * one. It is a safety net for consumers, not a licence for core's own
   * components to skip labelling — which is what the sweep below enforces.
   */
  it("still falls back to the icon name so a button is never unnamed", () => {
    render(<IconButton icon="close" onClick={noop} />, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "close" })).toBeInTheDocument();
  });
});

describe("core components label their own IconButtons", () => {
  it("has no IconButton in src/ without a tooltip or aria-label", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "__tests__") walk(p);
          continue;
        }
        if (!entry.name.endsWith(".tsx")) continue;
        const src = fs.readFileSync(p, "utf8");
        for (const m of src.matchAll(/<IconButton\b/g)) {
          let i = (m.index ?? 0) + m[0].length;
          let depth = 0;
          let quote: string | null = null;
          while (i < src.length) {
            const c = src[i];
            if (quote) {
              if (c === quote && src[i - 1] !== "\\") quote = null;
            } else if (c === '"' || c === "'" || c === "`") quote = c;
            else if (c === "{") depth++;
            else if (c === "}") depth--;
            else if (c === ">" && depth === 0) break;
            i++;
          }
          const tag = src.slice(m.index ?? 0, i);
          if (
            !tag.includes("aria-label") &&
            !tag.includes("tooltip") &&
            !tag.includes("combinedIconButtonProps") &&
            !tag.includes("aria-hidden")
          ) {
            offenders.push(`${p}:${src.slice(0, m.index ?? 0).split("\n").length}`);
          }
        }
      }
    };
    walk(path.resolve(__dirname, ".."));
    expect(offenders).toEqual([]);
  });
});

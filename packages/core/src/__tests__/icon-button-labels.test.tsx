import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IconButton } from "../components/IconButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { axeViolations, expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("IconButton accessible names", () => {
  // An IconButton with neither onClick nor href is decorative and renders a
  // div, by ElementType's design — so these pass a handler to get a real
  // button, which is the case an accessible name actually matters for.
  const noop = () => {};

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses an explicit aria-label over the icon name", async () => {
    const { container } = render(
      <IconButton icon="chevronRight" aria-label="Next slide" onClick={noop} />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("prefers aria-label over the tooltip", () => {
    render(<IconButton icon="close" aria-label="Close banner" tooltip="Close" onClick={noop} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("button", { name: "Close banner" })).toBeInTheDocument();
  });

  it("uses the tooltip when there is no aria-label", async () => {
    const { container } = render(<IconButton icon="close" tooltip="Remove" onClick={noop} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  /**
   * A name is something a person wrote. The icon key ("close", "chevronRight")
   * used to stand in, and a node tooltip was cast to a string and read out as
   * "[object Object]"; both are gone. An unnamed button is left unnamed — axe
   * and the development warning point at it — rather than hidden behind a
   * name that only looks like one.
   */
  it("never falls back to the icon key, and warns in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<IconButton icon="close" onClick={noop} />, { wrapper: wrap });

    const button = screen.getByRole("button");
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).toHaveAccessibleName("");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("has no accessible name"));
    expect((await axeViolations(container)).some((line) => line.startsWith("button-name"))).toBe(
      true,
    );
  });

  it("does not read a node tooltip as its name", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <IconButton
        icon="info"
        tooltip={
          <span>
            Rich <strong>tip</strong>
          </span>
        }
        onClick={noop}
      />,
      { wrapper: wrap },
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-label");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("has no accessible name"));
  });

  it("does not warn when the name comes from somewhere else", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <span id="external-name">Settings</span>
        <IconButton icon="settings" aria-labelledby="external-name" onClick={noop} />
        <IconButton icon="close" tooltip="Close" onClick={noop} />
      </>,
      { wrapper: wrap },
    );

    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("has no accessible name"));
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

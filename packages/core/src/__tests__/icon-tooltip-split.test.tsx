import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "../components/Icon";

/**
 * Button, IconButton, Input and most components render an Icon, and Icon used
 * to import HoverCard for its `tooltip` prop: Animation and floating-ui came
 * with every one of them, about a third of Button's gzipped size. The hover
 * card now loads only for an icon that has a tooltip.
 */
describe("Icon tooltip", () => {
  it("is not a static import of Icon", () => {
    const source = readFileSync(join(__dirname, "../components/Icon.tsx"), "utf8");
    const staticImports = source.match(/^import[^;]+;/gm) ?? [];
    expect(staticImports.join("\n")).not.toMatch(/HoverCard|Tooltip|Animation/);
    expect(source).toMatch(/lazy\(\(\) => import\("\.\/IconTooltip\.js"\)\)/);
  });

  it("shows the icon while the tooltip loads", () => {
    render(<Icon name="check" aria-label="Done" tooltip="Saved" />);
    expect(screen.getByRole("img", { name: "Done" })).toBeTruthy();
  });
});

import { DataThemeProvider, LayoutProvider, ThemeProvider } from "@once-ui-system/core";
import { render, screen, within } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { StylePanel } from "../StylePanel.js";
import { expectNoAxeViolations } from "../test/axe.js";

/**
 * Each of the panel's option sets is one choice from a set: a radio group
 * named by its row's label, with one Tab stop and the arrows to move and
 * choose (2.4, #259).
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider>
      <DataThemeProvider>{children}</DataThemeProvider>
    </ThemeProvider>
  </LayoutProvider>
);

describe("StylePanel's option sets", () => {
  it("are named radio groups with one tab stop each", async () => {
    const { container } = render(
      <StylePanel value={{ border: "playful", surface: "translucent" }} onValueChange={() => {}} />,
      { wrapper },
    );
    // Before: swatches were toggle buttons, one tab stop each (over forty in
    // the colour rows alone); option rows were unnamed tab lists without panels.
    expect(screen.queryAllByRole("tablist")).toHaveLength(0);
    for (const name of ["Theme", "Shape", "Brand", "Neutral", "Surface", "Transition"]) {
      const group = screen.getByRole("radiogroup", { name });
      const stops = within(group)
        .getAllByRole("radio")
        .filter((radio) => radio.getAttribute("tabindex") === "0");
      expect(stops).toHaveLength(1);
    }
    expect(screen.getByRole("radio", { name: "Corner style: playful" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expectNoAxeViolations(container);
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const options = [
  { value: "points", label: "Points" },
  { value: "time", label: "Time" },
];

/**
 * A Select's field is a read-only input, and browsers still blink a text
 * caret in one once it has focus: clicking a Select looked like it wanted
 * typing (Tavilio's scoring picker). The caret is transparent; focus still
 * lands on the field and shows through its border. The rule lives in
 * Input.module.scss, for every read-only combobox field.
 */
describe("Select caret", () => {
  it("shows no text caret in its read-only field, and still takes focus", async () => {
    const user = userEvent.setup();
    render(<Select id="scoring" label="Scoring" options={options} value="points" />, {
      wrapper: wrap,
    });
    const field = screen.getByRole("combobox", { name: "Scoring" }) as HTMLInputElement;
    expect(field.readOnly).toBe(true);
    // jsdom loads no stylesheets: the rule is read from the module itself.
    expect(field.matches("[readonly][role='combobox']")).toBe(true);
    expect(field.className).toContain("input");
    await user.click(field);
    expect(field).toHaveFocus();
  });

  it("is matched by the stylesheet rule that hides the caret", () => {
    const scss = readFileSync(
      path.join(__dirname, "..", "components", "Input.module.scss"),
      "utf8",
    );
    expect(scss).toMatch(
      /\.input\[readonly\]\[role="combobox"\]\s*\{\s*caret-color:\s*transparent;/,
    );
  });
});

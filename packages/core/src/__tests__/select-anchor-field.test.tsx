import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** Field box 40px tall at the top; everything else (the description included) below it. */
const rect = (top: number, height: number) =>
  ({
    x: 0,
    y: top,
    top,
    left: 0,
    right: 300,
    bottom: top + height,
    width: 300,
    height,
    toJSON() {},
  }) as DOMRect;

describe("Select with a description", () => {
  afterEach(() => vi.restoreAllMocks());

  it("opens its list from the field, over the description", async () => {
    // A viewport for floating-ui to place the list in (jsdom's is 0 by 0).
    for (const [key, value] of [
      ["clientHeight", 1000],
      ["clientWidth", 1000],
    ] as const) {
      vi.spyOn(document.documentElement, key, "get").mockReturnValue(value);
    }
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
      this: Element,
    ) {
      if (this.getAttribute("data-surface") === "field") return rect(0, 40);
      // The whole trigger: field, gap and description.
      if (this.querySelector?.('[data-surface="field"]')) return rect(0, 72);
      if (this === document.documentElement || this === document.body) return rect(0, 1000);
      return rect(0, 0);
    });
    render(
      <Select
        id="p"
        label="Project"
        description="The contract joins the project's payments."
        options={[{ value: "a", label: "Alpha" }]}
        value="a"
        onValueChange={() => {}}
      />,
      { wrapper: wrap },
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Project" }));
    const list = await screen.findByRole("listbox");
    const panel = list.closest<HTMLElement>("[style*='top']") ?? list;
    // 40px field + the 4px offset; from the whole trigger it would be 76px.
    await waitFor(() => expect(panel.style.top).toBe("44px"));
  });
});

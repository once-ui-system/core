import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { AccordionGroup } from "../components/AccordionGroup";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * With `autoCollapse={false}` the group passed every Accordion an `onToggle`
 * that did nothing and `open={undefined}`. The Accordion took the `onToggle`
 * to mean it was controlled, read `open` (false), and never opened.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items = [
  { title: "First", content: "First content" },
  { title: "Second", content: "Second content" },
];

const header = (name: string) => screen.getByRole("button", { name: new RegExp(name) });

describe("AccordionGroup", () => {
  it("opens several items at once with autoCollapse={false}", async () => {
    const user = userEvent.setup();
    render(<AccordionGroup items={items} autoCollapse={false} />, { wrapper });

    await user.click(header("First"));
    await user.click(header("Second"));
    expect(header("First")).toHaveAttribute("aria-expanded", "true");
    expect(header("Second")).toHaveAttribute("aria-expanded", "true");

    await user.click(header("First"));
    expect(header("First")).toHaveAttribute("aria-expanded", "false");
    expect(header("Second")).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps one item open at a time by default", async () => {
    const user = userEvent.setup();
    render(<AccordionGroup items={items} />, { wrapper });

    await user.click(header("First"));
    expect(header("First")).toHaveAttribute("aria-expanded", "true");
    await user.click(header("Second"));
    expect(header("First")).toHaveAttribute("aria-expanded", "false");
    expect(header("Second")).toHaveAttribute("aria-expanded", "true");
    await user.click(header("Second"));
    expect(header("Second")).toHaveAttribute("aria-expanded", "false");
  });
});

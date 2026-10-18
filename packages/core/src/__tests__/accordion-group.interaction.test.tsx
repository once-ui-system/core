import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { AccordionGroup } from "../components/AccordionGroup";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items = [
  { title: "Shipping", content: "Ships in 2 days" },
  { title: "Returns", content: "30 day returns" },
  { title: "Warranty", content: "Two years" },
];

const header = (name: string) => screen.getByRole("button", { name });
const expanded = () =>
  screen
    .getAllByRole("button")
    .filter((b) => b.getAttribute("aria-expanded") === "true")
    .map((b) => b.textContent);

/**
 * A list of accordions. With autoCollapse (the default) the group owns which
 * one is open, from the mouse and the keyboard alike; each header still points
 * at its own panel.
 */
describe("AccordionGroup: rendering", () => {
  it("renders one closed header per item and passes axe", async () => {
    const { container } = render(<AccordionGroup items={items} />, { wrapper });
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Shipping",
      "Returns",
      "Warranty",
    ]);
    expect(expanded()).toEqual([]);
    await expectNoAxeViolations(container);
  });

  it("renders nothing for no items", () => {
    const { container } = render(<AccordionGroup items={[]} />, { wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it("points every header at its own panel", () => {
    render(<AccordionGroup items={items} />, { wrapper });
    const ids = screen.getAllByRole("button").map((b) => b.getAttribute("aria-controls"));
    expect(new Set(ids).size).toBe(3);
    expect(document.getElementById(ids[1] as string)).toHaveTextContent("30 day returns");
  });

  it("passes axe with an item open", async () => {
    const user = userEvent.setup();
    const { container } = render(<AccordionGroup items={items} />, { wrapper });
    await user.click(header("Returns"));
    await expectNoAxeViolations(container);
  });
});

describe("AccordionGroup: keyboard", () => {
  it("walks the headers with Tab and opens one at a time with Enter and Space", async () => {
    const user = userEvent.setup();
    render(<AccordionGroup items={items} />, { wrapper });

    await user.tab();
    expect(header("Shipping")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(expanded()).toEqual(["Shipping"]);

    await user.tab();
    expect(header("Returns")).toHaveFocus();
    await user.keyboard(" ");
    expect(expanded()).toEqual(["Returns"]);

    await user.keyboard(" ");
    expect(expanded()).toEqual([]);
  });

  it("keeps several open from the keyboard with autoCollapse={false}", async () => {
    const user = userEvent.setup();
    render(<AccordionGroup items={items} autoCollapse={false} />, { wrapper });
    await user.tab();
    await user.keyboard("{Enter}");
    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(expanded()).toEqual(["Shipping", "Warranty"]);
  });
});

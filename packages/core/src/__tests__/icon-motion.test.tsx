import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Accordion } from "../components/Accordion";
import { Arrow } from "../components/Arrow";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Icon } from "../components/Icon";
import { NavIcon } from "../components/NavIcon";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { iconData } from "../icons/data";
import { iconMotions } from "../icons/motion";

/**
 * Icon motion is CSS: Icon only writes data-icon, data-animate and
 * data-active, and the built-ins carry data-part on the pieces that move.
 * These tests pin that contract and the components that use it.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const iconOf = (container: HTMLElement, name: string) =>
  container.querySelector(`[data-icon="${name}"]`);

describe("Icon animate", () => {
  it("stays still without animate or active", () => {
    const { container } = render(<Icon name="bell" />, { wrapper });
    expect(container.querySelector("[data-animate]")).toBeNull();
  });

  it("uses the icon's own trigger for animate={true}", () => {
    const { container } = render(
      <>
        <Icon name="bell" animate />
        <Icon name="check" animate />
        <Icon name="chevronDown" animate />
      </>,
      { wrapper },
    );
    expect(iconOf(container, "bell")).toHaveAttribute("data-animate", "hover");
    expect(iconOf(container, "check")).toHaveAttribute("data-animate", "in");
    expect(iconOf(container, "chevronDown")).toHaveAttribute("data-animate", "active");
  });

  it("takes active alone as animate, and marks the on state", () => {
    const { container, rerender } = render(<Icon name="heart" active={false} />, { wrapper });
    expect(iconOf(container, "heart")).toHaveAttribute("data-animate", "active");
    expect(iconOf(container, "heart")).not.toHaveAttribute("data-active");
    rerender(<Icon name="heart" active />);
    expect(iconOf(container, "heart")).toHaveAttribute("data-active");
  });

  it("lets a named trigger replace the default", () => {
    const { container } = render(<Icon name="refresh" animate="in" />, { wrapper });
    expect(iconOf(container, "refresh")).toHaveAttribute("data-animate", "in");
  });

  it("ignores animate on an icon with no motion", () => {
    const { container } = render(<Icon name="home" animate active />, { wrapper });
    expect(container.querySelector("[data-animate]")).toBeNull();
    expect(container.querySelector("[data-active]")).toBeNull();
  });

  it("gives every icon that moves the parts its motion needs", () => {
    const parts: Record<string, string[]> = {
      check: ["tick"],
      checkbox: ["box", "tick"],
      bell: ["body", "clapper"],
      trash: ["lid"],
      menu: ["top", "middle", "bottom"],
      arrowRight: ["shaft", "head"],
    };
    for (const name of Object.keys(iconMotions)) expect(iconData).toHaveProperty(name);
    for (const [name, want] of Object.entries(parts)) {
      const have = iconData[name as keyof typeof iconData].child.map(
        (c) => (c.attr as Record<string, unknown>)["data-part"],
      );
      for (const part of want) expect(have, `${name} has ${part}`).toContain(part);
    }
  });
});

describe("components on icon motion", () => {
  it("Accordion flips its chevron with active, and turns any other icon", async () => {
    const { container } = render(<Accordion title="Shipping">Ships in 2 days</Accordion>, {
      wrapper,
    });
    expect(iconOf(container, "chevronDown")).not.toHaveAttribute("data-active");
    await userEvent.click(screen.getByRole("button", { name: "Shipping" }));
    expect(iconOf(container, "chevronDown")).toHaveAttribute("data-active");

    const turned = render(
      <Accordion title="Returns" iconRotation={90}>
        30 days
      </Accordion>,
      { wrapper },
    );
    expect(turned.container.querySelector("[data-animate]")).toBeNull();
  });

  it("Checkbox draws its tick in when checked, not when it loads checked", async () => {
    const loaded = render(<Checkbox label="Loaded" defaultChecked />, { wrapper });
    expect(iconOf(loaded.container, "check")).toBeNull();
    expect(loaded.container.querySelector("[data-animate]")).toBeNull();

    const { container } = render(<Checkbox label="Agree" />, { wrapper });
    await userEvent.click(screen.getByRole("checkbox", { name: "Agree" }));
    expect(iconOf(container, "check")).toHaveAttribute("data-animate", "in");
  });

  it("Button's arrow is the arrowRight icon, with no trigger to wire", () => {
    const { container } = render(<Button arrowIcon>Get started</Button>, { wrapper });
    const parts = [...container.querySelectorAll("button svg [data-part]")].map((p) =>
      p.getAttribute("data-part"),
    );
    expect(parts).toEqual(["shaft", "head"]);
  });

  it("Arrow and NavIcon draw the built-in arrowRight and menu paths", () => {
    const paths = (name: "arrowRight" | "menu") => iconData[name].child.map((c) => c.attr.d);
    const arrow = render(<Button arrowIcon>Go</Button>, { wrapper });
    expect(
      [...arrow.container.querySelectorAll("svg path")].map((p) => p.getAttribute("d")),
    ).toEqual(paths("arrowRight"));
    const nav = render(<NavIcon active={false} />, { wrapper });
    expect([...nav.container.querySelectorAll("svg path")].map((p) => p.getAttribute("d"))).toEqual(
      paths("menu"),
    );
  });

  it("Arrow still takes a trigger elsewhere on the page", () => {
    const { container } = render(
      <>
        <div id="card">Card</div>
        <Arrow trigger="#card" />
      </>,
      { wrapper },
    );
    expect(container.querySelectorAll("svg [data-part]")).toHaveLength(2);
  });
});

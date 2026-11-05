import { render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Kbd } from "../components/Kbd";
import { Tooltip } from "../components/Tooltip";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Tooltip is the bubble itself; when it shows is up to whoever places it
 * (Icon and IconButton put it in a HoverCard). Its contract is the markup a
 * trigger points at with `aria-describedby`: role `tooltip`, the label as its
 * text, an `id` and other layout props passed through, and its ref.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Tooltip", () => {
  it("renders its label in an element with role tooltip", () => {
    render(<Tooltip label="Copy link" />, { wrapper });
    expect(screen.getByRole("tooltip")).toHaveTextContent("Copy link");
  });

  it("renders a node label", () => {
    render(
      <Tooltip
        label={
          <>
            Press <kbd>K</kbd>
          </>
        }
      />,
      { wrapper },
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Press K");
  });

  it("renders the prefix and suffix icons around the label, hidden from assistive tech", () => {
    render(<Tooltip label="Settings" prefixIcon="check" suffixIcon="chevronRight" />, {
      wrapper,
    });
    const tooltip = screen.getByRole("tooltip");
    const icons = tooltip.querySelectorAll(":scope > [aria-hidden='true']");
    expect(icons).toHaveLength(2);
    expect(tooltip).toHaveTextContent("Settings");
    expect(tooltip.firstElementChild).toBe(icons[0]);
    expect(tooltip.lastElementChild).toBe(icons[1]);
  });

  it("passes an id through, so a trigger can reference it", () => {
    render(
      <>
        <button type="button" aria-describedby="tip">
          Share
        </button>
        <Tooltip id="tip" label="Copy link" />
      </>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "Share" })).toHaveAccessibleDescription("Copy link");
  });

  it("keeps the label on one line, and lets the caller's style win", () => {
    render(<Tooltip label="Copy link" style={{ whiteSpace: "normal", maxWidth: "10rem" }} />, {
      wrapper,
    });
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.style.whiteSpace).toBe("normal");
    expect(tooltip.style.maxWidth).toBe("10rem");
    expect(tooltip.style.userSelect).toBe("none");
  });

  it("merges className with its own", () => {
    render(<Tooltip label="Copy link" className="custom" />, { wrapper });
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveClass("custom");
    // CSS module class names keep their local name: _fadeIn_<hash>.
    expect(tooltip.className).toMatch(/_fadeIn_/);
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tooltip ref={ref} label="Copy link" />, { wrapper });
    expect(ref.current).toBe(screen.getByRole("tooltip"));
  });

  it("has no axe violations", async () => {
    const { container } = render(<Tooltip label="Copy link" prefixIcon="check" />, { wrapper });
    await expectNoAxeViolations(container);
  });

  it("marks a KeyTip-only label the way its stylesheet tightens the right side", () => {
    // Tooltip.module.scss gives the right side the vertical padding when the
    // label is only a KeyTip (it ends in keycaps). jsdom can't evaluate :has(),
    // so this pins the structure the rule matches; the browser applies it.
    render(<Tooltip label={<Kbd label="Redo" keys="mod+shift+z" />} />, { wrapper });
    const tooltip = screen.getByRole("tooltip");
    const label = tooltip.lastElementChild as HTMLElement;
    expect(label.children).toHaveLength(1);
    expect(label.firstElementChild).toHaveAttribute("data-keytip");
  });
});

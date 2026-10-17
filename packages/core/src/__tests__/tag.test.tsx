import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "../components/Tag";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * 3.0 folds Badge and Chip into Tag (F3). A Tag is a static label; with
 * `variant="announce"`, `href`, `arrow` and `effect` it is 2.x's Badge; with
 * `selected`, `onClick` or `onRemove` it is 2.x's Chip: a `role="button"`
 * with `aria-pressed`, pressed by a click, Enter or Space, whose remove button
 * sits beside it and never counts as a click on the tag.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Tag, static", () => {
  it("is not a control", () => {
    render(<Tag label="Live" />, { wrapper });
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("draws in its tone, neutral by default", () => {
    const { container, rerender } = render(<Tag label="Live" />, { wrapper });
    const box = () => container.querySelector('[class*="_tag_"]');
    expect(box()?.className).toMatch(/neutral-background-weak/);
    rerender(<Tag label="Live" tone="danger" />);
    expect(box()?.className).toMatch(/danger-background-weak/);
    expect(box()?.className).toMatch(/danger-on-background-medium/);
  });

  it("takes the gradient look as a variant", () => {
    const { container } = render(<Tag label="New" variant="gradient" />, { wrapper });
    expect(container.querySelector('[class*="_tag_"]')?.className).toMatch(/_gradient_/);
  });

  it("renders its label, or its children without one", () => {
    const { rerender } = render(<Tag label="Label" />, { wrapper });
    expect(screen.getByText("Label")).toBeInTheDocument();
    rerender(
      <Tag>
        <b>child</b>
      </Tag>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("takes every size from xs to xl", () => {
    for (const size of ["xs", "s", "m", "l", "xl"] as const) {
      const { unmount } = render(<Tag label={size} size={size} />, { wrapper });
      expect(screen.getByText(size)).toBeInTheDocument();
      unmount();
    }
  });
});

describe("Tag, as an announcement (2.x Badge)", () => {
  it("is a link with href, with an arrow and the shine by default", () => {
    const { container } = render(<Tag variant="announce" label="New" href="/changelog" />, {
      wrapper,
    });
    const link = screen.getByRole("link", { name: /New/ });
    expect(link).toHaveAttribute("href", "/changelog");
    const box = container.querySelector('[class*="_tag_"]');
    expect(box?.className).toMatch(/_shine_/);
    expect(box?.className).toMatch(/radius-full/);
    expect(box?.className).toMatch(/brand-on-background-strong/);
    expect(box).toHaveAttribute("data-tag-arrow");
  });

  it("turns the shine and the arrow off on request", () => {
    const { container } = render(
      <Tag variant="announce" label="New" href="/x" effect={false} arrow={false} />,
      { wrapper },
    );
    const box = container.querySelector('[class*="_tag_"]');
    expect(box?.className).not.toMatch(/_shine_/);
    expect(box).not.toHaveAttribute("data-tag-arrow");
  });

  // Every 2.x Badge without an id got id="badge", so a page with several had
  // duplicate ids and each arrow followed hover on the first one.
  it("gives each tag's arrow its own trigger and sets no id", () => {
    const { container } = render(
      <>
        <Tag variant="announce" label="One" href="/one" />
        <Tag variant="announce" label="Two" href="/two" />
      </>,
      { wrapper },
    );
    expect(container.querySelector("#badge")).toBeNull();
    const triggers = [...container.querySelectorAll("[data-tag-arrow]")].map((el) =>
      el.getAttribute("data-tag-arrow"),
    );
    expect(triggers).toHaveLength(2);
    expect(new Set(triggers).size).toBe(2);
  });

  it("keeps an id that is passed", () => {
    const { container } = render(<Tag variant="announce" label="New" id="news" />, {
      wrapper,
    });
    expect(container.querySelector("#news")).not.toBeNull();
  });

  it("has no axe violations as a link", async () => {
    const { container } = render(<Tag variant="announce" label="New" href="/x" />, { wrapper });
    await expectNoAxeViolations(container);
  });
});

describe("Tag, as a toggle (2.x Chip)", () => {
  // Chip's `selected` defaulted to true, so `<Tag selected label="Unselected" />`, as
  // the docs wrote it, was announced and drawn as pressed (core#198).
  it("is a focusable toggle button named by its label, unselected by default", () => {
    render(<Tag label="Design" onClick={vi.fn()} />, { wrapper });
    const tag = screen.getByRole("button", { name: "Design" });
    expect(tag).toHaveAttribute("tabindex", "0");
    expect(tag).toHaveAttribute("aria-pressed", "false");
  });

  it("reflects `selected` in aria-pressed", () => {
    render(<Tag label="Design" selected />, { wrapper });
    expect(screen.getByRole("button", { name: "Design" })).toHaveAttribute("aria-pressed", "true");
  });

  it("draws selected in its tone, brand by default", () => {
    const { container, rerender } = render(<Tag label="Design" selected />, { wrapper });
    const box = () => container.querySelector('[class*="_toggle_"]');
    expect(box()?.className).toMatch(/_selected_/);
    expect(box()?.className).toMatch(/_tone-brand_/);
    rerender(<Tag label="Design" selected tone="success" />);
    expect(box()?.className).toMatch(/_tone-success_/);
  });

  it("calls onClick on a pointer click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag label="Design" onClick={onClick} />, { wrapper });
    const tag = screen.getByRole("button", { name: "Design" });

    await user.click(tag);
    expect(onClick).toHaveBeenCalledTimes(1);

    tag.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("is reachable with Tab", async () => {
    const user = userEvent.setup();
    render(<Tag label="Design" selected={false} />, { wrapper });
    await user.tab();
    expect(screen.getByRole("button", { name: "Design" })).toHaveFocus();
  });

  it("renders a remove button only with onRemove, and removing is not a click on the tag", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const { rerender } = render(<Tag label="Design" onClick={onClick} />, { wrapper });
    expect(screen.getAllByRole("button")).toHaveLength(1);

    rerender(<Tag label="Design" onClick={onClick} onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is a plain label beside its remove button when it has nothing to toggle", () => {
    render(<Tag label="Design" onRemove={vi.fn()} />, { wrapper });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("calls both its own remove handler and removeButtonProps.onClick", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onIconClick = vi.fn();
    render(
      <Tag
        label="Design"
        onRemove={onRemove}
        removeButtonProps={{ onClick: onIconClick, tooltip: "Remove Design" }}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Remove Design" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onIconClick).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations without a remove button", async () => {
    const { container } = render(<Tag label="Design" onClick={vi.fn()} />, { wrapper });
    await expectNoAxeViolations(container);
  });

  // A remove button inside the toggle's own role="button" is an interactive
  // control nested in another (axe: "nested-interactive").
  it("has no axe violations with a remove button", async () => {
    const { container } = render(<Tag label="Design" selected onRemove={vi.fn()} />, {
      wrapper,
    });
    await expectNoAxeViolations(container);
  });

  it("puts its own control and its remove button side by side", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag label="Design" selected={false} onClick={onClick} onRemove={vi.fn()} />, {
      wrapper,
    });
    const tag = screen.getByRole("button", { name: "Design" });
    const remove = screen.getByRole("button", { name: "Remove" });

    expect(tag).not.toContainElement(remove);
    expect(remove).not.toContainElement(tag);
    expect(tag).toHaveAttribute("tabindex", "0");
    expect(tag).toHaveAttribute("aria-pressed", "false");

    await user.click(tag);
    expect(onClick).toHaveBeenCalledTimes(1);
    tag.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("removes on Enter and Space without clicking the tag", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(<Tag label="Design" onClick={onClick} onRemove={onRemove} />, { wrapper });
    screen.getByRole("button", { name: "Remove" }).focus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps its look on the box and names its control with aria-label", () => {
    const { container } = render(
      <Tag
        label="Design"
        selected
        className="custom"
        aria-label="Design filter"
        onRemove={vi.fn()}
        removeButtonProps={{ "aria-label": "Remove Design" }}
      />,
      { wrapper },
    );
    const box = container.querySelector(".custom");
    expect(box?.className).toMatch(/_toggle_/);
    expect(box).not.toHaveAttribute("role");
    expect(box).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("button", { name: "Design filter" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Remove Design" }).tagName).toBe("BUTTON");
  });

  it("forwards a typed ref to its box", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Tag ref={ref} label="Design" onRemove={vi.fn()} />, {
      wrapper,
    });
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(container.querySelector('[class*="_toggle_"]'));
  });

  it("keeps its own classes when given a className", () => {
    render(<Tag label="Design" className="custom" selected={false} />, { wrapper });
    const tag = screen.getByRole("button", { name: "Design" });
    expect(tag).toHaveClass("custom");
    expect(tag.className).toMatch(/_toggle_/);
    expect(tag.className).toMatch(/_unselected_/);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "../components/Accordion";
import { Checkbox } from "../components/Checkbox";
import { Switch } from "../components/Switch";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * Interaction tests for the shared toggle-style controls
 * (rfcs/2026-08-once-ui-2-architecture.md §5.2). Focus: pointer + keyboard
 * activation, controlled vs uncontrolled behavior, and disabled semantics —
 * the contracts consumers rely on and refactors are most likely to break.
 */

const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const renderWithProviders = (ui: React.ReactElement) => render(ui, { wrapper: TestProviders });

describe("Accordion", () => {
  const renderAccordion = (props: Partial<React.ComponentProps<typeof Accordion>> = {}) =>
    renderWithProviders(
      <Accordion title="Section title" {...props}>
        <span>Accordion body</span>
      </Accordion>,
    );

  it("is closed by default and opens on header click", async () => {
    const user = userEvent.setup();
    renderAccordion();

    const header = screen.getByRole("button", { name: /section title/i });
    expect(header).toHaveAttribute("aria-expanded", "false");

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Accordion body")).toBeVisible();
  });

  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();
    renderAccordion();

    const header = screen.getByRole("button", { name: /section title/i });
    header.focus();
    await user.keyboard("{Enter}");
    expect(header).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(header).toHaveAttribute("aria-expanded", "false");
  });

  it("defers to onOpenChange in controlled mode instead of toggling itself", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderAccordion({ open: false, onOpenChange });

    const header = screen.getByRole("button", { name: /section title/i });
    await user.click(header);

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(header).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Checkbox", () => {
  it("toggles its own state when uncontrolled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Checkbox label="Accept terms" />);

    const checkbox = screen.getByRole("checkbox", { name: /accept terms/i });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("calls onCheckedChange without mutating state when controlled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProviders(
      <Checkbox label="Controlled" checked={false} onCheckedChange={onCheckedChange} />,
    );

    const checkbox = screen.getByRole("checkbox", { name: /controlled/i });
    await user.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(checkbox).not.toBeChecked();
  });

  it("ignores interaction when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProviders(<Checkbox label="Disabled" disabled onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("checkbox", { name: /disabled/i }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

describe("Switch", () => {
  it("fires onCheckedChange from pointer and keyboard", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProviders(
      <Switch checked={false} onCheckedChange={onCheckedChange} aria-label="Enable feature" />,
    );

    const control = screen.getByRole("switch", { name: /enable feature/i });
    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);

    // The role="switch" element is the one that takes focus and handles keys,
    // so the click above already left focus on it.
    expect(control).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });

  it("reflects the controlled isChecked value", () => {
    const { rerender } = renderWithProviders(
      <Switch checked={false} onCheckedChange={() => {}} aria-label="State" />,
    );
    expect(screen.getByRole("switch", { name: /state/i })).not.toBeChecked();

    rerender(<Switch checked onCheckedChange={() => {}} aria-label="State" />);
    expect(screen.getByRole("switch", { name: /state/i })).toBeChecked();
  });

  it("does not fire onCheckedChange when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProviders(
      <Switch checked={false} onCheckedChange={onCheckedChange} disabled aria-label="Locked" />,
    );

    await user.click(screen.getByRole("switch", { name: /locked/i }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

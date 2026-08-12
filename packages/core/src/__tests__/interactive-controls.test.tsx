import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "../components/Accordion";
import { Checkbox } from "../components/Checkbox";
import { Switch } from "../components/Switch";
import { LayoutProvider } from "../contexts";

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

  it("defers to onToggle in controlled mode instead of toggling itself", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderAccordion({ open: false, onToggle });

    const header = screen.getByRole("button", { name: /section title/i });
    await user.click(header);

    expect(onToggle).toHaveBeenCalledTimes(1);
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

  it("calls onToggle without mutating state when controlled", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithProviders(<Checkbox label="Controlled" isChecked={false} onToggle={onToggle} />);

    const checkbox = screen.getByRole("checkbox", { name: /controlled/i });
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(checkbox).not.toBeChecked();
  });

  it("ignores interaction when disabled", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithProviders(<Checkbox label="Disabled" disabled onToggle={onToggle} />);

    await user.click(screen.getByRole("checkbox", { name: /disabled/i }));
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe("Switch", () => {
  it("fires onToggle from pointer and keyboard", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithProviders(
      <Switch isChecked={false} onToggle={onToggle} ariaLabel="Enable feature" />,
    );

    const control = screen.getByRole("switch", { name: /enable feature/i });
    await user.click(control);
    expect(onToggle).toHaveBeenCalledTimes(1);

    // The keydown handler lives on the inner focusable element, not the
    // role="switch" wrapper (flagged for the a11y audit) — reach it via Tab.
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("reflects the controlled isChecked value", () => {
    const { rerender } = renderWithProviders(
      <Switch isChecked={false} onToggle={() => {}} ariaLabel="State" />,
    );
    expect(screen.getByRole("switch", { name: /state/i })).not.toBeChecked();

    rerender(<Switch isChecked onToggle={() => {}} ariaLabel="State" />);
    expect(screen.getByRole("switch", { name: /state/i })).toBeChecked();
  });

  it("does not fire onToggle when disabled", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithProviders(
      <Switch isChecked={false} onToggle={onToggle} disabled ariaLabel="Locked" />,
    );

    await user.click(screen.getByRole("switch", { name: /locked/i }));
    expect(onToggle).not.toHaveBeenCalled();
  });
});

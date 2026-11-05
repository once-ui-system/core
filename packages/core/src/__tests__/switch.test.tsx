import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../components/Switch";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * The switch is the element that takes focus (ROADMAP W3): before 2.1 the
 * role sat on an unfocusable wrapper, Tab landed on an unnamed div inside it,
 * and the default `ariaLabel` drowned out the visible label.
 */
describe("Switch accessibility", () => {
  it("puts the switch role on the element Tab reaches, named by the visible label", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Switch
        label="Wi-Fi"
        description="Join known networks"
        checked={false}
        onCheckedChange={() => {}}
      />,
      { wrapper: wrap },
    );

    await user.tab();
    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(control).toHaveFocus();
    expect(control).toHaveAccessibleDescription("Join known networks");
    expect(screen.getAllByRole("switch")).toHaveLength(1);
    await expectNoAxeViolations(container);
  });

  it("toggles from the keyboard on the focused switch", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Wi-Fi" checked={false} onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });

    await user.tab();
    await user.keyboard(" ");
    await user.keyboard("{Enter}");
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });

  it("toggles from a click on the label", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Wi-Fi" checked={false} onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });

    await user.click(screen.getByText("Wi-Fi"));
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it("reports its state", () => {
    const { rerender } = render(
      <Switch label="Wi-Fi" checked={false} onCheckedChange={() => {}} />,
      {
        wrapper: wrap,
      },
    );
    expect(screen.getByRole("switch", { name: "Wi-Fi" })).not.toBeChecked();

    rerender(<Switch label="Wi-Fi" checked onCheckedChange={() => {}} />);
    expect(screen.getByRole("switch", { name: "Wi-Fi" })).toBeChecked();
  });

  it("is named by aria-label when there is no visible label", async () => {
    const { container } = render(
      <Switch aria-label="Dark mode" checked={false} onCheckedChange={() => {}} />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("switch", { name: "Dark mode" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("keeps the documented fallback name when given nothing else", () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />, { wrapper: wrap });
    expect(screen.getByRole("switch", { name: "Toggle switch" })).toBeInTheDocument();
  });

  it("stays out of the tab order and inert when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch label="Locked" disabled checked={false} onCheckedChange={onCheckedChange} />,
      { wrapper: wrap },
    );

    const control = screen.getByRole("switch", { name: "Locked" });
    expect(control).toHaveAttribute("aria-disabled", "true");
    await user.tab();
    expect(control).not.toHaveFocus();
    await user.click(control);
    expect(onCheckedChange).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("stays clean while loading", async () => {
    const { container } = render(
      <Switch label="Syncing" loading checked onCheckedChange={() => {}} />,
      {
        wrapper: wrap,
      },
    );
    await expectNoAxeViolations(container);
  });

  it("still submits its value with a form", () => {
    const { container } = render(
      <form>
        <Switch
          label="Newsletter"
          name="newsletter"
          value="yes"
          checked
          onCheckedChange={() => {}}
        />
      </form>,
      { wrapper: wrap },
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect(new FormData(form).get("newsletter")).toBe("yes");
  });
});

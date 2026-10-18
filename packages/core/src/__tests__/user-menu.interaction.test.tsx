import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Column } from "../components/Column";
import { Option } from "../components/Option";
import { resetScrollLockState } from "../components/ScrollLock";
import { User } from "../components/User";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();
beforeEach(() => {
  resetScrollLockState();
});

const Menu = ({
  onSettings,
  ...props
}: Partial<React.ComponentProps<typeof User>> & { onSettings?: (value: string) => void }) => (
  <>
    <User
      name="Lorant One"
      subline="Design Engineer"
      avatarProps={{ value: "LO" }}
      dropdown={
        <Column gap="4" padding="4">
          <Option value="settings" label="Settings" onClick={onSettings} />
          <Option value="logout" label="Log out" />
        </Column>
      }
      {...props}
    />
    <button type="button">Elsewhere</button>
  </>
);

const pill = () => screen.getByRole("button", { name: /Lorant One/ });
const options = () => screen.queryAllByRole("option");

const waitForOpen = async () => {
  await waitFor(() => expect(options()).toHaveLength(2));
  await waitFor(() => expect(document.activeElement).toHaveAttribute("role", "option"));
};

/**
 * UserMenu is a pill that opens a menu. The pill is what Tab lands on, so it
 * is the button: it carries `aria-haspopup` and `aria-expanded` itself. They
 * used to sit on two unfocusable wrappers around a role-less focusable div,
 * so a screen reader heard neither that it opens a list nor whether it was open.
 */
describe("UserMenu", () => {
  it("is one collapsed button, the element Tab reaches, with the user in its name", async () => {
    const user = userEvent.setup();
    const { container } = render(<Menu />, { wrapper: wrap });

    expect(screen.getAllByRole("button", { name: /Lorant One/ })).toHaveLength(1);
    expect(pill()).toHaveAttribute("aria-haspopup", "listbox");
    expect(pill()).toHaveAttribute("aria-expanded", "false");
    expect(pill()).toHaveTextContent("Design Engineer");

    await user.tab();
    expect(pill()).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("opens on Enter onto the first option, and reports itself expanded", async () => {
    const user = userEvent.setup();
    render(<Menu />, { wrapper: wrap });

    await user.tab();
    await user.keyboard("{Enter}");
    await waitForOpen();
    expect(pill()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Settings" })).toHaveFocus();
    await expectNoAxeViolations(document.body);
  });

  it("opens on Space and on a click", async () => {
    const user = userEvent.setup();
    render(<Menu />, { wrapper: wrap });

    await user.tab();
    await user.keyboard(" ");
    await waitForOpen();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(options()).toHaveLength(0));

    await user.click(screen.getByText("Lorant One"));
    await waitForOpen();
  });

  it("moves with the arrow keys and closes on Escape, handing focus back to the pill", async () => {
    const user = userEvent.setup();
    render(<Menu />, { wrapper: wrap });

    await user.tab();
    await user.keyboard("{Enter}");
    await waitForOpen();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Log out" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Settings" })).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(options()).toHaveLength(0));
    expect(pill()).toHaveAttribute("aria-expanded", "false");
    expect(pill()).toHaveFocus();
  });

  it("runs an option's onClick with its value and closes", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Menu onSettings={onClick} />, { wrapper: wrap });

    await user.click(screen.getByText("Lorant One"));
    await waitForOpen();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledWith("settings");
    await waitFor(() => expect(options()).toHaveLength(0));
  });

  it("is out of the tab order and does not open while loading", async () => {
    const user = userEvent.setup();
    const { container } = render(<Menu loading />, { wrapper: wrap });

    const trigger = screen.getByRole("button", { name: /Loading avatar/ });
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByText("Lorant One")).toBeNull();

    await user.tab();
    expect(trigger).not.toHaveFocus();
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();

    await user.click(trigger);
    expect(options()).toHaveLength(0);
    await expectNoAxeViolations(container);
  });

  it("forwards its ref to the menu's outer element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Menu ref={ref} />, { wrapper: wrap });
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toContainElement(pill());
  });

  it("shows the selected look with `selected`", () => {
    render(<Menu selected />, { wrapper: wrap });
    expect(pill().className).toMatch(/_selected_/);
  });
});

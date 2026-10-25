import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { Column } from "../components/Column";
import { DropdownWrapper } from "../components/DropdownWrapper";
import { Input } from "../components/Input";
import { Option } from "../components/Option";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";
import { clearLastOpenedDropdown } from "../utils/dropdownState";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();
beforeEach(() => {
  resetScrollLockState();
  clearLastOpenedDropdown();
});

const list = (
  <Column padding="4" gap="2">
    <Option value="rename" label="Rename" />
    <Option value="duplicate" label="Duplicate" />
    <Option value="delete" label="Delete" />
  </Column>
);

const trigger = (name = "Actions") => screen.getByRole("button", { name });
const options = () => screen.queryAllByRole("option");

/** Open, positioned, and focus handed to an option. */
const waitForOpen = async (count = 3) => {
  await waitFor(() => expect(options()).toHaveLength(count));
  await waitFor(() => expect(document.activeElement).toHaveAttribute("role", "option"));
};
const waitForClosed = () => waitFor(() => expect(options()).toHaveLength(0));

/**
 * DropdownWrapper is the trigger-plus-popup behind Select, UserMenu,
 * EmojiPickerDropdown and app menus. It owns the open state (or follows a
 * controlled one), reports every change and every pick once, and closes on a
 * pick, Escape, a click outside, or another dropdown opening.
 */
describe("DropdownWrapper open state", () => {
  it("opens and closes from its trigger uncontrolled, reporting each change", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DropdownWrapper
        trigger={<Button>Actions</Button>}
        dropdown={list}
        onOpenChange={onOpenChange}
      />,
      { wrapper: wrap },
    );

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger());
    await waitForOpen();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(trigger());
    await waitForClosed();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("follows a controlled `open`, asking onOpenChange rather than opening itself", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <DropdownWrapper
        open={false}
        onOpenChange={onOpenChange}
        trigger={<Button>Actions</Button>}
        dropdown={list}
      />,
      { wrapper: wrap },
    );

    await user.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(options()).toHaveLength(0);

    rerender(
      <DropdownWrapper
        open
        onOpenChange={onOpenChange}
        trigger={<Button>Actions</Button>}
        dropdown={list}
      />,
    );
    await waitForOpen();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on a click outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <DropdownWrapper trigger={<Button>Actions</Button>} dropdown={list} />
        <p>Outside</p>
      </>,
      { wrapper: wrap },
    );
    await user.click(trigger());
    await waitForOpen();
    await user.click(screen.getByText("Outside"));
    await waitForClosed();
  });

  it("closes on Escape and hands focus back to the trigger", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper trigger={<Button>Actions</Button>} dropdown={list} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard("{Enter}");
    await waitForOpen();
    await user.keyboard("{Escape}");
    await waitForClosed();
    expect(trigger()).toHaveFocus();
  });

  it("closes one dropdown when another opens", async () => {
    const user = userEvent.setup();
    render(
      <>
        <DropdownWrapper trigger={<Button>Actions</Button>} dropdown={list} />
        <DropdownWrapper
          trigger={<Button>Sort</Button>}
          dropdown={
            <Column>
              <Option value="name" label="Name" />
            </Column>
          }
        />
      </>,
      { wrapper: wrap },
    );

    await user.click(trigger());
    await waitForOpen();
    await user.click(trigger("Sort"));
    await waitFor(() => expect(screen.getByRole("option", { name: "Name" })).toBeInTheDocument());
    expect(screen.queryByRole("option", { name: "Rename" })).toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Sort")).toHaveAttribute("aria-expanded", "true");
  });

  it("does not open from a click with disableTriggerClick", async () => {
    const user = userEvent.setup();
    render(
      <DropdownWrapper disableTriggerClick trigger={<Button>Actions</Button>} dropdown={list} />,
      {
        wrapper: wrap,
      },
    );
    await user.click(trigger());
    expect(options()).toHaveLength(0);
  });
});

describe("DropdownWrapper picking", () => {
  it("opens on the first option, moves with the arrows and picks with Enter, once", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownWrapper trigger={<Button>Actions</Button>} dropdown={list} onSelect={onSelect} />,
      { wrapper: wrap },
    );
    await user.click(trigger());
    await waitForOpen();
    expect(screen.getByRole("option", { name: "Rename" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("option", { name: "Delete" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("delete");
    await waitForClosed();
    expect(trigger()).toHaveFocus();
  });

  it("reports a clicked option's value and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownWrapper trigger={<Button>Actions</Button>} dropdown={list} onSelect={onSelect} />,
      { wrapper: wrap },
    );
    await user.click(trigger());
    await waitForOpen();
    await user.click(screen.getByRole("option", { name: "Duplicate" }));
    expect(onSelect.mock.calls).toEqual([["duplicate"]]);
    await waitForClosed();
  });

  /**
   * Options given straight to `dropdown`, with no Column around them, were
   * cloned with an onClick that reported the pick a second time on top of
   * Dropdown's own, and that threw the option's own onClick away.
   */
  it("reports a pick from options given without a wrapper once, and keeps their onClick", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const onRename = vi.fn();
    render(
      <DropdownWrapper
        trigger={<Button>Actions</Button>}
        onSelect={onSelect}
        onOpenChange={onOpenChange}
        dropdown={[
          <Option key="rename" value="rename" label="Rename" onClick={onRename} />,
          <Option key="delete" value="delete" label="Delete" />,
        ]}
      />,
      { wrapper: wrap },
    );
    await user.click(trigger());
    await waitForOpen(2);
    await user.click(screen.getByRole("option", { name: "Rename" }));

    expect(onSelect.mock.calls).toEqual([["rename"]]);
    expect(onRename.mock.calls).toEqual([["rename"]]);
    await waitForClosed();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("stays open after a pick with closeAfterClick={false}", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownWrapper
        closeAfterClick={false}
        trigger={<Button>Actions</Button>}
        dropdown={list}
        onSelect={onSelect}
      />,
      { wrapper: wrap },
    );
    await user.click(trigger());
    await waitForOpen();
    await user.click(screen.getByRole("option", { name: "Rename" }));
    await user.click(screen.getByRole("option", { name: "Delete" }));
    expect(onSelect.mock.calls).toEqual([["rename"], ["delete"]]);
    expect(options()).toHaveLength(3);
  });

  it("opens on the selected option", async () => {
    const user = userEvent.setup();
    render(
      <DropdownWrapper
        trigger={<Button>Actions</Button>}
        dropdown={
          <Column>
            <Option value="a" label="Alpha" />
            <Option value="b" label="Bravo" selected />
          </Column>
        }
      />,
      { wrapper: wrap },
    );
    await user.click(trigger());
    await waitForOpen(2);
    expect(screen.getByRole("option", { name: "Bravo" })).toHaveFocus();
  });

  /**
   * A switcher or command menu: a search field above the list, arrow
   * navigation still on. It opens with the caret in the field, so typing
   * filters straight away, and ArrowDown from there walks into the list.
   */
  const searchable = (
    <Column>
      <Input id="dw-search" label="Search" />
      <Column>
        <Option value="a" label="Alpha" />
        <Option value="b" label="Bravo" selected />
      </Column>
    </Column>
  );

  it("opens on a leading search field rather than the selected option", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper trigger={<Button>Actions</Button>} dropdown={searchable} />, {
      wrapper: wrap,
    });
    await user.click(trigger());
    const field = await screen.findByRole("textbox", { name: "Search" });
    await waitFor(() => expect(field).toHaveFocus());
    // Let every open-time effect settle: the field must keep focus, not lose
    // it to the selected option a frame later.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(field).toHaveFocus();

    await user.keyboard("Br");
    expect(field).toHaveValue("Br");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("moves from a leading search field into the list with ArrowDown", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper trigger={<Button>Actions</Button>} dropdown={searchable} />, {
      wrapper: wrap,
    });
    await user.click(trigger());
    const field = await screen.findByRole("textbox", { name: "Search" });
    await waitFor(() => expect(field).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toHaveAttribute("role", "option"));
  });

  it("is one listbox named by its trigger, with no axe violations, while open", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper trigger={<Button>Actions</Button>} dropdown={list} />, {
      wrapper: wrap,
    });
    await user.click(trigger());
    await waitForOpen();
    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    await expectNoAxeViolations(document.body);
  });
});

describe("DropdownWrapper with free content", () => {
  /** Without arrow navigation the panel is a dialog of whatever it holds: a form, a picker. */
  const Form = () => (
    <Column padding="8" gap="8">
      <Input id="dw-name" label="Name" />
      <Button onClick={() => {}}>Save</Button>
    </Column>
  );

  it("says it opens a dialog, and moves focus to the panel's first field", async () => {
    const user = userEvent.setup();
    render(
      <DropdownWrapper
        handleArrowNavigation={false}
        trigger={<Button>Rename</Button>}
        dropdown={<Form />}
      />,
      { wrapper: wrap },
    );
    expect(trigger("Rename")).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(trigger("Rename"));
    const field = await screen.findByRole("textbox", { name: "Name" });
    await waitFor(() => expect(field).toHaveFocus());
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("keeps Tab inside the panel", async () => {
    const user = userEvent.setup();
    render(
      <>
        <DropdownWrapper
          handleArrowNavigation={false}
          trigger={<Button>Rename</Button>}
          dropdown={<Form />}
        />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    await user.click(trigger("Rename"));
    const field = await screen.findByRole("textbox", { name: "Name" });
    await waitFor(() => expect(field).toHaveFocus());

    await user.tab();
    expect(trigger("Save")).toHaveFocus();
    await user.tab();
    expect(field).toHaveFocus();
    await user.tab({ shift: true });
    expect(trigger("Save")).toHaveFocus();
  });

  it("keeps typing in a field from closing or picking", async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <DropdownWrapper
          open={open}
          onOpenChange={setOpen}
          handleArrowNavigation={false}
          trigger={<Button>Rename</Button>}
          dropdown={<Form />}
        />
      );
    };
    render(<Harness />, { wrapper: wrap });
    await user.click(trigger("Rename"));
    const field = await screen.findByRole("textbox", { name: "Name" });
    await waitFor(() => expect(field).toHaveFocus());
    await user.keyboard("Draft one");
    expect(field).toHaveValue("Draft one");
    expect(trigger("Rename")).toHaveAttribute("aria-expanded", "true");
  });
});

/**
 * A trigger that is not a Button: the wrapper is the button then, so it
 * carries the popup semantics. It is not focusable itself, so a keyboard
 * user needs the trigger content to be (questionable: see the report).
 */
describe("DropdownWrapper around a plain trigger", () => {
  it("puts the popup semantics on the wrapper", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper trigger={<span>More</span>} dropdown={list} />, { wrapper: wrap });
    const buttons = screen.getAllByRole("button", { name: "More" });
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
    await user.click(screen.getByText("More"));
    await waitForOpen();
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
  });
});

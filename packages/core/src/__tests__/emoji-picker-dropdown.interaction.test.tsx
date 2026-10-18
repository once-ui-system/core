import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { EmojiPickerDropdown } from "../components/EmojiPickerDropdown";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";
import { clearLastOpenedDropdown } from "../utils/dropdownState";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

// The built-in eight-a-category set instead of the 1,800 generated emojis:
// the same component paths, at a size axe and role queries get through fast.
vi.mock("../data/emoji-data.json", () => ({ default: {} }));

failOnConsoleError();
beforeEach(() => {
  resetScrollLockState();
  clearLastOpenedDropdown();
});

const trigger = () => screen.getByRole("button", { name: "React" });
const search = () => screen.queryByRole("textbox", { name: "Search emojis" });

const openPicker = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(trigger());
  await waitFor(() => expect(search()).toHaveFocus());
};

/**
 * EmojiPickerDropdown is EmojiPicker in a DropdownWrapper whose trigger says
 * it opens a dialog. A pick closes it, controlled or not, and that close is
 * reported once: it went through both the pick handler and the picker's
 * onClose, so onOpenChange heard `false` twice for every pick.
 */
describe("EmojiPickerDropdown", () => {
  it("opens a dialog from its Button trigger, with focus in the search", async () => {
    const user = userEvent.setup();
    render(<EmojiPickerDropdown trigger={<Button>React</Button>} onSelect={() => {}} />, {
      wrapper: wrap,
    });
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");

    await openPicker(user);
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "smileys emojis" })).toBeInTheDocument();
  });

  it("reports the pick and the close once each", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <EmojiPickerDropdown
        trigger={<Button>React</Button>}
        onSelect={onSelect}
        onOpenChange={onOpenChange}
      />,
      { wrapper: wrap },
    );

    await openPicker(user);
    await user.click(screen.getByRole("button", { name: "grinning face" }));
    expect(onSelect.mock.calls).toEqual([["😀"]]);
    await waitFor(() => expect(search()).toBeNull());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("picks from the keyboard and hands focus back to the trigger", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<EmojiPickerDropdown trigger={<Button>React</Button>} onSelect={onSelect} />, {
      wrapper: wrap,
    });

    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(search()).toHaveFocus());
    await user.tab();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(onSelect.mock.calls).toEqual([["😃"]]);
    await waitFor(() => expect(search()).toBeNull());
    expect(trigger()).toHaveFocus();
  });

  it("stays open for more picks with closeAfterClick={false}", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <EmojiPickerDropdown
        closeAfterClick={false}
        trigger={<Button>React</Button>}
        onSelect={onSelect}
      />,
      { wrapper: wrap },
    );
    await openPicker(user);
    await user.click(screen.getByRole("button", { name: "grinning face" }));
    await user.click(screen.getByRole("button", { name: "face with tears of joy" }));
    expect(onSelect.mock.calls).toEqual([["😀"], ["😂"]]);
    expect(search()).toBeInTheDocument();
  });

  it("follows a controlled `open`", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <EmojiPickerDropdown
            open={open}
            onOpenChange={setOpen}
            trigger={<Button>React</Button>}
            onSelect={() => {}}
          />
          <span data-testid="state">{String(open)}</span>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await openPicker(user);
    expect(screen.getByTestId("state")).toHaveTextContent("true");
    await user.click(screen.getByRole("button", { name: "grinning face" }));
    await waitFor(() => expect(search()).toBeNull());
    expect(screen.getByTestId("state")).toHaveTextContent("false");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<EmojiPickerDropdown trigger={<Button>React</Button>} onSelect={() => {}} />, {
      wrapper: wrap,
    });
    await openPicker(user);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(search()).toBeNull());
    expect(trigger()).toHaveFocus();
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    render(<EmojiPickerDropdown trigger={<Button>React</Button>} onSelect={() => {}} />, {
      wrapper: wrap,
    });
    await openPicker(user);
    await expectNoAxeViolations(document.body);
  });
});

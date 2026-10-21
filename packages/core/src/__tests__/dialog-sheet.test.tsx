import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { Dialog } from "../components/Dialog";
import { Drawer } from "../components/Drawer";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { resetDialogState } from "../test/dialogTestUtils";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Harness = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open profile
      </button>
      <Dialog variant="sheet" open={open} onClose={() => setOpen(false)} title="Edit profile">
        <button type="button">Save</button>
        <button type="button">Discard</button>
      </Dialog>
    </>
  );
};

const openModal = async () => {
  const user = userEvent.setup();
  render(<Harness />, { wrapper: wrap });
  const opener = screen.getByRole("button", { name: "Open profile" });
  await user.click(opener);
  const dialog = await screen.findByRole("dialog");
  return { user, opener, dialog };
};

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
});

/**
 * Focus, naming and ref contract of the sheet: 2.x `Modal`, folded into
 * Dialog in 3.0 (F1). Every check Modal passed still holds for the sheet.
 */
describe('Dialog variant="sheet" (2.x Modal)', () => {
  it("is a modal dialog named by its title", async () => {
    const { dialog } = await openModal();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Edit profile");
    await expectNoAxeViolations(document.body);
  });

  it("moves focus into the dialog when it opens", async () => {
    const { dialog } = await openModal();
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("keeps Tab and Shift+Tab inside the dialog", async () => {
    const { user, opener } = await openModal();
    const close = screen.getByRole("button", { name: "Close" });
    const save = screen.getByRole("button", { name: "Save" });
    const discard = screen.getByRole("button", { name: "Discard" });

    await waitFor(() => expect(close).toHaveFocus());
    await user.tab();
    expect(save).toHaveFocus();
    await user.tab();
    expect(discard).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(discard).toHaveFocus();
    expect(opener).not.toHaveFocus();
  });

  it("returns focus to the opener when closed with Escape", async () => {
    const { user, opener } = await openModal();
    await waitFor(() => expect(screen.getByRole("button", { name: "Close" })).toHaveFocus());

    await user.keyboard("{Escape}");
    expect(opener).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("returns focus to the opener when closed with the close button", async () => {
    const { user, opener } = await openModal();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(opener).toHaveFocus();
  });

  it("returns focus to the opener when unmounted while open", async () => {
    const user = userEvent.setup();
    const Parent = () => {
      const [show, setShow] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setShow(true)}>
            Show
          </button>
          {show && (
            <Dialog variant="sheet" open onClose={() => setShow(false)} title="Transient">
              <button type="button" onClick={() => setShow(false)}>
                Remove
              </button>
            </Dialog>
          )}
        </>
      );
    };
    render(<Parent />, { wrapper: wrap });
    const opener = screen.getByRole("button", { name: "Show" });
    await user.click(opener);
    await user.click(await screen.findByRole("button", { name: "Remove" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("forwards its ref to the dialog element", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog variant="sheet" ref={ref} open onClose={() => {}} title="With ref">
        <p>Body</p>
      </Dialog>,
      { wrapper: wrap },
    );
    const dialog = await screen.findByRole("dialog");
    expect(ref.current).toBe(dialog);
  });
});

describe('Dialog variant="sheet" keeps Modal\'s look and slots', () => {
  it("renders the backdrop inside the overlay, behind the panel", async () => {
    render(
      <Dialog
        variant="sheet"
        open
        onClose={() => {}}
        title="With backdrop"
        backdrop={<div data-testid="backdrop" />}
      >
        <p>Body</p>
      </Dialog>,
      { wrapper: wrap },
    );
    const dialog = await screen.findByRole("dialog");
    const backdrop = screen.getByTestId("backdrop");
    expect(backdrop.parentElement).toBe(dialog);
    expect(dialog.firstElementChild).toBe(backdrop);
  });

  it("titles the sheet with a display heading, as Modal did", async () => {
    render(
      <Dialog variant="sheet" open onClose={() => {}} title="Display title">
        <p>Body</p>
      </Dialog>,
      { wrapper: wrap },
    );
    const heading = await screen.findByRole("heading", { name: "Display title", level: 2 });
    expect(heading).toHaveClass("font-display", "font-xs");
  });

  it("closes on a click outside the sheet, as Modal always did", async () => {
    let closed = 0;
    render(
      <Dialog variant="sheet" open onClose={() => closed++} title="Click away">
        <button type="button">Inside</button>
      </Dialog>,
      { wrapper: wrap },
    );
    const dialog = await screen.findByRole("dialog");
    await new Promise((resolve) => setTimeout(resolve, 20));
    screen
      .getByRole("button", { name: "Inside" })
      .dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    expect(closed).toBe(0);
    dialog.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    expect(closed).toBe(1);
  });

  it("has no axe violations with a description and a footer", async () => {
    render(
      <Dialog
        variant="sheet"
        open
        onClose={() => {}}
        title="Full sheet"
        description="Everything Dialog has, on a sheet"
        footer={<button type="button">Done</button>}
      >
        <p>Body</p>
      </Dialog>,
      { wrapper: wrap },
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleDescription("Everything Dialog has, on a sheet");
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });
});

describe("one overlay core for Dialog and Drawer", () => {
  it("answers Escape in the innermost overlay only", async () => {
    const user = userEvent.setup();
    const closed: string[] = [];
    const Nested = () => {
      const [dialog, setDialog] = useState(false);
      return (
        <Drawer open onClose={() => closed.push("drawer")} title="Drawer">
          <button type="button" onClick={() => setDialog(true)}>
            Open dialog
          </button>
          <Dialog
            open={dialog}
            onClose={() => {
              closed.push("dialog");
              setDialog(false);
            }}
            title="Dialog"
          >
            <p>Inner</p>
          </Dialog>
        </Drawer>
      );
    };
    render(<Nested />, { wrapper: wrap });
    await user.click(await screen.findByRole("button", { name: "Open dialog" }));
    await screen.findByRole("dialog", { name: "Dialog" });
    await user.keyboard("{Escape}");
    expect(closed).toEqual(["dialog"]);
    await user.keyboard("{Escape}");
    expect(closed).toEqual(["dialog", "drawer"]);
  });
});

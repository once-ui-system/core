import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { Modal } from "../components/Modal";
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
      <Modal open={open} onClose={() => setOpen(false)} title="Edit profile">
        <button type="button">Save</button>
        <button type="button">Discard</button>
      </Modal>
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

/** Focus, naming and ref contract for Modal (ROADMAP W3). */
describe("Modal accessibility", () => {
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
            <Modal open onClose={() => setShow(false)} title="Transient">
              <button type="button" onClick={() => setShow(false)}>
                Remove
              </button>
            </Modal>
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
      <Modal ref={ref} open onClose={() => {}} title="With ref">
        <p>Body</p>
      </Modal>,
      { wrapper: wrap },
    );
    const dialog = await screen.findByRole("dialog");
    expect(ref.current).toBe(dialog);
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "../components/Dialog";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { resetDialogState } from "../test/dialogTestUtils";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
});

const Harness = ({ onClose, backdrop }: { onClose?: () => void; backdrop?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog
        variant="sheet"
        open={open}
        backdrop={backdrop}
        title={
          <>
            Release <em>notes</em>
          </>
        }
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
      >
        <p>What changed in 2.1.</p>
        <input aria-label="Search notes" />
      </Dialog>
    </>
  );
};

const dialog = () => screen.queryByRole("dialog");

const open = async (props: React.ComponentProps<typeof Harness> = {}) => {
  const user = userEvent.setup();
  render(<Harness {...props} />, { wrapper: wrap });
  await user.click(screen.getByRole("button", { name: "Open" }));
  await screen.findByRole("dialog");
  await waitFor(() => expect(screen.getByRole("button", { name: "Close" })).toHaveFocus());
  return user;
};

/**
 * Modal beyond the focus contract in modal.test.tsx: nothing in the DOM while
 * closed, a node title still names it, the backdrop slot renders behind the
 * sheet, a press outside the sheet closes it and one inside does not, the
 * page behind stops scrolling, and an Escape something inside already handled
 * is not the Modal's.
 */
describe("Modal", () => {
  it("renders nothing while closed", () => {
    render(
      <Dialog variant="sheet" open={false} onClose={() => {}} title="Hidden">
        <p>Body</p>
      </Dialog>,
      { wrapper: wrap },
    );
    expect(dialog()).toBeNull();
    expect(screen.queryByText("Body")).toBeNull();
  });

  it("is named by a title node, renders its children and the backdrop slot", async () => {
    await open({ backdrop: <div data-testid="backdrop" /> });
    expect(dialog()).toHaveAccessibleName("Release notes");
    expect(screen.getByRole("heading", { level: 2, name: "Release notes" })).toBeInTheDocument();
    expect(screen.getByText("What changed in 2.1.")).toBeInTheDocument();
    expect(dialog()).toContainElement(screen.getByTestId("backdrop"));
    await expectNoAxeViolations(document.body);
  });

  it("closes on a press outside the sheet, not on one inside it", async () => {
    const onClose = vi.fn();
    await open({ onClose });

    // The click-outside listener goes on 10ms after opening.
    await new Promise((resolve) => setTimeout(resolve, 20));
    fireEvent.mouseDown(screen.getByText("What changed in 2.1."));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(dialog() as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes once from the close button", async () => {
    const onClose = vi.fn();
    const user = await open({ onClose });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(dialog()).toBeNull());
  });

  it("calls onClose on Escape, but not for an Escape something inside handled", async () => {
    const onClose = vi.fn();
    const user = await open({ onClose });
    const field = screen.getByRole("textbox", { name: "Search notes" });
    field.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && (event.target as HTMLInputElement).value) {
        event.preventDefault();
      }
    });

    await user.click(field);
    await user.keyboard("draft{Escape}");
    expect(onClose).not.toHaveBeenCalled();

    await user.clear(field);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not listen for Escape while closed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog variant="sheet" open={false} onClose={onClose} title="Closed">
        <p>Body</p>
      </Dialog>,
      { wrapper: wrap },
    );
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("stops the page behind it scrolling while open, and lets it go on close", async () => {
    const wheel = () => {
      const event = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const user = await open();
    expect(wheel()).toBe(true);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(dialog()).toBeNull());
    expect(wheel()).toBe(false);
  });

  it("opens again after closing", async () => {
    const user = await open();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(dialog()).toBeNull());
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toHaveAccessibleName("Release notes");
  });
});

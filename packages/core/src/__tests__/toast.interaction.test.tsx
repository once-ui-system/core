import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "../components/Toast";
import { Toaster } from "../components/Toaster";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider, useToast } from "../contexts/ToastProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const consoleError = failOnConsoleError();

/**
 * The Toast on its own: what it shows, the one control it adds (Hide), and
 * the onClose it reports when it goes, whether a person closed it or its
 * countdown ran out.
 */
describe("Toast", () => {
  it("renders its message as a polite status, with the variant icon", async () => {
    const { container } = render(<Toast tone="success">Saved</Toast>, { wrapper: wrap });
    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Saved");
    expect(toast.querySelector("svg")).not.toBeNull();
    // No onClose, no close button: nothing to dismiss it with.
    expect(within(toast).queryByRole("button")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("drops the icon with showIcon={false}", () => {
    render(
      <Toast tone="info" showIcon={false}>
        Plain
      </Toast>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("status").querySelector("svg")).toBeNull();
  });

  it("renders the action next to the message", async () => {
    const user = userEvent.setup();
    const undo = vi.fn();
    const { container } = render(
      <Toast
        tone="warning"
        onClose={() => {}}
        action={
          <button type="button" onClick={undo}>
            Undo
          </button>
        }
      >
        Archived
      </Toast>,
      { wrapper: wrap },
    );

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(undo).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(container);
  });

  it("is closed by its named Hide button, from the keyboard too", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Toast tone="danger" onClose={onClose}>
        Failed
      </Toast>,
      { wrapper: wrap },
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    await user.tab();
    const hide = within(alert).getByRole("button", { name: "Hide" });
    expect(hide).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("forwards its ref and className to the toast element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Toast ref={ref} tone="info" className="mine">
        Hi
      </Toast>,
      { wrapper: wrap },
    );
    expect(ref.current).toBe(screen.getByRole("status"));
    expect(screen.getByRole("status")).toHaveClass("mine");
  });

  describe("countdown", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("reports onClose once when the duration runs out", () => {
      const onClose = vi.fn();
      render(
        <Toast tone="info" duration={500} onClose={onClose}>
          Brief
        </Toast>,
        { wrapper: wrap },
      );
      act(() => vi.advanceTimersByTime(499));
      expect(onClose).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1));
      expect(onClose).toHaveBeenCalledTimes(1);
      act(() => vi.advanceTimersByTime(5000));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

/**
 * Toaster stacks the toasts it is given in a portal and positions the stack
 * per breakpoint. jsdom's window is 1024px wide, the "m" breakpoint, and a
 * position set on a wider breakpoint cascades down to it.
 */
describe("Toaster", () => {
  const toasts = [
    { id: "1", tone: "success" as const, message: "One" },
    { id: "2", tone: "danger" as const, message: "Two" },
  ];

  const stack = () => screen.getByText("One").closest('[class*="toastContainer"]');

  it("renders each toast into document.body, in order", () => {
    const { container } = render(<Toaster toasts={toasts} removeToast={() => {}} />, {
      wrapper: wrap,
    });
    expect(container).toBeEmptyDOMElement();
    // The stack is one polite live region; only a danger toast is its own alert.
    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region.textContent).toMatch(/One.*Two/);
    expect(screen.getByRole("alert")).toHaveTextContent("Two");
  });

  it("sits at the bottom by default", () => {
    render(<Toaster toasts={toasts} removeToast={() => {}} />, { wrapper: wrap });
    expect(stack()?.className).toMatch(/_bottom_/);
  });

  it("takes the position set for a wider breakpoint", () => {
    render(<Toaster toasts={toasts} removeToast={() => {}} xl="top" />, { wrapper: wrap });
    expect(stack()?.className).toMatch(/_top_/);
  });

  it("ignores a position set only for a narrower breakpoint", () => {
    render(<Toaster toasts={toasts} removeToast={() => {}} s="top" />, { wrapper: wrap });
    expect(stack()?.className).toMatch(/_bottom_/);
  });

  it("calls removeToast with the id of the toast whose Hide was pressed", async () => {
    const user = userEvent.setup();
    const removeToast = vi.fn();
    render(<Toaster toasts={toasts} removeToast={removeToast} />, { wrapper: wrap });

    await user.click(within(screen.getByRole("alert")).getByRole("button", { name: "Hide" }));
    expect(removeToast).toHaveBeenCalledWith("2");
    expect(removeToast).toHaveBeenCalledTimes(1);
  });
});

/** The public hook: addToast puts a closable toast up, and it refuses to run without a provider. */
describe("useToast", () => {
  it("throws outside a ToastProvider", () => {
    const Orphan = () => {
      useToast();
      return null;
    };
    consoleError().mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow("useToast must be used within a ToastProvider");
    consoleError().mockClear();
  });

  it("shows a toast from a button and removes it with Hide", async () => {
    const user = userEvent.setup();
    const Consumer = () => {
      const { addToast, toasts } = useToast();
      return (
        <>
          <button
            type="button"
            onClick={() => addToast({ tone: "success", message: "Copied", duration: Infinity })}
          >
            Copy
          </button>
          <span data-testid="count">{toasts.length}</span>
        </>
      );
    };
    render(
      <LayoutProvider>
        <ToastProvider xl="top">
          <Consumer />
        </ToastProvider>
      </LayoutProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Copy" }));
    const toast = screen.getByText("Copied").closest('[class*="toast"]') as HTMLElement;
    expect(toast).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    await user.click(within(toast).getByRole("button", { name: "Hide" }));
    expect(screen.queryByText("Copied")).toBeNull();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});

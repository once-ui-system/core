import { act, createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog, DialogProvider } from "../components/Dialog";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts";
import { resetDialogState } from "../test/dialogTestUtils";

vi.mock("../components", async () => {
  const actual = await vi.importActual<typeof import("../components")>("../components");

  return {
    ...actual,
    IconButton: ({ onClick, tooltip }: { onClick?: () => void; tooltip?: string }) => (
      <button aria-label={tooltip || "Close"} onClick={onClick} type="button">
        Close
      </button>
    ),
  };
});

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: "Dialog title",
  children: <button type="button">Primary action</button>,
};

const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const renderDialog = (props: Partial<React.ComponentProps<typeof Dialog>> = {}) =>
  render(<Dialog {...defaultProps} {...props} />, { wrapper: TestProviders });

const getDialogPanel = (root: ParentNode = document.body) =>
  root.querySelector('[tabindex="-1"]') as HTMLElement | null;

const getOverlay = () => screen.getByRole("dialog");

const advanceTimers = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Dialog", () => {
  describe("rendering and visibility", () => {
    it("renders nothing when isOpen is false", () => {
      renderDialog({ isOpen: false });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("Dialog title")).not.toBeInTheDocument();
    });

    it("renders into the portal when isOpen is true", () => {
      renderDialog();

      expect(getOverlay()).toBeInTheDocument();
      expect(document.body).toContainElement(getOverlay());
    });

    it("sets aria-modal on the dialog overlay", () => {
      renderDialog();

      expect(getOverlay()).toHaveAttribute("aria-modal", "true");
    });

    it("has a valid aria-labelledby pointing to an element in the DOM", () => {
      renderDialog();
      const overlay = getOverlay();
      const labelledBy = overlay.getAttribute("aria-labelledby");

      expect(labelledBy).toBeTruthy();
      expect(labelledBy && document.getElementById(labelledBy)).toBeInTheDocument();
    });

    it("uses unique aria-labelledby ids for stacked dialogs", () => {
      renderDialog({ title: "Base dialog", base: true });
      renderDialog({ title: "Stacked dialog", stack: true });

      const [baseDialog, stackedDialog] = screen.getAllByRole("dialog");
      const baseLabelId = baseDialog.getAttribute("aria-labelledby");
      const stackedLabelId = stackedDialog.getAttribute("aria-labelledby");

      expect(baseLabelId).toBeTruthy();
      expect(stackedLabelId).toBeTruthy();
      expect(baseLabelId).not.toBe(stackedLabelId);
      expect(baseLabelId && document.getElementById(baseLabelId)).toBeInTheDocument();
      expect(stackedLabelId && document.getElementById(stackedLabelId)).toBeInTheDocument();
    });

    it("renders a string title", () => {
      renderDialog({ title: "Simple title" });

      expect(screen.getByText("Simple title")).toBeInTheDocument();
    });

    it("renders a ReactNode title", () => {
      renderDialog({ title: <span data-testid="custom-title">Custom title</span> });

      expect(screen.getByTestId("custom-title")).toBeInTheDocument();
    });

    it("labels the dialog correctly when title is a ReactNode", () => {
      renderDialog({ title: <span>Custom title node</span> });

      const overlay = getOverlay();
      const labelledBy = overlay.getAttribute("aria-labelledby");

      expect(labelledBy).toBeTruthy();
      expect(labelledBy && document.getElementById(labelledBy)).toHaveTextContent(
        "Custom title node",
      );
    });

    it("renders description when provided", () => {
      renderDialog({ description: "Helpful description" });

      expect(screen.getByText("Helpful description")).toBeInTheDocument();
    });

    it("does not render description when omitted", () => {
      renderDialog();

      expect(screen.queryByText("Helpful description")).not.toBeInTheDocument();
    });

    it("renders children inside the dialog body", () => {
      renderDialog({ children: <div>Body content</div> });

      expect(screen.getByText("Body content")).toBeInTheDocument();
    });

    it("renders footer when provided", () => {
      renderDialog({ footer: <button type="button">Confirm</button> });

      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    });

    it("does not render footer when omitted", () => {
      renderDialog();

      expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
    });
  });

  describe("open and close animation state machine", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("opens visible immediately and animates after a tick", () => {
      const { rerender } = renderDialog({ isOpen: false });

      rerender(<Dialog {...defaultProps} isOpen />);

      expect(getOverlay()).toBeInTheDocument();
      expect(getOverlay()).not.toHaveClass("open");

      advanceTimers(0);

      expect(getOverlay()).toHaveClass("open");
    });

    it("stops animating immediately on close and hides after 300ms", () => {
      const { rerender } = renderDialog();

      advanceTimers(0);
      expect(getOverlay()).toHaveClass("open");

      rerender(<Dialog {...defaultProps} isOpen={false} />);

      expect(getOverlay()).not.toHaveClass("open");

      advanceTimers(299);
      expect(getOverlay()).toBeInTheDocument();

      advanceTimers(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("handles rapid open-close-open without leaving the dialog hidden", () => {
      const { rerender } = renderDialog({ isOpen: false });

      rerender(<Dialog {...defaultProps} isOpen />);
      rerender(<Dialog {...defaultProps} isOpen={false} />);
      rerender(<Dialog {...defaultProps} isOpen />);

      advanceTimers(0);
      advanceTimers(300);

      expect(getOverlay()).toBeInTheDocument();
      expect(getOverlay()).toHaveClass("open");
    });

    it("handles rapid close-open-close without leaving the dialog visible", () => {
      const { rerender } = renderDialog();

      advanceTimers(0);
      rerender(<Dialog {...defaultProps} isOpen={false} />);
      rerender(<Dialog {...defaultProps} isOpen />);
      rerender(<Dialog {...defaultProps} isOpen={false} />);

      expect(getOverlay()).not.toHaveClass("open");

      advanceTimers(300);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("onClose callback triggers", () => {
    it("calls onClose on Escape when base is false", () => {
      const onClose = vi.fn();
      renderDialog({ onClose, base: false });

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose on Escape when base is true", () => {
      const onClose = vi.fn();
      renderDialog({ onClose, base: true });

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onClose when clicking outside while open and not base", () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      renderDialog({ onClose, base: false });
      const outside = document.createElement("div");
      document.body.appendChild(outside);

      advanceTimers(10);
      fireEvent.mouseDown(outside, { button: 0 });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when clicking outside with a non-primary mouse button", () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      renderDialog({ onClose, base: false });
      const outside = document.createElement("div");
      document.body.appendChild(outside);

      advanceTimers(10);
      fireEvent.mouseDown(outside, { button: 2 });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when clicking outside with base true and stack false", () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      renderDialog({ onClose, base: true, stack: false });
      const outside = document.createElement("div");
      document.body.appendChild(outside);

      advanceTimers(10);
      fireEvent.mouseDown(outside, { button: 0 });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onClose when clicking outside with stack true", () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      renderDialog({ onClose, base: true, stack: true });
      const outside = document.createElement("div");
      document.body.appendChild(outside);

      advanceTimers(10);
      fireEvent.mouseDown(outside, { button: 0 });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when clicking inside the dialog", () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      renderDialog({ onClose, children: <button type="button">Inside content</button> });

      advanceTimers(10);
      fireEvent.mouseDown(screen.getByRole("button", { name: "Inside content" }), { button: 0 });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when clicking inside a dropdown portal", () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      renderDialog({ onClose });
      const dropdownPortal = document.createElement("div");
      dropdownPortal.className = "dropdown-portal";
      const dropdownItem = document.createElement("button");
      dropdownPortal.appendChild(dropdownItem);
      document.body.appendChild(dropdownPortal);

      advanceTimers(10);
      fireEvent.mouseDown(dropdownItem, { button: 0 });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onClose when the close button is clicked", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderDialog({ onClose });

      await user.click(screen.getByRole("button", { name: /close/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("focus management", () => {
    it("moves focus to the first focusable element in the dialog when opened", () => {
      renderDialog({
        children: (
          <>
            <button type="button">First content button</button>
            <button type="button">Second content button</button>
          </>
        ),
      });

      expect(document.activeElement).toBe(screen.getByRole("button", { name: /close/i }));
    });

    it("wraps Tab from the last focusable element to the first", () => {
      renderDialog({
        children: (
          <>
            <button type="button">First content button</button>
            <button type="button">Last content button</button>
          </>
        ),
      });

      const panel = getDialogPanel();
      const buttons = screen.getAllByRole("button");
      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      last.focus();
      act(() => {
        fireEvent.keyDown(panel as HTMLElement, { key: "Tab" });
      });

      expect(document.activeElement).toBe(first);
    });

    it("wraps Shift+Tab from the first focusable element to the last", () => {
      renderDialog({
        children: (
          <>
            <button type="button">First content button</button>
            <button type="button">Last content button</button>
          </>
        ),
      });

      const panel = getDialogPanel();
      const buttons = screen.getAllByRole("button");
      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      first.focus();
      act(() => {
        fireEvent.keyDown(panel as HTMLElement, { key: "Tab", shiftKey: true });
      });

      expect(document.activeElement).toBe(last);
    });

    it("does not crash when no focusable elements are found", () => {
      const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const originalQuerySelectorAll = HTMLElement.prototype.querySelectorAll;
      let interceptedQuery = false;

      const spy = vi
        .spyOn(HTMLElement.prototype, "querySelectorAll")
        .mockImplementation(function mockQuery(this: HTMLElement, selectors: string) {
          if (selectors === focusableSelector && this.getAttribute("tabindex") === "-1") {
            interceptedQuery = true;
            return document.createDocumentFragment().querySelectorAll(selectors);
          }
          return originalQuerySelectorAll.call(this, selectors);
        });

      try {
        expect(() => {
          renderDialog({ children: <div>Only text content</div> });
        }).not.toThrow();

        expect(interceptedQuery).toBe(true);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      } finally {
        spy.mockRestore();
      }
    });

    it("restores focus to the opener after the close animation completes", () => {
      vi.useFakeTimers();
      const opener = document.createElement("button");
      opener.textContent = "Open dialog";
      document.body.appendChild(opener);
      opener.focus();

      try {
        const { rerender } = renderDialog();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: /close/i }));

        rerender(<Dialog {...defaultProps} isOpen={false} />);

        expect(document.activeElement).not.toBe(opener);

        advanceTimers(299);
        expect(document.activeElement).not.toBe(opener);

        advanceTimers(1);
        expect(document.activeElement).toBe(opener);
      } finally {
        opener.remove();
      }
    });

    it("restores focus on unmount while still visible", () => {
      const opener = document.createElement("button");
      opener.textContent = "Open dialog";
      document.body.appendChild(opener);
      opener.focus();

      try {
        const { unmount } = renderDialog();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: /close/i }));

        unmount();

        expect(document.activeElement).toBe(opener);
      } finally {
        opener.remove();
      }
    });
  });

  describe("inert state management", () => {
    it("sets inert on other body children while a dialog is open", () => {
      const sibling = document.createElement("div");
      document.body.appendChild(sibling);
      renderDialog();

      expect(sibling.inert).toBe(true);
    });

    it("restores inert when a dialog closes", () => {
      vi.useFakeTimers();
      const sibling = document.createElement("div");
      document.body.appendChild(sibling);
      const { rerender } = renderDialog();

      rerender(<Dialog {...defaultProps} isOpen={false} />);
      advanceTimers(300);

      expect(sibling.inert).toBe(false);
    });

    it("sets inert on other body children when a stacked dialog is open", () => {
      renderDialog({ title: "Base dialog", base: true });
      renderDialog({ title: "Stacked dialog", stack: true });

      const [baseOverlay] = screen.getAllByRole("dialog");

      expect(baseOverlay.inert).toBe(true);
    });

    it("restores inert on the base dialog when the stacked dialog closes", () => {
      vi.useFakeTimers();
      renderDialog({ title: "Base dialog", base: true });
      const stacked = renderDialog({ title: "Stacked dialog", stack: true });
      const [baseOverlay] = screen.getAllByRole("dialog");
      const basePanel = getDialogPanel(baseOverlay) as HTMLElement;

      stacked.rerender(<Dialog {...defaultProps} title="Stacked dialog" isOpen={false} stack />);
      advanceTimers(300);

      expect(basePanel.inert).toBe(false);
    });

    it("restores inert when unmounted while open", () => {
      const sibling = document.createElement("div");
      document.body.appendChild(sibling);
      const { unmount } = renderDialog();

      expect(sibling.inert).toBe(true);

      unmount();

      expect(sibling.inert).toBe(false);
    });

    it("does not leave sibling inert after rapid open and close", () => {
      vi.useFakeTimers();
      const sibling = document.createElement("div");
      document.body.appendChild(sibling);
      const { rerender } = renderDialog({ isOpen: false });

      rerender(<Dialog {...defaultProps} isOpen />);
      rerender(<Dialog {...defaultProps} isOpen={false} />);
      rerender(<Dialog {...defaultProps} isOpen />);
      rerender(<Dialog {...defaultProps} isOpen={false} />);
      advanceTimers(300);

      expect(sibling.inert).toBe(false);
    });
  });

  describe("ScrollLock integration", () => {
    it("prevents wheel scroll while the dialog is open", () => {
      renderDialog();

      const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
      document.body.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it("does not prevent wheel scroll after the dialog closes", () => {
      const { rerender } = renderDialog();

      rerender(<Dialog {...defaultProps} isOpen={false} />);

      const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
      document.body.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });

    it("does not prevent Space key in the dialog's own content", () => {
      renderDialog({
        children: <textarea data-testid="dialog-textarea" />,
      });

      const textarea = screen.getByTestId("dialog-textarea");
      const spaceEvent = createEvent.keyDown(textarea, { key: " " });
      fireEvent(textarea, spaceEvent);

      expect(spaceEvent.defaultPrevented).toBe(false);
    });
  });

  describe("onHeightChange callback", () => {
    it("calls onHeightChange with the dialog offsetHeight when visible", () => {
      const onHeightChange = vi.fn();
      const spy = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(321);

      renderDialog({ onHeightChange });

      expect(onHeightChange).toHaveBeenCalledWith(321);

      spy.mockRestore();
    });

    it("does not call onHeightChange when the dialog is not visible", () => {
      const onHeightChange = vi.fn();

      renderDialog({ isOpen: false, onHeightChange });

      expect(onHeightChange).not.toHaveBeenCalled();
    });
  });

  describe("minHeight prop", () => {
    it("applies minHeight inline style when provided", () => {
      renderDialog({ minHeight: 480 });

      expect(getDialogPanel()).toHaveStyle({ minHeight: "480px" });
    });

    it("does not apply minHeight style when omitted", () => {
      renderDialog();

      expect(getDialogPanel()).not.toHaveStyle({ minHeight: "480px" });
    });
  });

  describe("base and stack props", () => {
    it("applies zIndex 8 on the overlay when base is true", () => {
      renderDialog({ base: true });

      expect(getOverlay()).toHaveClass("z-index-8");
    });

    it("applies zIndex 9 on the overlay when base is false", () => {
      renderDialog({ base: false });

      expect(getOverlay()).toHaveClass("z-index-9");
    });

    it("applies the base transform on the inner wrapper when base is true", () => {
      renderDialog({ base: true });

      expect(getOverlay().firstElementChild).toHaveStyle({
        transform: "scale(0.94) translateY(-1.25rem)",
      });
    });
  });

  describe("DialogProvider", () => {
    it("renders children correctly", () => {
      render(
        <DialogProvider>
          <div>Provider child</div>
        </DialogProvider>,
      );

      expect(screen.getByText("Provider child")).toBeInTheDocument();
    });
  });

  describe("SSR safety", () => {
    it("does not throw during server render when closed", () => {
      const { renderToString } = require("react-dom/server");

      expect(() => {
        renderToString(
          <LayoutProvider>
            <Dialog {...defaultProps} isOpen={false} />
          </LayoutProvider>,
        );
      }).not.toThrow();
    });
  });
});

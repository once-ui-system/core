import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Modal } from "../components/Modal";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts";

vi.mock("../components/IconButton", () => ({
  IconButton: ({ onClick, tooltip }: { onClick?: () => void; tooltip?: string }) => (
    <button aria-label={tooltip || "Close"} onClick={onClick} type="button">
      Close
    </button>
  ),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: "Modal title",
  children: <div>Modal body content</div>,
};

const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const renderModal = (props: Partial<React.ComponentProps<typeof Modal>> = {}) =>
  render(<Modal {...defaultProps} {...props} />, { wrapper: TestProviders });

const advanceTimers = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe("Modal", () => {
  beforeEach(() => {
    resetScrollLockState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering and visibility", () => {
    it("renders nothing when isOpen is false", () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("Modal title")).not.toBeInTheDocument();
    });

    it("renders into portal when isOpen is true", () => {
      renderModal();

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(document.body).toContainElement(dialog);
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("renders title and children", () => {
      renderModal({
        title: "Custom Modal Title",
        children: <div>Specific content</div>,
      });

      expect(screen.getByText("Custom Modal Title")).toBeInTheDocument();
      expect(screen.getByText("Specific content")).toBeInTheDocument();
    });

    it("renders backdrop when provided", () => {
      renderModal({
        backdrop: <div data-testid="custom-backdrop">Backdrop element</div>,
      });

      expect(screen.getByTestId("custom-backdrop")).toBeInTheDocument();
    });
  });

  describe("animation and transition", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("animates to visible and hides after 300ms on close", () => {
      const { rerender } = renderModal({ isOpen: false });

      rerender(<Modal {...defaultProps} isOpen />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      advanceTimers(0);
      expect(screen.getByRole("dialog")).toHaveClass("opacity-100");

      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.getByRole("dialog")).not.toHaveClass("opacity-100");

      advanceTimers(299);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      advanceTimers(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("callbacks and interactions", () => {
    it("calls onClose when the close button is clicked", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderModal({ onClose });

      await user.click(screen.getByRole("button", { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose on Escape keydown", () => {
      const onClose = vi.fn();
      renderModal({ onClose });

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking outside the dialog", () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      renderModal({ onClose });

      advanceTimers(10);
      const overlay = screen.getByRole("dialog");
      fireEvent.mouseDown(overlay, { button: 0 });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when clicking inside the dialog content", () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      renderModal({ onClose });

      advanceTimers(10);
      fireEvent.mouseDown(screen.getByText("Modal body content"), { button: 0 });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to root dialog overlay element", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <TestProviders>
          <Modal {...defaultProps} ref={ref} />
        </TestProviders>,
      );

      expect(ref.current).toBe(screen.getByRole("dialog"));
    });
  });

  describe("SSR safety", () => {
    it("does not throw during server render when closed", () => {
      const { renderToString } = require("react-dom/server");

      expect(() => {
        renderToString(
          <LayoutProvider>
            <Modal {...defaultProps} isOpen={false} />
          </LayoutProvider>,
        );
      }).not.toThrow();
    });
  });
});

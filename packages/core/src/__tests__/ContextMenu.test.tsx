import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContextMenu } from "../components/ContextMenu";
import { Option } from "../components/Option";
import { resetScrollLockState } from "../components/ScrollLock";

const renderContextMenu = (props: Partial<React.ComponentProps<typeof ContextMenu>> = {}) =>
  render(
    <ContextMenu
      dropdown={
        <>
          <Option value="opt1" label="Option 1" />
          <Option value="opt2" label="Option 2" />
        </>
      }
      {...props}
    >
      <div data-testid="target-area">Right Click Target</div>
    </ContextMenu>,
  );

describe("ContextMenu", () => {
  beforeEach(() => {
    resetScrollLockState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering and trigger interaction", () => {
    it("renders children and does not show menu initially", () => {
      renderContextMenu();

      expect(screen.getByTestId("target-area")).toBeInTheDocument();
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });

    it("opens menu on right-click (contextmenu event) with correct coordinates", () => {
      renderContextMenu();

      const target = screen.getByTestId("target-area");
      fireEvent.contextMenu(target, { clientX: 150, clientY: 250 });

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();

      const menu = screen.getByRole("menu");
      expect(menu).toHaveStyle({ top: "250px", left: "150px" });
    });

    it("opens menu on Ctrl+Click (Mac shortcut)", () => {
      renderContextMenu();

      const target = screen.getByTestId("target-area");
      fireEvent.click(target, { ctrlKey: true, clientX: 100, clientY: 200 });

      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("does not open menu when disabled", () => {
      renderContextMenu({ disabled: true });

      const target = screen.getByTestId("target-area");
      fireEvent.contextMenu(target, { clientX: 100, clientY: 100 });

      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });
  });

  describe("controlled mode", () => {
    it("renders menu when open is true", () => {
      renderContextMenu({ open: true });

      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("calls onOpenChange when triggered", () => {
      const onOpenChange = vi.fn();
      renderContextMenu({ open: false, onOpenChange });

      const target = screen.getByTestId("target-area");
      fireEvent.contextMenu(target, { clientX: 50, clientY: 50 });

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe("selection and closing", () => {
    it("calls onSelect when an option is clicked", () => {
      const onSelect = vi.fn();
      renderContextMenu({ onSelect });

      const target = screen.getByTestId("target-area");
      fireEvent.contextMenu(target, { clientX: 50, clientY: 50 });

      fireEvent.click(screen.getByText("Option 1"));
      expect(onSelect).toHaveBeenCalledWith("opt1");
    });

    it("closes menu when clicking outside", () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ContextMenu dropdown={<Option value="opt" label="Opt" />}>
            <div data-testid="target">Target</div>
          </ContextMenu>
        </div>,
      );

      fireEvent.contextMenu(screen.getByTestId("target"), { clientX: 50, clientY: 50 });
      expect(screen.getByText("Opt")).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId("outside"));
      expect(screen.queryByText("Opt")).not.toBeInTheDocument();
    });

    it("closes menu on Escape key", () => {
      renderContextMenu();

      fireEvent.contextMenu(screen.getByTestId("target-area"), { clientX: 50, clientY: 50 });
      expect(screen.getByText("Option 1")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to dropdown container when open", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <ContextMenu ref={ref} open dropdown={<Option value="1" label="One" />}>
          <div>Target</div>
        </ContextMenu>,
      );

      expect(ref.current).toBe(screen.getByRole("menu"));
    });
  });
});

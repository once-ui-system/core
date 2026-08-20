import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DropdownWrapper } from "../components/DropdownWrapper";
import { Option } from "../components/Option";
import { resetScrollLockState } from "../components/ScrollLock";
import { clearLastOpenedDropdown } from "../utils";

const renderDropdown = (props: Partial<React.ComponentProps<typeof DropdownWrapper>> = {}) =>
  render(
    <DropdownWrapper
      trigger={<button type="button">Trigger Button</button>}
      dropdown={
        <>
          <Option value="opt1" label="Option 1" />
          <Option value="opt2" label="Option 2" />
        </>
      }
      {...props}
    />,
  );

describe("DropdownWrapper", () => {
  beforeEach(() => {
    resetScrollLockState();
    clearLastOpenedDropdown();
  });

  afterEach(() => {
    clearLastOpenedDropdown();
    vi.useRealTimers();
  });

  describe("rendering and trigger interaction", () => {
    it("renders trigger and does not render dropdown portal initially", () => {
      renderDropdown();

      expect(screen.getByText("Trigger Button")).toBeInTheDocument();
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });

    it("opens dropdown portal when trigger is clicked", async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByText("Trigger Button"));

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("toggles dropdown closed when clicking trigger again", async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByText("Trigger Button"));
      expect(screen.getByText("Option 1")).toBeInTheDocument();

      await user.click(screen.getByText("Trigger Button"));
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });

    it("respects disableTriggerClick prop", async () => {
      const user = userEvent.setup();
      renderDropdown({ disableTriggerClick: true });

      await user.click(screen.getByText("Trigger Button"));
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });
  });

  describe("controlled mode", () => {
    it("opens when controlled isOpen is true", () => {
      renderDropdown({ isOpen: true });

      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("calls onOpenChange when trigger is clicked", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      renderDropdown({ isOpen: false, onOpenChange });

      await user.click(screen.getByText("Trigger Button"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe("selection and closing", () => {
    it("calls onSelect and closes when option is clicked", async () => {
      const onSelect = vi.fn();
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      renderDropdown({ onSelect, onOpenChange });

      await user.click(screen.getByText("Trigger Button"));
      expect(screen.getByText("Option 1")).toBeInTheDocument();

      await user.click(screen.getByText("Option 1"));
      expect(onSelect).toHaveBeenCalledWith("opt1");
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });

    it("does not close on select when closeAfterClick is false", async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      renderDropdown({ onSelect, closeAfterClick: false });

      await user.click(screen.getByText("Trigger Button"));
      await user.click(screen.getByText("Option 1"));

      expect(onSelect).toHaveBeenCalledWith("opt1");
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });
  });

  describe("outside click and keyboard interactions", () => {
    it("closes dropdown on Escape keydown", async () => {
      const user = userEvent.setup();
      renderDropdown();

      await user.click(screen.getByText("Trigger Button"));
      expect(screen.getByText("Option 1")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
    });

    it("closes dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <div data-testid="outside-area">Outside element</div>
          <DropdownWrapper
            trigger={<button type="button">Trigger</button>}
            dropdown={<Option value="1" label="One" />}
          />
        </div>,
      );

      await user.click(screen.getByText("Trigger"));
      expect(screen.getByText("One")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("outside-area"));
      expect(screen.queryByText("One")).not.toBeInTheDocument();
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to the outer wrapper element", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <DropdownWrapper
          ref={ref}
          trigger={<button type="button">Trigger</button>}
          dropdown={<Option value="1" label="One" />}
        />,
      );

      expect(ref.current).toBeInTheDocument();
      expect(ref.current).toHaveAttribute("data-role", "dropdown-wrapper");
    });
  });
});

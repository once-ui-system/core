import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  ArrowNavigation,
  useArrowNavigationContext,
  withArrowNavigation,
} from "../components/ArrowNavigationContext";

describe("ArrowNavigation", () => {
  const renderListbox = (props: Partial<React.ComponentProps<typeof ArrowNavigation>> = {}) => {
    return render(
      <ArrowNavigation itemCount={3} layout="column" {...props}>
        <button type="button" role="option" aria-selected="false">
          Option 1
        </button>
        <button type="button" role="option" aria-selected="false">
          Option 2
        </button>
        <button type="button" role="option" aria-selected="false">
          Option 3
        </button>
      </ArrowNavigation>,
    );
  };

  describe("rendering and accessibility roles", () => {
    it("renders children and defaults role to 'listbox' for column layout", () => {
      renderListbox({ layout: "column" });
      const container = screen.getByRole("listbox");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
    });

    it("defaults role to 'grid' for grid layout", () => {
      renderListbox({ layout: "grid", columns: 2 });
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("allows overriding the role and sets aria-label", () => {
      renderListbox({ role: "menu", "aria-label": "Custom Menu" });
      const container = screen.getByRole("menu");
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute("aria-label", "Custom Menu");
    });

    it("applies max-h-full and outline-none Tailwind classes and merges className", () => {
      renderListbox({ className: "custom-class" });
      const container = screen.getByRole("listbox");
      expect(container).toHaveClass("max-h-full");
      expect(container).toHaveClass("outline-none");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("ref forwarding and Column props", () => {
    it("forwards ref to the underlying container element", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <ArrowNavigation ref={ref} itemCount={2} layout="column">
          <button type="button" role="option">
            Item 1
          </button>
          <button type="button" role="option">
            Item 2
          </button>
        </ArrowNavigation>,
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute("role", "listbox");
      expect(ref.current).toHaveAttribute("tabindex", "-1");
    });

    it("passes column/flex layout props to the underlying Column", () => {
      render(
        <ArrowNavigation itemCount={1} layout="column" data-testid="nav-container" fillWidth>
          <button type="button">Item</button>
        </ArrowNavigation>,
      );

      const container = screen.getByTestId("nav-container");
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("w-full");
    });
  });

  describe("keyboard arrow navigation", () => {
    it("navigates down and up in column layout", () => {
      const onFocusChange = vi.fn();
      renderListbox({ layout: "column", onFocusChange, initialFocusedIndex: 0 });

      const container = screen.getByRole("listbox");
      fireEvent.keyDown(container, { key: "ArrowDown" });
      expect(onFocusChange).toHaveBeenCalledWith(1);

      fireEvent.keyDown(container, { key: "ArrowDown" });
      expect(onFocusChange).toHaveBeenCalledWith(2);

      fireEvent.keyDown(container, { key: "ArrowUp" });
      expect(onFocusChange).toHaveBeenCalledWith(1);
    });

    it("navigates right and left in row layout", () => {
      const onFocusChange = vi.fn();
      renderListbox({ layout: "row", onFocusChange, initialFocusedIndex: 0 });

      const container = screen.getByRole("listbox");
      fireEvent.keyDown(container, { key: "ArrowRight" });
      expect(onFocusChange).toHaveBeenCalledWith(1);

      fireEvent.keyDown(container, { key: "ArrowLeft" });
      expect(onFocusChange).toHaveBeenCalledWith(0);
    });

    it("handles Home and End keys", () => {
      const onFocusChange = vi.fn();
      renderListbox({ layout: "column", onFocusChange, initialFocusedIndex: 1 });

      const container = screen.getByRole("listbox");
      fireEvent.keyDown(container, { key: "End" });
      expect(onFocusChange).toHaveBeenCalledWith(2);

      fireEvent.keyDown(container, { key: "Home" });
      expect(onFocusChange).toHaveBeenCalledWith(0);
    });

    it("triggers onSelect when Enter or Space is pressed", () => {
      const onSelect = vi.fn();
      renderListbox({ layout: "column", onSelect, initialFocusedIndex: 1 });

      const container = screen.getByRole("listbox");
      fireEvent.keyDown(container, { key: "Enter" });
      expect(onSelect).toHaveBeenCalledWith(1);

      fireEvent.keyDown(container, { key: " " });
      expect(onSelect).toHaveBeenCalledWith(1);
    });
  });

  describe("context and hooks", () => {
    const ContextConsumer = () => {
      const { focusedIndex, setFocusedIndex } = useArrowNavigationContext();
      return (
        <div>
          <span data-testid="focused-index">{focusedIndex}</span>
          <button type="button" onClick={() => setFocusedIndex(2)}>
            Set to 2
          </button>
        </div>
      );
    };

    it("provides arrow navigation context to children", async () => {
      const user = userEvent.setup();
      render(
        <ArrowNavigation itemCount={3} layout="column" initialFocusedIndex={0}>
          <ContextConsumer />
        </ArrowNavigation>,
      );

      expect(screen.getByTestId("focused-index")).toHaveTextContent("0");

      await user.click(screen.getByText("Set to 2"));
      expect(screen.getByTestId("focused-index")).toHaveTextContent("2");
    });

    it("throws when useArrowNavigationContext is called outside provider", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<ContextConsumer />)).toThrow(
        "useArrowNavigationContext must be used within an ArrowNavigation component",
      );
      spy.mockRestore();
    });
  });

  describe("focus trapping and HOC", () => {
    it("renders with FocusTrap when trapFocus is true", () => {
      renderListbox({ trapFocus: true, focusTrapActive: true });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("works with withArrowNavigation HOC", () => {
      const SimpleList = ({ title }: { title: string }) => (
        <div>
          <h2>{title}</h2>
          <button type="button" role="option">
            Item A
          </button>
          <button type="button" role="option">
            Item B
          </button>
        </div>
      );

      const NavigableList = withArrowNavigation(SimpleList, {
        itemCount: 2,
        layout: "column",
      });

      render(<NavigableList title="My Navigable List" />);
      expect(screen.getByText("My Navigable List")).toBeInTheDocument();
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText("Item A")).toBeInTheDocument();
      expect(screen.getByText("Item B")).toBeInTheDocument();
    });
  });
});

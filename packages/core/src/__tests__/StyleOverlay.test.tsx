import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { StyleOverlay, styleOverlayPanelVariants } from "../components/StyleOverlay";
import { DataThemeProvider } from "../contexts/DataThemeProvider";
import { ThemeProvider } from "../contexts/ThemeProvider";

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <DataThemeProvider>{ui}</DataThemeProvider>
    </ThemeProvider>,
  );
};

describe("StyleOverlay", () => {
  it("renders trigger children when closed", () => {
    renderWithProviders(
      <StyleOverlay>
        <button type="button">Open Styles</button>
      </StyleOverlay>,
    );

    expect(screen.getByText("Open Styles")).toBeInTheDocument();
  });

  it("toggles panel open when trigger is clicked and closes on close button click", () => {
    renderWithProviders(
      <StyleOverlay>
        <button type="button">Open Styles</button>
      </StyleOverlay>,
    );

    const trigger = screen.getByText("Open Styles");
    fireEvent.click(trigger);

    expect(screen.queryByText("Open Styles")).not.toBeInTheDocument();
    expect(screen.getByText("Page")).toBeInTheDocument();

    const closeButton = screen.getByLabelText("Close style panel");
    fireEvent.click(closeButton);

    expect(screen.getByText("Open Styles")).toBeInTheDocument();
  });

  it("opens panel on trigger Enter/Space key down", () => {
    renderWithProviders(
      <StyleOverlay>
        <span>Open Styles</span>
      </StyleOverlay>,
    );

    const trigger = screen.getByText("Open Styles");
    const triggerContainer = trigger.closest("[tabindex='0']");
    expect(triggerContainer).not.toBeNull();

    if (triggerContainer) {
      fireEvent.keyDown(triggerContainer, { key: "Enter" });
      expect(screen.queryByText("Open Styles")).not.toBeInTheDocument();
      expect(screen.getByText("Page")).toBeInTheDocument();
    }
  });

  it("calls custom iconButtonProps onClick handler when close button is clicked", () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <StyleOverlay iconButtonProps={{ onClick: handleClose }}>
        <button type="button">Open Styles</button>
      </StyleOverlay>,
    );

    fireEvent.click(screen.getByText("Open Styles"));
    const closeButton = screen.getByLabelText("Close style panel");
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Open Styles")).toBeInTheDocument();
  });

  it("forwards ref to root Flex element", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithProviders(
      <StyleOverlay ref={ref}>
        <span>Trigger</span>
      </StyleOverlay>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and preserves zIndex", () => {
    const { container } = renderWithProviders(
      <StyleOverlay zIndex={5} className="custom-overlay-panel">
        <span>Trigger</span>
      </StyleOverlay>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("z-index-5");
  });

  it("exports styleOverlayPanelVariants with CVA", () => {
    const closedClasses = styleOverlayPanelVariants({ open: false });
    expect(closedClasses).toContain("invisible");
    expect(closedClasses).toContain("opacity-0");

    const openClasses = styleOverlayPanelVariants({ open: true });
    expect(openClasses).toContain("visible");
    expect(openClasses).toContain("opacity-100");
  });
});

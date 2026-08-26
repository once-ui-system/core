import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { colorSwatchVariants, StylePanel, styleOptionVariants } from "../components/StylePanel";
import { DataThemeProvider } from "../contexts/DataThemeProvider";
import { ThemeProvider } from "../contexts/ThemeProvider";

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <DataThemeProvider>{ui}</DataThemeProvider>
    </ThemeProvider>,
  );
};

describe("StylePanel", () => {
  it("renders all sections (Page, Color, Solid style, Advanced)", () => {
    renderWithProviders(<StylePanel />);

    expect(screen.getByText("Page")).toBeInTheDocument();
    expect(screen.getByText("Customize page theme")).toBeInTheDocument();
    expect(screen.getAllByText("Color")[0]).toBeInTheDocument();
    expect(screen.getByText("Customize color schemes")).toBeInTheDocument();
    expect(screen.getByText("Solid style")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("handles shape selection", () => {
    renderWithProviders(<StylePanel />);

    const roundedShape = screen.getByLabelText("Select rounded shape");
    fireEvent.click(roundedShape);

    expect(document.documentElement.getAttribute("data-border")).toBe("rounded");
  });

  it("handles shape selection with keyboard enter/space", () => {
    renderWithProviders(<StylePanel />);

    const sharpShape = screen.getByLabelText("Select sharp shape");
    const parentContainer = sharpShape.closest("[tabindex='0']");
    expect(parentContainer).not.toBeNull();

    if (parentContainer) {
      fireEvent.keyDown(parentContainer, { key: "Enter" });
      expect(document.documentElement.getAttribute("data-border")).toBe("sharp");

      fireEvent.keyDown(parentContainer, { key: " " });
      expect(document.documentElement.getAttribute("data-border")).toBe("sharp");
    }
  });

  it("handles brand color selection", () => {
    renderWithProviders(<StylePanel />);

    const emeraldBrand = screen.getByLabelText("Select emerald brand color");
    fireEvent.click(emeraldBrand);

    expect(document.documentElement.getAttribute("data-brand")).toBe("emerald");
  });

  it("handles color selection with keyboard enter/space", () => {
    renderWithProviders(<StylePanel />);

    const cyanBrand = screen.getByLabelText("Select cyan brand color");
    const parentContainer = cyanBrand.closest("[tabindex='0']");
    expect(parentContainer).not.toBeNull();

    if (parentContainer) {
      fireEvent.keyDown(parentContainer, { key: "Enter" });
      expect(document.documentElement.getAttribute("data-brand")).toBe("cyan");
    }
  });

  it("handles accent and neutral color selection", () => {
    renderWithProviders(<StylePanel />);

    const violetAccent = screen.getByLabelText("Select violet accent color");
    fireEvent.click(violetAccent);
    expect(document.documentElement.getAttribute("data-accent")).toBe("violet");

    const sandNeutral = screen.getByLabelText("Select sand neutral color");
    fireEvent.click(sandNeutral);
    expect(document.documentElement.getAttribute("data-neutral")).toBe("sand");
  });

  it("handles solid type selection via SegmentedControl", () => {
    renderWithProviders(<StylePanel />);

    const inverseButton = screen.getByText("Inverse");
    fireEvent.click(inverseButton);

    expect(document.documentElement.getAttribute("data-solid")).toBe("inverse");
  });

  it("handles solid style effect (plastic vs flat)", () => {
    renderWithProviders(<StylePanel />);

    const plasticButton = screen.getByText("Plastic");
    fireEvent.click(plasticButton);

    expect(localStorage.getItem("data-solid-style")).toBe("plastic");

    const flatButton = screen.getByText("Flat");
    fireEvent.click(flatButton);

    expect(localStorage.getItem("data-solid-style")).toBe("flat");
  });

  it("handles surface, scaling, and transition controls", () => {
    renderWithProviders(<StylePanel />);

    const translucentButton = screen.getByText("Translucent");
    fireEvent.click(translucentButton);
    expect(document.documentElement.getAttribute("data-surface")).toBe("translucent");

    const scalingButton = screen.getByText("110");
    fireEvent.click(scalingButton);
    expect(document.documentElement.getAttribute("data-scaling")).toBe("110");

    const noneTransition = screen.getByText("None");
    fireEvent.click(noneTransition);
    expect(document.documentElement.getAttribute("data-transition")).toBe("none");
  });

  it("handles data style chart mode selection", () => {
    renderWithProviders(<StylePanel />);

    const divergentButton = screen.getByText("Divergent");
    fireEvent.click(divergentButton);

    const sequentialButton = screen.getByText("Sequential");
    fireEvent.click(sequentialButton);
  });

  it("forwards ref to root Column element", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithProviders(<StylePanel ref={ref} data-testid="style-panel-root" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("flex", "flex-col", "w-full");
  });

  it("merges custom className and style props", () => {
    const { container } = renderWithProviders(
      <StylePanel className="custom-style-panel" style={{ zIndex: 10 }} />,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-style-panel");
    expect((root as HTMLElement).style.zIndex).toBe("10");
  });

  it("exports styleOptionVariants and colorSwatchVariants with CVA", () => {
    const defaultClasses = styleOptionVariants();
    expect(defaultClasses).toContain("min-w-40");

    const selectedClasses = styleOptionVariants({ selected: true });
    expect(selectedClasses).toContain("bg-neutral-alpha-strong");

    const blueSwatch = colorSwatchVariants({ color: "blue" });
    expect(blueSwatch).toContain("bg-[var(--scheme-blue-500)]");

    const neutralSwatch = colorSwatchVariants({ color: "neutral" });
    expect(neutralSwatch).toContain("bg-neutral-solid-medium");
  });
});

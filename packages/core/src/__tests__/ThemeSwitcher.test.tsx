import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { ThemeProvider } from "../contexts/ThemeProvider";

describe("ThemeSwitcher", () => {
  it("renders system, dark, and light theme buttons", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("System theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Dark theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Light theme")).toBeInTheDocument();
  });

  it("updates theme on button click", () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );

    const darkButton = screen.getByLabelText("Dark theme");
    fireEvent.click(darkButton);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    const lightButton = screen.getByLabelText("Light theme");
    fireEvent.click(lightButton);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("forwards ref to container Row element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ThemeProvider>
        <ThemeSwitcher ref={ref} data-testid="theme-switcher-row" />
      </ThemeProvider>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("data-border", "rounded");
  });
});

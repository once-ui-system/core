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

    const systemButton = screen.getByLabelText("System theme");
    fireEvent.click(systemButton);
  });

  it("merges custom className, style, and Row props", () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeSwitcher className="custom-switcher" style={{ opacity: 0.9 }} padding="4" />
      </ThemeProvider>,
    );

    const row = container.firstElementChild;
    expect(row).toHaveClass("custom-switcher", "p-4", "rounded-full");
    expect((row as HTMLElement).style.opacity).toBe("0.9");
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

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "../components";
import { LayoutProvider, ToastProvider } from "../contexts";

// Logo calls useToast for its copy-to-clipboard actions, so it needs both.
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

/**
 * A per-theme source renders BOTH assets and lets CSS choose, rather than
 * reading the theme at runtime — that keeps Logo server-renderable and avoids
 * a flash of the wrong mark on first paint.
 */
describe("Logo theme-aware sources", () => {
  it("renders one image for a plain string source", () => {
    render(<Logo icon="/mark.svg" />, { wrapper: wrap });
    expect(screen.getAllByAltText("Trademark")).toHaveLength(1);
  });

  it("renders both assets for a per-theme source", () => {
    const { container } = render(
      <Logo icon={{ light: "/mark-light.svg", dark: "/mark-dark.svg" }} />,
      { wrapper: wrap },
    );
    expect(screen.getAllByAltText("Trademark")).toHaveLength(2);
    expect(container.querySelector('img.light-flex')).toHaveAttribute("src", "/mark-light.svg");
    expect(container.querySelector('img.dark-flex')).toHaveAttribute("src", "/mark-dark.svg");
  });

  it("supports a per-theme wordmark alongside a plain icon", () => {
    const { container } = render(
      <Logo icon="/mark.svg" wordmark={{ light: "/word-light.svg", dark: "/word-dark.svg" }} />,
      { wrapper: wrap },
    );
    expect(screen.getAllByAltText("Trademark")).toHaveLength(3);
    expect(container.querySelectorAll("img.light-flex")).toHaveLength(1);
    expect(container.querySelectorAll("img.dark-flex")).toHaveLength(1);
  });

  it("still honours the whole-element light/dark props", () => {
    const { container } = render(<Logo icon="/mark.svg" href="/" dark />, { wrapper: wrap });
    expect(container.querySelector("a")?.className).toMatch(/dark-flex/);
  });
});

import { act, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoLoader } from "../components/LogoLoader";
import { expectNoAxeViolations } from "../test/axe";

/** Two letters in one compound path (the second with a counter), and a dot. */
const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100" onload="alert(1)">
  <defs><clipPath id="c"><rect width="10" height="10"/></clipPath></defs>
  <path fill-rule="evenodd" fill="#111" d="M0 0H40V100H0Z M60 0H100V100H60ZM70 10H90V90H70Z" onclick="alert(1)"/>
  <circle cx="150" cy="50" r="20" fill="#111"/>
</svg>`;

describe("LogoLoader", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("draws one stroke per outline over the filled logo", () => {
    render(<LogoLoader svg={LOGO} />);
    const status = screen.getByRole("status", { name: "Loading" });
    const svg = status.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 200 100");
    // Fills: the compound path and the circle. Strokes: three subpaths and the circle.
    expect(svg?.querySelectorAll("[fill='currentColor']")).toHaveLength(2);
    expect(svg?.querySelectorAll("[pathLength='100']")).toHaveLength(4);
    expect(svg?.querySelector("path")?.getAttribute("fill-rule")).toBe("evenodd");
    expect(status.style.aspectRatio).toBe("200 / 100");
  });

  it("keeps only geometry from the markup", () => {
    render(<LogoLoader svg={LOGO} />);
    const svg = screen.getByRole("status").querySelector("svg");
    expect(svg?.outerHTML).not.toContain("alert");
    expect(svg?.querySelector("rect")).toBeNull();
  });

  it("shows the filled logo with no strokes when settled", () => {
    render(<LogoLoader svg={LOGO} settled />);
    const svg = screen.getByRole("status").querySelector("svg");
    expect(svg?.querySelectorAll("[pathLength='100']")).toHaveLength(0);
    expect(svg?.querySelectorAll("[fill='currentColor']")).toHaveLength(2);
  });

  it("calls onComplete once the intro has played, and never when settled", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { rerender } = render(<LogoLoader svg={LOGO} onComplete={onComplete} />);
    act(() => vi.advanceTimersByTime(5000));
    expect(onComplete).toHaveBeenCalledTimes(1);

    onComplete.mockClear();
    rerender(<LogoLoader svg={LOGO} settled onComplete={onComplete} />);
    act(() => vi.advanceTimersByTime(5000));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("fetches the logo from src", async () => {
    const fetchMock = vi.fn(async () => new Response(LOGO));
    vi.stubGlobal("fetch", fetchMock);
    render(<LogoLoader src="/logo.svg" />);
    await waitFor(() => expect(screen.getByRole("status").querySelector("svg")).not.toBeNull());
    expect(fetchMock).toHaveBeenCalledWith("/logo.svg", expect.anything());
  });

  it("takes a color, or the text color with inherit", () => {
    const { rerender } = render(<LogoLoader svg={LOGO} color="brand" />);
    expect(screen.getByRole("status").style.color).toBe("var(--brand-color-strong)");
    rerender(<LogoLoader svg={LOGO} color="inherit" />);
    expect(screen.getByRole("status").style.color).toBe("");
  });

  it("renders on the server", () => {
    expect(renderToString(<LogoLoader svg={LOGO} height={48} />)).toContain(
      'viewBox="0 0 200 100"',
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<LogoLoader svg={LOGO} />);
    await expectNoAxeViolations(container);
  });
});

describe("LogoLoader order", () => {
  const RIGHT_TO_LEFT = `<svg viewBox="0 0 100 10"><path d="M80 0H90V10H80Z"/><path d="M0 0H10V10H0Z"/></svg>`;
  const strokeStarts = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("[pathLength='100']")).map((stroke) =>
      stroke.getAttribute("d")?.slice(0, 3),
    );

  it("draws left to right by default", () => {
    const { container } = render(<LogoLoader svg={RIGHT_TO_LEFT} />);
    expect(strokeStarts(container)).toEqual(["M0 ", "M80"]);
  });

  it("keeps the file's order with document", () => {
    const { container } = render(<LogoLoader svg={RIGHT_TO_LEFT} order="document" />);
    expect(strokeStarts(container)).toEqual(["M80", "M0 "]);
  });
});

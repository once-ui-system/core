import { act, render as baseRender, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LogoSpinner } from "../components/LogoSpinner";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { WorkingIndicator } from "../modules/ai/WorkingIndicator";
import { workingVerbs } from "../modules/ai/workingVerbs";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const render = (ui: ReactElement) => baseRender(ui, { wrapper });

describe("LogoSpinner", () => {
  it("is a named status that keeps moving under reduced motion", () => {
    render(<LogoSpinner aria-label="Thinking" />);
    const status = screen.getByRole("status", { name: "Thinking" });
    expect(status.getAttribute("data-motion")).toBe("essential");
    expect(status.querySelectorAll("path")).toHaveLength(4);
  });

  it("takes a tone's foreground, or the text color with inherit", () => {
    const { rerender } = render(<LogoSpinner tone="accent" />);
    expect(screen.getByRole("status").style.color).toBe("var(--function-accent-500)");
    rerender(<LogoSpinner tone="inherit" />);
    expect(screen.getByRole("status").style.color).toBe("");
  });

  it("sets its cycle length from speed", () => {
    render(<LogoSpinner speed={3} />);
    expect(screen.getByRole("status").style.getPropertyValue("--logo-spinner-duration")).toBe("3s");
  });
});

describe("WorkingIndicator", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const verbText = (container: HTMLElement) =>
    container.querySelector("[aria-hidden='true'] p, [aria-hidden='true'] span")?.textContent;

  it("renders the first verb on the server, so hydration agrees", () => {
    const html = renderToString(
      <LayoutProvider>
        <WorkingIndicator verbs={["Imagining", "Noodling"]} />
      </LayoutProvider>,
    );
    expect(html).toContain("Imagining…");
  });

  it("walks the list in order when shuffle is off", () => {
    const { container } = render(
      <WorkingIndicator
        verbs={["Imagining", "Noodling", "Kerning"]}
        shuffle={false}
        interval={1000}
      />,
    );
    expect(verbText(container)).toBe("Imagining…");
    act(() => vi.advanceTimersByTime(1000));
    expect(verbText(container)).toBe("Noodling…");
    act(() => vi.advanceTimersByTime(2000));
    expect(verbText(container)).toBe("Imagining…");
  });

  it("never shows the same verb twice in a row when shuffling", () => {
    const { container } = render(<WorkingIndicator verbs={["A", "B"]} interval={100} />);
    let last = verbText(container);
    for (let i = 0; i < 20; i++) {
      act(() => vi.advanceTimersByTime(100));
      const now = verbText(container);
      expect(now).not.toBe(last);
      last = now;
    }
  });

  it("shows a fixed label instead of cycling", () => {
    render(<WorkingIndicator label="Searching the docs" />);
    expect(screen.getByText("Searching the docs")).toBeTruthy();
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("Searching the docs")).toBeTruthy();
  });

  it("counts seconds from startedAt and keeps the detail beside it", () => {
    vi.setSystemTime(new Date("2026-10-20T12:00:00Z"));
    render(
      <WorkingIndicator
        showElapsed
        startedAt={new Date("2026-10-20T11:58:55Z")}
        detail="esc to stop"
      />,
    );
    expect(screen.getByText("1m 05s")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("1m 06s")).toBeTruthy();
    expect(screen.getByText("esc to stop")).toBeTruthy();
  });

  it("announces one fixed label, not each verb", () => {
    render(<WorkingIndicator aria-label="Claude is working" />);
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Claude is working");
    // The only status region: the loader inside is hidden from assistive tech.
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("ships a default list of single-line verbs without punctuation", () => {
    expect(workingVerbs.length).toBeGreaterThan(20);
    for (const verb of workingVerbs) expect(verb).toMatch(/^[A-Z][a-z ]+$/);
  });

  it("has no axe violations", async () => {
    vi.useRealTimers();
    const { container } = render(<WorkingIndicator showElapsed detail="esc to stop" />);
    await expectNoAxeViolations(container);
  });
});

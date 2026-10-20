import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GlitchFx } from "../components/GlitchFx";
import styles from "../components/GlitchFx.module.scss";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const root = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const glitching = (container: HTMLElement) =>
  root(container).classList.contains(styles.active as string);

/**
 * GlitchFx draws its children three times: once for real and twice as the
 * red/blue shifted layers. The copies are decoration, so they must be hidden
 * from assistive tech and out of the tab order, or a screen reader reads the
 * text three times and a link inside takes three tab stops.
 */
describe("GlitchFx", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("exposes its children once", async () => {
    const { container } = render(
      <GlitchFx>
        <span>Signal lost</span>
      </GlitchFx>,
      { wrapper },
    );
    expect(screen.getAllByText("Signal lost")).toHaveLength(3);
    const exposed = screen
      .getAllByText("Signal lost")
      .filter((el) => !el.closest("[aria-hidden='true']"));
    expect(exposed).toHaveLength(1);
    await expectNoAxeViolations(container);
  });

  it("keeps the copies of a link out of the tab order", () => {
    render(
      <GlitchFx>
        <a href="/docs">Docs</a>
      </GlitchFx>,
      { wrapper },
    );
    // jsdom does not apply `inert` to focus, so check the copies carry it.
    const links = screen.getAllByRole("link", { hidden: true });
    expect(links).toHaveLength(3);
    expect(links.filter((link) => !link.closest("[inert]"))).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Docs" })).toBe(links[0]);
  });

  it("glitches from the start with the instant trigger", () => {
    const { container } = render(<GlitchFx>Text</GlitchFx>, { wrapper });
    expect(glitching(container)).toBe(true);
  });

  it("applies the speed class", () => {
    const { container } = render(<GlitchFx speed="fast">Text</GlitchFx>, { wrapper });
    expect(root(container)).toHaveClass(styles.fast as string);
  });

  it("glitches only while hovered with the hover trigger", () => {
    const { container } = render(
      <GlitchFx trigger="hover" continuous={false}>
        Text
      </GlitchFx>,
      { wrapper },
    );
    expect(glitching(container)).toBe(false);
    fireEvent.mouseEnter(root(container));
    expect(glitching(container)).toBe(true);
    fireEvent.mouseLeave(root(container));
    expect(glitching(container)).toBe(false);
  });

  it("bursts for 500ms every `interval` with the custom trigger", () => {
    vi.useFakeTimers();
    const { container } = render(
      <GlitchFx trigger="custom" continuous={false} interval={1000}>
        Text
      </GlitchFx>,
      { wrapper },
    );
    expect(glitching(container)).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(glitching(container)).toBe(true);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(glitching(container)).toBe(false);
  });

  it("stops the custom interval on unmount", () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <GlitchFx trigger="custom" continuous={false}>
        Text
      </GlitchFx>,
      { wrapper },
    );
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

import { act, render } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoCloud } from "../components/LogoCloud";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

const logos = Array.from({ length: 8 }, (_, i) => ({ icon: `/logo-${i}.svg` }));
const shown = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));

/**
 * LogoCloud shows at most `limit` logos; with more than that it rotates them
 * every `rotationInterval + 25ms * limit`, staggering each logo's animation by
 * 25ms. With `limit` or fewer it shows them all and never rotates.
 */
describe("LogoCloud", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows every logo when there are no more than the limit, and does not rotate", () => {
    vi.useFakeTimers();
    const { container } = render(<LogoCloud logos={logos.slice(0, 3)} />, { wrapper });
    expect(shown(container)).toEqual(["/logo-0.svg", "/logo-1.svg", "/logo-2.svg"]);
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(shown(container)).toEqual(["/logo-0.svg", "/logo-1.svg", "/logo-2.svg"]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows the first `limit` logos and rotates them on the interval", () => {
    vi.useFakeTimers();
    const { container } = render(<LogoCloud logos={logos} limit={6} rotationInterval={1000} />, {
      wrapper,
    });
    expect(shown(container)).toHaveLength(6);
    expect(shown(container)[0]).toBe("/logo-0.svg");

    // 1000ms + 25ms stagger * 6 logos.
    act(() => {
      vi.advanceTimersByTime(1149);
    });
    expect(shown(container)[0]).toBe("/logo-0.svg");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(shown(container)).toEqual([
      "/logo-1.svg",
      "/logo-2.svg",
      "/logo-3.svg",
      "/logo-4.svg",
      "/logo-5.svg",
      "/logo-6.svg",
    ]);
  });

  it("wraps around the logo list as it rotates", () => {
    vi.useFakeTimers();
    const { container } = render(<LogoCloud logos={logos} limit={6} rotationInterval={1000} />, {
      wrapper,
    });
    act(() => {
      vi.advanceTimersByTime(1150 * 3);
    });
    expect(shown(container)).toEqual([
      "/logo-0.svg",
      "/logo-3.svg",
      "/logo-4.svg",
      "/logo-5.svg",
      "/logo-6.svg",
      "/logo-7.svg",
    ]);
  });

  it("stops rotating on unmount", () => {
    vi.useFakeTimers();
    const { unmount } = render(<LogoCloud logos={logos} limit={2} />, { wrapper });
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("staggers each logo's animation and keeps a logo's own style", () => {
    const { container } = render(
      <LogoCloud
        logos={[
          { icon: "/a.svg", style: { opacity: 0.5 } },
          { icon: "/b.svg", style: { opacity: 0.5 } },
        ]}
      />,
      { wrapper },
    );
    const marks = Array.from(container.querySelectorAll("img")).map(
      (img) => img.parentElement as HTMLElement,
    );
    expect(marks.map((m) => m.style.animationDelay)).toEqual(["0ms", "25ms"]);
    expect(marks.map((m) => m.style.opacity)).toEqual(["0.5", "0.5"]);
  });

  it("keeps a logo's own className alongside the animation class", () => {
    const { container } = render(<LogoCloud logos={[{ icon: "/a.svg", className: "mine" }]} />, {
      wrapper,
    });
    const mark = container.querySelector("img")?.parentElement as HTMLElement;
    expect(mark.className).toContain("mine");
    expect(mark.className).toContain("staticLogo");
  });

  it("forwards grid props such as columns", () => {
    const { container } = render(<LogoCloud logos={logos.slice(0, 2)} columns="2" />, { wrapper });
    expect((container.firstElementChild as HTMLElement).className).toMatch(/columns-2/);
  });

  it("renders linked logos as links", async () => {
    const { container, getAllByRole } = render(
      <LogoCloud logos={[{ icon: "/a.svg", href: "https://a.example" }]} />,
      { wrapper },
    );
    expect(getAllByRole("link")[0]).toHaveAttribute("href", "https://a.example");
    await expectNoAxeViolations(container);
  });
});

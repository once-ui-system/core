import { render } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { BlobFx } from "../components/BlobFx";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * BlobFx is a decorative, pointer-transparent backdrop of three drifting
 * gradients whose timings come from `seed`. It is hidden from assistive tech,
 * forwards its ref, and only defines its keyframes when motion is welcome.
 * Whether the browser actually holds the blobs still is a browser-layer check.
 */
describe("BlobFx", () => {
  it("renders a decorative, pointer-transparent backdrop", async () => {
    const { container } = render(<BlobFx height={24} />, { wrapper });
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toMatch(/pointer-events-none/);
    await expectNoAxeViolations(container);
  });

  it("forwards its ref to the root", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<BlobFx ref={ref} />, { wrapper });
    expect(ref.current).toBe(container.firstElementChild);
  });

  it("names its keyframes by seed and varies the timing with it", () => {
    const { container, rerender } = render(<BlobFx seed={3} />, { wrapper });
    const css = () => container.querySelector("style")?.innerHTML ?? "";
    const animations = () =>
      Array.from(container.querySelectorAll<HTMLElement>("[style*='animation']")).map(
        (el) => el.style.animation,
      );
    expect(css()).toContain("@keyframes blob1-3");
    const seeded = animations();
    expect(seeded[0]).toContain("blob2-3");
    rerender(<BlobFx seed={7} />);
    expect(css()).toContain("@keyframes blob1-7");
    expect(animations()).not.toEqual(seeded);
  });

  it("is deterministic for a seed", () => {
    const a = render(<BlobFx seed={5} />, { wrapper }).container.innerHTML;
    const b = render(<BlobFx seed={5} />, { wrapper }).container.innerHTML;
    expect(a).toBe(b);
  });

  it("defines its keyframes only for viewers who allow motion", () => {
    const { container } = render(<BlobFx />, { wrapper });
    const css = container.querySelector("style")?.innerHTML ?? "";
    const media = css.indexOf("@media (prefers-reduced-motion: no-preference)");
    expect(media).toBeGreaterThanOrEqual(0);
    expect(css.indexOf("@keyframes")).toBeGreaterThan(media);
  });
});

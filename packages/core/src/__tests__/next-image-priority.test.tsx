import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * Media's `priority` reaches next/image as `loading="eager"` and
 * `fetchPriority="high"`, never as next/image's own `priority`: Next 16
 * deprecated it for `preload`, which adds only a preload link and leaves the
 * image at normal priority (the LCP image on Stack waited 2.2 s to start).
 *
 * next/image is mocked to record the props it is given.
 */
const received: Record<string, unknown>[] = [];
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string } & Record<string, unknown>) => {
    received.push(props);
    // biome-ignore lint/performance/noImgElement: stand-in for next/image in a test
    return <img src={src} alt={alt} />;
  },
}));
vi.mock("next/link", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push() {} }) }));

import { Media } from "../components/Media";
import { LayoutProvider } from "../next";

describe("Media priority under the Next adapters", () => {
  it("asks next/image for an eager, high-priority fetch", () => {
    received.length = 0;
    render(
      <LayoutProvider>
        <Media src="/hero.jpg" alt="Hero" aspectRatio="16/9" priority />
      </LayoutProvider>,
    );
    screen.getByRole("img", { name: "Hero" });
    const props = received.at(-1);
    expect(props).toMatchObject({ loading: "eager", fetchPriority: "high" });
    expect(props).not.toHaveProperty("priority");
    expect(props).not.toHaveProperty("preload");
  });

  it("leaves other images to next/image's lazy default", () => {
    received.length = 0;
    render(
      <LayoutProvider>
        <Media src="/photo.jpg" alt="Photo" aspectRatio="16/9" />
      </LayoutProvider>,
    );
    const props = received.at(-1);
    expect(props).not.toHaveProperty("loading");
    expect(props).not.toHaveProperty("fetchPriority");
  });
});

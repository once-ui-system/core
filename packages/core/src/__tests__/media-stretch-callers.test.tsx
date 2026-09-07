import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, Book, CompareImage, Media } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * `Media`'s aspect-ratio escape hatch was renamed `fill` → `stretch`, because
 * `fill` is a layout prop on every Flex-derived component. Core's own callers
 * had to be renamed with it, and nothing failed when they were not: `fill` is
 * still a valid prop, it just means something else now, so the components kept
 * rendering — with a zero-sized image inside them.
 *
 * These assert the observable end of that: an image that has been told to drop
 * its intrinsic ratio is absolutely positioned over its box. A caller that
 * drifts back to `fill` renders a statically positioned, zero-sized image and
 * fails here rather than in someone's app.
 */
const isStretched = (img: HTMLImageElement | null) => {
  expect(img).not.toBeNull();
  expect(img?.style.position).toBe("absolute");
  // next/image's non-fill path is what this guards against; it sizes via
  // width/height attributes of 0 rather than via the style above.
  expect(img?.getAttribute("width")).not.toBe("0");
};

describe("Media stretch — core's own callers", () => {
  it("Media itself stretches when asked", () => {
    const { container } = render(<Media src="/a.jpg" alt="a" stretch />, { wrapper: wrap });
    isStretched(container.querySelector("img"));
  });

  it("Avatar renders a stretched cover image", () => {
    const { container } = render(<Avatar src="/a.jpg" />, { wrapper: wrap });
    isStretched(container.querySelector("img"));
  });

  it("Book renders a stretched cover image", () => {
    const { container } = render(<Book src="/cover.jpg" alt="Cover" />, { wrapper: wrap });
    isStretched(container.querySelector("img"));
  });

  it("CompareImage renders stretched images on both sides", () => {
    const { container } = render(
      <CompareImage leftContent={{ src: "/a.jpg" }} rightContent={{ src: "/b.jpg" }} />,
      { wrapper: wrap },
    );
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
    images.forEach((img) => isStretched(img as HTMLImageElement));
  });
});

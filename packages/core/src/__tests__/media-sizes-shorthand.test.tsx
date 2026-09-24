import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Book } from "../components/Book";
import { Carousel } from "../components/Carousel";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * `Media` takes `sizes` as a number too: `sizes={1200}` stands for
 * `(max-width: 1200px) 100vw, 1200px`. The components that hand `sizes` to
 * `Media` typed it as `string`, so the shorthand worked at runtime but did not
 * type-check through `Carousel`, `Swiper`, `OgCard`, `Book` or `MediaUpload`.
 * They now take `Media`'s own type. These check the number reaches the image
 * resolved, the same as it does on `Media` itself.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const resolved = "(max-width: 1200px) 100vw, 1200px";

describe("sizes shorthand through Media", () => {
  it("Book", () => {
    render(<Book src="/cover.jpg" alt="Cover" sizes={1200} />, { wrapper: wrap });
    expect(screen.getByRole("img", { name: "Cover" })).toHaveAttribute("sizes", resolved);
  });

  it("Carousel", () => {
    render(<Carousel items={[{ slide: "/one.jpg", alt: "One" }]} sizes={1200} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("img", { name: "One" })).toHaveAttribute("sizes", resolved);
  });
});

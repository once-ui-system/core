import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MasonryGrid } from "../components/MasonryGrid";

describe("MasonryGrid", () => {
  it("renders with default columns and gap", () => {
    const { container } = render(
      <MasonryGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </MasonryGrid>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("block");
    expect(root).toHaveClass("columns-3");
    expect(root).toHaveClass("gap-8");

    const children = root?.querySelectorAll(".break-inside-avoid");
    expect(children?.length).toBe(2);
    expect(children?.[0]).toHaveClass("mb-8");
  });

  it("renders responsive columns and hides", () => {
    const { container } = render(
      <MasonryGrid
        columns={4}
        gap="16"
        s={{ columns: 1 }}
        m={{ columns: 2 }}
        l={{ columns: 3 }}
        xs={{ hide: true }}
      >
        <div>Item 1</div>
      </MasonryGrid>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("columns-4");
    expect(root).toHaveClass("gap-16");
    expect(root).toHaveClass("s:columns-1");
    expect(root).toHaveClass("m:columns-2");
    expect(root).toHaveClass("l:columns-3");
    expect(root).toHaveClass("xs:hidden");
  });

  it("merges custom className", () => {
    const { container } = render(
      <MasonryGrid className="custom-masonry">
        <div>Item 1</div>
      </MasonryGrid>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-masonry");
  });
});

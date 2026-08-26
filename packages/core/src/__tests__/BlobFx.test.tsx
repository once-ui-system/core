import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { BlobFx, blobFxVariants } from "../components/BlobFx";

describe("BlobFx", () => {
  it("renders default BlobFx container with blur and fill classes", () => {
    const { container } = render(<BlobFx />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("blur-[2rem]", "w-full", "h-full", "overflow-hidden");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<BlobFx ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children properly", () => {
    render(
      <BlobFx>
        <div data-testid="blob-child">Blob Content</div>
      </BlobFx>,
    );

    expect(screen.getByTestId("blob-child")).toBeInTheDocument();
    expect(screen.getByText("Blob Content")).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(<BlobFx className="custom-blob-class" style={{ zIndex: 10 }} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-blob-class", "blur-[2rem]");
    expect(root.style.zIndex).toBe("10");
  });

  it("renders 3 background blob layers with CSS custom properties and without inline style tags", () => {
    const { container } = render(<BlobFx seed={0} />);
    const root = container.firstElementChild as HTMLElement;

    // Root contains 3 background elements and NO inline style tag
    const backgrounds = root.querySelectorAll(":scope > div");
    expect(backgrounds.length).toBe(3);

    const styleTag = root.querySelector("style");
    expect(styleTag).toBeNull();

    // Verify background divs have static animation names and CSS custom properties
    const blob2 = backgrounds[0] as HTMLElement;
    const blob3 = backgrounds[1] as HTMLElement;
    const blob1 = backgrounds[2] as HTMLElement;

    expect(blob2.style.animation).toContain("blob-fx-2");
    expect(blob2.style.getPropertyValue("--blob-2-33")).toBeTruthy();
    expect(blob2.style.getPropertyValue("--blob-2-66")).toBeTruthy();

    expect(blob3.style.animation).toContain("blob-fx-3");
    expect(blob3.style.getPropertyValue("--blob-3-33")).toBeTruthy();
    expect(blob3.style.getPropertyValue("--blob-3-66")).toBeTruthy();

    expect(blob1.style.animation).toContain("blob-fx-1");
    expect(blob1.style.getPropertyValue("--blob-1-33")).toBeTruthy();
    expect(blob1.style.getPropertyValue("--blob-1-66")).toBeTruthy();
  });

  it("applies distinct CSS custom property offsets and durations when a custom seed is provided", () => {
    const { container: container0 } = render(<BlobFx seed={0} />);
    const { container: container42 } = render(<BlobFx seed={42} />);

    const root0 = container0.firstElementChild as HTMLElement;
    const root42 = container42.firstElementChild as HTMLElement;

    const bg0 = root0.querySelectorAll(":scope > div")[0] as HTMLElement;
    const bg42 = root42.querySelectorAll(":scope > div")[0] as HTMLElement;

    expect(bg0.style.animation).not.toBe(bg42.style.animation);
    expect(bg0.style.getPropertyValue("--blob-2-33")).not.toBe(
      bg42.style.getPropertyValue("--blob-2-33"),
    );
  });

  it("exports blobFxVariants CVA function", () => {
    expect(blobFxVariants()).toBe("blur-[2rem]");
    expect(blobFxVariants({ className: "custom-variant" })).toContain("blur-[2rem]");
    expect(blobFxVariants({ className: "custom-variant" })).toContain("custom-variant");
  });
});

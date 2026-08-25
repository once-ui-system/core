import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Media, mediaOverlayVariants, mediaVariants } from "../components/Media";

describe("Media", () => {
  it("renders image with src and alt", () => {
    const { container } = render(<Media src="https://example.com/image.jpg" alt="Test Image" />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toContain("https%3A%2F%2Fexample.com%2Fimage.jpg");
    expect(img).toHaveAttribute("alt", "Test Image");
  });

  it("renders unoptimized image when specified", () => {
    const { container } = render(
      <Media src="https://example.com/image.jpg" alt="Unoptimized Image" unoptimized />,
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders skeleton when loading", () => {
    const { container } = render(<Media src="https://example.com/image.jpg" loading />);
    const img = container.querySelector("img");
    expect(img).not.toBeInTheDocument();
    const skeleton = container.querySelector(".animate-skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders native video for video URLs without controls", () => {
    const { container } = render(<Media src="https://example.com/video.mp4" controls={false} />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
  });

  it("renders custom video player for video URLs with controls", () => {
    render(<Media src="https://example.com/video.mp4" controls />);
    const videoPlayer = screen.getByRole("region", { name: /video player/i });
    expect(videoPlayer).toBeInTheDocument();
  });

  it("renders YouTube iframe for YouTube URLs", () => {
    const { container } = render(<Media src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("src")).toContain("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("renders caption with figcaption tag", () => {
    render(<Media src="https://example.com/image.jpg" caption="A beautiful photograph" />);
    const caption = screen.getByText("A beautiful photograph");
    expect(caption).toBeInTheDocument();
    expect(caption.tagName.toLowerCase()).toBe("figcaption");
  });

  it("handles enlarge toggle on click", () => {
    const { container } = render(<Media src="https://example.com/image.jpg" enlarge />);
    const figureOrDiv = container.querySelector(".cursor-zoom-in");
    expect(figureOrDiv).toBeInTheDocument();

    if (figureOrDiv) {
      fireEvent.click(figureOrDiv);
    }

    expect(container.querySelector(".cursor-zoom-out")).toBeInTheDocument();

    // Trigger escape key to close
    fireEvent.keyDown(document, { key: "Escape" });
    expect(container.querySelector(".cursor-zoom-in")).toBeInTheDocument();
  });

  it("forwards ref to container element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Media ref={ref} src="https://example.com/image.jpg" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Media
        src="https://example.com/image.jpg"
        className="custom-media-class"
        style={{ opacity: 0.9 }}
      />,
    );
    const element = container.querySelector(".custom-media-class");
    expect(element).toBeInTheDocument();
    expect(element).toHaveStyle({ opacity: "0.9" });
  });

  it("exports mediaVariants and mediaOverlayVariants", () => {
    expect(mediaVariants()).toContain("outline-none");
    expect(mediaVariants({ enlargeState: "zoomIn" })).toContain("cursor-zoom-in");
    expect(mediaVariants({ enlargeState: "zoomOut" })).toContain("cursor-zoom-out");
    expect(mediaOverlayVariants()).toContain("fixed");
  });
});

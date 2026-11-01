import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Media } from "../components/Media";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** The overlay is the only fixed-position sibling Media renders while enlarged. */
const overlay = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".position-fixed.cursor-interactive");

/**
 * Media picks the element from the URL (image, <video>, the custom player,
 * a YouTube embed) and, with `enlarge`, zooms an image to the viewport on
 * click and closes it on a second click, the overlay, Escape or wheel.
 */
describe("Media", () => {
  it("renders an image named by alt", async () => {
    const { container } = render(<Media src="/photo.jpg" alt="A lake at dawn" />, { wrapper });
    expect(screen.getByRole("img", { name: "A lake at dawn" })).toHaveAttribute(
      "src",
      expect.stringContaining("photo.jpg"),
    );
    await expectNoAxeViolations(container);
  });

  it("treats a missing alt as decorative", () => {
    render(<Media src="/photo.jpg" />, { wrapper });
    expect(screen.queryByRole("img")).toBeNull();
    expect(document.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("shows a skeleton instead of the media while loading", () => {
    const { container } = render(<Media src="/photo.jpg" alt="Lake" loading />, { wrapper });
    expect(screen.queryByRole("img", { name: "Lake" })).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("applies aspectRatio to the media box", () => {
    const { container } = render(<Media src="/photo.jpg" alt="Lake" aspectRatio="16 / 9" />, {
      wrapper,
    });
    const box = container.firstElementChild as HTMLElement;
    expect(box.style.aspectRatio).toBe("16 / 9");
  });

  it("renders a muted, looping, autoplaying <video> for a video URL", () => {
    const { container } = render(<Media src="/clip.webm?v=2" />, { wrapper });
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video).toHaveAttribute("src", "/clip.webm?v=2");
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(screen.queryByRole("group", { name: "Video player" })).toBeNull();
  });

  it("uses the custom video player when controls are on", () => {
    render(<Media src="/clip.mp4" controls autoplay={false} sound />, { wrapper });
    expect(screen.getByRole("group", { name: "Video player" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mute" })).toBeInTheDocument();
  });

  it("builds a YouTube embed URL from the props", () => {
    const { container, rerender } = render(<Media src="https://youtu.be/dQw4w9WgXcQ" />, {
      wrapper,
    });
    const src = () => container.querySelector("iframe")?.getAttribute("src");
    expect(src()).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&controls=0&autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ",
    );
    rerender(
      <Media
        src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        controls
        autoplay={false}
        sound
        loop={false}
      />,
    );
    expect(src()).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1");
  });

  it("gives the YouTube frame an accessible title", async () => {
    const { container, rerender } = render(
      <Media src="https://youtu.be/dQw4w9WgXcQ" alt="Product launch keynote" />,
      { wrapper },
    );
    expect(container.querySelector("iframe")).toHaveAttribute("title", "Product launch keynote");
    // jsdom cannot host a cross-frame axe run; the rule itself still checks the title.
    await expectNoAxeViolations(container, { iframes: false });
    rerender(<Media src="https://youtu.be/dQw4w9WgXcQ" />);
    expect(container.querySelector("iframe")).toHaveAttribute("title", "YouTube video");
  });

  it("enlarges on click and closes on a second click", async () => {
    const user = userEvent.setup();
    const { container } = render(<Media src="/photo.jpg" alt="Lake" enlarge />, { wrapper });
    const box = container.querySelector(".cursor-zoom-in") as HTMLElement;
    expect(box).not.toBeNull();
    await user.click(screen.getByRole("img", { name: "Lake" }));
    expect(overlay(container)).not.toBeNull();
    expect(box.className).toContain("cursor-zoom-out");
    expect(box.style.zIndex).toBe("10");
    await user.click(screen.getByRole("img", { name: "Lake" }));
    expect(overlay(container)).toBeNull();
    expect(box.className).toContain("cursor-zoom-in");
  });

  it("closes the enlarged image from the overlay, Escape and the wheel", async () => {
    const user = userEvent.setup();
    const { container } = render(<Media src="/photo.jpg" alt="Lake" enlarge />, { wrapper });
    const img = screen.getByRole("img", { name: "Lake" });

    await user.click(img);
    await user.click(overlay(container) as HTMLElement);
    expect(overlay(container)).toBeNull();

    await user.click(img);
    await user.keyboard("{Escape}");
    expect(overlay(container)).toBeNull();

    await user.click(img);
    fireEvent.wheel(window);
    expect(overlay(container)).toBeNull();
  });

  it("leaves the outline to focus-ring when it enlarges, so Tab shows a ring", async () => {
    const user = userEvent.setup();
    render(<Media src="/photo.jpg" alt="Lake" enlarge />, { wrapper });
    const box = screen.getByRole("button", { name: "Enlarge image: Lake" });
    expect(box).toHaveClass("focus-ring");
    // An inline outline would beat the class's :focus-visible rule.
    expect(box.style.outline).toBe("");
    await user.tab();
    expect(box).toHaveFocus();
  });

  it("keeps the outline off a media box that does not enlarge", () => {
    const { container } = render(<Media src="/photo.jpg" alt="Lake" />, { wrapper });
    const box = container.firstElementChild as HTMLElement;
    expect(box).not.toHaveClass("focus-ring");
    expect(box.style.outline).toMatch(/none/);
  });

  it("does nothing on click without enlarge", async () => {
    const user = userEvent.setup();
    const { container } = render(<Media src="/photo.jpg" alt="Lake" />, { wrapper });
    await user.click(screen.getByRole("img", { name: "Lake" }));
    expect(overlay(container)).toBeNull();
    expect(container.querySelector(".cursor-zoom-in")).toBeNull();
  });

  it("does not enlarge a video with custom controls", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const { container } = render(<Media src="/clip.mp4" controls enlarge autoplay={false} />, {
      wrapper,
    });
    await user.click(container.querySelector("video") as HTMLVideoElement);
    expect(overlay(container)).toBeNull();
  });

  it("passes a numeric sizes as a max-width media query", () => {
    const { container } = render(<Media src="/photo.jpg" alt="Lake" sizes={640} />, { wrapper });
    expect(container.querySelector("img")).toHaveAttribute(
      "sizes",
      "(max-width: 640px) 100vw, 640px",
    );
  });
});

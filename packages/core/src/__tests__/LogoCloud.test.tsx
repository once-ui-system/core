import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoCloud, logoCloudItemVariants, logoCloudVariants } from "../components/LogoCloud";

describe("LogoCloud", () => {
  const STAGGER_DELAY = 25;
  const sampleLogos = [
    { wordmark: "/logo1.svg", alt: "Logo 1" },
    { wordmark: "/logo2.svg", alt: "Logo 2" },
    { wordmark: "/logo3.svg", alt: "Logo 3" },
    { wordmark: "/logo4.svg", alt: "Logo 4" },
    { wordmark: "/logo5.svg", alt: "Logo 5" },
    { wordmark: "/logo6.svg", alt: "Logo 6" },
    { wordmark: "/logo7.svg", alt: "Logo 7" },
    { wordmark: "/logo8.svg", alt: "Logo 8" },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("exports variant functions", () => {
    expect(logoCloudVariants()).toBe("");
    expect(logoCloudItemVariants({ rotating: false })).toContain("animate-logoFadeIn");
    expect(logoCloudItemVariants({ rotating: true })).toContain("animate-logoFadeInOut");
    expect(logoCloudItemVariants()).toContain("animate-logoFadeIn");
    expect(logoCloudItemVariants()).toContain("origin-center");
    expect(logoCloudItemVariants()).toContain("will-change-[opacity,filter,transform]");
  });

  it("renders static logo cloud when count <= limit", () => {
    const staticLogos = sampleLogos.slice(0, 4);
    const { container } = render(<LogoCloud logos={staticLogos} limit={6} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("grid");

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(4);
    expect(images[0]).toHaveAttribute("src", "/logo1.svg");
    expect(images[1]).toHaveAttribute("src", "/logo2.svg");
    expect(images[2]).toHaveAttribute("src", "/logo3.svg");
    expect(images[3]).toHaveAttribute("src", "/logo4.svg");

    const logoDivs = container.querySelectorAll('[aria-label="Trademark"]');
    for (const logoDiv of logoDivs) {
      expect(logoDiv).toHaveClass("animate-logoFadeIn");
      expect(logoDiv).not.toHaveClass("animate-logoFadeInOut");
    }
  });

  it("applies staggered animation delays based on index", () => {
    const staticLogos = sampleLogos.slice(0, 3);
    const { container } = render(<LogoCloud logos={staticLogos} />);

    const logoDivs = container.querySelectorAll('[aria-label="Trademark"]');
    expect(logoDivs[0]).toHaveStyle({ animationDelay: "0ms" });
    expect(logoDivs[1]).toHaveStyle({ animationDelay: "25ms" });
    expect(logoDivs[2]).toHaveStyle({ animationDelay: "50ms" });
  });

  it("renders rotating logo cloud when count > limit", () => {
    const { container } = render(<LogoCloud logos={sampleLogos} limit={4} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(4);

    const logoDivs = container.querySelectorAll('[aria-label="Trademark"]');
    for (const logoDiv of logoDivs) {
      expect(logoDiv).toHaveClass("animate-logoFadeInOut");
      expect(logoDiv).not.toHaveClass("animate-logoFadeIn");
    }
  });

  it("rotates visible logos over time when rotating is enabled", () => {
    vi.useFakeTimers();

    const rotationInterval = 3000;
    const limit = 4;
    render(<LogoCloud logos={sampleLogos} limit={limit} rotationInterval={rotationInterval} />);

    let images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("src", "/logo1.svg");
    expect(images[1]).toHaveAttribute("src", "/logo2.svg");
    expect(images[2]).toHaveAttribute("src", "/logo3.svg");
    expect(images[3]).toHaveAttribute("src", "/logo4.svg");

    // Advance timer by one full interval cycle (rotationInterval + STAGGER_DELAY * limit)
    act(() => {
      vi.advanceTimersByTime(rotationInterval + STAGGER_DELAY * limit);
    });

    images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("src", "/logo2.svg");
    expect(images[1]).toHaveAttribute("src", "/logo3.svg");
    expect(images[2]).toHaveAttribute("src", "/logo4.svg");
    expect(images[3]).toHaveAttribute("src", "/logo5.svg");

    // Advance timer again
    act(() => {
      vi.advanceTimersByTime(rotationInterval + STAGGER_DELAY * limit);
    });

    images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("src", "/logo3.svg");
    expect(images[1]).toHaveAttribute("src", "/logo4.svg");
    expect(images[2]).toHaveAttribute("src", "/logo5.svg");
    expect(images[3]).toHaveAttribute("src", "/logo6.svg");
  });

  it("does not rotate when logos count <= limit", () => {
    vi.useFakeTimers();

    const staticLogos = sampleLogos.slice(0, 3);
    render(<LogoCloud logos={staticLogos} limit={4} rotationInterval={1000} />);

    let images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute("src", "/logo1.svg");

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    images = screen.getAllByRole("img");
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute("src", "/logo1.svg");
    expect(images[1]).toHaveAttribute("src", "/logo2.svg");
    expect(images[2]).toHaveAttribute("src", "/logo3.svg");
  });

  it("clears rotation interval on unmount", () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = render(<LogoCloud logos={sampleLogos} limit={4} rotationInterval={3000} />);

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("forwards ref to Grid root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<LogoCloud ref={ref} logos={sampleLogos.slice(0, 2)} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style on root Grid", () => {
    const { container } = render(
      <LogoCloud
        logos={sampleLogos.slice(0, 2)}
        className="custom-cloud-class"
        style={{ opacity: 0.85 }}
      />,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("custom-cloud-class", "grid");
    expect(grid.style.opacity).toBe("0.85");
  });

  it("passes Grid layout and styling props to Grid", () => {
    const { container } = render(
      <LogoCloud
        logos={sampleLogos.slice(0, 2)}
        columns="4"
        gap="24"
        padding="16"
        radius="l"
        dark
      />,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("grid-cols-4", "gap-24", "p-16", "rounded-l", "dark-grid");
  });

  it("preserves individual logo props, className, and style", () => {
    const customLogos = [
      {
        wordmark: "/custom.svg",
        className: "custom-single-logo",
        style: { opacity: 0.6 },
        size: "s" as const,
      },
    ];

    const { container } = render(<LogoCloud logos={customLogos} />);
    const logoDiv = container.querySelector('[aria-label="Trademark"]') as HTMLElement;
    expect(logoDiv).toHaveClass("custom-single-logo");
    expect(logoDiv.style.opacity).toBe("0.6");

    const img = screen.getByRole("img");
    expect(img).toHaveClass("h-24"); // size="s"
  });
});

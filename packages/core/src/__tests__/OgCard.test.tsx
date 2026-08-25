import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { OgCard } from "../components/OgCard";

// Mock useOgData hook for controlled testing
vi.mock("../hooks/useFetchOg", () => ({
  useOgData: (url: string | null) => {
    if (url === "https://loading.com") {
      return { ogData: null, loading: true };
    }
    if (url === "https://fetched.com") {
      return {
        ogData: {
          title: "Fetched Title",
          description: "Fetched Description",
          image: "https://fetched.com/image.jpg",
          faviconUrl: "https://fetched.com/favicon.ico",
          url: "https://fetched.com",
        },
        loading: false,
      };
    }
    return { ogData: null, loading: false };
  },
}));

describe("OgCard", () => {
  const sampleData = {
    title: "Once UI Design System",
    description: "An open-source design system and component library.",
    image: "https://once-ui.com/og.jpg",
    faviconUrl: "https://once-ui.com/favicon.ico",
    url: "https://once-ui.com",
  };

  it("renders with pre-provided ogData", () => {
    render(<OgCard ogData={sampleData} />);

    expect(screen.getByText("Once UI Design System")).toBeInTheDocument();
    expect(
      screen.getByText("An open-source design system and component library."),
    ).toBeInTheDocument();
    expect(screen.getByText("once-ui.com")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://once-ui.com");
  });

  it("renders fetched ogData when url is provided", () => {
    render(<OgCard url="https://fetched.com" />);

    expect(screen.getByText("Fetched Title")).toBeInTheDocument();
    expect(screen.getByText("Fetched Description")).toBeInTheDocument();
    expect(screen.getByText("fetched.com")).toBeInTheDocument();
  });

  it("renders skeletons when loading", () => {
    const { container } = render(<OgCard url="https://loading.com" />);

    const skeletons = container.querySelectorAll(".animate-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("returns null when no data and not loading", () => {
    const { container } = render(<OgCard url="https://empty.com" />);
    expect(container.firstChild).toBeNull();
  });

  it("allows hiding title, description, image, and favicon with false", () => {
    const { container } = render(
      <OgCard
        ogData={sampleData}
        title={false}
        description={false}
        image={false}
        favicon={false}
      />,
    );

    expect(screen.queryByText("Once UI Design System")).not.toBeInTheDocument();
    expect(
      screen.queryByText("An open-source design system and component library."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("once-ui.com")).not.toBeInTheDocument();
    // Only card should be rendered without image media
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("allows custom overrides for title, description, and cardUrl", () => {
    render(
      <OgCard
        ogData={sampleData}
        title="Custom Title Override"
        description="Custom Description Override"
        cardUrl="https://custom-target.com"
      />,
    );

    expect(screen.getByText("Custom Title Override")).toBeInTheDocument();
    expect(screen.getByText("Custom Description Override")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://custom-target.com");
  });

  it("supports row direction layout", () => {
    const { container } = render(<OgCard ogData={sampleData} direction="row" />);
    expect(container.querySelector(".flex-row")).toBeInTheDocument();
  });

  it("forwards ref to the underlying Card element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<OgCard ref={ref} ogData={sampleData} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("handles different sizes (s, m, l)", () => {
    const { rerender } = render(<OgCard ogData={sampleData} size="s" />);
    expect(screen.getByText("Once UI Design System")).toHaveClass("font-label", "font-s");

    rerender(<OgCard ogData={sampleData} size="m" />);
    expect(screen.getByText("Once UI Design System")).toHaveClass("font-label", "font-m");

    rerender(<OgCard ogData={sampleData} size="l" />);
    expect(screen.getByText("Once UI Design System")).toHaveClass("font-label", "font-l");
  });

  it("uses custom serviceConfig proxies when provided", () => {
    const customProxyImage = vi.fn((img: string) => `https://imgproxy.com?url=${img}`);
    const customProxyFavicon = vi.fn((fav: string) => `https://favproxy.com?url=${fav}`);

    render(
      <OgCard
        ogData={{
          title: "Proxy Test",
          url: "https://proxy-test.com",
          image: "https://proxy-test.com/og.jpg",
        }}
        serviceConfig={{
          proxyImageUrl: customProxyImage,
          proxyFaviconUrl: customProxyFavicon,
        }}
      />,
    );

    expect(customProxyImage).toHaveBeenCalledWith("https://proxy-test.com/og.jpg");
    expect(customProxyFavicon).toHaveBeenCalled();
  });
});

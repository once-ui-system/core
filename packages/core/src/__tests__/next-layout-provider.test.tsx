import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * The drop-in `LayoutProvider` from `@once-ui-system/core/next` must install
 * the Next adapters, so that changing one import path is the whole migration
 * for a Next.js app.
 *
 * next/* is mocked: core's own test env has no Next runtime, and what is being
 * asserted is the wiring — that components render through the *installed*
 * adapters rather than the DOM defaults — not Next's behaviour.
 */

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children?: React.ReactNode }) => (
    <a href={href} data-adapter="next-link" {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // biome-ignore lint/performance/noImgElement: stand-in for next/image in a test
    <img src={src} alt={alt} data-adapter="next-image" {...props} />
  ),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/from-next-navigation",
  useRouter: () => ({ push }),
}));

import { ElementType } from "../components/ElementType";
import { Media } from "../components/Media";
import { useAdapters } from "../contexts/AdapterProvider";
import { LayoutProvider } from "../next";

describe("LayoutProvider from @once-ui-system/core/next", () => {
  it("routes internal links through next/link, not a bare <a>", () => {
    render(
      <LayoutProvider>
        <ElementType href="/about" data-testid="link">
          About
        </ElementType>
      </LayoutProvider>,
    );
    expect(screen.getByTestId("link")).toHaveAttribute("data-adapter", "next-link");
  });

  it("routes images through next/image", () => {
    render(
      <LayoutProvider>
        <Media src="/a.png" alt="probe" />
      </LayoutProvider>,
    );
    expect(screen.getByAltText("probe")).toHaveAttribute("data-adapter", "next-image");
  });

  it("installs the Next pathname and navigate hooks", () => {
    const Probe = () => {
      const { usePathname, useNavigate } = useAdapters();
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => navigate("/next")} data-testid="probe">
          {usePathname()}
        </button>
      );
    };

    render(
      <LayoutProvider>
        <Probe />
      </LayoutProvider>,
    );

    const probe = screen.getByTestId("probe");
    expect(probe).toHaveTextContent("/from-next-navigation");
    probe.click();
    expect(push).toHaveBeenCalledWith("/next");
  });

  it("still accepts LayoutProvider's own props", () => {
    render(
      <LayoutProvider breakpoints={{ s: 600 }}>
        <ElementType href="/x" data-testid="link">
          x
        </ElementType>
      </LayoutProvider>,
    );
    expect(screen.getByTestId("link")).toHaveAttribute("data-adapter", "next-link");
  });
});
